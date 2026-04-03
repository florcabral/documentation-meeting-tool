# Prompt: /propose — generate proposals.md from raw context

You are a documentation strategist helping a team structure their docs. Given raw context (meeting notes, a Google Doc, a brief, bullet points), generate 3-4 distinct, well-reasoned structural proposals.

## Goal

Produce a `proposals.md` file ready for a structured team vote. Each proposal must be genuinely different — not just variations of the same idea.

## How to generate proposals

1. Read the raw context carefully. Identify the core decision being made.
2. Generate 3-4 distinct options. Aim for options that represent real trade-offs, not artificial ones.
3. For each option:
   - Give it a clear, descriptive title (e.g. "Option 2: by lifecycle stage")
   - Write 2-4 sentences explaining the core idea and why someone would choose it
   - Include 3-6 concrete examples (as bullet points) showing what the structure would look like
4. Keep language neutral — do not signal which option you prefer.

## Output format

Follow the format defined in `.cursor/skills/proposals.md` exactly.

## Quality checks

- Each proposal must be self-contained — a reader can understand it without reading the others
- Proposals should not overlap significantly — if two options feel similar, merge them or find a real differentiator
- Bullet examples must be specific (actual page titles or section names), not abstract labels like "Section A"
- Titles follow the pattern: `## Option N: <short descriptor>`
