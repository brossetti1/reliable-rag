import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ingest } from './ingest.js';
import { queryPipeline } from './query.js';

import { Chroma } from '@langchain/community/vectorstores/chroma';
import { CohereEmbeddings } from '@langchain/cohere';
import { ChromaClient } from 'chromadb';

// helper to get a ready‑to‑use store
async function getChromaStore() {
  // 1. low‑level HTTP client pointing at your server
  const client = new ChromaClient({ path: process.env.CHROMA_SERVER_URL });
  // 2. instantiate your embedding provider
  const embeddings = new CohereEmbeddings({ model: 'embed-english-v3.0' });
  // 3. load the existing Chroma collection
  return Chroma.fromExistingCollection(embeddings,
    {
      url: process.env.CHROMA_SERVER_URL,
      index: client,
      collectionName: 'reliable-rag',
    }
  );
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Log every incoming request
app.use((req, _res, next) => {
  console.log(`➡️  [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.post('/api/ingest', async (req, res) => {
  console.log('📥 Ingest endpoint hit with URLs:', req.body.urls);
  try {
    const result = await ingest(req.body.urls);
    console.log('✅ Ingest succeeded, chunks:', result.ingested);
    res.json(result);
  } catch (err) {
    console.error('❌ Ingest error:', err);
    res.status(500).json({ error: 'Ingest failed' });
  }
});

app.post('/api/query', async (req, res) => {
  console.log('📥 Query endpoint hit with query:', req.body.query);
  try {
    const result = await queryPipeline(req.body.query);
    console.log('✅ Query succeeded, answer saved to:', result.file);
    res.json(result);
  } catch (err) {
    console.error('❌ Query error:', err);
    res.status(500).json({ error: 'Query failed' });
  }
});

app.get('/api/docs', async (_req, res) => {
  console.log('📄 GET /api/docs');
  try {
    const store = await getChromaStore();
    const internalClient = (store as any).collection;
    const docs = await internalClient.get({});
    console.log(`✅ /api/docs returned ${docs.length} docs`);
    res.json({  ids: docs.ids, docs, metadata: docs.metadatas });
  } catch (err) {
    console.error('❌ /api/docs error:', err);
    res.status(500).json({ error: 'Could not list documents' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
