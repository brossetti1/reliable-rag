import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ingest } from './ingest';
import { queryPipeline } from './query';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/ingest', async (req, res) => {
  const { urls } = req.body;
  console.log('Ingesting URLs:', urls);
  const result = await ingest(urls);
  res.json(result);
});

app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  const result = await queryPipeline(query);
  res.json(result);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
