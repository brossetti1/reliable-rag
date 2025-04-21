import 'dotenv/config';
import type { Document } from 'langchain/document';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CohereEmbeddings } from '@langchain/cohere';
import { Chroma } from '@langchain/community/vectorstores/chroma';
/**
 * Loads web pages, splits into chunks, and returns documents
 */
async function loadAndSplit(urls: string[]): Promise<Document[]> {
  console.log(`🛠️ loadAndSplit: starting to load ${urls.length} URLs`);
  const docsArrays = await Promise.all(
    urls.map(async (url) => {
      console.log(`🔗 Loading URL: ${url}`);
      const docs = await new CheerioWebBaseLoader(url).load();
      console.log(`✅ Loaded ${docs.length} docs from ${url}`);
      return docs;
    })
  );
  const docs = docsArrays.flat();
  console.log(`🪓 Splitting into chunks (total docs: ${docs.length})`);
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 0 });
  const chunks = await splitter.splitDocuments(docs);
  console.log(`📦 Generated ${chunks.length} chunks total`);
  return chunks;
}

/**
 * Ingests URLs into the vector store
 */
export async function ingest(urls: string[]) {
  console.log('📝 ingest: received URLs:', urls);
  const chunks = await loadAndSplit(urls);
  console.log(`📥 ingest: ${chunks.length} chunks ready to add to vector store`);
  const embedding = new CohereEmbeddings({ model: 'embed-english-v3.0' });
  const store = new Chroma(embedding, {
    collectionName: 'reliable-rag',
    url: process.env.CHROMA_SERVER_URL,
  }
);
  console.log('🚀 ingest: adding documents to Chroma');
  await store.addDocuments(chunks);
  console.log('✅ ingest: completed successfully');
  return { ingested: chunks.length };
}
