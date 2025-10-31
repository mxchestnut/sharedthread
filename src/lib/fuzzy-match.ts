// src/lib/fuzzy-match.ts
// Simple fuzzy matcher for templates by title/description
export function fuzzyMatchTemplates<T extends { title: string; description: string }>(
  query: string,
  templates: T[],
  threshold: number = 0.5
): T[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const q = norm(query);
  return templates.filter(t => {
    const text = norm(t.title + " " + t.description);
    const score = similarity(q, text);
    return score >= threshold;
  });
}

// Jaccard similarity for quick fuzzy matching
function similarity(a: string, b: string): number {
  const aSet = new Set(a.split(" "));
  const bSet = new Set(b.split(" "));
  const intersection = new Set([...aSet].filter(x => bSet.has(x)));
  const union = new Set([...aSet, ...bSet]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}
