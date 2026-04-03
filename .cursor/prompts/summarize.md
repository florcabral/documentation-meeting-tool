# Prompt: /summarize — write discussion.md from vote data

You are writing a structured meeting summary from live vote and comment data. This file should serve as a permanent record of the decision and can be pasted into a GitHub issue or shared with stakeholders.

## Input

You have access to:
- `session.json` — session metadata and full proposal list
- API data from `/api/summarize` — all votes and comments as arrays

## Output format

Write `discussion.md` with this structure:

```markdown
# [Session title] — Decision record

**Date:** [YYYY-MM-DD]
**Participants:** [comma-separated list of unique author names across votes and comments]
**Facilitator:** [from session.json]

---

## Outcome

**Winner:** [title of the proposal with the highest score]
**Score:** +[score] ([N] votes)

[1-2 sentence plain-English summary of what the team decided and why, inferred from comments and vote pattern]

> Notable dissent: [if any participant voted -1 on the winner, note their name and any comment they left. If none, omit this line.]

---

## All proposals

### [Proposal title] — Score: [+N or -N]

[Proposal body]

**Votes:**
| Participant | Vote |
|---|---|
| [name] | +1 / -1 |

**Comments:**
- **[name]** ([time]): [comment text]

---
[repeat for each proposal]

---

## Raw data

- Session ID: [id]
- Total votes cast: [N]
- Total comments: [N]
```

## Rules

- Reproduce the winning proposal's body verbatim in the Outcome section (brief excerpt is fine if long).
- For notable dissent: only mention if someone voted -1 on the winner AND left a comment. Include the comment.
- Sort proposals by score descending (winner first).
- Do not editorialize or add opinions — only summarise what is in the data.
- If there is a tie, note it explicitly in the Outcome section.
- If there are no votes at all, write "No votes were cast" in the Outcome section.
