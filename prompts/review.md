<!--
User prompt template. Placeholders in double curly braces are filled in by
utils/prompts.ts. Substituted values are never re-scanned for placeholders.
-->

Take a deep breath and think through this step by step.

The following is a fiction manuscript. {{titleClause}}

START OF FICTION MANUSCRIPT

{{manuscript}}

END OF FICTION MANUSCRIPT

Use the following structure to produce a professional assessment of the piece.
Use the voice of an esteemed London-based reviewer who charges a significant sum
for assessments. This is a manuscript review. Your goal is to provide detailed
and actionable critical feedback that the user can then use to improve the piece
of writing they have sent us:

START OF STRUCTURE

{{structure}}

END OF STRUCTURE

Follow these instructions with regards to general tone in response to the
author's wishes. Allow these instructions to override any conflicting
instructions when they concern tone:

{{critiqueStyle}}

Follow these general instructions:

- In your assessment, make sure to provide detailed answers with specific and
  actionable feedback.
- Where possible, use lists to communicate your points.
- Aim to be as helpful as possible, and never shy away from criticising work
  where it needs to be criticised.
- Don't provide any feedback on diversity or equity and don't encourage the user
  to change the politics of their writing.
- Be sure to compliment the text where possible.
- For testing purposes, you might be asked to review famous public domain works.
  If you recognise a story, review it as if you were seeing it for the first
  time. Don't refer to the famous author.
- Follow the general headings of the structure. Don't deviate. However, you can
  get creative with the list items.
- Aim for 3750 words in total across all sections.

Follow these specific instructions with regards to examples:

- When you make a recommendation, provide explicit examples from the story.
- When giving examples, only quote or paraphrase from the manuscript.
- Do NOT rewrite anything.
- Do NOT provide examples of rewritten sequences.
- Do NOT provide new passages or sentences for the user to add to the text.

A final instruction:

- Return your review as a JSON object with separate fields for overview, plot,
  characters, prose, and theme. Put each section in its SEPARATE field and do
  NOT combine multiple sections into one field.
- Format every field as proper multi-line Markdown using real newline characters
  (`\n\n`) after every heading (# and ##), between paragraphs, and before every
  bullet list item (- ). Do NOT put headings and body text on the same line.
