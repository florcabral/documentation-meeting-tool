# Skill: proposals.md format

This skill defines the canonical format for `proposals.md` — the source-of-truth file for meeting proposals.

## File format

```markdown
# [Short topic title — used as session title]

## Option N: [short descriptor]

[2-4 sentences describing the approach. Explain who it's good for and why.]

- [Concrete example 1]
- [Concrete example 2]
- [Concrete example 3]
- [Concrete example 4 — optional]

## Option N+1: [short descriptor]

[description]

- [examples]
```

## Rules

1. **One `#` heading** — the file title. This becomes the session title in `session.json`.
2. **Each proposal starts with `## `** — the H2 heading is the proposal title. Everything below until the next `## ` is the body.
3. **Title pattern** — use `Option N: descriptor` (e.g. `Option 2: by lifecycle stage`). The descriptor should be 3-5 words, lowercase except for proper nouns.
4. **Body** — 2-4 sentences of plain text. No markdown formatting inside the body (no bold, no headers). Bullet points for examples are fine.
5. **Examples** — 3-6 bullet points. Must be concrete (actual section names or page titles), not abstract placeholders.
6. **No trailing whitespace** — keep the file clean.
7. **Order** — list proposals in logical order, not ranked. Never signal a preference.

## What makes a good proposal

- **Self-contained** — a reader can understand the proposal without context from the others
- **Distinct** — each option represents a genuinely different structural approach
- **Specific** — vague options like "mixed approach" are only valid if the mixing is well-defined
- **Neutral** — proposal text should not advocate for itself

## Example

```markdown
# Landing page navigation structure

## Option 1: by customer need

Groups content by what the reader is trying to accomplish, not by how the product is organised internally.

- Security & compliance
- Packaging & distribution
- Observability & monitoring
- CI/CD integration

## Option 2: by lifecycle stage

Maps to the reader's journey from evaluation to long-term maintenance.

- Get started
- Build & publish
- Deploy
- Operate & maintain
```
