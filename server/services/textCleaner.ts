export function cleanExtractedText(rawText: string): string {
  return rawText
    .replace(/\r\n|\r/g, "\n") // Normalize line breaks
    .replace(/\n{2,}/g, "\n\n") // Collapse multiple blank lines
    .replace(/[ \t]+/g, " ") // Normalize whitespace
    .replace(/ +\n/g, "\n") // Remove trailing spaces at line end
    .trim(); // Trim start and end
}
