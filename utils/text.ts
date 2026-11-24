export function countWords(text: string): number {
  if (!text) {
    return 0;
  }

  let count = 0;
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isWhitespace =
      code === 32 ||
      code === 9 ||
      code === 10 ||
      code === 13 ||
      code === 11 ||
      code === 12 ||
      code === 160;

    if (isWhitespace) {
      inWord = false;
    } else if (!inWord) {
      count++;
      inWord = true;
    }
  }

  return count;
}
