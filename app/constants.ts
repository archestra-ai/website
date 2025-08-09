// Company constants
const COMPANY_NAME = 'Archestra';

// Website constants
const WEBSITE_BASE_URL = 'https://archestra.ai';
const MCP_CATALOG_URL = `${WEBSITE_BASE_URL}/mcp-catalog`;

const LOGO_RELATIVE_URL = '/logo.png';
const LOGO_ABSOLUTE_URL = `${WEBSITE_BASE_URL}${LOGO_RELATIVE_URL}`;

const TEAM_PHOTO_RELATIVE_URL = '/team-photo.jpg';
const TEAM_PHOTO_ABSOLUTE_URL = `${WEBSITE_BASE_URL}${TEAM_PHOTO_RELATIVE_URL}`;

const MATVEY = {
  '@type': 'Person',
  name: 'Matvey Kukuy',
  jobTitle: 'CEO and Co-Founder',
  worksFor: {
    '@type': 'Organization',
    name: COMPANY_NAME,
  },
  sameAs: 'https://www.linkedin.com/in/motakuk/',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'London',
    addressCountry: 'UK',
  },
  description:
    'Third-time founder, engineer and passionate advocate for Open Source. Previously founding and leading Amixr as CEO (acquired by Grafana Labs) and co-founding KeepHQ (acquired by Elastic).',
};
const ILDAR = {
  '@type': 'Person',
  name: 'Ildar Iskhakov',
  jobTitle: 'CTO and Co-Founder',
  worksFor: {
    '@type': 'Organization',
    name: COMPANY_NAME,
  },
  sameAs: 'https://www.linkedin.com/in/ildari/',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'London',
    addressCountry: 'UK',
  },
  description: 'Second-time founder, Ex-Principal at Grafana Labs and Ex-CTO at Amixr (acquired by Grafana Labs).',
};
const JOEY = {
  '@type': 'Person',
  name: 'Joey Orlando',
  jobTitle: 'Founding Engineer',
  worksFor: {
    '@type': 'Organization',
    name: COMPANY_NAME,
  },
  sameAs: 'https://www.linkedin.com/in/josephorlando1/',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Montréal',
    addressCountry: 'Canada',
  },
  description:
    'Experienced software engineer/leader with 10+ years in full-stack development and expertise in Python, TypeScript, Clojure, Go, and cloud infrastructure.',
};
const PEOPLE = {
  matvey: MATVEY,
  ildar: ILDAR,
  joey: JOEY,
};

// GitHub constants
const GITHUB_ORG_NAME = 'archestra-ai';
const WEBSITE_REPO_NAME = 'website';
const DESKTOP_APP_REPO_NAME = 'archestra';
const MAIN_BRANCH_NAME = 'main';

const BASE_GITHUB_ORG_URL = `https://github.com/${GITHUB_ORG_NAME}`;
const BASE_WEBSITE_GITHUB_URL = `${BASE_GITHUB_ORG_URL}/${WEBSITE_REPO_NAME}`;

const MCP_CATALOG_DIRECTORY_PATH = 'app/app/mcp-catalog/data';
const MCP_CATALOG_BASE_DIRECTORY_URL = `${BASE_WEBSITE_GITHUB_URL}/tree/${MAIN_BRANCH_NAME}/${MCP_CATALOG_DIRECTORY_PATH}`;

export default {
  company: {
    name: COMPANY_NAME,
    tagline: `${COMPANY_NAME} | Enterprise MCP Platform for AI Agents`,
    description:
      'Enterprise-grade platform enabling non-technical users to safely leverage AI agents and MCP (Model Context Protocol) servers with security guardrails and compliance.',
    alternateName: 'Archestra.ai',
    foundingDate: '2024',
    address: {
      addressCountry: 'UK',
      addressLocality: 'London',
    },
    people: PEOPLE,
  },
  website: {
    urls: {
      base: WEBSITE_BASE_URL,
      mcpCatalog: MCP_CATALOG_URL,
      logoRelativeUrl: LOGO_RELATIVE_URL,
      logoAbsoluteUrl: LOGO_ABSOLUTE_URL,
      teamPhotoRelativeUrl: TEAM_PHOTO_RELATIVE_URL,
      teamPhotoAbsoluteUrl: TEAM_PHOTO_ABSOLUTE_URL,
      about: `${WEBSITE_BASE_URL}/about`,
      stateOfMcp: `${WEBSITE_BASE_URL}/state-of-mcp`,
    },
    structuredData: Object.values(PEOPLE),
    keywords: [
      'MCP',
      'Model Context Protocol',
      'AI agents',
      'enterprise AI',
      'secure runtime',
      'prompt injection prevention',
    ],
  },
  github: {
    archestra: {
      orgName: GITHUB_ORG_NAME,
      orgUrl: BASE_GITHUB_ORG_URL,
      website: {
        repoName: WEBSITE_REPO_NAME,
        repoUrl: BASE_WEBSITE_GITHUB_URL,
        mainBranchName: MAIN_BRANCH_NAME,
        mcpCatalogDirectoryPath: MCP_CATALOG_DIRECTORY_PATH,
        newIssueUrl: `${BASE_WEBSITE_GITHUB_URL}/issues/new`,
        viewMcpCatalogDirectoryUrl: MCP_CATALOG_BASE_DIRECTORY_URL,
        editMcpCatalogJsonFileUrl: `${BASE_WEBSITE_GITHUB_URL}/edit/${MAIN_BRANCH_NAME}/${MCP_CATALOG_DIRECTORY_PATH}/mcp-servers.json`,
      },
      archestra: {
        repoName: DESKTOP_APP_REPO_NAME,
        repoUrl: `${BASE_GITHUB_ORG_URL}/${DESKTOP_APP_REPO_NAME}`,
      },
    },
  },
  slack: {
    joinCommunityUrl: 'https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg',
  },
  twitter: {
    handle: '@archestra_ai',
  },
  posthog: {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    token: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  },
  debug: process.env.NODE_ENV === 'development',
};
