import { Metadata } from "next";

export const metadata: Metadata = {
  title: "State of MCP Report Q3 2025 | Industry Analysis",
  description:
    "Comprehensive analysis of 900+ MCP implementations. Evidence-based insights on Model Context Protocol ecosystem, adoption patterns, and future trajectories.",
  keywords: [
    "MCP report",
    "Model Context Protocol analysis",
    "AI infrastructure",
    "MCP ecosystem",
    "industry analysis",
    "AI adoption patterns",
  ],
  openGraph: {
    title: "State of MCP Report Q3 2025 | Comprehensive Industry Analysis",
    description:
      "Empirical analysis of 900+ MCP implementations with 100k+ inference calls. Get evidence-based insights on the Model Context Protocol ecosystem.",
    url: "https://archestra.ai/state-of-mcp",
    type: "article",
    images: [
      {
        url: "/og-state-of-mcp.png",
        width: 1200,
        height: 630,
        alt: "State of MCP Report Q3 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "State of MCP Report Q3 2025",
    description:
      "Comprehensive analysis of 900+ MCP implementations and ecosystem trends",
    images: ["/og-state-of-mcp.png"],
  },
  alternates: {
    canonical: "https://archestra.ai/state-of-mcp",
  },
};

export default function StateOfMCPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
