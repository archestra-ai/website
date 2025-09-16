import DesktopAppDownloadButton from '@components/DesktopAppDownloadButton';
import Footer from '@components/Footer';
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
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Easy-to-use local MCP</h1>
                <p className="text-base text-gray-700 mb-8">
                  Build helpful agents with prompts!
                  <br />
                  <br />
                  - ChatGPT-like interface
                  <br />- <b>Local</b> for sensitive corporate data
                  <br />- Sandboxed runtime preventing from <b>supply chain</b> attacks
                  <br />- Configuration <b>without API keys or configs</b>
                  <br />- Supports {serverCount} open-source MCP servers
                  <br />- <b>Free and open-source</b>
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
      </main>

      <Footer />
    </div>
  );
}
