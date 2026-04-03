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
  ]
}
```

## Rules

- Preserve the proposal body verbatim — do not paraphrase or reformat.
- Slugify titles: lowercase, spaces to hyphens, strip special characters except hyphens.
- Do not invent proposals — only include what is in the file.
- If `proposals.md` is empty or has no `## ` headings, write `session.json` with an empty proposals array and note this to the user.
- Sort proposals in the order they appear in the file.
