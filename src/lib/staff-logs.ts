// src/lib/staff-logs.ts
// Simple file-based logging for staff review of AI-generated templates
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.resolve(process.cwd(), 'staff-logs');
const ARTICLE_LOG = path.join(LOG_DIR, 'article-templates.jsonl');
const PROJECT_LOG = path.join(LOG_DIR, 'project-templates.jsonl');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
  }
}

export function logArticleTemplate(query: string, template: unknown) {
  ensureLogDir();
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    query,
    template,
  });
  fs.appendFileSync(ARTICLE_LOG, entry + '\n');
}

export function logProjectTemplate(query: string, template: unknown) {
  ensureLogDir();
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    query,
    template,
  });
  fs.appendFileSync(PROJECT_LOG, entry + '\n');
}
