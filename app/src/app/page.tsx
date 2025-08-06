import { AlertTriangle, CheckCircle, Cpu, GitCommit, Github, MessageSquare, Monitor, Star, Users } from 'lucide-react';

import { EmailForm } from '@components/EmailForm';
import Footer from '@components/Footer';
import Header from '@components/Header';
import constants from '@constants';

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
      <Header />

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container relative z-10 px-4 md:px-6 py-16 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{companyName}</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              At {companyName} we're developing an enterprise-grade platform that enables non-technical users to safely
              leverage AI agents and MCP (Model Context Protocol) servers.
            </p>
          </div>

          <div className="mb-12">
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <Cpu className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Secure runtime</h3>
                  <p className="text-sm text-gray-600">
                    Isolated execution environment for AI agents with sandboxing and resource controls
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <AlertTriangle className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Prompt Injection Prevention</h3>
                  <p className="text-sm text-gray-600">
                    Securing the context to prevent leakage of data to the context and changing agent's behaviour
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <CheckCircle className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Compliance with MCP Specification</h3>
                  <p className="text-sm text-gray-600">
                    Compatible with thousands of existing MCP servers and supports custom implementations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <Monitor className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Desktop App</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We're building the desktop app and it's currently in early alpha. Subscribe below to get notified
                    when it's ready.
                  </p>
                  <div className="w-full max-w-lg">
                    <EmailForm />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <Github className="h-6 w-6 text-gray-700 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Open Source</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {companyName} is open source, follow us on{' '}
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
                  <div className="flex gap-4 text-xs text-gray-600">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
