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
| 1 | **Economy of Means**: money and economics, explained with stick figures | named |
| 2 | **Hubris Holdings**: how real companies rose and collapsed (no crime at the centre) | named |
| 3 | **Legible Machines**: how AI and everyday technology work | named |
| 4 | **Measured Awe**: space and science questions with real numbers | named |
| 5 | **Ink Tectonics**: history told through animated maps | named |
| 6 | **Chamberstick**: multi-hour calm history for falling asleep | named |
| 7 | **Rogues of Record**: historic true crime: lone thieves, cons and hoaxes | named |
| 8 | **Hereby Explained**: plain-English insurance, legal and real-estate terms | named |
| 9 | **Cloister Weather**: hours-long ambient rain and sleep sound | named |
| 10 | **Modest Catastrophes**: wordless animated Shorts for adults: tiny characters, grown-up problems | named |
| 11 | **Until Someone Talked**: investigative documentaries, blue-collar crime (crews and organisations) | named |
| 12 | **Crooked Arithmetic**: investigative documentaries, white-collar crime (fraud is the story) | named |
| 13 | **Respectable Front**: investigative documentaries, elite syndicates and transnational networks | named |

Boundaries between overlapping channels are in `network/briefs.json`.

## Layout

| Path | What it is |
|---|---|
| `channels.json` | **The single source of truth** for all 13 channels' content: name, handle, description, keywords, audience, titles, first script, sources, and a `history` of every change with its reason. Edit this, never the built outputs. |
| `design/ch-<n>.json` | **The single source of each channel's look**: colours, font, mark and banner backdrop, as approved by the design team. |
| `fonts/` | Open-licence fonts (SIL OFL 1.1) bundled so the pictures render the same anywhere; `fonts/fonts.json` lists them. |
| `kit/` | The built kit: `index.html` (everything to paste, with pictures), each channel's picture and banner, and `paste-into-claude-in-chrome.txt`. Rebuilt by `build.mjs` and `handoff.mjs`. |
| `data.mjs` | The first, unchecked drafts. Kept only as the starting point that `history` refers back to. |
| `network/briefs.json` | The owner's brief for channels 11-13, which every documentary agent reads. |
| `agents/naming-agent.js` | The naming agent: research, invent, judge, clear. Use it for every new channel. |
| `agents/design-team.js` | The design team: designer and critic per channel at real YouTube sizes, then an art director across all channels. Use it for every new or changed look. |
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
| `art.mjs` | Draws a channel's picture (800x800, shown as a circle) and banner (2560x1440, name kept in the 1546x423 phone-safe centre). Used by both tools below, so what is approved is what ships. Reports a name that overflows the phone-safe area, and a font that isn't really rendering. |
| `preview.mjs <n> [design.json]` | A designer's proof sheet: the picture at 176-32 px on YouTube's dark and light, the banner as TV, desktop and phone crop it. Exit 3 = overflow, 5 = font not rendering. |
| `build.mjs` | Builds the kit from `channels.json` and `design/`. Needs `CHECKED_ON` (the date the names last passed the checks); refuses to build on overflow or a missing font. |
| `handoff.mjs` | Writes the instructions Claude in Chrome follows to create the channels in YouTube Studio. |

The tools need `curl`, Node and (for `build.mjs`, `preview.mjs` and `thumbsheet.mjs`) Playwright with Chromium; run those with `NODE_PATH=$(npm root -g)` if Playwright is installed globally. Network access they use:
www.youtube.com, i.ytimg.com, support.google.com, blog.youtube, www.courtlistener.com, en.wikipedia.org,
rdap.verisign.com, tmsearch.uspto.gov.

## Agent teams

Every team follows the same rule: one agent does the work, an independent agent tries to knock it down, and only what
survives is used.

| Team | Script | State |
|---|---|---|
| Naming | `agents/naming-agent.js` (earlier rounds in `agents/runs/`) | done: all 13 named and cleared (YouTube, .com, US trademarks, web) |
| Fact-check | `agents/runs/fact-check-first-scripts-*` | done: 45 corrections applied to channels 1-8 |
| YouTube rules | `agents/runs/youtube-rules-review-*` | done: 15 fixes applied; setup steps in `plan/setup.md` |
| Growth (1-10) | `agents/runs/growth-engine-*` | paused until channels exist |
| Moonshot | `agents/runs/moonshot-playbook-*` | done: `plan/moonshot.md` |
| Documentary network (11-13) | `agents/runs/documentary-network-*` | paused until channels exist |
| Design | `agents/design-team.js` (first run in `agents/runs/`) | done for all 13 (every critic score 7+); channel 2 being redesigned (no architecture, so it can't be mistaken for 13) |

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
