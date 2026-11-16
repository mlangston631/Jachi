# YouTube network

A portfolio of 13 faceless YouTube channels, built by the owner with AI agents. This folder is the whole operation: the
channel records, the tools that check and scout YouTube, the agent teams that do the research, and what they found.

It has nothing to do with the Jachi Health website in the rest of this repository. It lives here only because this was
the repository connected to the work; nothing outside this folder reads it, and it changes nothing on the site.

**This repository is public.** Keep secrets, personal details and other people's images and page copies out of it
(`.gitignore` already excludes the page copies, thumbnail sheets and caches the tools make).

## The channels

| # | Niche | Status (17 Nov 2026) |
|---|---|---|
| 1 | Money and economics, explained with stick figures | renaming: first name was taken on YouTube |
| 2 | How real companies rose and collapsed (no crime at the centre) | renaming |
| 3 | How AI and everyday technology work | renaming |
| 4 | Space and science questions with real numbers | renaming |
| 5 | History told through animated maps | renaming |
| 6 | Multi-hour calm history for falling asleep | renaming |
| 7 | Historic true crime: lone thieves, cons and hoaxes, mostly pre-1950 | renaming |
| 8 | Plain-English insurance, legal and real-estate terms | renaming |
| 9 | Hours-long ambient rain and sleep sound | renaming |
| 10 | Wordless animated Shorts about tiny original characters | renaming |
| 11 | Investigative documentaries: blue-collar crime (crews and organisations) | naming |
| 12 | Investigative documentaries: white-collar crime (fraud is the story) | naming |
| 13 | Investigative documentaries: elite syndicates and transnational networks | naming |

Boundaries between overlapping channels are in `network/briefs.json`.

## Layout

| Path | What it is |
|---|---|
| `channels.json` | **The single source of truth** for channels 1-10: name, handle, description, keywords, titles, first script, sources, and a `history` of every change with its reason. Edit this, never the built outputs. |
| `data.mjs` | The first, unchecked drafts. Kept only as the starting point that `history` refers back to. |
| `network/briefs.json` | The owner's brief for channels 11-13, which every documentary agent reads. |
| `agents/naming-agent.js` | The naming agent: research, invent, judge, clear. Use it for every new channel. |
| `agents/runs/` | The exact scripts of every agent team run so far, kept as a record of how each result was produced. They point at the session folder they ran in. |
| `results/` | What those teams returned, raw. |
| `names/`, `factcheck/`, `growth/`, `plan/` | Working files and findings, per step. |

## Tools

Run them from this folder. Each one's header explains how it works and why.

| Tool | Does |
|---|---|
| `ytcheck.mjs "Name" ...` | Is a name free on YouTube? Handle, "The"+handle, and same or near-same channel names in YouTube's own search. Refuses to answer if its control checks fail. |
| `brandcheck.mjs "Name" ...` | `ytcheck` plus the .com domain (registry lookup) and live US trademarks, including marks that contain the name. A screening tool, not legal clearance. |
| `ytscout.mjs "query" ...` | What is winning: this year's or month's most-viewed videos for a query, with each uploader's real subscriber count and the outlier ratio (views ÷ subscribers). |
| `thumbsheet.mjs scout.json sheet.png` | One image of the top outliers' thumbnails, for study only. |
| `readpage.py URL` | Text of a trusted page, labelled by tier: YouTube's rules, primary court records, or Wikipedia as a lead only. Refuses every other site and reports bot checks rather than getting around them. |
| `apply_factcheck.py` | Applies fact-checkers' corrections to `channels.json` only where the wording matches exactly once, recording reason and sources. |
| `build.mjs` | Renders the kit page, logos and banners from `channels.json`. Needs `CHECKED_ON` set to the date the names last passed the checks. |
| `handoff.mjs` | Writes the instructions Claude in Chrome follows to create the channels in YouTube Studio. |

The tools need `curl`, Node and (for `build.mjs` and `thumbsheet.mjs`) Playwright with Chromium. Network access they use:
www.youtube.com, i.ytimg.com, support.google.com, blog.youtube, www.courtlistener.com, en.wikipedia.org,
rdap.verisign.com, tmsearch.uspto.gov.

## Agent teams

Every team follows the same rule: one agent does the work, an independent agent tries to knock it down, and only what
survives is used.

| Team | Script | State |
|---|---|---|
| Naming | `agents/naming-agent.js` (earlier rounds in `agents/runs/`) | channels 1-10 round 2 and 11-13 running |
| Fact-check | `agents/runs/fact-check-first-scripts-*` | done: 45 corrections applied to channels 1-8 |
| YouTube rules | `agents/runs/youtube-rules-review-*` | reviews done, skeptics finishing |
| Growth (1-10) | `agents/runs/growth-engine-*` | paused until channels exist |
| Moonshot | `agents/runs/moonshot-playbook-*` | done: `plan/moonshot.md` |
| Documentary network (11-13) | `agents/runs/documentary-network-*` | paused until channels exist |

## Decisions and why

- **Videos come after the channels exist** (owner, 17 Nov 2026). Growth and documentary teams are paused; resuming
  them reuses every finished agent.
- **Phone verification limits launch speed.** YouTube: "a phone number can only be associated with 2 channels per year"
  (support.google.com/youtube/answer/171664). Videos over 15 minutes and custom thumbnails need it
  (answer/9890437). So: create all 13 channels to secure the names, verify the first two to launch, and verify the
  rest as they launch with other numbers the owner legitimately holds. Never buy numbers to get around the limit.
- **Only YouTube's own words count as a rule.** Blogs about faceless channels invent rules; the rules team keeps only
  findings quoted from support.google.com or blog.youtube.
- **No AI persona gives advice.** YouTube refuses monetization to whole channels where AI presents itself as an
  expert giving health, legal, financial or political advice (answer/1311392). Channels 1, 8 and 12 narrate how things
  work and never tell viewers what to do.
- **Nothing templated.** YouTube's spam policy can end channels for AI mass-production of similar videos
  (answer/2801973). Every video is researched and written or substantially rewritten by a person.
- **Fastest growth in YouTube history is the stated goal** (owner). `plan/moonshot.md` names the records to beat,
  with sources, and the pace targets to measure against.
