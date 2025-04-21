import 'dotenv/config';
import fs from 'fs';
import type { Document } from 'langchain/document';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { ChatOpenAI } from '@langchain/openai';
import { CohereEmbeddings } from '@langchain/cohere';

function getRetriever() {
  const embedding = new CohereEmbeddings({ model: 'embed-english-v3.0' });
  const store = new Chroma(embedding, {
    collectionName: 'reliable-rag',
    url: process.env.CHROMA_SERVER_URL
  });
  return store.asRetriever({ searchType: 'similarity', k: 8 });
}

async function relevancyFilter(docs: Document[], q: string, llm: ChatOpenAI) {
  const relevant: Document[] = [];
  console.log(`[FILTER] Checking ${docs.length} docs for query "${q}"`);

  for (const [i, doc] of docs.entries()) {
    const preview = doc.pageContent.slice(0, 200);
    console.log(`  → Preview ${i + 1}: "${preview}..."`);

    const { generations } = await llm.generate([
      ['system', 'Decide if the following chunk is relevant. Reply YES or NO.'],
      ['user', `Query: "${q}"\nChunk: "${preview}..."`]
    ]);
    const resp = generations[0][0].text.trim().toUpperCase();
    console.log(`    ↳ Response: ${resp}`);

    if (resp === 'YES') relevant.push(doc);
  }

  console.log(`[FILTER] Kept ${relevant.length}/${docs.length} docs`);
  return relevant;
}

async function generateAnswer(docs: Document[], q: string, llm: ChatOpenAI) {
  console.log(`[ANSWER] Generating answer from ${docs.length} docs`);
  const context = docs.map(d => d.pageContent).join('\n---\n');

  const { generations } = await llm.generate([
    ['system', 'Use the context to answer concisely, citing sources.'],
    ['user', `Context:\n${context}\n\nQuestion: ${q}`]
  ]);

  const answer = generations[0][0].text;
  console.log('[ANSWER] Generated:', answer);
  return answer;
}

export async function queryPipeline(q: string) {
  console.log(`[QUERY] Pipeline start for "${q}"`);
  const retriever = getRetriever();
  const initial = await retriever.invoke(q);
  console.log(`[RETRIEVER] Got ${initial.length} docs`);

  const llm = new ChatOpenAI({ modelName: 'gpt-4o-mini' });
  const relevant = await relevancyFilter(initial, q, llm);
  const answer = await generateAnswer(relevant, q, llm);

  const file = `results/query-${Date.now()}.json`;
  fs.mkdirSync('results', { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ query: q, answer }, null, 2));

  console.log(`[DONE] Saved to ${file}`);
  return { answer, file };
}
