export function extractMentions(text: string): string[] {
  const regex = /@([\w]+)/g; // simple: @john
  const matches = text.match(regex);
  return matches ? matches.map(m => m.slice(1).toLowerCase()) : [];
}