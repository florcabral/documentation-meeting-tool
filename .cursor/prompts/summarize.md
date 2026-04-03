# Prompt: /summarize — write discussion.md from vote data

You are writing a structured meeting summary from live vote and comment data. This file should serve as a permanent record of the decision and can be pasted into a GitHub issue or shared with stakeholders.

## Input

You have access to:
- `session.json` — session metadata and full proposal list (including the `terms` array)
- API data from `/api/summarize` — `proposals`, `votes`, `comments`, and `terms` arrays

Votes are shared across proposals and terms. To compute a term's score: sum all `value` fields in `votes` where `proposalId` matches the term's `id` (term IDs start with `term--`).

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

## Term voting

[Include this section only if at least one term has a non-zero score.]

The team voted on individual terms to signal which concepts matter most.

| Term | Score | Votes |
|---|---|---|
| [label] | [+N or -N] | [N] |

[Sort by score descending. Include all terms with a non-zero score. Omit terms with score 0.]

**Signal:** [1-2 sentences interpreting what the top-voted terms reveal about the team's priorities — what concepts rose to the top, and whether they align with or diverge from the winning cluster proposal.]

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
- Total votes cast: [N] (proposals) + [N] (terms)
- Total comments: [N]
- Terms voted on: [N of total]
```

## Rules

- Reproduce the winning proposal's body verbatim in the Outcome section (brief excerpt is fine if long).
- For notable dissent: only mention if someone voted -1 on the winner AND left a comment. Include the comment.
- Sort proposals by score descending (winner first).
- Omit the Term voting section entirely if no terms received any votes.
- In the Signal line, note if the top terms match the winning proposal's structure, diverge from it, or suggest a direction not captured in any proposal.
- Do not editorialize or add opinions beyond the Signal inference — only summarise what is in the data.
- If there is a tie, note it explicitly in the Outcome section.
- If there are no votes at all, write "No votes were cast" in the Outcome section.
