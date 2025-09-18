import DesktopAppDownloadButton from '@components/DesktopAppDownloadButton';
import Footer from '@components/Footer';
import HeaderWithBanner from '@components/HeaderWithBanner';
import TypewriterText from '@components/TypewriterText';
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
      archestra: { repoUrl: githubArchestraRepoUrl },
    },
  },
} = constants;

export default async function Home() {
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
    sameAs: [githubArchestraRepoUrl],
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

      <main className="flex-1 relative flex items-center justify-center">
        <section className="bg-white w-full">
          <div className="container px-4 md:px-6 py-16 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Simple & Safe Local Agent</h1>
                <TypewriterText
                  className="text-2xl md:text-xl text-gray-600 mb-6"
                  words={[
                    'management',
                    'legal',
                    'finance',
                    'sales',
                    'HR',
                    'engineering',
                    'marketing',
                    'operations',
                    'IT',
                    'research',
                  ]}
                />
                <p className="text-base text-gray-700 mb-8">
                  - ChatGPT-like interface
                  <br />- Local for sensitive corporate data
                  <br />- Supports {serverCount} open-source <b>MCP</b> servers
                  <br />- <b>Sandboxed runtime</b> preventing supply chain attacks
                  <br />- Configuration <b>without API keys or configs</b>
                  <br />- Free and open-source
                </p>
                <div className="flex justify-center lg:justify-start">
                  <DesktopAppDownloadButton />
                </div>
              </div>

              <div className="flex-1 max-w-5xl lg:max-w-none">
                <img
                  src="/screenshot.png"
                  alt="Archestra Autonomous Agents Interface"
                  className="scale-75 md:scale-90 lg:scale-150"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
