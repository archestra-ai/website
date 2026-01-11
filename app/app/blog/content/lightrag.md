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

# Let's Start!

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
