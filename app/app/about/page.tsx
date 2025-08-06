import { Metadata } from "next";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { Linkedin } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

export const metadata: Metadata = {
  title: "About Archestra | Team & Mission",
  description:
    "Meet the team building the enterprise-grade MCP platform. Founded by engineers from Grafana Labs and Elastic, passionate about the future of AI.",
  keywords: [
    "Archestra team",
    "about Archestra",
    "MCP platform team",
    "AI infrastructure company",
    "enterprise AI platform",
  ],
  openGraph: {
    title: "About Archestra | Team Building the Future of Enterprise AI",
    description:
      "Meet the founding team from Grafana Labs and Elastic building the enterprise-grade MCP platform for AI agents.",
    url: "https://archestra.ai/about",
    type: "website",
    images: [
      {
        url: "/team-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Archestra.ai founding team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Archestra | Team & Mission",
    description:
      "Meet the team building the enterprise MCP platform for AI agents",
    images: ["/team-photo.jpg"],
  },
  alternates: {
    canonical: "https://archestra.ai/about",
  },
};

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "Joey Orlando",
        jobTitle: "Founding Engineer",
        worksFor: {
          "@type": "Organization",
          name: "Archestra",
        },
        sameAs: "https://www.linkedin.com/in/josephorlando1/",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Montreal",
          addressRegion: "Quebec",
          addressCountry: "Canada",
        },
        description:
          "Experienced staff software engineer with 9+ years in full-stack development and expertise in Python, TypeScript, Clojure, Go, SQL, and cloud infrastructure.",
      },
      {
        "@type": "Person",
        name: "Matvey Kukuy",
        jobTitle: "CEO and Co-Founder",
        worksFor: {
          "@type": "Organization",
          name: "Archestra",
        },
        sameAs: "https://www.linkedin.com/in/motakuk/",
        address: {
          "@type": "PostalAddress",
          addressLocality: "London",
          addressCountry: "UK",
        },
        description:
          "Third-time founder, engineer and passionate advocate for Open Source. Previously founding and leading Amixr as CEO (acquired by Grafana Labs) and co-founding KeepHQ (acquired by Elastic).",
      },
      {
        "@type": "Person",
        name: "Ildar Iskhakov",
        jobTitle: "CTO and Co-Founder",
        worksFor: {
          "@type": "Organization",
          name: "Archestra",
        },
        sameAs: "https://www.linkedin.com/in/ildari/",
        address: {
          "@type": "PostalAddress",
          addressLocality: "London",
          addressCountry: "UK",
        },
        description:
          "Second-time founder, Ex-Principal at Grafana Labs and Ex-CTO at Amixr (acquired by Grafana Labs).",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <main className="flex-1 relative">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Team Section */}
          <div className="max-w-5xl mx-auto mb-16">
            <p className="text-lg text-gray-600 text-center mb-12">
              Founded with urgency by engineers passionate about the future of
              AI
            </p>

            {/* Team Photo */}
            <div className="mb-12">
              <img
                src="/team-photo.jpg"
                alt="Archestra.ai founding team - Joey, Ildar, and Matvey"
                className="w-full max-w-4xl mx-auto rounded-xl shadow-lg"
              />
            </div>

            {/* Team Member Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Joey */}
              <Card className="border-2 hover:border-yellow-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <h3 className="font-bold text-xl mb-2">Joey Orlando</h3>
                  <p className="text-gray-700 font-medium mb-1">
                    Founding Engineer
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    Montreal, Quebec, Canada
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Experienced staff software engineer with 9+ years in
                    full-stack development and expertise in Python, TypeScript,
                    Clojure, Go, SQL, and cloud infrastructure, who transitioned
                    from a career as a biochemist at Harvard & McGill.
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="https://www.linkedin.com/in/josephorlando1/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Matvey */}
              <Card className="border-2 hover:border-green-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <h3 className="font-bold text-xl mb-2">Matvey Kukuy</h3>
                  <p className="text-gray-700 font-medium mb-1">
                    CEO and Co-Founder
                  </p>
                  <p className="text-gray-500 text-sm mb-3">London, UK</p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Third-time founder, engineer and passionate advocate for
                    Open Source who relocated from Israel to London to build
                    this company, previously founding and leading Amixr as CEO
                    (acquired by Grafana Labs) and co-founding KeepHQ (acquired
                    by Elastic).
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="https://www.linkedin.com/in/motakuk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Ildar */}
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardContent className="p-6 text-left">
                  <h3 className="font-bold text-xl mb-2">Ildar Iskhakov</h3>
                  <p className="text-gray-700 font-medium mb-1">
                    CTO and Co-Founder
                  </p>
                  <p className="text-gray-500 text-sm mb-3">London, UK</p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Second-time founder who relocated from Singapore to the UK
                    to build this company, bringing experience as Ex-Principal
                    at Grafana Labs and Ex-CTO at Amixr (acquired by Grafana
                    Labs), and is a devoted coffee enthusiast.
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="https://www.linkedin.com/in/ildari/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
