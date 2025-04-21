import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ingest } from './ingest.js';
import { queryPipeline } from './query.js';

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
