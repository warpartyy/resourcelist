export function formatTag(tag: string) {
  return tag
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}