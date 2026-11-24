declare module 'text-readability' {
  interface TextReadability {
    fleschReadingEase(text: string): number;
    fleschKincaidGrade(text: string): number;
    colemanLiauIndex(text: string): number;
    automatedReadabilityIndex(text: string): number;
    daleChallReadabilityScore(text: string): number;
    linsearWriteFormula(text: string): number;
    gunningFog(text: string): number;
  }

  const rs: TextReadability;
  export default rs;
}

declare module 'textract' {
  export function fromFileWithMimeAndPath(
    mimeType: string,
    filePath: string,
    callback: (error: Error | null, text?: string) => void
  ): void;
}
