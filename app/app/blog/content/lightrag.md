---
title: 'LightRAG'
date: '2026-01-12'
author: 'Dominik Broj, Founding Engineer'
description: 'Building personal Movie Recommendation assistant with Archestra, LightRAG, Neo4j and Qdrant'
image: '/blog/2026-01-12-main-image.webp'
---

Let's do something fun and useful today. Archestra becomes more and more powerful and in this blog post I want to show you how easily you can integrate it with **LightRAG**, **Neo4j** and **Qdrant** in order to solve my personal problem. That's a good example of empowering Archestra with **knowledge base** and **memory** capabilities.

# The problem to solve

I watched many TV shows on VOD and it becomes more and more challenging to find a good next candidate based on my preferences and historical data about what I watched and how I liked it.

In order to solve it, I want to build an agent that can recommend me new TV shows candidates I can watch based on what I like, what I watched, how I rated previous watchings and my mood.

# Technological stack and architecture

The plan is to **LightRAG** as <AI_pls_fill> connected to **Neo4j** as a graph storage and **Qdrant** as a vector storage.

In short, [Neo4j](https://neo4j.com/) is a <AI_pls_fill> that allows you to <AI_pls_fill>.

[Qdrant](https://qdrant.tech/) is <AI_pls_fill> and you can use it to <AI_pls_fill>.

[LightRAG](https://arxiv.org/abs/2410.05779) can use both under the hood. Thanks to that <AI_pls_fill>. [Here's](https://github.com/HKUDS/LightRAG/tree/main) its GH repo

LightRAG can also be configured to use external key-value storage (for LLM response cache, text chunks, document information) like Redis or doc status storage like Postgres / MongoDB (for document indexing) but for simplity we will just use default JsonFile for those two.

We are going to use managed cloud instances of Neo4j and Qdrant.

Then we need a running instance of Archestra and LightRAG. I'm going to use my own k8s cluster where I have Archestra deployed. I'll deploy LightRAG there on separate namespace.

Then we're going to connect Archestra to LightRAG via MCP server that runs via [Archestra MCP Orchestrator](https://archestra.ai/docs/platform-orchestrator).

Lastly, we are going to use new Archestra's Agent-to-Agent capabilities. We will have main Movie Recommender agent connected to two subagents:
- Movie Finder - responsible for finding TV shows candidates
- Movie Tracker - responsible for tracking historical data of my watchings and ratings

We also need TV shows to be entered to our storages via LightRAG. I'm going to use [themoviedb.org](https://www.themoviedb.org/) as a source of data.

<img src="/blog/2026-01-12-diagram.png" alt="Architecture Diagram" />

---

# Let's start preparation!

## Neo4j Aura DB instance

Create Neo4j account if you haven't already. Then create AuraDB instance.

Note down for later:
```bash
NEO4J_URI=<from_Connect_->_Developer_Hub>
NEO4J_USERNAME=neo4j # (default)
NEO4J_PASSWORD=<shown_after_instance_creation>
```

<img src="/blog/2026-01-12-neo4j.gif" alt="Setup Neo4j Aura DB" />

## Qdrant cluster

Time to create Qdrant cluster. On your Qdrant account go to Clusters page, enter the name and create new instance.

Note down for later:
```bash
QDRANT_URL=<cluster_endpoint>
QDRANT_API_KEY=<cluster_api_key>
```

<img src="/blog/2026-01-12-qdrant.gif" alt="Setup Qdrant cluster" />

## Deploy LightRAG server

We have now Graph and Vector storages ready to use. The next step is to deploy LightRAG server. To do so, I'm going to use [helm chart](https://github.com/HKUDS/LightRAG/tree/main/k8s-deploy/lightrag) from official LightRAG repository.

Now we're going to use environment variables written down before. You also need LLM provider API key. I'm going to use OpenAI.

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

Once installed, you need a way to access LightRAG API and UI. You can do it via kubectl port-forwarding:
```bash
kubectl port-forward -n lightrag svc/lightrag 9621:9621
```

or configure ingress controller which I'll skip for simplicity.

## Fetch TMDB data

We have LightRAG server running and connected to Neo4j and Qdrant. Let's ingest TV shows data from TMDB. Once an account on TMDB is created, you can get the API key.

At first I'll create a script that will fetch data from TMDB and will save it into JSON file on my local file system. I'm interested in English TV shows produced in 2010 or later, with rating greater or equal to 7 that have at least 200 votes. The script applies those filters accordingly.

**fetch-tmdb-tv-shows.mjs**
```mjs
import { writeFileSync } from "fs";

const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  console.error("Error: TMDB_API_KEY environment variable is required");
  process.exit(1);
}

const BASE_URL = "https://api.themoviedb.org/3/discover/tv";

const params = new URLSearchParams({
  "vote_average.gte": "7",
  "first_air_date.lte": "2009-12-31",
  "vote_count.gte": "200",
  with_original_language: "en",
  sort_by: "vote_average.desc",
});

async function fetchTvShows() {
  const allResults = [];

  for (let page = 1; page <= 5; page++) {
    const url = `${BASE_URL}?${params}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    allResults.push(...data.results);
    console.log(`Fetched page ${page}: ${data.results.length} shows`);
  }

  const output = {
    query_params: {
      vote_average_gte: 7,
      first_air_date_lte: "2009-12-31",
      vote_count_gte: 200,
      original_language: "en",
      sort_by: "vote_average.desc",
    },
    total_results: allResults.length,
    tv_shows: allResults,
  };

  writeFileSync("tmdb_tv_shows.json", JSON.stringify(output, null, 2));
  console.log(`\nSaved ${allResults.length} TV shows to tmdb_tv_shows.json`);
}

fetchTvShows();
```

You can run it with `export API_KEY=<your_key> node fetch-tmdb-tv-shows.mjs`. Shortly after you will have `tmdb_tv_shows.json` file in the same directory.

## LightRAG data ingestion

The next step is to ingest data from newly created `tmdb_tv_shows.json` into LightRAG. What LightRAG will do as a part of data ingestion is <AI_pls_fill>.

Let's again create a script that will help us ingest data programmatically.

**ingest-tv-shows.mjs**
```mjs
import { readFileSync } from "fs";
import { config } from "dotenv";

// Load env vars from parent .env file
config({ path: "./.env" });

const LIGHTRAG_DOMAIN = process.env.LIGHTRAG_DOMAIN || "localhost:9621";
const LIGHTRAG_URL = LIGHTRAG_DOMAIN.includes("localhost")
  ? `http://${LIGHTRAG_DOMAIN}`
  : `https://${LIGHTRAG_DOMAIN}`;
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
const start = parseInt(args[0] || "0", 10);
const end = parseInt(args[1] || "101", 10);

async function ingestTvShows() {
  // Load TV shows data
  const data = JSON.parse(readFileSync("tmdb_tv_shows.json", "utf-8"));
  const tvShows = data.tv_shows.slice(start, end);

  console.log(`Ingesting TV shows ${start + 1} to ${Math.min(end, data.tv_shows.length)} of ${data.tv_shows.length} total`);
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
Genre IDs: ${show.genre_ids.join(", ")}
Origin Country: ${show.origin_country.join(", ")}

Overview:
${show.overview}
`.trim();

    // Generate unique file_source (include ID to handle duplicates like "Battlestar Galactica")
    const fileSource = show.name.toLowerCase().replace(/[^a-z0-9]+/g, "_") + `_${show.id}.md`;

    try {
      const response = await fetch(`${LIGHTRAG_URL}/documents/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(LIGHTRAG_API_KEY && { "X-API-Key": LIGHTRAG_API_KEY }),
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

Put `.env` file in the same directory, then run it with `node ingest-tv-shows.mjs`. All 100 TV shows are going to be ingested to LightRAG which you can observe in LightRAG UI! :tada:

Note the knowledge graph it created :)

<img src="/blog/2026-01-12-ingest.gif" alt="LightRAG ingestion" />

---

# Connect with Archestra

In order to connect LightRAG to Archestra we will use MCP server that will run via Archestra MCP Orchestrator. We are going to use [my fork](https://github.com/brojd/lightrag-mcp) of [lightrag-mcp](https://github.com/shemhamforash23/lightrag-mcp) (fork was needed to properly support connecting via https, we might contribute to upstream repo afterwards).

## Add MCP server to registry

Let's first add MCP server to MCP registry.

<img src="/blog/2026-01-12-mcp-registry.gif" alt="Add MCP Server to MCP registry" />

## Install MCP server and assign tools to profile

Now we need to install MCP server. We need to provide credentials required to connect with LightRAG. Under the hood, Archestra's MCP Orchestrator will start the pod for the server and will discover its tools.

Then we can assign tools to the profile so that the tools are available in the chat.

We will also update tools policies because we trust the content of the data we entered.

<img src="/blog/2026-01-12-install-mcp.gif" alt="Install MCP server and connect with profile" />

## Create agents

We are ready to create agents! Recommender will orchestrate the whole process. Finder will be responsible for finding good TV shows candidates while Tracker will make sure user shares fellings about already watched tv shows and will update the LightRAG data accordingly.

Let's use those simple system prompts:

Movie Recommender (Orchestrator)
> You are a friendly movie recommendation assistant. At the start of each conversation, first delegate to Movie Tracker to check for any watched shows missing ratings or impressions—if found, ask the user to share their feelings before proceeding. When the user wants recommendations, delegate to Movie Finder. Summarize responses from subagents conversationally and guide the user through the experience.

Movie Finder (Subagent)
> You find TV show recommendations by querying LightRAG. Use the query tool to search for shows matching user preferences, mood, and viewing history. If the user's request is vague, ask clarifying questions about genre, mood, or preferences before searching. Return relevant recommendations with brief explanations of why each show might appeal to the user.

Movie Tracker (Subagent)
> You track the user's TV show watching history and ratings. When asked to check for missing data, query LightRAG for shows that were recommended but lack user ratings or impressions, and report them back. When collecting feedback, ask the user about their impressions and ratings (1-10), then use the LightRAG insert tool to update the knowledge base so future recommendations reflect their preferences. Every time you get useful info from the user, you must update corresponding document in LightRAG.

<img src="/blog/2026-01-12-agents.gif" alt="Create agents" />

# The Result :tada:

We are ready to test everything out. We start the chat with Movie Recommender. Every time I share feelings about some TV shows, it Movie Tracker subagent asks follow-up questions if needed and record the answers in LightRAG. New chats have this knowledge and when I ask about next recommendations Movie Finder take it into account. It uses LightRAG data and is being constantly updated based on the impressions I'm proactively asked for by Movie Tracker.

<img src="/blog/2026-01-12-final-chat.gif" alt="Create agents" />

Exactly what I wanted!

Now I can finally focus on watching TV shows instead of spending time finding the right ones :relieved: :popcorn:
