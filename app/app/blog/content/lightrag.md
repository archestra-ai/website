---
title: 'Personal Movie Recommender with LightRAG and Archestra'
date: '2026-01-12'
author: 'Dominik Broj, Founding Engineer'
description: 'Practical guide to memory and knowledge base integration in Archestra via LightRAG'
image: '/blog/2026-01-12-main-image.webp'
---

Let's do something fun and useful today. Archestra is becoming more and more powerful and in this blog post I want to show you how easily you can integrate it with **LightRAG**, **Neo4j** and **Qdrant** to solve my personal problem. It's a good example of empowering Archestra with **knowledge base** and **memory** capabilities.

# The problem to solve

I've watched many TV shows on various streaming platforms and it's becoming increasingly challenging to find a good next candidate. There's just too many options and I want recommendations based on my preferences and historical data about what I've already watched and how I liked it.

To solve this, I want to build an agent that recommends me new TV shows based on what I like, what I've watched, how I rated previous shows and my current mood.

# Technological stack and architecture

The plan is to use **LightRAG** as a retrieval-augmented generation framework connected to **Neo4j** as graph storage and **Qdrant** as vector storage.

In short, [Neo4j](https://neo4j.com/) is a graph database that stores data as nodes and relationships. It's great for representing complex connections between entities - like TV shows, genres, actors and user preferences.

[Qdrant](https://qdrant.tech/) is a vector database built for similarity search. You can use it to find semantically similar content by comparing vector embeddings.

[LightRAG](https://arxiv.org/abs/2410.05779) uses both under the hood. Here's how they work together: when you ingest a document, LightRAG uses an LLM to extract entities (like "Breaking Bad", "crime drama", "Vince Gilligan") and relationships between them (like "Breaking Bad" → "is a" → "crime drama"). These entities and relationships are stored in Neo4j as a knowledge graph. At the same time, LightRAG creates vector embeddings for text chunks and entities, which are stored in Qdrant.

When you query LightRAG, it uses a dual-level retrieval approach. Low-level retrieval finds specific entities and their direct relationships - useful for questions like "what crime dramas are in the database?". High-level retrieval looks at broader themes and topics across the graph - useful for questions like "recommend something dark and intense". Both retrieval paths use the vector embeddings in Qdrant to find semantically relevant content, then traverse the knowledge graph in Neo4j to understand context and relationships. Finally, an LLM generates a response based on all retrieved information. [Here's](https://github.com/HKUDS/LightRAG/tree/main) its GH repo.

LightRAG can also be configured to use external key-value storage (for LLM response cache, text chunks, document information) like Redis or doc status storage like Postgres / MongoDB (for document indexing) but for simplicity we will just use default JsonFile for those two.

We're going to use managed cloud instances of Neo4j and Qdrant.

Then we need a running instance of Archestra and LightRAG. I'm going to use my own k8s cluster where I have Archestra deployed. I'll deploy LightRAG there on a separate namespace.

Next, we'll connect Archestra to LightRAG via MCP server that runs via [Archestra MCP Orchestrator](https://archestra.ai/docs/platform-orchestrator).

Lastly, we're going to use Archestra's Agent-to-Agent capabilities. We will have a main **Movie Recommender** agent connected to two subagents:

- **Movie Finder** - responsible for finding TV shows candidates
- **Movie Tracker** - responsible for tracking historical data of my watchings and ratings

We also need TV shows data to be entered into our storages via LightRAG. I'm going to use [themoviedb.org](https://www.themoviedb.org/) as a source of data.

<img src="/blog/2026-01-12-diagram.png" alt="Architecture Diagram" />

---

# Let's start preparation!

## Neo4j AuraDB instance

Create a Neo4j account if you haven't already. Then create an AuraDB instance - they offer a free tier which is enough for our use case.

Note down the credentials for later:

```bash
NEO4J_URI=<from_Connect_->_Developer_Hub>
NEO4J_USERNAME=neo4j # (default)
NEO4J_PASSWORD=<shown_after_instance_creation>
```

<img src="/blog/2026-01-12-neo4j.gif" alt="Setup Neo4j Aura DB" />

## Qdrant cluster

Time to create a Qdrant cluster. On your Qdrant account go to the Clusters page, enter a name and create a new instance. Again, there's a free tier available.

Note down the credentials for later:

```bash
QDRANT_URL=<cluster_endpoint>
QDRANT_API_KEY=<cluster_api_key>
```

<img src="/blog/2026-01-12-qdrant.gif" alt="Setup Qdrant cluster" />

## Deploy LightRAG server

We now have graph and vector storages ready to use. The next step is to deploy the LightRAG server. I'm going to use the [helm chart](https://github.com/HKUDS/LightRAG/tree/main/k8s-deploy/lightrag) from the official LightRAG repository.

Now we're going to use the environment variables we noted down before. You also need an LLM provider API key - I'm going to use OpenAI.

```bash
helm upgrade --install lightrag ./charts/lightrag \
  --namespace lightrag --create-namespace \
  -f k8s/lightrag-values.yaml \
  --set-string env.OPENAI_API_KEY='sk-your-openai-api-key' \
  --set-string env.LIGHTRAG_NEO4J_URI='neo4j+s://xxxxxxxx.databases.neo4j.io' \
  --set-string env.LIGHTRAG_NEO4J_USERNAME='neo4j' \
  --set-string env.LIGHTRAG_NEO4J_PASSWORD='your-neo4j-password' \
  --set-string env.LIGHTRAG_NEO4J_DATABASE='neo4j' \
  --set-string env.LIGHTRAG_QDRANT_URL='https://xxxxxxxx.cloud.qdrant.io:6333' \
  --set-string env.LIGHTRAG_QDRANT_API_KEY='your-qdrant-api-key' \
  --set-string env.LIGHTRAG_LLM_MODEL='gpt-4o-mini' \
  --set-string env.LIGHTRAG_EMBEDDING_MODEL='text-embedding-3-small' \
  --set-string env.LIGHTRAG_EMBEDDING_DIM='1536' \
  --wait
```

Once installed, you need a way to access the LightRAG API and UI. You can do it via kubectl port-forwarding:

```bash
kubectl port-forward -n lightrag svc/lightrag 9621:9621
```

Or you can configure an ingress controller, which I'll skip here for simplicity.

## Fetch TMDB data

We have LightRAG server running and connected to Neo4j and Qdrant. Now let's ingest some TV shows data from TMDB. Once you've created an account on TMDB, you can get an API key from your account settings.

First, I'll create a script that fetches data from TMDB and saves it to a JSON file. I'm interested in classic English TV shows (released before 2010), with a rating of 7 or higher and at least 200 votes. The script applies these filters accordingly.

**fetch-tmdb-tv-shows.mjs**

```mjs
import { writeFileSync } from 'fs';

const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  console.error('Error: TMDB_API_KEY environment variable is required');
  process.exit(1);
}

const BASE_URL = 'https://api.themoviedb.org/3/discover/tv';

const params = new URLSearchParams({
  'vote_average.gte': '7',
  'first_air_date.lte': '2009-12-31',
  'vote_count.gte': '200',
  with_original_language: 'en',
  sort_by: 'vote_average.desc',
});

async function fetchTvShows() {
  const allResults = [];

  for (let page = 1; page <= 5; page++) {
    const url = `${BASE_URL}?${params}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    allResults.push(...data.results);
    console.log(`Fetched page ${page}: ${data.results.length} shows`);
  }

  const output = {
    query_params: {
      vote_average_gte: 7,
      first_air_date_lte: '2009-12-31',
      vote_count_gte: 200,
      original_language: 'en',
      sort_by: 'vote_average.desc',
    },
    total_results: allResults.length,
    tv_shows: allResults,
  };

  writeFileSync('tmdb_tv_shows.json', JSON.stringify(output, null, 2));
  console.log(`\nSaved ${allResults.length} TV shows to tmdb_tv_shows.json`);
}

fetchTvShows();
```

You can run it with `TMDB_API_KEY=<your_key> node fetch-tmdb-tv-shows.mjs`. Shortly after, you'll have a `tmdb_tv_shows.json` file in the same directory.

## LightRAG data ingestion

The next step is to ingest data from the newly created `tmdb_tv_shows.json` into LightRAG. During ingestion, LightRAG will extract entities and relationships from the text, create vector embeddings for semantic search, and build a knowledge graph connecting all the TV shows, genres, and other metadata.

Let's create another script to help us ingest data programmatically.

**ingest-tv-shows.mjs**

```mjs
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load env vars from parent .env file
config({ path: './.env' });

const LIGHTRAG_DOMAIN = process.env.LIGHTRAG_DOMAIN || 'localhost:9621';
const LIGHTRAG_URL = LIGHTRAG_DOMAIN.includes('localhost') ? `http://${LIGHTRAG_DOMAIN}` : `https://${LIGHTRAG_DOMAIN}`;
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
const start = parseInt(args[0] || '0', 10);
const end = parseInt(args[1] || '101', 10);

async function ingestTvShows() {
  // Load TV shows data
  const data = JSON.parse(readFileSync('tmdb_tv_shows.json', 'utf-8'));
  const tvShows = data.tv_shows.slice(start, end);

  console.log(
    `Ingesting TV shows ${start + 1} to ${Math.min(end, data.tv_shows.length)} of ${data.tv_shows.length} total`
  );
  console.log(`LightRAG URL: ${LIGHTRAG_URL}\n`);

  let success = 0;
  let failed = 0;

  for (const show of tvShows) {
    // Format TV show as a document
    const document = `
Title: ${show.name}
Original Title: ${show.original_name}
First Air Date: ${show.first_air_date}
Rating: ${show.vote_average}/10 (${show.vote_count} votes)
Popularity: ${show.popularity}
Language: ${show.original_language}
Genre IDs: ${show.genre_ids.join(', ')}
Origin Country: ${show.origin_country.join(', ')}

Overview:
${show.overview}
`.trim();

    // Generate unique file_source (include ID to handle duplicates like "Battlestar Galactica")
    const fileSource = show.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + `_${show.id}.md`;

    try {
      const response = await fetch(`${LIGHTRAG_URL}/documents/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(LIGHTRAG_API_KEY && { 'X-API-Key': LIGHTRAG_API_KEY }),
        },
        body: JSON.stringify({ text: document, file_source: fileSource }),
      });

      if (response.ok) {
        console.log(`✓ Ingested: ${show.name} (${show.vote_average}/10)`);
        success++;
      } else {
        const error = await response.text();
        console.error(`✗ Failed: ${show.name} - ${response.status}: ${error}`);
        failed++;
      }
    } catch (error) {
      console.error(`✗ Failed: ${show.name} - ${error.message}`);
      failed++;
    }

    // Small delay to avoid overwhelming the API
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
}

ingestTvShows();
```

Put a `.env` file in the same directory with the required variables, then run it with `node ingest-tv-shows.mjs`. All 100 TV shows will be ingested into LightRAG, which you can observe in the LightRAG UI! 🎉

Note the knowledge graph it created.

<img src="/blog/2026-01-12-ingest.gif" alt="LightRAG ingestion" />

---

# Connect with Archestra

To connect LightRAG to Archestra, we'll use an MCP server that runs via Archestra MCP Orchestrator. We're going to use [my fork](https://github.com/brojd/lightrag-mcp) of [lightrag-mcp](https://github.com/shemhamforash23/lightrag-mcp) (the fork was needed to properly support connecting via HTTPS - we might contribute this back to the upstream repo later).

## Add MCP server to registry

Let's first add the MCP server to the MCP registry.

<img src="/blog/2026-01-12-mcp-registry.gif" alt="Add MCP Server to MCP registry" />

## Install MCP server and assign tools to profile

Now we need to install the MCP server. We provide the credentials required to connect with LightRAG. Under the hood, Archestra's MCP Orchestrator will start a pod for the server and discover its tools.

Then we assign the tools to a profile so they're available in the chat.

We'll also update the tool policies because we trust the content of the data we entered.

<img src="/blog/2026-01-12-install-mcp.gif" alt="Install MCP server and connect with profile" />

## Create agents

We're ready to create the agents! Recommender will orchestrate the whole process. Finder will be responsible for finding good TV show candidates while Tracker will make sure the user shares their feelings about already watched shows and will enrich the LightRAG knowledge graph with that feedback.

The key insight here is that when Tracker inserts user feedback into LightRAG, it gets processed just like any other document - LightRAG extracts entities and relationships from the feedback and links them to existing entities in the graph. So if I say "I loved Breaking Bad, especially the character development, 9/10", LightRAG will connect my positive sentiment to the Breaking Bad entity that's already in the graph. This way, future queries about "shows with great character development" or "shows I might like" will take my preferences into account.

Let's use these simple system prompts:

Movie Recommender (Orchestrator)

> You are a friendly movie recommendation assistant. At the start of each conversation, first delegate to Movie Tracker to check if the user has shared feelings about recently recommended shows—if not, ask the user to share their impressions before proceeding. When the user wants recommendations, delegate to Movie Finder. Summarize responses from subagents conversationally and guide the user through the experience.

Movie Finder (Subagent)

> You find TV show recommendations by querying LightRAG. Use the query tool to search for shows matching user preferences, mood, and viewing history. If the user's request is vague, ask clarifying questions about genre, mood, or preferences before searching. Return relevant recommendations with brief explanations of why each show might appeal to the user.

Movie Tracker (Subagent)

> You track the user's TV show watching history and ratings. When asked to check for feedback, query LightRAG for recent user activity and identify shows that were discussed but lack ratings. When collecting feedback, ask the user about their impressions and ratings (1-10), then use the LightRAG insert tool to add this feedback as a new entry. LightRAG will extract entities from the feedback and link them to existing shows in the knowledge graph, enriching future recommendations.

<img src="/blog/2026-01-12-agents.gif" alt="Create agents" />

# The Result 🎉

We're ready to test everything out. We start a chat with Movie Recommender. Every time I share my feelings about a TV show, the Movie Tracker subagent asks follow-up questions if needed and inserts my feedback into LightRAG as a new document. LightRAG then extracts entities from my feedback and connects them to existing shows in the knowledge graph. In new chat sessions, this enriched graph is available - when I ask for recommendations, Movie Finder queries LightRAG and my preferences are part of the context. The knowledge graph keeps growing with each feedback I provide.

<img src="/blog/2026-01-12-final-chat.gif" alt="Final chat demo" />

Exactly what I wanted!

Now I can finally focus on watching TV shows instead of spending time finding the right ones 😌🍿

<img src="/blog/2026-01-12-popcorn-giphy.gif" alt="More time for this" />
