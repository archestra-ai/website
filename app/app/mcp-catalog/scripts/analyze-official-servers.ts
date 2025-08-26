#!/usr/bin/env tsx

/**
 * MCP Official Servers Analysis Script
 * 
 * This script analyzes the MCP servers catalog to identify and report on official servers.
 * Run with: tsx app/mcp-catalog/scripts/analyze-official-servers.ts
 */

import fs from 'fs';
import path from 'path';
import { analyzeAllServers, generateDetailedReport, type AnalysisReport } from '../lib/official-server-detector';

const SERVERS_JSON_PATH = path.join(__dirname, '../data/mcp-servers.json');
const REPORTS_DIR = path.join(__dirname, '../../../docs/analysis');

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function main() {
  try {
    console.log('🔍 Loading MCP servers catalog...');
    
    // Read the servers JSON file
    const serversJson = fs.readFileSync(SERVERS_JSON_PATH, 'utf-8');
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
    
    // Show top official servers
    console.log('\n🏆 Top Official Servers:');
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
    
    // Generate detailed report
    console.log('\n📝 Generating detailed report...');
    const detailedReport = generateDetailedReport(analysis);
    
    // Ensure reports directory exists
    ensureDirectoryExists(REPORTS_DIR);
    
    // Save reports
    const timestamp = new Date().toISOString().slice(0, 10);
    const reportPath = path.join(REPORTS_DIR, `official-servers-analysis-${timestamp}.md`);
    const summaryPath = path.join(REPORTS_DIR, 'official-servers-summary.json');
    
    fs.writeFileSync(reportPath, detailedReport);
    fs.writeFileSync(summaryPath, JSON.stringify(analysis, null, 2));
    
    console.log(`\n✅ Reports saved:`);
    console.log(`   📄 Detailed report: ${reportPath}`);
    console.log(`   📊 JSON summary: ${summaryPath}`);
    
    // Export official servers list for easy access
    const officialUrlsPath = path.join(REPORTS_DIR, 'official-servers-urls.json');
    const officialUrls = analysis.official.map(s => s.url);
    fs.writeFileSync(officialUrlsPath, JSON.stringify(officialUrls, null, 2));
    
    console.log(`   🔗 Official URLs list: ${officialUrlsPath}`);
    
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