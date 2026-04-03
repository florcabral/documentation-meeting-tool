# docs decision tool — spec v1.0

---

## meta

| | |
|---|---|
| status | ready to build |
| demo context | AI-assisted work session — SE team, Cursor demo |
| meeting type | live remote, screen share, 5 participants |
| replaces | ad-hoc Google Sheets voting during docs meetings |

---

## 1. problem

The team holds recurring meetings to make decisions about documentation structure — which pages to include, how to organise navigation, what belongs where. These meetings are painful for three reasons:

- The facilitator drives everything from their screen. Others react rather than contribute independently.
- Proposals are prepared by one person in a Google Doc or bullet list. Everyone else votes on imperfect options with no easy way to suggest alternatives mid-meeting.
- Voting happens in ad-hoc spreadsheets built on the fly. The format is clunky, the options aren't well-defined, and the output is a number — not a decision with reasoning.
- Not everyone feels represented. The loudest voices or the person sharing the screen naturally dominate.
- Nothing is recorded. The person running the meeting is responsible for summarising and opening a GitHub PR — a step that often loses nuance.

> **concrete example:** a one-hour meeting to decide which pages should be linked in the landing docs page. The facilitator prepared a Google Doc with 3 structural options (by customer need, by lifecycle stage, by product). During the meeting, a teammate suggested a 4th option in the chat. The team voted using a manually-built spreadsheet with -1 / 0 / 1 columns. The outcome felt inconclusive — not everyone agreed the options were optimal, and the record of who preferred what and why was lost.

---

## 2. what we're building

A lightweight, single-URL web app for running structured documentation decisions during live remote meetings. The facilitator shares their screen. Teammates open the URL on their own devices and interact directly — voting, commenting, and proposing alternatives. Results are visible to everyone in real time without a page refresh.

The app is backed by a Cursor AI layer that:

- Generates structured proposals from raw context (notes, a Google Doc, a brief) using `/propose`
- Loads existing pre-written proposals from a local `.md` file using `/review`
- Writes a `discussion.md` summary after the meeting using `/summarize`

This is also a demo of AI-assisted development for the SE team — built live in Cursor, showing rules / prompts / skills as a slash-command pipeline.

---

## 3. goals

### primary
- Leave every meeting with a clear collective signal — not the facilitator's interpretation of a conversation
- Make it easy for all participants to contribute proposals and reactions, not just the person sharing the screen
- Replace the ad-hoc spreadsheet with something purpose-built that requires zero setup from teammates
- Automatically capture the decision and reasoning in a file ready to reference or paste into a GitHub issue

### demo goals (Cursor session)
- Show the rules / prompts / skills pattern as a slash-command pipeline
- Show `/propose` and `/review` loading real content into the app live
- Show the app updating in real time as votes come in during the demo

---

## 4. non-goals

- Not a general documentation editor — does not replace Sphinx or the `.md` files in the repo
- Not a persistent platform — one session per meeting, no user accounts, no history browser
- Not a GitHub integration — `/summarize` writes a local file, no automated PR or issue creation
- Not a backend product — no server to maintain, no database, no auth system

---

## 5. user flow

### before the meeting

- **`/review`** — facilitator runs this in Cursor, points it at an existing `proposals.md`. Cursor parses the options and writes `session.json`. The app reads this file on load.
- **`/propose`** — alternative entry point. Facilitator pastes raw context (Google Doc text, notes, a brief). Cursor generates 3-4 structured options and writes `proposals.md`. Then `/review` loads it.
- Facilitator starts the app locally (`vercel dev`), gets the deployed GitHub Pages URL, shares it in the meeting chat before or at the start of the call.

### during the meeting

- Facilitator shares their screen — this is the live results view
- Teammates open the URL on their own device — same page, same data
- Everyone sees all proposals as tabs. Default tab shows a summary across all options.
- Teammates click `+1` or `-1` on any proposal. They enter a display name once on first interaction (stored in localStorage). No login.
- Anyone can add a comment to any proposal tab — plain text, appears in the thread immediately
- Anyone can add a new proposal mid-meeting — title + plain text body — appears as a new tab for everyone instantly
- Facilitator's screen updates automatically every few seconds — no manual refresh needed

### after the meeting

- **`/summarize`** — facilitator runs this in Cursor. It fetches final vote state from Vercel KV and reads `session.json`, then writes `discussion.md` containing: date, all proposals with final scores, individual vote breakdown (who voted what), all comments, and an outcome section noting the winning option and any notable dissent.

---

## 6. UI

Single page. No separate host/guest mode — everyone sees the same view. The facilitator's advantage is the larger screen.

### tab bar
- One tab per proposal, ordered by creation time
- First tab is always the **overview** — shows all proposals as cards with score and comment count
- A `+` button opens a simple inline form: title + text area body. Submitting creates a new tab visible to everyone instantly.

### proposal tab
- Title and body rendered as plain text (not markdown — teammates type plain text)
- `+1` and `-1` buttons. On first click, user is prompted for a display name.
- Aggregate score shown prominently (sum of all votes, reddit-style)
- Individual vote breakdown: list of names with their vote — visible to everyone
- Comment thread below — plain text, name + timestamp, newest at bottom

### overview tab
- Cards for each proposal showing: title, score, vote count, comment count
- Ordered by score descending — winning option rises naturally
- Updates live without interaction

### live updates
- App polls the Vercel API every 3-5 seconds
- New votes, comments, and proposals appear without page refresh
- No websocket needed — polling is sufficient for 5 people

---

## 7. Cursor AI layer

Three slash commands, each wired as a `rule → prompt → skill` chain.

| command | what it does | when to use |
|---|---|---|
| `/review` | loads `proposals.md`, parses H2 headings as proposals, writes `session.json` | existing `.md` file ready |
| `/propose` | given raw pasted context, generates 3-4 structured proposal options as `proposals.md` | starting from scratch or notes |
| `/summarize` | fetches votes from Vercel KV + reads `session.json`, writes `discussion.md` | end of meeting |

### file structure

```
.cursor/
  rules/
    review.mdc          ← triggers /review, routes to prompt
    propose.mdc         ← triggers /propose, routes to prompt
    summarize.mdc       ← triggers /summarize, routes to prompt
  prompts/
    review.md           ← how to parse proposals.md → session.json
    propose.md          ← how to generate proposals from raw context
    summarize.md        ← how to write discussion.md from vote data
  skills/
    proposals.md        ← what a good proposal looks like, format rules

proposals.md            ← pre-written proposals (source of truth, edited by facilitator)
session.json            ← generated by /review, read by the app on load
discussion.md           ← generated by /summarize after the meeting

src/                    ← React + Vite frontend
api/
  votes.js              ← GET all votes / POST a vote
  proposals.js          ← GET proposals / POST new proposal
  comments.js           ← GET comments / POST a comment
```

### proposals.md format

H2 headings become proposal titles. Body under each heading becomes the proposal content. The `/review` prompt parses this into `session.json`.

```markdown
## Option 1: by customer need

Groups content by what problem the reader is trying to solve.

- Packaging & distribution
- Observability & monitoring
- Security

## Option 2: by lifecycle stage

Good for readers who know what stage they are in.

- Develop
- Build & publish
- Deploy
- Operate
- Maintain
```

---

## 8. tech stack

| layer | technology | why |
|---|---|---|
| frontend | React + Vite | fast dev server, familiar, easy GitHub Pages deploy |
| hosting | GitHub Pages (public) from private repo | free, permanent, no config — teammates need no GitHub account |
| API | Vercel serverless functions | free tier, deploys from same repo, handles POSTs from teammates' browsers |
| storage | Vercel KV | key-value store on Vercel free tier, no schema needed, enough for 5 people |
| AI layer | Cursor + Anthropic API | rules / prompts / skills as slash-command pipeline |
| proposals | local `.md` file | written by facilitator or generated by `/propose`, no database needed |
| local dev | `vercel dev` | runs frontend + API functions together, hits same KV as deployed version |

---

## 9. data model (Vercel KV)

All keys namespaced by session ID. Session ID generated from date, stored in `session.json`.

### keys

- **`session:{id}:proposals`** — array of `{ id, title, body, author, createdAt }`
- **`session:{id}:votes`** — array of `{ proposalId, author, value (+1 or -1), createdAt }`
- **`session:{id}:comments`** — array of `{ proposalId, author, text, createdAt }`

### constraints

- No auth — author name set once, stored in localStorage
- One vote per author per proposal — API overwrites on re-vote
- Votes are public — individual breakdown shown in UI, not just aggregate score

---

## 10. repo + hosting setup

**Repo: private. GitHub Pages: public.**

GitHub Pages deploys publicly from a private repo — source code stays private, the app URL is accessible to anyone with the link. Teammates need no GitHub account, no repo access.

> Note: public GitHub Pages from private repos requires GitHub Free plan or above — standard for any team using GitHub.

Since the Vercel API endpoints are public and there's no auth, technically anyone with the URL could submit votes. For a 5-person internal meeting this is not a concern. A simple session token in the URL can be added later if needed.

---

## 11. pre-build setup

Do these four steps before the coding agent starts.

### step 1 — create the repo

Create a new **private** empty GitHub repo. Clone it locally.

```bash
git clone <your-repo-url>
cd <repo-name>
```

### step 2 — create Vercel project + KV

1. Go to vercel.com → New Project → import the GitHub repo
2. Don't deploy yet — just connect it
3. Go to **Storage** tab → Create KV database (free tier) → Connect to project
4. Pull credentials locally:

```bash
npm i -g vercel
vercel link       # links local folder to the Vercel project
vercel env pull   # writes .env.local with KV credentials
```

Add `.env.local` to `.gitignore` immediately.

### step 3 — enable GitHub Pages

GitHub repo → **Settings → Pages → Source: GitHub Actions**. The agent writes the deploy workflow. Nothing else to configure here.

### step 4 — start the Cursor session with this context

Paste this at the top of the first Cursor message:

```
Environment variables available via .env.local:
- KV_REST_API_URL
- KV_REST_API_TOKEN
Use @vercel/kv for all storage operations.
```

---

## 12. constraints

- Free hosting only — GitHub Pages + Vercel free tier, no paid services
- No auth — display name entered once, stored in localStorage
- No backend server — Vercel serverless functions only
- Teammates need zero setup — one URL, works in any mobile browser
- App updates without manual refresh — polling every 3-5 seconds
- `proposals.md` is the source of truth for proposal content — not the KV store
- `/summarize` writes `discussion.md` only — no automated GitHub action or issue creation
- Teammate proposal input is plain text — not markdown

---

## 13. out of scope for v1

- Multiple concurrent sessions
- Session history or browsing past meetings
- Markdown rendering for teammate-submitted proposals
- Direct GitHub issue/PR creation from the summary
- Authentication or access control
- Mobile-optimised facilitator view
