import 'dotenv/config';
import type { Document } from 'langchain/document';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CohereEmbeddings } from '@langchain/cohere';
import { Chroma } from '@langchain/community/vectorstores/chroma';

async function loadAndSplit(urls: string[]): Promise<Document[]> {
  const docsArrays = await Promise.all(
    urls.map(url => new CheerioWebBaseLoader(url).load())
  );
  const docs = docsArrays.flat();
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 0 });
  return splitter.splitDocuments(docs);
}

export async function ingest(urls: string[]) {
  const chunks = await loadAndSplit(urls);
  const embedding = new CohereEmbeddings({ model: 'embed-english-v3.0' });
  const store = new Chroma(embedding, {
      collectionName: 'reliable-rag',
      url: process.env.CHROMA_SERVER_URL,
    }
  );
  await store.addDocuments(chunks);
  return { ingested: chunks.length };
}
