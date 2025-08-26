/**
 * Comprehensive Official MCP Server Detection System
 * 
 * This module provides systematic detection of official MCP servers by analyzing
 * GitHub repository URLs and matching them against known official organizations.
 */

export interface OfficialOrgMapping {
  /** The GitHub organization/username */
  org: string;
  /** Known official company/service names that map to this org */
  companyNames: string[];
  /** Additional verification patterns */
  patterns?: string[];
}

export interface ServerClassification {
  url: string;
  category: 'official' | 'corporate' | 'community' | 'unclear';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  companyName?: string;
  orgName?: string;
}

export interface AnalysisReport {
  totalServers: number;
  official: ServerClassification[];
  corporate: ServerClassification[];
  community: ServerClassification[];
  unclear: ServerClassification[];
  summary: {
    officialCount: number;
    corporateCount: number;
    communityCount: number;
    unclearCount: number;
  };
}

/**
 * Comprehensive mapping of known official organizations
 * Format: GitHub org/username -> Company information
 */
export const OFFICIAL_ORG_MAPPINGS: OfficialOrgMapping[] = [
  // Major Tech Companies - Official
  { org: 'microsoft', companyNames: ['Microsoft'], patterns: ['ms-', 'azure-', 'dotnet-'] },
  { org: 'google', companyNames: ['Google'], patterns: ['google-', 'gcp-'] },
  { org: 'googleapis', companyNames: ['Google'], patterns: ['google-', 'gcp-'] },
  { org: 'github', companyNames: ['GitHub'], patterns: ['github-'] },
  { org: 'facebook', companyNames: ['Facebook', 'Meta'], patterns: ['fb-', 'meta-'] },
  { org: 'meta', companyNames: ['Meta', 'Facebook'], patterns: ['meta-', 'fb-'] },
  { org: 'amazon', companyNames: ['Amazon'], patterns: ['aws-', 'amazon-'] },
  { org: 'awslabs', companyNames: ['Amazon', 'AWS'], patterns: ['aws-', 'amazon-'] },
  { org: 'aws', companyNames: ['Amazon', 'AWS'], patterns: ['aws-', 'amazon-'] },
  
  // Cloud & Infrastructure
  { org: 'cloudflare', companyNames: ['Cloudflare'], patterns: ['cloudflare-'] },
  { org: 'docker', companyNames: ['Docker'], patterns: ['docker-'] },
  { org: 'redis', companyNames: ['Redis'], patterns: ['redis-'] },
  { org: 'elastic', companyNames: ['Elastic'], patterns: ['elasticsearch-', 'elastic-'] },
  { org: 'hashicorp', companyNames: ['HashiCorp'], patterns: ['terraform-', 'vault-', 'consul-'] },
  
  // Databases & Data
  { org: 'mongodb', companyNames: ['MongoDB'], patterns: ['mongodb-', 'mongo-'] },
  { org: 'neo4j', companyNames: ['Neo4j'], patterns: ['neo4j-'] },
  { org: 'neo4j-contrib', companyNames: ['Neo4j'], patterns: ['neo4j-'] },
  { org: 'supabase', companyNames: ['Supabase'], patterns: ['supabase-'] },
  { org: 'supabase-community', companyNames: ['Supabase'], patterns: ['supabase-'] },
  { org: 'prisma', companyNames: ['Prisma'], patterns: ['prisma-'] },
  { org: 'clickhouse', companyNames: ['ClickHouse'], patterns: ['clickhouse-'] },
  { org: 'confluentinc', companyNames: ['Confluent'], patterns: ['confluent-', 'kafka-'] },
  { org: 'chroma-core', companyNames: ['Chroma'], patterns: ['chroma-'] },
  { org: 'qdrant', companyNames: ['Qdrant'], patterns: ['qdrant-'] },
  { org: 'weaviate', companyNames: ['Weaviate'], patterns: ['weaviate-'] },
  { org: 'pinecone-io', companyNames: ['Pinecone'], patterns: ['pinecone-'] },
  { org: 'zilliztech', companyNames: ['Zilliz'], patterns: ['milvus-', 'zilliz-'] },
  { org: 'influxdata', companyNames: ['InfluxData'], patterns: ['influxdb-'] },
  { org: 'neondatabase', companyNames: ['Neon'], patterns: ['neon-'] },
  { org: 'planetscale', companyNames: ['PlanetScale'], patterns: ['planetscale-'] },
  { org: 'tigrisdata', companyNames: ['Tigris'], patterns: ['tigris-'] },
  { org: 'cockroachdb', companyNames: ['CockroachDB'], patterns: ['cockroach-'] },
  
  // DevTools & IDEs
  { org: 'jetbrains', companyNames: ['JetBrains'], patterns: ['jetbrains-', 'intellij-'] },
  { org: 'code', companyNames: ['Visual Studio Code'], patterns: ['vscode-'] },
  { org: 'atlassian', companyNames: ['Atlassian'], patterns: ['atlassian-', 'jira-', 'confluence-'] },
  { org: 'gitlab', companyNames: ['GitLab'], patterns: ['gitlab-'] },
  { org: 'gitea', companyNames: ['Gitea'], patterns: ['gitea-'] },
  
  // AI/ML Companies
  { org: 'openai', companyNames: ['OpenAI'], patterns: ['openai-', 'gpt-'] },
  { org: 'anthropic', companyNames: ['Anthropic'], patterns: ['claude-'] },
  { org: 'huggingface', companyNames: ['Hugging Face'], patterns: ['hf-', 'huggingface-'] },
  { org: 'cohere-ai', companyNames: ['Cohere'], patterns: ['cohere-'] },
  { org: 'mistralai', companyNames: ['Mistral AI'], patterns: ['mistral-'] },
  { org: 'langchain-ai', companyNames: ['LangChain'], patterns: ['langchain-'] },
  { org: 'wandb', companyNames: ['Weights & Biases'], patterns: ['wandb-'] },
  { org: 'mlflow', companyNames: ['MLflow'], patterns: ['mlflow-'] },
  { org: 'optuna', companyNames: ['Optuna'], patterns: ['optuna-'] },
  
  // Productivity & SaaS
  { org: 'notion', companyNames: ['Notion'], patterns: ['notion-'] },
  { org: 'makenotion', companyNames: ['Notion'], patterns: ['notion-'] },
  { org: 'slack', companyNames: ['Slack'], patterns: ['slack-'] },
  { org: 'shopify', companyNames: ['Shopify'], patterns: ['shopify-'] },
  { org: 'stripe', companyNames: ['Stripe'], patterns: ['stripe-'] },
  { org: 'twilio', companyNames: ['Twilio'], patterns: ['twilio-'] },
  { org: 'zoom', companyNames: ['Zoom'], patterns: ['zoom-'] },
  { org: 'airtable', companyNames: ['Airtable'], patterns: ['airtable-'] },
  { org: 'asana', companyNames: ['Asana'], patterns: ['asana-'] },
  { org: 'linear', companyNames: ['Linear'], patterns: ['linear-'] },
  { org: 'figma', companyNames: ['Figma'], patterns: ['figma-'] },
  { org: 'miro', companyNames: ['Miro'], patterns: ['miro-'] },
  
  // Security & Compliance
  { org: 'okta', companyNames: ['Okta'], patterns: ['okta-'] },
  { org: 'auth0', companyNames: ['Auth0'], patterns: ['auth0-'] },
  { org: 'paloaltonetworks', companyNames: ['Palo Alto Networks'], patterns: ['palo-', 'pan-'] },
  { org: 'crowdstrike', companyNames: ['CrowdStrike'], patterns: ['crowdstrike-'] },
  { org: 'sentinel-one', companyNames: ['SentinelOne'], patterns: ['sentinelone-'] },
  
  // Monitoring & Analytics
  { org: 'datadog', companyNames: ['Datadog'], patterns: ['datadog-'] },
  { org: 'newrelic', companyNames: ['New Relic'], patterns: ['newrelic-'] },
  { org: 'splunk', companyNames: ['Splunk'], patterns: ['splunk-'] },
  { org: 'grafana', companyNames: ['Grafana'], patterns: ['grafana-'] },
  { org: 'prometheus', companyNames: ['Prometheus'], patterns: ['prometheus-'] },
  { org: 'jaegertracing', companyNames: ['Jaeger'], patterns: ['jaeger-'] },
  { org: 'open-telemetry', companyNames: ['OpenTelemetry'], patterns: ['opentelemetry-', 'otel-'] },
  { org: 'posthog', companyNames: ['PostHog'], patterns: ['posthog-'] },
  { org: 'segment-integrations', companyNames: ['Segment'], patterns: ['segment-'] },
  
  // Communication & Media
  { org: 'discord', companyNames: ['Discord'], patterns: ['discord-'] },
  { org: 'telegram', companyNames: ['Telegram'], patterns: ['telegram-'] },
  { org: 'whatsapp', companyNames: ['WhatsApp'], patterns: ['whatsapp-'] },
  { org: 'youtube', companyNames: ['YouTube'], patterns: ['youtube-'] },
  { org: 'spotify', companyNames: ['Spotify'], patterns: ['spotify-'] },
  { org: 'netflix', companyNames: ['Netflix'], patterns: ['netflix-'] },
  
  // E-commerce & Payments
  { org: 'paypal', companyNames: ['PayPal'], patterns: ['paypal-'] },
  { org: 'square', companyNames: ['Square'], patterns: ['square-'] },
  { org: 'ebay', companyNames: ['eBay'], patterns: ['ebay-'] },
  { org: 'etsy', companyNames: ['Etsy'], patterns: ['etsy-'] },
  { org: 'woocommerce', companyNames: ['WooCommerce'], patterns: ['woocommerce-'] },
  
  // Content Management
  { org: 'wordpress', companyNames: ['WordPress'], patterns: ['wordpress-', 'wp-'] },
  { org: 'drupal', companyNames: ['Drupal'], patterns: ['drupal-'] },
  { org: 'contentful', companyNames: ['Contentful'], patterns: ['contentful-'] },
  { org: 'sanity-io', companyNames: ['Sanity'], patterns: ['sanity-'] },
  
  // Development Platforms
  { org: 'vercel', companyNames: ['Vercel'], patterns: ['vercel-'] },
  { org: 'netlify', companyNames: ['Netlify'], patterns: ['netlify-'] },
  { org: 'heroku', companyNames: ['Heroku'], patterns: ['heroku-'] },
  { org: 'digitalocean', companyNames: ['DigitalOcean'], patterns: ['digitalocean-', 'do-'] },
  { org: 'linode', companyNames: ['Linode'], patterns: ['linode-'] },
  
  // Specialized Services
  { org: 'browserbase', companyNames: ['Browserbase'], patterns: ['browserbase-'] },
  { org: 'apify', companyNames: ['Apify'], patterns: ['apify-'] },
  { org: 'firecrawl', companyNames: ['Firecrawl'], patterns: ['firecrawl-'] },
  { org: 'langfuse', companyNames: ['Langfuse'], patterns: ['langfuse-'] },
  { org: 'dbt-labs', companyNames: ['dbt Labs'], patterns: ['dbt-'] },
  { org: 'airbyte', companyNames: ['Airbyte'], patterns: ['airbyte-'] },
  { org: 'zapier', companyNames: ['Zapier'], patterns: ['zapier-'] },
  { org: 'ifttt', companyNames: ['IFTTT'], patterns: ['ifttt-'] },
  
  // Chinese Tech Companies
  { org: 'alibaba', companyNames: ['Alibaba'], patterns: ['alibaba-', 'aliyun-'] },
  { org: 'aliyun', companyNames: ['Alibaba Cloud', 'Aliyun'], patterns: ['aliyun-', 'alibaba-'] },
  { org: 'tencent', companyNames: ['Tencent'], patterns: ['tencent-'] },
  { org: 'baidu', companyNames: ['Baidu'], patterns: ['baidu-'] },
  { org: 'bytedance', companyNames: ['ByteDance'], patterns: ['bytedance-'] },
  
  // Blockchain & Crypto
  { org: 'ethereum', companyNames: ['Ethereum'], patterns: ['ethereum-', 'eth-'] },
  { org: 'bitcoin', companyNames: ['Bitcoin'], patterns: ['bitcoin-', 'btc-'] },
  { org: 'coinbase', companyNames: ['Coinbase'], patterns: ['coinbase-'] },
  { org: 'binance', companyNames: ['Binance'], patterns: ['binance-'] },
  
  // Kubernetes & Container Orchestration
  { org: 'kubernetes', companyNames: ['Kubernetes'], patterns: ['k8s-', 'kubernetes-'] },
  { org: 'helm', companyNames: ['Helm'], patterns: ['helm-'] },
  { org: 'istio', companyNames: ['Istio'], patterns: ['istio-'] },
  { org: 'envoyproxy', companyNames: ['Envoy'], patterns: ['envoy-'] },
  
  // Gaming & Entertainment
  { org: 'unity', companyNames: ['Unity'], patterns: ['unity-'] },
  { org: 'unrealengine', companyNames: ['Unreal Engine'], patterns: ['unreal-'] },
  { org: 'roblox', companyNames: ['Roblox'], patterns: ['roblox-'] },
  { org: 'epicgames', companyNames: ['Epic Games'], patterns: ['epic-'] },
  
  // Model Context Protocol Official
  { org: 'modelcontextprotocol', companyNames: ['Model Context Protocol', 'Anthropic'], patterns: ['mcp-'] },
  
  // Additional Enterprise Software
  { org: 'salesforce', companyNames: ['Salesforce'], patterns: ['salesforce-', 'sf-'] },
  { org: 'oracle', companyNames: ['Oracle'], patterns: ['oracle-'] },
  { org: 'ibm', companyNames: ['IBM'], patterns: ['ibm-'] },
  { org: 'sap', companyNames: ['SAP'], patterns: ['sap-'] },
  { org: 'adobe', companyNames: ['Adobe'], patterns: ['adobe-'] },
  { org: 'vmware', companyNames: ['VMware'], patterns: ['vmware-'] },
  
  // Automation & CI/CD
  { org: 'jenkins', companyNames: ['Jenkins'], patterns: ['jenkins-'] },
  { org: 'actions', companyNames: ['GitHub Actions'], patterns: ['actions-'] },
  { org: 'circleci', companyNames: ['CircleCI'], patterns: ['circleci-'] },
  { org: 'travisci', companyNames: ['Travis CI'], patterns: ['travis-'] },
  
  // Communication Platforms
  { org: 'line', companyNames: ['LINE'], patterns: ['line-'] },
  { org: 'wechat', companyNames: ['WeChat'], patterns: ['wechat-'] },
  { org: 'kakaocorp', companyNames: ['Kakao'], patterns: ['kakao-'] },
  
  // Research & Academic
  { org: 'apache', companyNames: ['Apache'], patterns: ['apache-'] },
  { org: 'eclipse', companyNames: ['Eclipse'], patterns: ['eclipse-'] },
  { org: 'mozilla', companyNames: ['Mozilla'], patterns: ['mozilla-', 'firefox-'] },
  { org: 'wikimedia', companyNames: ['Wikimedia'], patterns: ['wikimedia-', 'wikipedia-'] },
  
  // Additional Specialized Services
  { org: 'mailchimp', companyNames: ['Mailchimp'], patterns: ['mailchimp-'] },
  { org: 'sendgrid', companyNames: ['SendGrid'], patterns: ['sendgrid-'] },
  { org: 'twilio-labs', companyNames: ['Twilio'], patterns: ['twilio-'] },
  { org: 'auth0-community', companyNames: ['Auth0'], patterns: ['auth0-'] }
];

/**
 * Extract GitHub organization and repository from a URL
 */
export function parseGitHubUrl(url: string): { org: string; repo: string } | null {
  // Handle both GitHub and GitLab URLs
  const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  const gitlabMatch = url.match(/gitlab\.com\/([^\/]+)\/([^\/]+)/);
  
  if (githubMatch) {
    return { org: githubMatch[1], repo: githubMatch[2] };
  }
  
  if (gitlabMatch) {
    return { org: gitlabMatch[1], repo: gitlabMatch[2] };
  }
  
  return null;
}

/**
 * Check if an organization is known to be official
 */
export function isOfficialOrg(org: string): OfficialOrgMapping | null {
  return OFFICIAL_ORG_MAPPINGS.find(mapping => 
    mapping.org.toLowerCase() === org.toLowerCase()
  ) || null;
}

/**
 * Check if repository name matches company patterns
 */
export function matchesCompanyPattern(repoName: string, companyNames: string[], patterns?: string[]): boolean {
  const lowerRepo = repoName.toLowerCase();
  
  // Check if repo name contains company name
  for (const companyName of companyNames) {
    if (lowerRepo.includes(companyName.toLowerCase().replace(/\s+/g, ''))) {
      return true;
    }
    if (lowerRepo.includes(companyName.toLowerCase().replace(/\s+/g, '-'))) {
      return true;
    }
    if (lowerRepo.includes(companyName.toLowerCase().replace(/\s+/g, '_'))) {
      return true;
    }
  }
  
  // Check additional patterns
  if (patterns) {
    for (const pattern of patterns) {
      if (lowerRepo.includes(pattern.toLowerCase())) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Classify a single server URL
 */
export function classifyServer(url: string): ServerClassification {
  const parsed = parseGitHubUrl(url);
  
  if (!parsed) {
    return {
      url,
      category: 'unclear',
      confidence: 'low',
      reasoning: 'Unable to parse GitHub/GitLab URL',
    };
  }
  
  const { org, repo } = parsed;
  const officialMapping = isOfficialOrg(org);
  
  if (officialMapping) {
    const matchesPattern = matchesCompanyPattern(repo, officialMapping.companyNames, officialMapping.patterns);
    
    return {
      url,
      category: 'official',
      confidence: matchesPattern ? 'high' : 'medium',
      reasoning: `Official ${officialMapping.companyNames[0]} organization${matchesPattern ? ' with matching repository pattern' : ''}`,
      companyName: officialMapping.companyNames[0],
      orgName: org,
    };
  }
  
  // Check for corporate patterns (company name in org name)
  const corporatePatterns = [
    'inc', 'corp', 'company', 'ltd', 'llc', 'gmbh', 'labs', 'ai', 'tech', 
    'systems', 'solutions', 'services', 'group', 'team', 'dev', 'studio'
  ];
  
  const lowerOrg = org.toLowerCase();
  const hasCorporatePattern = corporatePatterns.some(pattern => 
    lowerOrg.includes(pattern) || lowerOrg.endsWith(pattern)
  );
  
  // Check for MCP-specific official patterns
  const mcpOfficialPatterns = [
    'mcp-server-', 'mcp-', '-mcp', '-mcp-server', 'server-', '-server'
  ];
  
  const lowerRepo = repo.toLowerCase();
  const hasMcpPattern = mcpOfficialPatterns.some(pattern => 
    lowerRepo.includes(pattern)
  );
  
  if (hasCorporatePattern) {
    return {
      url,
      category: 'corporate',
      confidence: hasMcpPattern ? 'medium' : 'low',
      reasoning: `Corporate organization pattern detected${hasMcpPattern ? ' with MCP naming convention' : ''}`,
      orgName: org,
    };
  }
  
  // Check for individual developer patterns
  const individualPatterns = /^[a-z][a-z0-9\-_]*$/i;
  const seemsIndividual = individualPatterns.test(org) && !hasCorporatePattern;
  
  if (seemsIndividual) {
    return {
      url,
      category: 'community',
      confidence: 'medium',
      reasoning: 'Individual developer pattern detected',
      orgName: org,
    };
  }
  
  return {
    url,
    category: 'unclear',
    confidence: 'low',
    reasoning: 'Unable to determine classification with confidence',
    orgName: org,
  };
}

/**
 * Analyze all servers and generate comprehensive report
 */
export function analyzeAllServers(serverUrls: string[]): AnalysisReport {
  const classifications = serverUrls.map(url => classifyServer(url));
  
  const official = classifications.filter(c => c.category === 'official');
  const corporate = classifications.filter(c => c.category === 'corporate');
  const community = classifications.filter(c => c.category === 'community');
  const unclear = classifications.filter(c => c.category === 'unclear');
  
  return {
    totalServers: serverUrls.length,
    official: official.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || '')),
    corporate: corporate.sort((a, b) => (a.orgName || '').localeCompare(b.orgName || '')),
    community: community.sort((a, b) => (a.orgName || '').localeCompare(b.orgName || '')),
    unclear: unclear.sort((a, b) => (a.orgName || '').localeCompare(b.orgName || '')),
    summary: {
      officialCount: official.length,
      corporateCount: corporate.length,
      communityCount: community.length,
      unclearCount: unclear.length,
    },
  };
}

/**
 * Integration function to add official status to MCP server manifest
 */
export function addOfficialStatusToServer(server: any): any {
  const classification = classifyServer(server.github_info.url);
  
  return {
    ...server,
    official_status: {
      category: classification.category,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      company_name: classification.companyName,
      is_official: classification.category === 'official'
    }
  };
}

/**
 * Get official servers list for quick filtering
 */
export function getOfficialServerUrls(serversJsonPath?: string): string[] {
  const jsonPath = serversJsonPath || '../data/mcp-servers.json';
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.resolve(__dirname, jsonPath);
    const serverUrls: string[] = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    const analysis = analyzeAllServers(serverUrls);
    return analysis.official.map(server => server.url);
  } catch (error) {
    console.warn('Could not load server URLs for official detection:', error);
    return [];
  }
}

/**
 * Check if a specific URL is from an official organization
 */
export function isOfficialServer(url: string): boolean {
  const classification = classifyServer(url);
  return classification.category === 'official';
}

/**
 * Generate detailed text report
 */
export function generateDetailedReport(analysis: AnalysisReport): string {
  let report = `# MCP Server Official Status Analysis Report\n\n`;
  report += `**Total Servers Analyzed:** ${analysis.totalServers}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- ✅ **Official:** ${analysis.summary.officialCount} (${((analysis.summary.officialCount / analysis.totalServers) * 100).toFixed(1)}%)\n`;
  report += `- 🏢 **Corporate:** ${analysis.summary.corporateCount} (${((analysis.summary.corporateCount / analysis.totalServers) * 100).toFixed(1)}%)\n`;
  report += `- 👥 **Community:** ${analysis.summary.communityCount} (${((analysis.summary.communityCount / analysis.totalServers) * 100).toFixed(1)}%)\n`;
  report += `- ❓ **Unclear:** ${analysis.summary.unclearCount} (${((analysis.summary.unclearCount / analysis.totalServers) * 100).toFixed(1)}%)\n\n`;
  
  report += `## ✅ Official Servers (${analysis.summary.officialCount})\n\n`;
  report += `These servers are hosted by verified official company organizations:\n\n`;
  
  const officialByCompany = analysis.official.reduce((acc, server) => {
    const company = server.companyName || 'Unknown';
    if (!acc[company]) acc[company] = [];
    acc[company].push(server);
    return acc;
  }, {} as Record<string, ServerClassification[]>);
  
  Object.entries(officialByCompany).forEach(([company, servers]) => {
    report += `### ${company} (${servers.length})\n\n`;
    servers.forEach(server => {
      report += `- **${server.orgName}:** [${server.url}](${server.url})\n`;
      report += `  - Confidence: ${server.confidence}\n`;
      report += `  - Reasoning: ${server.reasoning}\n\n`;
    });
  });
  
  report += `## 🏢 Corporate Servers (${analysis.summary.corporateCount})\n\n`;
  report += `These servers appear to be from corporate organizations but need verification:\n\n`;
  
  analysis.corporate.forEach(server => {
    report += `- **${server.orgName}:** [${server.url}](${server.url})\n`;
    report += `  - Confidence: ${server.confidence}\n`;
    report += `  - Reasoning: ${server.reasoning}\n\n`;
  });
  
  report += `## 👥 Community Servers (${analysis.summary.communityCount})\n\n`;
  report += `These servers appear to be from individual developers or community organizations:\n\n`;
  
  analysis.community.forEach(server => {
    report += `- **${server.orgName}:** [${server.url}](${server.url})\n`;
    report += `  - Confidence: ${server.confidence}\n`;
    report += `  - Reasoning: ${server.reasoning}\n\n`;
  });
  
  report += `## ❓ Unclear Classification (${analysis.summary.unclearCount})\n\n`;
  report += `These servers need manual review to determine their official status:\n\n`;
  
  analysis.unclear.forEach(server => {
    report += `- **${server.orgName || 'Unknown'}:** [${server.url}](${server.url})\n`;
    report += `  - Confidence: ${server.confidence}\n`;
    report += `  - Reasoning: ${server.reasoning}\n\n`;
  });
  
  return report;
}