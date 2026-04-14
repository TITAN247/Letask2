export function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
}

export function computeTf(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  const len = tokens.length;
  if (len === 0) return tf;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  for (const token in tf) {
    tf[token] = tf[token] / len;
  }
  return tf;
}

export function computeIdf(corpus: string[][]): Record<string, number> {
  const N = corpus.length;
  const df: Record<string, number> = {};
  for (const tokens of corpus) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      df[token] = (df[token] || 0) + 1;
    }
  }
  const idf: Record<string, number> = {};
  for (const token in df) {
    idf[token] = Math.log(N / (df[token] + 1)); // smooth idf
  }
  return idf;
}

export function computeTfIdf(tf: Record<string, number>, idf: Record<string, number>): Record<string, number> {
  const tfidf: Record<string, number> = {};
  for (const token in tf) {
    tfidf[token] = tf[token] * (idf[token] || 0);
  }
  return tfidf;
}

export function cosineSimilarity(vec1: Record<string, number>, vec2: Record<string, number>): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  for (const key of allKeys) {
    const v1 = vec1[key] || 0;
    const v2 = vec2[key] || 0;
    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Helper to find best matches among documents
export function findBestMatches(query: string, documents: { id: string, text: string }[]) {
  if (documents.length === 0) return [];
  
  const queryTokens = tokenize(query);
  const docTokens = documents.map(doc => tokenize(doc.text));
  const corpus = [queryTokens, ...docTokens];
  
  const idf = computeIdf(corpus);
  const queryTf = computeTf(queryTokens);
  const queryTfIdf = computeTfIdf(queryTf, idf);
  
  const matches = documents.map((doc, idx) => {
    const tf = computeTf(docTokens[idx]);
    const tfidf = computeTfIdf(tf, idf);
    const score = cosineSimilarity(queryTfIdf, tfidf);
    return { id: doc.id, score };
  });
  
  return matches.sort((a, b) => b.score - a.score);
}
