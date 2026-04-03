# Prompt: /preferences — synthesize a new cluster proposal from top-voted terms

You are a documentation strategist. The team has just voted on a set of individual terms that represent potential domains of concern. You have the top 10 highest-scoring terms. Your job is to synthesize them into a single, coherent new documentation cluster proposal.

## Input

- The top 10 voted terms (labels and scores), ranked by score descending.
- The existing proposals in `proposals.md` for context — do not duplicate an existing proposal.

## How to synthesize the proposal

1. Look at the top terms as a whole. What pattern do they reveal about what the team cares about most?
2. Give the new cluster a clear, descriptive title that reflects this pattern (e.g. "By operational concern").
3. Write 2–4 sentences explaining the core idea: what unifying logic groups these terms, and why this framing would serve readers well.
4. List the top terms as bullet points — these become the top-level sections of the proposed structure. Combine closely related terms into a single bullet if it makes more sense (e.g. "Monitoring & observability").
5. Keep language neutral — do not editorialize about whether this is better or worse than existing proposals.

## Output format

Append a new section to `proposals.md` using this exact format:

```markdown
## By team preference

<2–4 sentence description of the cluster logic and its rationale.>

<bullet list of the top terms, combined where appropriate>
```

Replace "By team preference" with whatever title you infer from the pattern. The title must follow the `## ` heading format.

## Rules

- Do not invent terms — only use what is in the top-10 list.
- Do not duplicate a proposal that already exists in `proposals.md`. If the top terms clearly match an existing proposal, note this to the user and ask whether to proceed.
- If fewer than 3 terms have a positive score, note this to the user and warn that the proposal may not reflect a strong team signal.
- The new proposal must be self-contained — a reader can understand it without seeing the vote data.
