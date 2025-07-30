#!/usr/bin/env npx tsx

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { MCPServer } from '../data/types';

const execAsync = promisify(exec);

// Function to extract categories from the types.ts file
function extractCategories(): string[] {
  const typesPath = path.join(__dirname, '../data/types.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf-8');
  
  // Find the category type definition
  const categoryMatch = typesContent.match(/category:\s*\n\s*\|([\s\S]*?)\s*\|\s*null;/);
  
  if (!categoryMatch) {
    throw new Error('Could not find category definition in types.ts');
  }
  
  // Extract all quoted strings from the union type
  const categorySection = categoryMatch[1];
  const categories = categorySection
    .split('|')
    .map(line => line.trim())
    .filter(line => line.startsWith('"') && line.endsWith('"'))
    .map(line => line.slice(1, -1)); // Remove quotes
  
  return categories;
}

async function callOllama(prompt: string, format?: any, model = 'deepseek-r1:14b'): Promise<string> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: format || 'json',
        options: {
          temperature: 0.1,
          top_p: 0.9
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error('Error calling Ollama:', error);
    throw error;
  }
}

async function extractConfigFromReadme(server: MCPServer, model = 'deepseek-r1:14b'): Promise<Record<string, any> | null> {
  const content = server.readme || server.description;
  
  if (!content) {
    return null;
  }
  
  // Use full content for better context
  const contentSnippet = content;
  
  const prompt = `You are extracting MCP server run configuration from README documentation.

README Content:
${contentSnippet}

TASK: Find the command to RUN this MCP server (not how clients connect to it).

STEP BY STEP:
1. Look for "Usage", "Quick Start", or "Getting Started" sections
2. Find commands that START the server process
3. Look for patterns like:
   - "npx package-name"
   - "npx -y @scope/package"
   - "node dist/server.js"

IGNORE:
- Client connection examples (with "type": "http", "url")
- npm install, git clone, docker build commands
- Development commands (npm run dev, test, build)
- curl, wget, or API calls

EXAMPLES:
README shows: "npx -y @1mcp/agent" → Extract as: {"command": "npx", "args": ["-y", "@1mcp/agent"]}
README shows: "node dist/index.js" → Extract as: {"command": "node", "args": ["dist/index.js"]}

Focus on the SIMPLEST command to start the server.`;

  const configFormat = {
    type: 'object',
    properties: {
      config: {
        type: ['object', 'null'],
        properties: {
          mcpServers: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                command: { type: 'string' },
                args: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['command', 'args']
            }
          }
        }
      }
    },
    required: ['config']
  };

  try {
    const responseText = await callOllama(prompt, configFormat, model);
    const parsed = JSON.parse(responseText);
    return parsed.config || null;
  } catch (error) {
    console.warn(`Failed to extract config for ${server.slug}:`, error);
    return null;
  }
}

async function categorizeServer(server: MCPServer, categories: string[], model = 'deepseek-r1:14b'): Promise<string> {
  const content = server.readme || server.description;
  const isReadme = !!server.readme;
  
  if (!isReadme) {
    console.log(`No README for ${server.slug}, using description`);
  }
  
  // Use full content for better categorization
  const contentSnippet = content;
  
  const prompt = `Based on this MCP server ${isReadme ? 'README' : 'description'}, categorize it into ONE of these categories: ${categories.join(', ')}.

${isReadme ? 'README' : 'Description'}:
${contentSnippet}

Guidelines:
- Choose the most specific category that fits
- Consider the primary function/purpose of the server
- If it serves multiple purposes, choose the dominant one

Respond with a JSON object containing only a "category" field with the exact category name from the list above.
Example response: {"category": "Browser Automation"}`;

  const categoryFormat = {
    type: 'object',
    properties: {
      category: { 
        type: 'string',
        enum: categories
      }
    },
    required: ['category']
  };

  try {
    const responseText = await callOllama(prompt, categoryFormat, model);
    const parsed = JSON.parse(responseText);
    const category = parsed.category;
    
    // Validate the response
    if (categories.includes(category)) {
      return category;
    }
    
    // If invalid response, try to find closest match
    const lowerCategory = category.toLowerCase();
    const match = categories.find(c => c.toLowerCase() === lowerCategory);
    
    if (match) {
      return match;
    }
    
    console.warn(`Invalid category "${category}" returned, defaulting to "Utilities"`);
    return 'Utilities';
  } catch (error) {
    console.warn(`Failed to parse JSON response: "${responseText}", defaulting to "Utilities"`);
    return 'Utilities';
  }
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const processAll = args.includes('--all') || args.includes('-a');
  
  // Find specific server argument
  let specificServer: string | null = null;
  const serverArgIndex = args.findIndex(arg => arg === '--server' || arg === '-s');
  if (serverArgIndex !== -1 && args[serverArgIndex + 1]) {
    specificServer = args[serverArgIndex + 1];
  }
  
  // Find model argument
  let model = 'deepseek-r1:14b';
  const modelArgIndex = args.findIndex(arg => arg === '--model' || arg === '-m');
  if (modelArgIndex !== -1 && args[modelArgIndex + 1]) {
    model = args[modelArgIndex + 1];
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🤖 MCP Server Analysis Script\n');
    console.log('Usage: npx tsx analyze-servers-with-ai.ts [options]\n');
    console.log('Options:');
    console.log('  --all, -a               Process all servers (re-categorize and re-extract configs for all)');
    console.log('  --server <slug>, -s     Process only the specified server by slug');
    console.log('  --model <model>, -m     Specify Ollama model to use (default: deepseek-r1:14b)');
    console.log('  --help, -h              Show this help message');
    console.log('\nExamples:');
    console.log('  npx tsx analyze-servers-with-ai.ts --server microsoft__playwright-mcp');
    console.log('  npx tsx analyze-servers-with-ai.ts --all');
    console.log('  npx tsx analyze-servers-with-ai.ts --model deepseek-r1:32b --all');
    return;
  }

  console.log(`🤖 Starting MCP server analysis using Ollama ${model}...`);
  if (specificServer) {
    console.log(`🎯 Processing specific server: ${specificServer}\n`);
  } else if (processAll) {
    console.log('🔄 Processing ALL servers (re-categorizing and re-extracting configs)\n');
  } else {
    console.log('⏭️  Skipping servers with existing categories and configs (use --all to override)\n');
  }
  
  // Extract categories from types file
  let categories: string[];
  try {
    categories = extractCategories();
    console.log(`📋 Found ${categories.length} categories in types.ts\n`);
  } catch (error) {
    console.error('❌ Error extracting categories:', error);
    process.exit(1);
  }
  
  // Check if Ollama is running
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error('Ollama not responding');
    }
  } catch (error) {
    console.error('❌ Ollama is not running. Please start Ollama first.');
    console.error('   Run: ollama serve');
    process.exit(1);
  }
  
  // Check if specified model is available
  try {
    const { stdout } = await execAsync('ollama list');
    if (!stdout.includes(model)) {
      console.error(`❌ ${model} model not found.`);
      console.error(`   Run: ollama pull ${model}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error checking Ollama models:', error);
    process.exit(1);
  }
  
  const evaluationsDir = path.join(__dirname, '../data/mcp-evaluations');
  let files = fs.readdirSync(evaluationsDir).filter(f => f.endsWith('.json'));
  
  // Filter to specific server if requested
  if (specificServer) {
    const targetFile = `${specificServer}.json`;
    if (files.includes(targetFile)) {
      files = [targetFile];
      console.log(`Found target server file: ${targetFile}\n`);
    } else {
      console.error(`❌ Server file not found: ${targetFile}`);
      console.error(`Available servers: ${files.map(f => f.replace('.json', '')).join(', ')}`);
      process.exit(1);
    }
  } else {
    console.log(`Found ${files.length} evaluation files to process.\n`);
  }
  
  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of files) {
    const filePath = path.join(evaluationsDir, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const server = JSON.parse(content) as MCPServer;
      
      // Skip if already has a valid category and config (unless processAll is true or specific server)
      if (!processAll && !specificServer && server.category && categories.includes(server.category) && server.configToRun) {
        console.log(`✓ ${server.slug} - Already processed (category: "${server.category}", config: present)`);
        skipped++;
        continue;
      }
      
      // Log existing data if present and we're re-processing
      if ((processAll || specificServer) && (server.category || server.configToRun)) {
        const currentCategory = server.category ? `"${server.category}"` : 'none';
        const currentConfig = server.configToRun ? 'present' : 'none';
        console.log(`🔄 ${server.slug} - Processing (category: ${currentCategory}, config: ${currentConfig})`);
      }
      
      console.log(`🔍 Processing ${server.slug}...`);
      
      // Extract category
      const category = await categorizeServer(server, categories, model);
      server.category = category as any;
      
      // Extract configuration if not already present or if processing all
      if (!server.configToRun || processAll) {
        console.log(`🔧 Extracting configuration for ${server.slug}...`);
        const config = await extractConfigFromReadme(server, model);
        if (config) {
          server.configToRun = config;
          console.log(`✅ ${server.slug} - Configuration extracted`);
        } else {
          console.log(`⚠️  ${server.slug} - No configuration found in README`);
        }
      }
      
      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(server, null, 2) + '\n');
      
      const configStatus = server.configToRun ? " + config" : "";
      console.log(`✅ ${server.slug} - Categorized as "${category}"${configStatus}\n`);
      updated++;
      
      // Add a small delay to avoid overwhelming Ollama
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
      errors++;
    }
    
    processed++;
    
    // Progress update every 10 files
    if (processed % 10 === 0) {
      console.log(`\n📊 Progress: ${processed}/${files.length} files processed\n`);
    }
  }
  
  console.log('\n✨ Analysis complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Total files: ${files.length}`);
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Skipped (already categorized): ${skipped}`);
  console.log(`   - Errors: ${errors}`);
  
  if (!processAll && skipped > 0) {
    console.log(`\n💡 Tip: Use --all to process all servers, including those already categorized and configured.`);
  }
}

// Run the script
main().catch(console.error);