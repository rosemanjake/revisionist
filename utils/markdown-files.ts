import fs from 'fs';
import path from 'path';

const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/g;
const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

const fileCache = new Map<string, string>();

// Reads `<dir>/<name>.md` relative to the project root, with HTML comments
// stripped so files can carry notes for editors.
export function loadMarkdownFile(dir: string, name: string): string {
  const filePath = path.join(process.cwd(), dir, `${name}.md`);
  const cached = fileCache.get(filePath);
  if (cached !== undefined) {
    return cached;
  }

  const content = fs
    .readFileSync(filePath, 'utf8')
    .replace(HTML_COMMENT_REGEX, '')
    .trim();

  fileCache.set(filePath, content);
  return content;
}

// Fills `{{name}}` placeholders. Single pass, so substituted values (e.g. a
// manuscript) are never re-scanned for placeholders.
export function renderTemplate(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(PLACEHOLDER_REGEX, (match, key: string) => {
    if (!(key in values)) {
      throw new Error(`Missing value for template placeholder "${key}"`);
    }
    return values[key];
  });
}
