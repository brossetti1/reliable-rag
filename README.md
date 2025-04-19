# reliable-rag

A minimal Retrieval-Augmented Generation (RAG) scaffold for ingesting web URLs into a vector store and querying them via a simple UI.

## 📖 README

### Overview
This lightweight project lets you:

1. **Ingest** web pages (URLs) → chunk text → store embeddings in Chroma.
2. **Query** that store via a RAG pipeline (retrieval → filter → generate) using OpenAI & Cohere.
3. **Serve** a local HTML/JS UI to manage ingestion and run queries.

### 🏗️ Architecture

```mermaid
flowchart LR
  subgraph Ingest Process
    U[User: URL list] -->|POST /api/ingest| S1[Express Server]
    S1 --> I[ingest.ts]
    I --> C[Chroma Vector Store]
  end

  subgraph Query Process
    Q[User: Query] -->|POST /api/query| S1
    S1 --> R[query.ts]
    R --> C
    R --> LLM[OpenAI]
    LLM --> R
    R --> F[results/*.json]
  end

  subgraph UI
    Browser --> index.html
    index.html --> app.js
    app.js -->|fetch| S1
  end
```

# Setup & Installation
## Clone & enter

```bash
git clone git@github.com:brossetti1/reliable-rag.git
cd reliable-rag
```

# Install dependencies (using pnpm or npm):

```bash
nvm use
pnpm install
# or
npm install
```

# Chroma setup

you can see the full instructions for [langchain chroma here](https://js.langchain.com/docs/integrations/vectorstores/chroma/). add chroma to docker and Run Chroma:

```bash
docker pull chromadb/chroma
docker run -p 8000:8000 chromadb/chroma
```
**If self‑hosting, start your Chroma DB at the URL above.

# Env vars: Create a .env file:

```bash
OPENAI_API_KEY=your_key_here
COHERE_API_KEY=your_key_here
CHROMA_SERVER_URL=http://localhost:8000
```


# ▶️ Running Locally
## Start server & UI

```bash
pnpm dev
```

Then open http://localhost:3000 in your browser.


# Project Structure

```bash
reliable-rag/
├── .gitignore
├── package.json
├── tsconfig.json
├── ingest.ts
├── query.ts
├── server.ts
├── results/           # (auto-created) query outputs
└── public/
    ├── index.html
    └── app.js
```
