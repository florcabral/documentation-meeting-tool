# Prompt: /review — parse proposals.md → session.json

You are parsing a `proposals.md` file into a structured `session.json` that the meeting app reads on load.

## Input

The content of `proposals.md`. Each `## ` heading is a proposal title. The text below the heading (until the next `## ` or end of file) is the proposal body.

## Output format

Write `session.json` with this exact shape:

```json
{
  "id": "<YYYYMMDD based on today's date>",
  "title": "<infer a short session title from the proposals topic, or use 'Documentation meeting'>",
  "date": "<today's date in YYYY-MM-DD>",
  "facilitator": "facilitator",
  "proposals": [
    {
      "id": "<slugified version of the title, lowercase, hyphens>",
      "title": "<the ## heading text>",
      "body": "<full text body under the heading, trimmed>",
      "author": "facilitator",
      "createdAt": "<today's date in ISO 8601, time 09:00:00.000Z>"
    }
  ],
  "terms": [
    {
      "id": "term--<slugified label>",
      "label": "<term label>"
    }
  ]
}
```

## How to extract terms

After parsing proposals, extract individual votable terms from all bullet point lines across every proposal body:

1. Collect every line starting with `- ` across all proposal bodies.
2. Split each bullet on ` & ` and ` and ` to separate compound items (e.g. "Packaging & distribution" → "Packaging", "Distribution").
3. Strip parenthetical annotations (anything in `(…)`) and arrow annotations (`→ …`).
4. Keep product names and multi-word concepts as single terms (e.g. "Snap Store", "Get started", "Ubuntu Core").
5. Deduplicate: if the same term (case-insensitive) appears in multiple proposals, include it only once.
6. Slugify each label for the `id` field using the `term--` prefix: lowercase, spaces to hyphens, strip special characters except hyphens. Example: "Snap Store" → `"term--snap-store"`.
7. Preserve the original casing in `label` (title-case the first letter).

## Rules

- Preserve the proposal body verbatim — do not paraphrase or reformat.
- Slugify titles: lowercase, spaces to hyphens, strip special characters except hyphens.
- Do not invent proposals — only include what is in the file.
- If `proposals.md` is empty or has no `## ` headings, write `session.json` with an empty proposals array and note this to the user.
- Sort proposals in the order they appear in the file.
- If no bullet points exist, write `session.json` with an empty `terms` array.
