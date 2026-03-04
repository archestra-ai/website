'use client';

import { Check, Code, Copy, Globe, MessageSquare, Rocket, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

type LaunchTab = 'development' | 'quickstart' | 'production';
type ShellType = 'bash' | 'powershell';
type ExposureStep = 'choose' | 'ngrok-input' | null;
export type MessagingProvider = 'slack' | 'msteams';

const linkClass = 'text-gray-500 hover:text-gray-300 underline underline-offset-2';

export default function QuickStartBlock({
  showExposureOverlay = false,
  messagingProvider = 'slack',
  onMessagingProviderChange,
}: {
  showExposureOverlay?: boolean;
  messagingProvider?: MessagingProvider;
  onMessagingProviderChange?: (provider: MessagingProvider) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [launchTab, setLaunchTab] = useState<LaunchTab>('quickstart');
  const [shell, setShell] = useState<ShellType>('bash');
  const [exposureStep, setExposureStep] = useState<ExposureStep>(null);
  const [ngrokKey, setNgrokKey] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  useEffect(() => {
    if (navigator.platform?.startsWith('Win') || navigator.userAgent?.includes('Windows')) {
      setShell('powershell');
    }
  }, []);

  // Reset exposure step when messaging provider changes
  useEffect(() => {
    if (messagingProvider === 'msteams' && showExposureOverlay && launchTab === 'quickstart') {
      setExposureStep('choose');
    } else {
      setExposureStep(null);
    }
    setNgrokKey('');
    setCustomDomain('');
    setCopied(false);
  }, [messagingProvider, showExposureOverlay, launchTab]);

  const lc = shell === 'bash' ? '\\' : '`';

  const getQuickstartCommand = () => {
    const base = `docker pull archestra/platform:latest;\ndocker run -p 9000:9000 -p 3000:3000 ${lc}\n  -e ARCHESTRA_QUICKSTART=true ${lc}`;
    let extra = '';
    if (ngrokKey) extra += `\n  -e ARCHESTRA_NGROK_AUTH_TOKEN=${ngrokKey} ${lc}`;
    if (customDomain) extra += `\n  -e ARCHESTRA_API_BASE_URL=${customDomain} ${lc}`;
    const suffix = `\n  -v /var/run/docker.sock:/var/run/docker.sock ${lc}\n  -v archestra-postgres-data:/var/lib/postgresql/data ${lc}\n  -v archestra-app-data:/app/data ${lc}\n  archestra/platform;`;
    return base + extra + suffix;
  };

  const commands: Record<LaunchTab, string> = {
    development: 'git clone https://github.com/archestra-ai/archestra.git\ncd archestra/platform\ntilt up',
    quickstart: getQuickstartCommand(),
    production: `helm upgrade archestra-platform ${lc}\n  oci://europe-west1-docker.pkg.dev/friendly-path-465518-r6/archestra-public/helm-charts/archestra-platform ${lc}\n  --install ${lc}\n  --namespace archestra ${lc}\n  --set archestra.env.HOSTNAME="0.0.0.0" ${lc}\n  --create-namespace ${lc}\n  --wait`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(commands[launchTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (tab: LaunchTab) => {
    setLaunchTab(tab);
    setCopied(false);
  };

  const renderExposureOverlay = () => {
    if (!showExposureOverlay || launchTab !== 'quickstart' || messagingProvider !== 'msteams' || exposureStep === null)
      return null;

    if (exposureStep === 'choose') {
      return (
        <div className="absolute inset-0 bg-[#0d1117] z-10 flex flex-col items-center justify-center p-6 md:p-8">
          <p className="text-gray-400 text-xs md:text-sm text-center mb-6 max-w-md">
            To connect MS Teams, Archestra needs to be reachable from the Internet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-xl">
            <button
              onClick={() => setExposureStep('ngrok-input')}
              className="group flex flex-col items-center gap-2 px-4 py-5 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:border-indigo-500/50 hover:bg-gray-800 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center mb-1 group-hover:bg-indigo-500/20 transition-colors">
                <Globe className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-gray-200">ngrok</span>
              <span className="text-xs text-gray-500 text-center">
                Fastest way to expose local server to the internet
              </span>
            </button>
            <button
              onClick={() => setExposureStep(null)}
              className="group flex flex-col items-center gap-2 px-4 py-5 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:border-indigo-500/50 hover:bg-gray-800 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center mb-1 group-hover:bg-indigo-500/20 transition-colors">
                <Terminal className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-gray-200">Other way</span>
              <span className="text-xs text-gray-500 text-center">
                I&apos;ll expose local Archestra to the internet myself
              </span>
            </button>
            <button
              onClick={() => setExposureStep(null)}
              className="group flex flex-col items-center gap-2 px-4 py-5 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center mb-1 group-hover:bg-gray-700 transition-colors">
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-200">Web chat only</span>
              <span className="text-xs text-gray-500 text-center">Skip for now, could expose any moment later</span>
            </button>
          </div>
        </div>
      );
    }

    if (exposureStep === 'ngrok-input') {
      return (
        <div className="absolute inset-0 bg-[#0d1117] z-10 flex flex-col items-center justify-center p-6">
          <label className="text-gray-300 text-sm md:text-base mb-2">Enter your ngrok API key</label>
          <p className="text-gray-500 text-xs mb-4">
            Get one at{' '}
            <a href="https://ngrok.com/" target="_blank" rel="noopener noreferrer" className={linkClass}>
              ngrok.com
            </a>
          </p>
          <input
            type="text"
            value={ngrokKey}
            onChange={(e) => setNgrokKey(e.target.value)}
            className="w-full max-w-xs px-3 py-2 text-sm rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:border-indigo-500 font-mono"
            placeholder="ngrok API key"
          />
          <button
            onClick={() => setExposureStep(null)}
            className="mt-4 px-6 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Continue
          </button>
        </div>
      );
    }

    return null;
  };

  const renderLineContinuation = () => <span className="text-gray-600">{lc}</span>;

  const agentTriggersPath = `/agent-triggers/${messagingProvider === 'msteams' ? 'ms-teams' : 'slack'}`;
  const agentTriggersBase = ngrokKey || customDomain ? '<archestra_url>' : 'localhost:3000';
  const agentTriggersHref = ngrokKey || customDomain ? undefined : `http://localhost:3000${agentTriggersPath}`;

  const renderQuickstartCommand = () => (
    <div>
      <div className="flex text-gray-600 mb-3">
        <span className="select-none mr-4">#</span>
        <span>
          Requires:{' '}
          <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Docker
          </a>
        </span>
      </div>
      <div className="flex">
        <span className="text-gray-600 select-none mr-4">$</span>
        <span>
          <span className="text-cyan-400">docker pull</span>{' '}
          <span className="text-gray-300">archestra/platform:latest</span>
        </span>
      </div>
      <div className="flex mt-2">
        <span className="text-gray-600 select-none mr-4">$</span>
        <div>
          <span className="text-cyan-400">docker run</span>{' '}
          <span className="text-yellow-300">-p 9000:9000 -p 3000:3000</span> {renderLineContinuation()}
          {'\n'}
          <span className="text-gray-300">
            {'  '}-e <span className="text-purple-400">ARCHESTRA_QUICKSTART</span>=true
          </span>{' '}
          {renderLineContinuation()}
          {'\n'}
          {ngrokKey && (
            <>
              <span className="text-gray-300">
                {'  '}-e <span className="text-purple-400">ARCHESTRA_NGROK_AUTH_TOKEN</span>={ngrokKey}
              </span>{' '}
              {renderLineContinuation()}
              {'\n'}
            </>
          )}
          {customDomain && (
            <>
              <span className="text-gray-300">
                {'  '}-e <span className="text-purple-400">ARCHESTRA_API_BASE_URL</span>={customDomain}
              </span>{' '}
              {renderLineContinuation()}
              {'\n'}
            </>
          )}
          <span className="text-gray-300">{'  '}-v /var/run/docker.sock:/var/run/docker.sock</span>{' '}
          {renderLineContinuation()}
          {'\n'}
          <span className="text-gray-300">{'  '}-v archestra-postgres-data:/var/lib/postgresql/data</span>{' '}
          {renderLineContinuation()}
          {'\n'}
          <span className="text-gray-300">{'  '}-v archestra-app-data:/app/data</span> {renderLineContinuation()}
          {'\n'}
          <span className="text-gray-300">{'  '}archestra/platform</span>
        </div>
      </div>
      <div className="flex text-gray-600 mt-3">
        <span className="select-none mr-4">#</span>
        <span>
          Full guide:{' '}
          <a href="/docs/platform-deployment#docker-deployment" className={linkClass}>
            Deployment Guide
          </a>
        </span>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800">
      {/* Tabs */}
      <div className="bg-gray-900 px-4 flex gap-0 border-b border-gray-700/50">
        <div className="flex gap-0 flex-1">
          {[
            { key: 'quickstart' as const, label: 'Local Quickstart', icon: Terminal },
            { key: 'development' as const, label: 'Development', icon: Code },
            { key: 'production' as const, label: 'Production', icon: Rocket },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = launchTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {showExposureOverlay && onMessagingProviderChange && (
            <>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => onMessagingProviderChange('slack')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                    messagingProvider === 'slack' ? 'text-gray-200 bg-gray-700' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <img src="/logo-slack.png" alt="" className="w-3.5 h-3.5" />
                  Slack
                </button>
                <button
                  onClick={() => onMessagingProviderChange('msteams')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                    messagingProvider === 'msteams' ? 'text-gray-200 bg-gray-700' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <img src="/logo-ms-teams.png" alt="" className="w-3.5 h-3.5" />
                  MS Teams
                </button>
              </div>
              {launchTab !== 'development' && <div className="w-px h-4 bg-gray-700"></div>}
            </>
          )}
          {launchTab !== 'development' && (
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setShell('bash')}
                className={`px-2 py-1 rounded transition-colors ${
                  shell === 'bash' ? 'text-gray-200 bg-gray-700' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Linux / macOS
              </button>
              <button
                onClick={() => setShell('powershell')}
                className={`px-2 py-1 rounded transition-colors ${
                  shell === 'powershell' ? 'text-gray-200 bg-gray-700' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Windows
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Code content */}
      <div className="bg-[#0d1117] p-6 font-mono text-sm md:text-base leading-relaxed overflow-x-auto relative whitespace-pre-wrap">
        <button
          onClick={handleCopy}
          className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-all z-20 ${
            exposureStep !== null ? 'hidden' : ''
          } ${copied ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        {renderExposureOverlay()}
        {launchTab === 'development' && (
          <div>
            <div className="flex text-gray-600 mb-3">
              <span className="select-none mr-4">#</span>
              <span>
                Requires:{' '}
                <a
                  href="https://docs.tilt.dev/install.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Tilt
                </a>{' '}
                and{' '}
                <a
                  href="https://docs.docker.com/get-docker/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Docker
                </a>
              </span>
            </div>
            <div className="flex">
              <span className="text-gray-600 select-none mr-4">$</span>
              <span>
                <span className="text-cyan-400">git clone</span>{' '}
                <span className="text-gray-300">https://github.com/archestra-ai/archestra.git</span>
              </span>
            </div>
            <div className="flex">
              <span className="text-gray-600 select-none mr-4">$</span>
              <span>
                <span className="text-cyan-400">cd</span> <span className="text-gray-300">archestra/platform</span>
              </span>
            </div>
            <div className="flex">
              <span className="text-gray-600 select-none mr-4">$</span>
              <span className="text-green-400">tilt up</span>
            </div>
            <div className="flex text-gray-600 mt-3">
              <span className="select-none mr-4">#</span>
              <span>
                Full guide:{' '}
                <a href="/docs/platform-developer-quickstart" className={linkClass}>
                  Developer Quickstart
                </a>
              </span>
            </div>
          </div>
        )}
        {launchTab === 'quickstart' && renderQuickstartCommand()}
        {launchTab === 'production' && (
          <div>
            <div className="flex text-gray-600 mb-3">
              <span className="select-none mr-4">#</span>
              <span>
                Requires:{' '}
                <a
                  href="https://helm.sh/docs/intro/install/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Helm
                </a>
                ,{' '}
                <a
                  href="https://kubernetes.io/docs/tasks/tools/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  kubectl
                </a>
                , a Kubernetes cluster
              </span>
            </div>
            <div className="flex">
              <span className="text-gray-600 select-none mr-4">$</span>
              <div>
                <span className="text-cyan-400">helm upgrade</span>{' '}
                <span className="text-gray-300">archestra-platform</span> {renderLineContinuation()}
                {'\n'}
                <span className="text-gray-300">{'  '}oci://europe-west1-docker.pkg.dev/friendly-path-465518-r6/</span>
                {'\n'}
                <span className="text-gray-300">{'    '}archestra-public/helm-charts/archestra-platform</span>{' '}
                {renderLineContinuation()}
                {'\n'}
                <span className="text-yellow-300">{'  '}--install</span> {renderLineContinuation()}
                {'\n'}
                <span className="text-yellow-300">{'  '}--namespace</span>{' '}
                <span className="text-gray-300">archestra</span> {renderLineContinuation()}
                {'\n'}
                <span className="text-yellow-300">{'  '}--set</span>{' '}
                <span className="text-purple-400">archestra.env.HOSTNAME</span>
                <span className="text-gray-300">=&quot;0.0.0.0&quot;</span> {renderLineContinuation()}
                {'\n'}
                <span className="text-yellow-300">{'  '}--create-namespace</span> {renderLineContinuation()}
                {'\n'}
                <span className="text-yellow-300">{'  '}--wait</span>
              </div>
            </div>
            <div className="flex text-gray-600 mt-3">
              <span className="select-none mr-4">#</span>
              <span>
                Full guide:{' '}
                <a href="/docs/platform-deployment#helm-deployment" className={linkClass}>
                  Deployment Guide
                </a>
              </span>
            </div>
          </div>
        )}
      </div>
      {/* Next step callout */}
      <div className="bg-[#0d1117] border-t border-gray-700/50 px-6 py-3 font-mono text-sm flex">
        <span className="text-green-400 select-none mr-4">→</span>
        <span className="text-gray-400">
          Then open{' '}
          {launchTab === 'development' ? (
            <>
              <a
                href="http://localhost:10350"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white underline underline-offset-2"
              >
                localhost:10350
              </a>
              <span className="text-gray-600"> (Tilt)</span> and{' '}
              <a
                href={agentTriggersHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white underline underline-offset-2"
              >
                {agentTriggersBase}
                {agentTriggersPath}
              </a>
              <span className="text-gray-600"> (Archestra)</span>
            </>
          ) : launchTab === 'quickstart' ? (
            <a
              href={agentTriggersHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-white underline underline-offset-2"
            >
              {agentTriggersBase}
              {agentTriggersPath}
            </a>
          ) : (
            <span className="text-gray-200">
              &lt;archestra_url&gt;{agentTriggersPath}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
