import { loadMarkdownFile, renderTemplate } from './markdown-files';

export function loadPrompt(name: string): string {
  return loadMarkdownFile('prompts', name);
}

export const renderPrompt = renderTemplate;
