import { AlertTriangle, ArrowRight, Cpu, GitCommit, Github, MessageSquare, Package, Star, Users } from 'lucide-react';
import Link from 'next/link';

import DesktopAppDownloadButton from '@components/DesktopAppDownloadButton';
import Footer from '@components/Footer';
import GitHubStarsChart from '@components/GitHubStarsChart';
import HeaderWithBanner from '@components/HeaderWithBanner';
import constants from '@constants';
import { loadServers } from '@mcpCatalog/lib/catalog';

const {
  company: {
    name: companyName,
    alternateName: companyAlternateName,
    description: companyDescription,
    foundingDate: companyFoundingDate,
    address: companyAddress,
    people: companyPeople,
  },
  website: { urls: websiteUrls },
  github: {
    archestra: {
      orgName: githubOrgName,
      archestra: { repoName: githubArchestraRepoName, repoUrl: githubArchestraRepoUrl },
    },
  },
  slack: { joinCommunityUrl: slackJoinCommunityUrl },
} = constants;

async function getGitHubStats() {
  const githubApiUrl = `https://api.github.com/repos/${githubOrgName}/${githubArchestraRepoName}`;

  try {
    const [repoResponse, contributorsResponse, commitsResponse] = await Promise.all([
      fetch(githubApiUrl, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }),
      fetch(`${githubApiUrl}/contributors`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${githubApiUrl}/commits?per_page=1`, {
        next: { revalidate: 3600 },
      }),
    ]);

    if (!repoResponse.ok || !contributorsResponse.ok || !commitsResponse.ok) {
      return { stars: 0, contributors: 0, commits: 0 };
    }

    const repoData = await repoResponse.json();
    const contributorsData = await contributorsResponse.json();

    // Get total commits from the Link header
    const linkHeader = commitsResponse.headers.get('Link');
    let totalCommits = 1;
    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (match) {
        totalCommits = parseInt(match[1]);
      }
    }

    return {
      stars: repoData.stargazers_count || 0,
      contributors: contributorsData.length || 0,
      commits: totalCommits,
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return { stars: 0, contributors: 0, commits: 0 };
  }
}

export default async function Home() {
  const githubStats = await getGitHubStats();
  const mcpServers = loadServers();
  const serverCount = mcpServers.length;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    alternateName: companyAlternateName,
    url: websiteUrls.base,
    logo: websiteUrls.logoAbsoluteUrl,
    description: companyDescription,
    sameAs: [githubArchestraRepoUrl, slackJoinCommunityUrl],
    foundingDate: companyFoundingDate,
    founders: [companyPeople.matvey, companyPeople.ildar],
    address: {
      '@type': 'PostalAddress',
      addressCountry: companyAddress.addressCountry,
      addressLocality: companyAddress.addressLocality,
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HeaderWithBanner />

      <main className="flex-1 relative flex flex-col">
        <section className="bg-white">
          <div className="container px-4 md:px-6 py-16 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">AI 🤝 Enterprise Data</h1>
                <p className="text-xl text-gray-700 mb-8">
                  Run AI agents locally and connect to your data leveraging {serverCount} open-source MCP servers.

                  < br />< br />
                  Build reports, automate communication, and more — all while keeping your data private and secure on your machine.
                </p>
                <div className="flex justify-center lg:justify-start">
                  <DesktopAppDownloadButton />
                </div>
              </div>

              <div className="flex-1 max-w-3xl lg:max-w-none">
                <img src="/screenshot.png" alt="Archestra Autonomous Agents Interface" className="scale-110" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-4">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <AlertTriangle className="h-12 w-12 text-gray-700 mb-4" />
                <h3 className="font-semibold mb-2 text-lg">Secure MCP Runtime</h3>
                <p className="text-sm text-gray-600">
                  Isolated execution environment protecting your host system.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6">
                <Cpu className="h-12 w-12 text-gray-700 mb-4" />
                <h3 className="font-semibold mb-2 text-lg">No Technical Knowledge Needed</h3>
                <p className="text-sm text-gray-600">
                  No need to configure API keys for each service; Archestra will do it for you.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6">
                <Package className="h-12 w-12 text-gray-700 mb-4" />
                <h3 className="font-semibold mb-2 text-lg">Fully Local</h3>
                <p className="text-sm text-gray-600">
                  Optionally, can work without an internet connection after initial download.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative pt-4">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="container relative z-10 px-4 md:px-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 shadow-md p-8">
              <div className="flex flex-col items-center text-center">
                <Package className="h-12 w-12 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold mb-3 text-green-900">Want to deploy for your colleagues?</h2>
                <p className="text-gray-700 mb-6 max-w-2xl">
                  Deploy and manage AI-to-Data connectors at scale with enterprise-grade security, compliance, and
                  governance features.
                </p>
                <Link
                  href="/enterprise-platform"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Book a Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-4">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="container relative z-10 px-4 md:px-6 max-w-4xl mx-auto space-y-2">
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <Github className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Open Source</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {companyName} is open source. Follow us on{' '}
                  <a
                    href={githubArchestraRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    GitHub
                  </a>
                  !
                </p>
                <div className="flex gap-4 text-xs text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {githubStats.stars} stars
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {githubStats.contributors} contributors
                  </span>
                  <span className="flex items-center gap-1">
                    <GitCommit className="h-3 w-3" />
                    {githubStats.commits} commits
                  </span>
                </div>
                <GitHubStarsChart />
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <MessageSquare className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Slack Community</h3>
                <p className="text-sm text-gray-600">
                  Join our community on{' '}
                  <a
                    href={slackJoinCommunityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Slack
                  </a>{' '}
                  to discuss and collaborate!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
