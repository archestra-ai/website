---
title: "A self-hosted Movie Recommendation Agent with LightRAG and MCP's"
date: '2026-01-12'
author: 'Dominik Broj, Founding Engineer'
description: 'Practical guide to memory and knowledge base integration in Archestra via LightRAG'
image: '/blog/2026-01-12-main-image.webp'
---

I've watched so many TV shows that finding the next one has become a mission. I keep jumping between streaming platforms trying to find something I actually want to watch. Filters barely help. And when a friend recommends something great but not that popular? Good luck finding it unless you know the exact title.

What I want is recommendations based on my preferences and what I've already watched - not just what's popular right now. I don't want to be locked into a specific platform. I want a single place where I can search shows across all of them.

To solve this, let's build an AI agent that recommends TV shows based on your taste and current mood. It will act as a personal movie expert that actually remembers what you enjoyed in the past.

We will leverage **LightRAG**, **Neo4j**, and **Qdrant** to create an intelligent system that learns from feedback. Finally, we'll use **Archestra** as the orchestration layer to connect these components, giving our agent the persistent **knowledge base** and **memory** capabilities it needs to be effective.

# Technological stack and architecture

**LightRAG** - a retrieval-augmented generation framework - will be backed by **Neo4j** as graph storage and **Qdrant** as vector storage. **Archestra** will be connected to LightRAG via MCP server that runs via [Archestra MCP Orchestrator](https://archestra.ai/docs/platform-orchestrator)..

<img src="/blog/2026-01-12-diagram.png" alt="Architecture Diagram" />

[Neo4j](https://neo4j.com/) acts as a storage for complex relationships, while [Qdrant](https://qdrant.tech/) handles vector similarity search.

[LightRAG](https://arxiv.org/abs/2410.05779) combines them nicely: it extracts entities and relationships into **Neo4j** and stores embeddings in **Qdrant**. This enables dual-level retrieval - finding specific facts via the graph and broad themes via vectors. For key-value storage (used for caching) and doc status storage (tracks which documents have been processed), we'll just use the default **JSONFile**.

Our agent architecture consists of:

- **Movie Recommender** - The main orchestrator.
- **Movie Finder** - Sub-agent that finds content.
- **Movie Tracker** - Sub-agent that manages watch history.

For data, we'll ingest TV shows from [themoviedb.org](https://www.themoviedb.org/).

---

# Let's get started

## Prerequisites

You'll need:
- **Docker** - for running Neo4j, Qdrant and LightRAG
- **Node.js** - for running the data scripts
- **OpenAI API key** - LightRAG uses it for LLM and embeddings
- **TMDB API key** - for fetching TV shows data (free account at [themoviedb.org](https://www.themoviedb.org/))

## Neo4j and Qdrant

Fire up both databases locally:

```bash
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your-password \
  neo4j:latest

docker run -d --name qdrant \
  -p 6333:6333 -p 6334:6334 \
  qdrant/qdrant:latest
```

Neo4j browser is at `http://localhost:7474`, Qdrant dashboard at `http://localhost:6333/dashboard`.

## LightRAG server

Now the fun part - let's spin up LightRAG and connect it to both databases:

```bash
docker run -d --name lightrag \
  -p 9621:9621 \
  -e LLM_BINDING=openai \
  -e LLM_MODEL=gpt-4o-mini \
  -e EMBEDDING_BINDING=openai \
  -e EMBEDDING_MODEL=text-embedding-3-small \
  -e OPENAI_API_KEY=sk-your-openai-key \
  -e LIGHTRAG_GRAPH_STORAGE=Neo4JStorage \
  -e LIGHTRAG_VECTOR_STORAGE=QdrantVectorDBStorage \
  -e NEO4J_URI=bolt://host.docker.internal:7687 \
  -e NEO4J_USERNAME=neo4j \
  -e NEO4J_PASSWORD=your-password \
  -e QDRANT_URL=http://host.docker.internal:6333 \
  --add-host=host.docker.internal:host-gateway \
  ghcr.io/hkuds/lightrag:latest
```

The `host.docker.internal` trick lets the LightRAG container talk to Neo4j and Qdrant running on your host machine.

Once it's up, the LightRAG UI is available at `http://localhost:9621`.

## Fetch TMDB data

[This script](https://gist.github.com/brojd/3493c6bd5ddfb8c575b7c7da321774fd) fetches classic English TV shows from TMDB - released before 2010, rated 7+ with at least 200 votes (adjust these filters to your needs). Grab it and run:

```bash
TMDB_API_KEY=your-key node fetch-tmdb-tv-shows.mjs
```

You'll get a `tmdb_tv_shows.json` file with 100 TV shows.

## Ingest data into LightRAG

Now let's feed this data to LightRAG. During ingestion, LightRAG extracts entities and relationships from the text, creates vector embeddings and builds a knowledge graph connecting all the shows, genres and metadata.

[This script](https://gist.github.com/brojd/3f8faff370abe01b3dd3ed2ffea373db) reads the JSON and sends each show to LightRAG's API. Grab it and run:

```bash
node ingest-tv-shows.mjs
```

All 100 TV shows will be ingested into LightRAG. Check out the knowledge graph it builds in the UI.

<img src="/blog/2026-01-12-ingest.gif" alt="LightRAG ingestion" />

---

# Connect with Archestra

First, let's get Archestra running. The quickstart mode spins up everything you need including an embedded Kubernetes cluster for MCP server orchestration:

```bash
docker run -p 9000:9000 -p 3000:3000 \
  -e ARCHESTRA_QUICKSTART=true \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v archestra-postgres-data:/var/lib/postgresql/data \
  -v archestra-app-data:/app/data \
  archestra/platform
```

Once it's up, head to `http://localhost:3000` to access the UI.

Now let's connect LightRAG. We'll use an MCP server that runs via Archestra MCP Orchestrator - specifically [my fork](https://github.com/brojd/lightrag-mcp) of [lightrag-mcp](https://github.com/shemhamforash23/lightrag-mcp) (the fork adds proper HTTPS support).

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

> You are a friendly movie recommendation assistant. At the start of each conversation, first delegate to Movie Tracker to check if the user has shared feelings about recently recommended shows - if not, ask the user to share their impressions before proceeding. When the user wants recommendations, delegate to Movie Finder. Summarize responses from subagents conversationally and guide the user through the experience.

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
