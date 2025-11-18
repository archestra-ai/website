import { AlertCircle, GitBranch, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function DeveloperNotice() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full space-y-8">
          {/* Main Notice Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Documentation Setup Required</h1>
                  <p className="text-gray-700">
                    We've moved our documentation to the platform repository for better consistency and maintainability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Terminal className="h-5 w-5 text-gray-500" />
              Setup Instructions for Local Development
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">1. Clone the platform repository</h3>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                  <div className="text-gray-600 mb-1"># From the parent directory of archestra-website:</div>
                  <div className="text-gray-900">cd ../..</div>
                  <div className="text-gray-900">git clone https://github.com/archestra-ai/archestra.git</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">2. Verify the structure</h3>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-700">
                  <div>Your directory structure should look like:</div>
                  <div className="mt-2 text-gray-600">
                    <div>├── archestra/</div>
                    <div>│ └── docs/</div>
                    <div>└── archestra-website/</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">3. Restart the development server</h3>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                  <div className="text-gray-900">pnpm dev</div>
                </div>
              </div>
            </div>
          </div>

          {/* Why This Architecture */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-500" />
              Why This Architecture?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">•</span>
                <div>
                  <strong className="text-gray-900">Single Source of Truth:</strong> Documentation lives alongside the
                  platform code it describes
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">•</span>
                <div>
                  <strong className="text-gray-900">Better Versioning:</strong> Docs are versioned with the platform
                  releases
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">•</span>
                <div>
                  <strong className="text-gray-900">Easier Maintenance:</strong> Platform developers can update docs in
                  the same PR as feature changes
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">•</span>
                <div>
                  <strong className="text-gray-900">Consistency:</strong> Ensures documentation stays in sync with the
                  actual implementation
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex gap-4 justify-center">
            <a
              href="https://github.com/archestra-ai/archestra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <GitBranch className="h-4 w-4" />
              Platform Repository
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
