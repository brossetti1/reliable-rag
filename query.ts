import 'dotenv/config';
import fs from 'fs';
import type { Document } from 'langchain/document';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAI } from '@langchain/openai';
import { CohereEmbeddings } from '@langchain/cohere';

function getRetriever() {
  const embedding = new CohereEmbeddings({ model: 'embed-english-v3.0' });
  const store = new Chroma(embedding, {
    collectionName: 'reliable-rag',
    url: process.env.CHROMA_SERVER_URL
  });
  return store.asRetriever({ searchType: 'similarity', k: 8 });
}

async function relevancyFilter(docs: Document[], q: string, llm: OpenAI) {
  const rel: Document[] = [];
  for (const d of docs) {
    const resp = await llm.call(
      `Query: "${q}"\nChunk: "${d.pageContent.slice(0,200)}..."\nRelevant? YES or NO.`
    );
    if (resp.trim().toUpperCase() === 'YES') rel.push(d);
  }
  return rel;
}

async function generateAnswer(docs: Document[], q: string, llm: OpenAI) {
  const ctx = docs.map(d => d.pageContent).join('\n---\n');
  return llm.call(`Use excerpts to answer and cite:\n${ctx}\nQ: ${q}\nA:`);
}

export async function queryPipeline(q: string) {
  const retriever = getRetriever();
  const initial = await retriever.getRelevantDocuments(q);
  const llm = new OpenAI({ modelName: 'gpt-4o-mini' });
  const relevant = await relevancyFilter(initial, q, llm);
  const answer = await generateAnswer(relevant, q, llm);

  const file = `results/query-${Date.now()}.json`;
  fs.mkdirSync('results', { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ query: q, answer }, null, 2));

  return { answer, file };
}
