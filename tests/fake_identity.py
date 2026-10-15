"""A stand-in for Netlify Identity (and the site's account and admin functions) for the browser tests.

It answers /.netlify/identity/* the way Netlify's Identity service does (same paths, bodies and error
messages), keeps users in memory, and records the emails it would have sent, so tests can follow the links.

    fake = FakeIdentity()
    fake.attach(page)                      # route the page's requests to the fake
    fake.add_user("sam@example.com", "secret-pass", confirmed=True)
"""
import json
import itertools
import time
import urllib.parse
import uuid

ERRORS = {
    "exists": (422, {"code": 422, "msg": "A user with this email address has already been registered"}),
    "login": (400, {"error": "invalid_grant", "error_description": "No user found with that email, or password invalid."}),
    "unconfirmed": (400, {"error": "invalid_grant", "error_description": "Email not confirmed"}),
    "not_found": (404, {"code": 404, "msg": "User not found"}),
    "unauthorized": (401, {"code": 401, "msg": "Invalid token: signature is invalid"}),
    "password": (422, {"code": 422, "msg": "Signup requires a valid password"}),
    "signup_off": (403, {"code": 403, "msg": "Signups not allowed for this instance"}),
    "needs_password": (422, {"code": 422, "msg": "Invited users must specify a password"}),
    "email_change": (401, {"code": 401, "msg": "Email Change Token didn't match token on file"}),
}


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


class FakeIdentity:
    def __init__(self, autoconfirm=False, disable_signup=False):
        self.autoconfirm = autoconfirm
        self.disable_signup = disable_signup
        self.users = {}       # email -> user dict (with a private "_password")
        self.tokens = {}      # access token -> email
        self.refresh = {}     # refresh token -> email
        self.links = {}       # email-link token -> (type, email)
        self.mail = []        # (kind, email, token) for every email the service would send
        self.calls = []       # (method, path) for every request
        self.deleted = []     # emails deleted through /api/account/delete
        self._n = itertools.count(1)
        # What the admin functions would read from Netlify Forms and the project's settings
        self.signups = []     # cleaned early-access submissions, like /api/admin/data returns them
        self.tickets = []     # cleaned support-ticket submissions
        self.forms = "ok"     # "ok", "no_token", "unauthorized" or "unreachable"
        self.alerts = []      # emails Netlify notifies about new submissions
        self.chat = True
        self.admin_emails = ["support@jachihealth.com"]
        self.admin_calls = []

    # ---------- helpers ----------
    def add_user(self, email, password, confirmed=True, metadata=None, roles=None, invited=False, emailed=True):
        """An account. By default it confirmed its email from our confirmation email (confirmation_sent_at);
        invited=True means it came from an invitation sent in Netlify (invited_at) instead, and
        emailed=False means it was confirmed automatically, without any email (Autoconfirm)."""
        at = now()
        user = {"id": str(uuid.uuid4()), "aud": "", "role": "", "email": email,
                "confirmed_at": at if confirmed else None,
                "confirmation_sent_at": at if emailed and not invited else None,
                "invited_at": at if invited else None,
                "app_metadata": {"provider": "email", **({"roles": roles} if roles else {})},
                "user_metadata": dict(metadata or {}), "created_at": at, "updated_at": at, "_password": password}
        self.users[email.lower()] = user
        return user

    def invite(self, email):
        """What Netlify's Identity tab does with Invite users: an account with no password yet, and an
        invitation email. Like Netlify, it refuses an address that already has an account."""
        if email.lower() in self.users:
            raise ValueError("Email address already registered by another user")
        self.add_user(email, None, confirmed=False, invited=True)
        return self.link("invite", email)

    def email_change(self, email, new_email):
        """An email-change link, as Identity sends when someone asks to change their address."""
        self.users[email.lower()]["_new_email"] = new_email
        return self.link("email_change", email)

    def drop_links(self, email, kinds):
        for token, (kind, owner) in list(self.links.items()):
            if owner.lower() == email.lower() and kind in kinds:
                del self.links[token]

    def public(self, user):
        return {k: v for k, v in user.items() if not k.startswith("_")}

    def issue(self, email):
        n = next(self._n)
        access, refresh = f"access-{n}", f"refresh-{n}"
        self.tokens[access] = email
        self.refresh[refresh] = email
        return {"access_token": access, "token_type": "bearer", "expires_in": 3600, "refresh_token": refresh}

    def link(self, kind, email):
        token = f"{kind}-{next(self._n)}"
        self.links[token] = (kind, email)
        self.mail.append((kind, email, token))
        return token

    def last_link(self, kind):
        for k, _email, token in reversed(self.mail):
            if k == kind:
                return token
        return None

    def bearer_user(self, request):
        auth = request.headers.get("authorization", "")
        email = self.tokens.get(auth[7:]) if auth.startswith("Bearer ") else None
        return self.users.get(email.lower()) if email else None

    # ---------- routing ----------
    def attach(self, page):
        page.route("**/.netlify/identity/**", self.handle)
        page.route("**/api/account/delete", self.handle_delete)
        page.route("**/api/admin/**", self.handle_admin)

    def add_signup(self, email, name="", state="TX", interest="", language="en", created_at="2026-10-14T15:00:00Z"):
        sid = f"{next(self._n):024x}"
        self.signups.append({"id": sid, "form": "signups", "created_at": created_at, "email": email, "name": name,
                             "state": state, "interest": interest, "language": language, "topic": "", "message": "",
                             "include_chat": False, "chat_transcript": ""})
        return sid

    def add_ticket(self, email, name="", topic="General question", message="", transcript="", language="en",
                   created_at="2026-10-14T16:00:00Z"):
        tid = f"{next(self._n):024x}"
        self.tickets.append({"id": tid, "form": "tickets", "created_at": created_at, "email": email, "name": name,
                             "state": "", "interest": "", "language": language, "topic": topic, "message": message,
                             "include_chat": bool(transcript), "chat_transcript": transcript})
        return tid

    def clean_member(self, u):
        meta = u.get("user_metadata") or {}
        return {"id": u["id"], "email": u["email"], "confirmed": bool(u["confirmed_at"]), "created_at": u["created_at"],
                "last_sign_in_at": u.get("last_sign_in_at"), "state": meta.get("state", ""),
                "interests": meta.get("interests", []), "language": "es" if meta.get("language") == "es" else "en",
                "updates": meta.get("updates") is not False, "admin": "admin" in (u["app_metadata"].get("roles") or [])}

    def handle_admin(self, route):
        req = route.request
        path = urllib.parse.urlparse(req.url).path.rstrip("/")
        self.admin_calls.append((req.method, path))
        user = self.bearer_user(req)
        if not user:
            return self.reply(route, 401, {"error": "signed_out"})
        roles = user["app_metadata"].get("roles") or []
        if "admin" not in roles:
            if user["email"].lower() not in self.admin_emails or not user["confirmed_at"]:
                return self.reply(route, 403, {"error": "not_admin"})
            if not user.get("invited_at"):
                return self.reply(route, 403, {"error": "not_invited"})
            if self.autoconfirm:
                return self.reply(route, 403, {"error": "autoconfirm_on"})
        if path == "/api/admin/data" and req.method == "GET":
            visible = self.forms in ("ok",)
            return self.reply(route, 200, {
                "me": {"id": user["id"], "email": user["email"]},
                "setup": {"identity": True, "autoconfirm": self.autoconfirm, "signups_open": not self.disable_signup,
                          "forms": self.forms, "members": "ok", "alerts": list(self.alerts) if visible else None,
                          "chat": self.chat, "admin_emails": list(self.admin_emails), "admin_via": "email", "site": "test"},
                "signups": list(self.signups) if visible else [], "tickets": list(self.tickets) if visible else [],
                "members": [self.clean_member(u) for u in self.users.values()],
                "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            })
        if path == "/api/admin/erase" and req.method == "POST":
            email = json.loads(req.post_data or "{}").get("email", "").strip().lower()
            if email == user["email"].lower():
                return self.reply(route, 400, {"error": "cannot_erase_self"})
            before = len(self.signups) + len(self.tickets)
            self.signups = [x for x in self.signups if x["email"].lower() != email]
            self.tickets = [x for x in self.tickets if x["email"].lower() != email]
            account = self.users.pop(email, None)
            return self.reply(route, 200, {"ok": True, "removed": before - len(self.signups) - len(self.tickets),
                                           "forms": "done", "account": bool(account)})
        if path == "/api/admin/alerts" and req.method == "POST":
            if user["email"] not in self.alerts:
                self.alerts.append(user["email"])
            return self.reply(route, 200, {"ok": True, "email": user["email"]})
        parts = path.split("/")
        if len(parts) == 5 and req.method == "DELETE" and parts[3] == "submissions":
            self.signups = [x for x in self.signups if x["id"] != parts[4]]
            self.tickets = [x for x in self.tickets if x["id"] != parts[4]]
            return self.reply(route, 200, {"ok": True, "deleted": True})
        if len(parts) == 5 and req.method == "DELETE" and parts[3] == "members":
            if parts[4] == user["id"]:
                return self.reply(route, 400, {"error": "cannot_delete_self"})
            for key, u in list(self.users.items()):
                if u["id"] == parts[4]:
                    del self.users[key]
            return self.reply(route, 200, {"ok": True, "deleted": True})
        return self.reply(route, 404, {"error": "not_found"})

    def reply(self, route, status, body=None):
        route.fulfill(status=status, content_type="application/json",
                      body="" if body is None else json.dumps(body))

    def handle(self, route):
        req = route.request
        path = urllib.parse.urlparse(req.url).path.split("/.netlify/identity", 1)[1]
        self.calls.append((req.method, path))
        body = {}
        if req.post_data:
            ctype = req.headers.get("content-type", "")
            if "x-www-form-urlencoded" in ctype:
                body = dict(urllib.parse.parse_qsl(req.post_data))
            else:
                body = json.loads(req.post_data)

        if path == "/settings" and req.method == "GET":
            return self.reply(route, 200, {"external": {"email": True, "google": False, "github": False},
                                           "disable_signup": self.disable_signup, "autoconfirm": self.autoconfirm})
        if path == "/signup" and req.method == "POST":
            if self.disable_signup:
                return self.reply(route, *ERRORS["signup_off"])
            email = body.get("email", "")
            if not body.get("password"):
                return self.reply(route, *ERRORS["password"])
            existing = self.users.get(email.lower())
            if existing and existing["confirmed_at"]:
                return self.reply(route, *ERRORS["exists"])
            if existing:
                # Like Identity: an unconfirmed account keeps its first password; only the details change.
                user = existing
                user["user_metadata"].update(body.get("data") or {})
                if self.autoconfirm:
                    user["confirmed_at"] = now()
            else:
                user = self.add_user(email, body["password"], confirmed=self.autoconfirm, metadata=body.get("data"),
                                     emailed=not self.autoconfirm)
            if not self.autoconfirm:
                # A new confirmation email; its link replaces the old one, and an unaccepted invitation's.
                self.drop_links(email, ("confirmation", "invite"))
                user["confirmation_sent_at"] = now()
                self.link("confirmation", email)
            return self.reply(route, 200, self.public(user))
        if path == "/token" and req.method == "POST":
            if body.get("grant_type") == "password":
                user = self.users.get(body.get("username", "").lower())
                if not user or user["_password"] != body.get("password"):
                    return self.reply(route, *ERRORS["login"])
                if not user["confirmed_at"]:
                    return self.reply(route, *ERRORS["unconfirmed"])
                return self.reply(route, 200, self.issue(user["email"]))
            if body.get("grant_type") == "refresh_token":
                email = self.refresh.pop(body.get("refresh_token", ""), None)
                if not email or email.lower() not in self.users:
                    return self.reply(route, 400, {"error": "invalid_grant", "error_description": "Invalid Refresh Token"})
                return self.reply(route, 200, self.issue(email))
        if path == "/verify" and req.method == "POST":
            token = body.get("token", "")
            kind, email = self.links.pop(token, (None, None))
            user = self.users.get(email.lower()) if email else None
            wanted = {"signup": ("confirmation", "invite"), "recovery": ("recovery",)}.get(body.get("type"), ())
            if not user or kind not in wanted:
                return self.reply(route, *ERRORS["not_found"])
            if kind in ("confirmation", "invite"):
                # Like Identity: an invited account without a password must choose one; otherwise a password
                # sent along is ignored. A failed attempt leaves the link working.
                if not user["_password"] and user.get("invited_at"):
                    if not body.get("password"):
                        self.links[token] = (kind, email)
                        return self.reply(route, *ERRORS["needs_password"])
                    user["_password"] = body["password"]
                user["confirmed_at"] = now()
            return self.reply(route, 200, self.issue(user["email"]))
        if path == "/recover" and req.method == "POST":
            user = self.users.get(body.get("email", "").lower())
            if not user:
                return self.reply(route, *ERRORS["not_found"])
            self.link("recovery", user["email"])
            return self.reply(route, 200, {})
        if path == "/user":
            user = self.bearer_user(req)
            if not user:
                return self.reply(route, *ERRORS["unauthorized"])
            if req.method == "GET":
                return self.reply(route, 200, self.public(user))
            if req.method == "PUT":
                if "email_change_token" in body:
                    kind, owner = self.links.get(body["email_change_token"], (None, None))
                    if kind != "email_change" or owner.lower() != user["email"].lower():
                        return self.reply(route, *ERRORS["email_change"])
                    del self.links[body["email_change_token"]]
                    old = user["email"]
                    user["email"] = user.pop("_new_email")
                    self.users[user["email"].lower()] = self.users.pop(old.lower())
                    for t, e in self.tokens.items():
                        if e.lower() == old.lower():
                            self.tokens[t] = user["email"]
                if "password" in body:
                    user["_password"] = body["password"]
                if isinstance(body.get("data"), dict):
                    for k, v in body["data"].items():
                        if v is None:
                            user["user_metadata"].pop(k, None)
                        else:
                            user["user_metadata"][k] = v
                return self.reply(route, 200, self.public(user))
        if path == "/logout" and req.method == "POST":
            auth = req.headers.get("authorization", "")
            self.tokens.pop(auth[7:], None)
            return route.fulfill(status=204, body="")
        return self.reply(route, 404, {"code": 404, "msg": "Not found"})

    def handle_delete(self, route):
        req = route.request
        self.calls.append((req.method, "/api/account/delete"))
        user = self.bearer_user(req)
        if req.method != "POST":
            return self.reply(route, 405, {"error": "method_not_allowed"})
        if not user:
            return self.reply(route, 401, {"error": "signed_out"})
        # Like the real function: sign-ups are erased only for an email proved by a link we sent, and never
        # while Autoconfirm is on.
        email = user["email"].lower()
        proved = user["confirmed_at"] and (user.get("confirmation_sent_at") or user.get("invited_at"))
        removed, forms = 0, "skipped"
        if proved and not self.autoconfirm and self.forms == "ok":
            before = len(self.signups) + len(self.tickets)
            self.signups = [x for x in self.signups if x["email"].lower() != email]
            self.tickets = [x for x in self.tickets if x["email"].lower() != email]
            removed, forms = before - len(self.signups) - len(self.tickets), "done"
        del self.users[email]
        self.deleted.append(user["email"])
        return self.reply(route, 200, {"ok": True, "forms": forms, "removed": removed})
