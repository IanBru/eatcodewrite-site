#!/usr/bin/env node
/**
 * Generate summary markdown files for entries that don't have one.
 * Uses AWS Bedrock (Titan Text Express v1) via OIDC credentials in CI; only writes
 * <slug>.summary.md when missing. Persist summaries in repo so we don't re-summarize.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const blogDir = path.join(contentDir, 'blog');
const recipesDir = path.join(contentDir, 'recipes');

const region = process.env.AWS_REGION || 'eu-west-1';
const modelId = process.env.BEDROCK_SUMMARY_MODEL_ID || 'amazon.titan-text-express-v1';

function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { body: content };
  return { body: match[2] };
}

async function summarizeWithBedrock(content, type) {
  const prompt = `Summarize the following ${type} in 1–2 sentences for a listing page. Be concise and descriptive. Reply with only the summary, no quotes or prefix.\n\n${content.slice(0, 4000)}`;
  const client = new BedrockRuntimeClient({ region });
  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: 150,
        temperature: 0.3,
        topP: 0.9,
      },
    }),
  });
  const response = await client.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  const text = body.results?.[0]?.outputText?.trim() ?? '';
  return text;
}

let generated = 0;

async function main() {
  // Blog: for each .md (not .summary.md), if .summary.md missing → summarize body, write
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md') && !f.endsWith('.summary.md'));
    for (const file of files) {
      const slug = path.basename(file, '.md');
      const summaryPath = path.join(blogDir, `${slug}.summary.md`);
      if (fs.existsSync(summaryPath)) continue;
      const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
      const { body } = parseFrontMatter(raw);
      const plain = body.replace(/#{1,6}\s/g, '').replace(/\n+/g, ' ').trim();
      if (!plain) continue;
      try {
        const summary = await summarizeWithBedrock(plain, 'blog post');
        fs.writeFileSync(summaryPath, summary + '\n', 'utf-8');
        console.log('Summary:', slug, summary.slice(0, 60) + '…');
        generated++;
      } catch (e) {
        console.error('Failed to summarize', slug, e.message);
      }
    }
  }

  // Recipes: for each .md + .recipe.json, if .summary.md missing → summarize name + instructions, write
  if (fs.existsSync(recipesDir)) {
    const mdFiles = fs.readdirSync(recipesDir).filter((f) => f.endsWith('.md') && !f.endsWith('.summary.md'));
    for (const file of mdFiles) {
      const slug = path.basename(file, '.md');
      const jsonPath = path.join(recipesDir, `${slug}.recipe.json`);
      if (!fs.existsSync(jsonPath)) continue;
      const summaryPath = path.join(recipesDir, `${slug}.summary.md`);
      if (fs.existsSync(summaryPath)) continue;
      const rawMd = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
      const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const name = meta.name ?? slug;
      const content = `Recipe: ${name}\n\nInstructions:\n${rawMd}`;
      try {
        const summary = await summarizeWithBedrock(content.slice(0, 3000), 'recipe');
        fs.writeFileSync(summaryPath, summary + '\n', 'utf-8');
        console.log('Summary:', slug, summary.slice(0, 60) + '…');
        generated++;
      } catch (e) {
        console.error('Failed to summarize', slug, e.message);
      }
    }
  }

  console.log('Summaries generated:', generated);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
