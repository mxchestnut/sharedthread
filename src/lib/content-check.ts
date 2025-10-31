// src/lib/content-check.ts
// Utilities for plagiarism and AI-content detection
import axios from 'axios';

// In-memory store for local duplicate detection (reset on server restart)
const submittedArticles: string[] = [];

// Simple text similarity using Levenshtein distance
function calculateSimilarity(text1: string, text2: string): number {
  const longer = text1.length > text2.length ? text1 : text2;
  const shorter = text1.length > text2.length ? text2 : text1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Local duplicate check (not web-scale)
export async function checkPlagiarism(text: string): Promise<{ isPlagiarized: boolean; score: number; details?: string }> {
  // Check against previously submitted articles
  for (const prev of submittedArticles) {
    const similarity = calculateSimilarity(text, prev);
    if (similarity > 0.8) {
      return {
        isPlagiarized: true,
        score: similarity,
        details: 'Similar to a previously submitted article.'
      };
    }
  }
  // If not plagiarized, add to store
  submittedArticles.push(text);
  return { isPlagiarized: false, score: 0 };
}

// HuggingFace AI content detection (roberta-base-openai-detector)
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL = 'roberta-base-openai-detector';

export async function checkAIContent(text: string): Promise<{ isAI: boolean; score: number; details?: string }> {
  try {
    if (!HF_API_KEY) {
      return { isAI: false, score: 0, details: 'AI detector disabled: missing HUGGINGFACE_API_KEY' };
    }
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    // HuggingFace returns an array of label/score objects
    const result = response.data && Array.isArray(response.data) ? response.data[0] : null;
    if (result && result.label && typeof result.score === 'number') {
      // label: 'AI-generated' or 'Human-written'
      return {
        isAI: result.label.toLowerCase().includes('ai'),
        score: result.score,
        details: `HuggingFace: ${result.label} (${(result.score * 100).toFixed(1)}%)`
      };
    }
    return { isAI: false, score: 0, details: 'No result from HuggingFace' };
  } catch {
    return { isAI: false, score: 0, details: 'Error contacting HuggingFace API' };
  }
}
