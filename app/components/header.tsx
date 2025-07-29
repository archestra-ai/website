export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container flex items-center px-4 md:px-6 justify-between h-16">
        <div className="flex items-center gap-8">
          <a
            href="/"
            className="font-mono text-2xl text-black hover:text-yellow-600 transition-colors"
          >
            archestra.ai
          </a>
          <nav className="flex items-center gap-4 mt-1">
            <a
              href="/mcp-catalog"
              className="text-sm text-gray-900 font-medium"
            >
              MCP Catalog
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2"></div>
      </div>
    </header>
  );
}