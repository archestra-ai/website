#!/usr/bin/env tsx

/**
 * MCP Official Servers Analysis Script
 * 
 * This script analyzes the MCP servers catalog to identify official servers
 * and generates data files used by the web application.
 * Run with: tsx app/mcp-catalog/scripts/analyze-official-servers.ts
 */

import fs from 'fs';
import { analyzeAllServers, type AnalysisReport } from '../lib/official-server-detector';
import { MCP_SERVERS_JSON_FILE_PATH } from './paths';

// Output path following existing pattern
const OFFICIAL_SERVERS_DATA_PATH = MCP_SERVERS_JSON_FILE_PATH.replace('mcp-servers.json', 'official-servers.json');

async function main() {
  try {
    console.log('🔍 Loading MCP servers catalog...');
    
    // Read the servers JSON file
    const serversJson = fs.readFileSync(MCP_SERVERS_JSON_FILE_PATH, 'utf-8');
    const serverUrls: string[] = JSON.parse(serversJson);
    
    console.log(`📊 Analyzing ${serverUrls.length} servers...`);
    
    // Analyze all servers
    const analysis: AnalysisReport = analyzeAllServers(serverUrls);
    
    // Display summary
    console.log('\n📈 Analysis Summary:');
    console.log(`- ✅ Official: ${analysis.summary.officialCount} (${((analysis.summary.officialCount / analysis.totalServers) * 100).toFixed(1)}%)`);
    console.log(`- 🏢 Corporate: ${analysis.summary.corporateCount} (${((analysis.summary.corporateCount / analysis.totalServers) * 100).toFixed(1)}%)`);
    console.log(`- 👥 Community: ${analysis.summary.communityCount} (${((analysis.summary.communityCount / analysis.totalServers) * 100).toFixed(1)}%)`);
    console.log(`- ❓ Unclear: ${analysis.summary.unclearCount} (${((analysis.summary.unclearCount / analysis.totalServers) * 100).toFixed(1)}%)`);
    
    // Show top official companies
    console.log('\n🏆 Top Official Companies:');
    const officialByCompany = analysis.official.reduce((acc, server) => {
      const company = server.companyName || 'Unknown';
      if (!acc[company]) acc[company] = [];
      acc[company].push(server);
      return acc;
    }, {} as Record<string, typeof analysis.official>);
    
    Object.entries(officialByCompany)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 10)
      .forEach(([company, servers]) => {
        console.log(`  - ${company}: ${servers.length} server${servers.length > 1 ? 's' : ''}`);
      });
    
    // Prepare data for web application use
    const officialServersData = {
      lastAnalyzed: new Date().toISOString(),
      totalServers: analysis.totalServers,
      summary: analysis.summary,
      officialServers: analysis.official.map(server => ({
        url: server.url,
        companyName: server.companyName,
        orgName: server.orgName,
        confidence: server.confidence,
        reasoning: server.reasoning
      })),
      // Quick lookup for the catalog UI
      officialUrls: analysis.official.map(s => s.url)
    };
    
    // Save official servers data for web app consumption
    fs.writeFileSync(OFFICIAL_SERVERS_DATA_PATH, JSON.stringify(officialServersData, null, 2));
    
    console.log(`\n✅ Official servers data saved to: ${OFFICIAL_SERVERS_DATA_PATH}`);
    console.log(`📊 Ready for web application integration`);
    console.log('\n🎉 Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as analyzeOfficialServers };