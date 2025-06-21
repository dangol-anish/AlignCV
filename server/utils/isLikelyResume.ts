export function isLikelyResume(text: string): boolean {
  // Regex to find typical resume section headers (case-insensitive, start of line)
  const requiredSections = [
    /^experience[:\s]*$/im,
    /^education[:\s]*$/im,
    /^skills[:\s]*$/im,
    /^projects[:\s]*$/im,
    /^summary[:\s]*$/im,
    /^objective[:\s]*$/im,
    /^contact[:\s]*$/im,
    /^certifications[:\s]*$/im,
  ];

  let matches = 0;
  for (const regex of requiredSections) {
    if (regex.test(text)) {
      matches++;
    }
  }

  // Check for contact info: email or phone number presence
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text);
  const hasPhone = /\+?\d{1,3}?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(
    text
  );

  // Optional: check for date ranges like "2015-2023"
  const hasDateRange = /\b(19|20)\d{2}[-–—](19|20)\d{2}\b/.test(text);

  // Require at least 3 section headers and some contact or date info to qualify as resume
  return matches >= 3 && (hasEmail || hasPhone || hasDateRange);
}
