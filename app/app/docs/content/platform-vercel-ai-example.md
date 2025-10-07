---
title: Secure Agent with Vercel AI
category: Archestra Platform
subcategory: Practical Examples
order: 7
---

## Overview

[**AI SDK**](https://ai-sdk.dev) - an open-source toolkit from Vercel that simplifies building AI-driven applications: unified provider support (OpenAI, Claude, Hugging-Face, etc.), streaming, tools execution, error handling, and more. While it offers great developer ergonomics and abstractions, out of the box it does *not* enforce runtime controls to guard against data leakage, untrusted context influence, or malicious tool-calls. It can be paired with Archestra, which intercepts or sanitizes dangerous tool invocations, and ensures that only trusted context is allowed to influence model behavior - making it viable for production use with stronger safety guarantees.

In this guide we will use an exemplary Express (Node.js) application to show how seamlessly agents written with AI SDK can be reconfigured to use Archestra as a security layer.

The full example can be found on: [https://github.com/archestra-ai/archestra/platform/examples/ai-sdk-express](https://github.com/archestra-ai/archestra/platform/examples/ai-sdk-express)

## Step 1. Get your OpenAI API Key

To use OpenAI models (such as GPT-4 or o3-mini), you need an API key from a supported provider.

You can use:

* OpenAI directly ([https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys))
* Azure OpenAI
* Any OpenAI-compatible service (e.g., LocalAI, FastChat, Helicone, LiteLLM, OpenRouter etc.)

👉 Once you have the key, copy it and keep it handy.

## Step 2. Run Archestra Platform locally

```shell
docker run -p 9000:9000 -p 3000:3000 archestra/platform
```

## Step 3. Integrate AI SDK with Archestra

At first, you need to change baseUrl and point it to Archestra's proxy which runs on [`http://localhost:9000/v1`](http://localhost:9000/v1).
Also, make sure that you configure the AI SDK to use [Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) which is currently supported by Archestra. It can be done simply by appending `.chat` to the OpenAI provider instance.

```ts
 const customOpenAI = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "http://localhost:9000/v1", // 1. use Archestra URL
  }).chat; // 2. Add .chat because Archestra supports Chat Completions API

  const result = streamText({
    model: customOpenAI('gpt-4o'),
    messages: conversationHistory,
  });
```

Feel free to use our official Node.js (Express) CLI chat example:

```shell
git clone git@github.com:archestra-ai/archestra.git
cd examples/ai-sdk-express
pnpm install
pnpm dev
```

## Step 4. Observe chat history in Archestra

Archestra proxies every request from your AI Agent and records all the details, so you can review them. Just send some messages from your agent and then:

1. Open [http://localhost:3000](http://localhost:3000) and navigate to **Chat**
2. In the table with conversations open any of them by clicking on the **Details**

## Step 5. See the tools in Archestra and configure the rules

Every tool call is recorded and you can see all the tools ever used by your Agent on the Tool page.

By default, every tool call result is untrusted, e.g. it can poison the context of your agent with prompt injection by email from stranger, or by sketchy website.

Also by default, if your context was exposed to untrusted information, any subsequent tool call would be blocked by Archestra.

This rule might be quite limiting for the agent, but you can additional rules to validate the input (the arguments for the tool calls) and allow the tool call even if the context is untrusted

![Add Tool Call Policy](/docs/platfrom/add-tool-call-policy.png)

I.e. we can always allow `fetch` to open `google.com`, even if the context _might_ have a prompt injection and is untrusted

Also we can add a rule to what to consider as untrusted content. E.g. in Tool Result Policies, if we know that we queried our corporate website, we know that we the result will be trusted, and therefore, tool calling would still be allowed.

![Add Tool Result Policy](/docs/platfrom/add-tool-result-policy.png)

The decision tree for Archestra would be:

![Archestra Decision Tree](/docs/platfrom/archestra-decision-tree.png)

## All Set!

Now you are safe from Lethal Trifecta type attacks and prompt injections cannot influence your agent.
