'use client';

import { AlertTriangle, Calendar, Github, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';
import MermaidDiagram from '@components/MermaidDiagram';
import NewsletterForm from '@components/NewsletterForm';
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
      archestra: { repoUrl: githubArchestraRepoUrl },
    },
  },
} = constants;

// Particle Animation Component
const ParticleAnimation = ({ topLogoRefs, archestraRef, bottomLogoRefs }: {
  topLogoRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  archestraRef: React.RefObject<HTMLDivElement>;
  bottomLogoRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size and recalculate positions
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Recalculate logo positions and recreate particles
        const positions = getLogoPositions();
        if (positions.archestraPos && positions.topLogos.length > 0 && positions.bottomLogos.length > 0) {
          particlesRef.current = createParticles(positions.topLogos, positions.bottomLogos, positions.archestraPos);
        }
      }
    };
    
    // Initial delay to ensure logos are rendered
    setTimeout(() => {
      resizeCanvas();
    }, 100);
    
    window.addEventListener('resize', resizeCanvas);

    // Get actual logo positions from refs
    const getLogoPositions = () => {
      const containerRect = canvas.parentElement?.getBoundingClientRect();
      if (!containerRect) return { topLogos: [], archestraPos: null, bottomLogos: [] };

      const topLogos = topLogoRefs.current
        .filter(ref => ref !== null)
        .map(ref => {
          const rect = ref!.getBoundingClientRect();
          return {
            x: (rect.left + rect.width / 2 - containerRect.left) / containerRect.width,
            y: (rect.top + rect.height / 2 - containerRect.top) / containerRect.height
          };
        });

      const archestraRect = archestraRef.current?.getBoundingClientRect();
      const archestraPos = archestraRect ? {
        x: (archestraRect.left + archestraRect.width / 2 - containerRect.left) / containerRect.width,
        y: (archestraRect.top + archestraRect.height / 2 - containerRect.top) / containerRect.height
      } : { x: 0.5, y: 0.5 };

      const bottomLogos = bottomLogoRefs.current
        .filter(ref => ref !== null)
        .map(ref => {
          const rect = ref!.getBoundingClientRect();
          return {
            x: (rect.left + rect.width / 2 - containerRect.left) / containerRect.width,
            y: (rect.top + rect.height / 2 - containerRect.top) / containerRect.height
          };
        });

      return { topLogos, archestraPos, bottomLogos };
    };


    // Particle class
    class Particle {
      constructor(
        public startX: number,
        public startY: number,
        public endX: number,
        public endY: number,
        public viaArchestra: boolean = true
      ) {
        this.x = startX;
        this.y = startY;
        this.progress = 0;
        this.speed = 0.002 + Math.random() * 0.002;
        this.radius = 1.5 + Math.random() * 1;
        this.opacity = 0;
        this.color = this.getRandomColor();
      }

      x: number;
      y: number;
      progress: number;
      speed: number;
      radius: number;
      opacity: number;
      color: string;

      getRandomColor() {
        const colors = ['#3b82f6', '#10b981', '#f59e0b'];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.progress += this.speed;
        
        if (this.progress >= 1) {
          this.progress = 0;
          this.x = this.startX;
          this.y = this.startY;
        }

        if (this.viaArchestra) {
          const archestraPos = (window as any).archestraPos || { x: 0.5, y: 0.5 };
          if (this.progress < 0.5) {
            // First half: source to Archestra
            const t = this.progress * 2;
            this.x = this.startX + (archestraPos.x * canvasWidth - this.startX) * t;
            this.y = this.startY + (archestraPos.y * canvasHeight - this.startY) * t;
          } else {
            // Second half: Archestra to destination
            const t = (this.progress - 0.5) * 2;
            this.x = archestraPos.x * canvasWidth + (this.endX - archestraPos.x * canvasWidth) * t;
            this.y = archestraPos.y * canvasHeight + (this.endY - archestraPos.y * canvasHeight) * t;
          }
        }

        // Fade in/out at edges
        const fadeDistance = 0.15;
        if (this.progress < fadeDistance) {
          this.opacity = this.progress / fadeDistance;
        } else if (this.progress > 1 - fadeDistance) {
          this.opacity = (1 - this.progress) / fadeDistance;
        } else {
          this.opacity = 0.6 + Math.sin(Date.now() * 0.001 + this.progress * 10) * 0.2;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Create particles for all connections
    const createParticles = (topLogoPositions: any[], bottomLogoPositions: any[], archestraPosition: any) => {
      const particles: Particle[] = [];
      const { width, height } = canvas;

      // Store archestra position for particle update
      window.archestraPos = archestraPosition;

      // Top to bottom connections via Archestra
      topLogoPositions.forEach(topLogo => {
        bottomLogoPositions.forEach(bottomLogo => {
          // Create 2 particles per connection
          for (let i = 0; i < 2; i++) {
            particles.push(
              new Particle(
                topLogo.x * width,
                topLogo.y * height,
                bottomLogo.x * width,
                bottomLogo.y * height,
                true
              )
            );
          }
        });
      });

      // Bottom to top connections via Archestra
      bottomLogoPositions.forEach(bottomLogo => {
        topLogoPositions.forEach(topLogo => {
          // Create 2 particles per connection
          for (let i = 0; i < 2; i++) {
            particles.push(
              new Particle(
                bottomLogo.x * width,
                bottomLogo.y * height,
                topLogo.x * width,
                topLogo.y * height,
                true
              )
            );
          }
        });
      });

      // Stagger the initial progress
      particles.forEach((p, i) => {
        p.progress = (i / particles.length) * 0.5;
      });

      return particles;
    };

    // Initial particle creation
    const initialPositions = getLogoPositions();
    if (initialPositions.archestraPos && initialPositions.topLogos.length > 0 && initialPositions.bottomLogos.length > 0) {
      particlesRef.current = createParticles(initialPositions.topLogos, initialPositions.bottomLogos, initialPositions.archestraPos);
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [topLogoRefs, archestraRef, bottomLogoRefs]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
};

export default function Home() {
  const [copied, setCopied] = useState(false);
  const topLogoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const archestraRef = useRef<HTMLDivElement>(null);
  const bottomLogoRefs = useRef<(HTMLDivElement | null)[]>([]);

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
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white pb-0 pt-20">
          <div className="container pt-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center gap-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">Central Place for AI in Your Organization</h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl">
                Open Source and Cloud-Native
              </p>
            </div>
          </div>
        </section>

        {/* Architecture Diagram Section */}
        <section className="pt-12 pb-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="relative max-w-6xl mx-auto">
              {/* Particle Animation */}
              <ParticleAnimation 
                topLogoRefs={topLogoRefs}
                archestraRef={archestraRef}
                bottomLogoRefs={bottomLogoRefs}
              />
              {/* Top Row - AI Applications */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
                <div className="flex flex-col items-center">
                  <div ref={el => topLogoRefs.current[0] = el} className="w-20 h-20 flex items-center justify-center">
                    <img src="/logo_n8n.png" alt="n8n" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div ref={el => topLogoRefs.current[1] = el} className="w-20 h-20 flex items-center justify-center">
                    <img src="/logo_cursor.png" alt="Cursor" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div ref={el => topLogoRefs.current[2] = el} className="w-20 h-20 flex items-center justify-center">
                    <img src="/logo_claude.png" alt="Claude" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div ref={el => topLogoRefs.current[3] = el} className="w-20 h-20 flex items-center justify-center">
                    <img src="/logo_azure_ai_foundry.png" alt="Azure AI Foundry" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div ref={el => topLogoRefs.current[4] = el} className="w-20 h-20 flex items-center justify-center">
                    <span className="text-2xl">🦜⛓️</span>
                  </div>
                </div>
              </div>

              {/* Center - Archestra */}
              <div className="relative z-10 flex justify-center mb-16">
                <div ref={archestraRef} className="relative">
                  <div className="absolute inset-0 bg-black blur-2xl opacity-10 animate-pulse"></div>
                  <img 
                    src="/logo_square.png" 
                    alt="Archestra" 
                    className="relative w-24 h-24"
                  />
                </div>
              </div>

              {/* Bottom Row - LLM Providers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  <div ref={el => bottomLogoRefs.current[0] = el} className="w-20 h-20 flex items-center justify-center">
                    <img src="/logo_openai.png" alt="OpenAI" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div ref={el => bottomLogoRefs.current[1] = el} className="w-20 h-20 flex items-center justify-center">
                    <img src="/logo_bedrock.png" alt="AWS Bedrock" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div ref={el => bottomLogoRefs.current[2] = el} className="w-20 h-20 flex items-center justify-center">
                    <img src="/logo_anthropic.png" alt="Anthropic" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div ref={el => bottomLogoRefs.current[3] = el} className="w-20 h-20 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">vLLM</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Security Hero Section with Video */}
        <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>
          
          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6">
                {/* Security Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-medium text-sm">Security Foundation</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Non-Probabilistic Security to{' '}
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Prevent Data Exfiltration
                  </span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Models could consume prompt injections via MCP uncontrollably - reading your inbox, 
                  GitHub issues, or customer inquiries - and follow malicious instructions resulting 
                  in data exfiltration.
                </p>
                
                {/* Examples of Hacks */}
                <div className="bg-red-50/50 backdrop-blur rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-3">⚠️ Real attacks examples:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <a href="https://simonwillison.net/2023/Apr/14/new-prompt-injection-attack-on-chatgpt-web-version-markdown-imag/" 
                       target="_blank" rel="noopener noreferrer"
                       className="text-gray-700 hover:text-red-600 transition-colors">
                      • ChatGPT (Apr 2023)
                    </a>
                    <a href="https://simonwillison.net/2023/Nov/4/hacking-google-bard-from-prompt-injection-to-data-exfiltration/" 
                       target="_blank" rel="noopener noreferrer"
                       className="text-gray-700 hover:text-red-600 transition-colors">
                      • Google Bard (Nov 2023)
                    </a>
                    <a href="https://simonwillison.net/2024/Jun/16/github-copilot-chat-prompt-injection/" 
                       target="_blank" rel="noopener noreferrer"
                       className="text-gray-700 hover:text-red-600 transition-colors">
                      • GitHub Copilot (Jun 2024)
                    </a>
                    <a href="https://simonwillison.net/2024/Aug/14/living-off-microsoft-copilot/" 
                       target="_blank" rel="noopener noreferrer"
                       className="text-gray-700 hover:text-red-600 transition-colors">
                      • Microsoft Copilot (Aug 2024)
                    </a>
                    <a href="https://simonwillison.net/2024/Aug/20/data-exfiltration-from-slack-ai/" 
                       target="_blank" rel="noopener noreferrer"
                       className="text-gray-700 hover:text-red-600 transition-colors">
                      • Slack AI (Aug 2024)
                    </a>
                    <a href="https://simonwillison.net/2025/Feb/17/chatgpt-operator-prompt-injection/" 
                       target="_blank" rel="noopener noreferrer"
                       className="text-gray-700 hover:text-red-600 transition-colors">
                      • ChatGPT Operator (Feb 2025)
                    </a>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/docs/platform-dynamic-tools"
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Dynamic Tools
                    <span className="ml-1">→</span>
                  </Link>
                  <Link
                    href="/docs/platform-lethal-trifecta"
                    className="inline-flex items-center px-5 py-2.5 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Lethal Trifecta
                    <span className="ml-1">→</span>
                  </Link>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex items-center gap-6 pt-4 text-sm">
                  <a
                    href="https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <span className="font-medium">📰 Simon Willison</span>
                  </a>
                  <a
                    href="https://www.economist.com/leaders/2025/09/25/how-to-stop-ais-lethal-trifecta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <span className="font-medium">📰 The Economist</span>
                  </a>
                </div>
              </div>
              
              {/* Right Column - Video */}
              <div className="relative space-y-4">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
                
                {/* Video Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-black">
                  <div className="relative pb-[56.25%] h-0">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src="https://www.youtube.com/embed/SkmluS-xzmM?start=2155"
                      title="Archestra Security Demo - Preventing Data Exfiltration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                
                {/* Video Label */}
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE DEMO
                </div>
                
                {/* Demo Description Box */}
                <div className="relative bg-white/90 backdrop-blur rounded-lg p-4 border border-gray-200 shadow-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-2">🎬 What you'll see in the demo:</p>
                  <p className="text-sm text-gray-600">
                    Live demonstration of Archestra's security engine preventing data leaks from 
                    private to public GitHub repositories through prompt injection attacks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Private MCP Registry Section */}
        <section className="py-24 bg-gradient-to-br from-purple-50 via-indigo-50 to-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-slate-100/30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]"></div>
          
          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Image */}
              <div className="relative">
                {/* Purple glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl blur-3xl opacity-15"></div>
                
                {/* Screenshot Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                  <img 
                    src="https://raw.githubusercontent.com/archestra-ai/archestra/main/docs/assets/mcp-registry.png" 
                    alt="Private MCP Registry Interface"
                    className="w-full h-auto"
                  />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -top-3 -right-3 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Enterprise Ready
                </div>
              </div>
              
              {/* Right Column - Content */}
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-700 font-medium text-sm">Centralized Governance</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Private MCP Registry with{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Full Governance
                  </span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Add MCPs to your private registry to share them with your team: self-hosted and remote, 
                  self-built and third-party. Maintain complete control over your organization's MCP ecosystem.
                </p>

                {/* Features List */}
                <div className="space-y-4">
                  {/* Version Control */}
                  <div className="flex items-start gap-4 bg-white/70 backdrop-blur rounded-lg p-4 border border-purple-200">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Version Control</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Track and manage different versions with full rollback capabilities
                      </p>
                    </div>
                  </div>

                  {/* Access Management */}
                  <div className="flex items-start gap-4 bg-white/70 backdrop-blur rounded-lg p-4 border border-green-200">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Access Management</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Granular permissions and team-based access control
                      </p>
                    </div>
                  </div>

                  {/* Compliance */}
                  <div className="flex items-start gap-4 bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Compliance & Governance</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ensure all deployments meet security and compliance standards
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="pt-2">
                  <Link
                    href="/docs/platform-private-registry"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Learn About Private Registry
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kubernetes-native MCP Orchestrator Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-slate-100/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>
          
          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 font-medium text-sm">Cloud-Native Architecture</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Kubernetes-Native{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    MCP Orchestrator
                  </span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Run MCP servers in Kubernetes, managing their state, API keys, OAuth, and credentials. 
                  Enterprise-grade orchestration with automatic scaling, health checks, and zero-downtime deployments.
                </p>

                {/* Key Features */}
                <div className="space-y-4">
                  {/* Credentials & OAuth */}
                  <div className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Secure Credentials</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Store secrets in HashiCorp Vault or Kubernetes Secrets with automatic rotation
                      </p>
                      <Link 
                        href="/docs/platform-secrets-management" 
                        className="text-xs text-green-600 hover:text-green-700 font-medium mt-1 inline-block"
                      >
                        Learn about secrets management →
                      </Link>
                    </div>
                  </div>

                  {/* Auto-scaling */}
                  <div className="flex items-start gap-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Auto-Scaling</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Automatic scaling based on load with health checks and monitoring
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/docs/platform-orchestrator"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Learn More
                    <span className="ml-2">→</span>
                  </Link>
                  <a
                    href="https://github.com/archestra-ai/archestra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all shadow-lg"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Deploy Now
                  </a>
                </div>
              </div>
              
              {/* Right Column - Mermaid Diagram */}
              <div className="relative">
                {/* Blue glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-3xl opacity-10"></div>
                
                {/* Diagram Container */}
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <MermaidDiagram />
                </div>
                
                {/* Floating Label */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  K8s Native
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* On-Prem Performance Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Production-Ready</h2>
                  <p className="text-xl text-gray-600">Enterprise-grade performance and observability</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Performance Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Lightning Fast</h3>
                    </div>
                    <p className="text-5xl font-black text-blue-600 mb-2">41ms</p>
                    <p className="text-gray-700 font-medium mb-4">99p latency overhead</p>
                    <a
                      href="/docs/platform-performance-benchmarks"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      View Benchmark
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* Observability Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Full Observability</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">Prometheus exporter</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">Traces</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">Real-time token usage monitoring</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA - Outside of panel */}
            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs"
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors inline-block"
                >
                  Read Documentation
                </Link>
                <Link
                  href="/book-demo"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
                >
                  Book a Demo
                </Link>
                <a
                  href="https://github.com/archestra-ai/archestra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  <span>Deploy</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Docker Run Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Quick Start</h2>
                <p className="text-lg text-gray-600">Deploy Archestra in seconds with Docker</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <code className="text-green-400 font-mono text-sm md:text-base">
                    docker pull archestra/platform:latest; <br />
                    docker run -p 9000:9000 -p 3000:3000 \ <br />
                    &nbsp;&nbsp;-v archestra-postgres-data:/var/lib/postgresql/data \ <br />
                    &nbsp;&nbsp;-v archestra-app-data:/app/data \ <br />
                    &nbsp;&nbsp;archestra/platform
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        'docker pull archestra/platform:latest;\ndocker run -p 9000:9000 -p 3000:3000 \\\n  -v archestra-postgres-data:/var/lib/postgresql/data \\\n  -v archestra-app-data:/app/data \\\n  archestra/platform;'
                      );
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`ml-4 px-3 py-1.5 text-xs font-medium text-white rounded transition-all ${
                      copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  View the{' '}
                  <Link href="/docs/platform-deployment" className="text-blue-600 hover:text-blue-700 font-medium">
                    full deployment guide
                  </Link>{' '}
                  for more options
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Integrations Section */}
        <section className="pb-20 pt-20 bg-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            {/* Platform Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {/* N8N */}
              <Link
                href="/docs/platform-n8n-example"
                className="group flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-red-600 mb-3 text-center">
                  <span className="text-sm font-medium">Securing</span>
                  <br />
                  <span className="text-4xl font-bold">n8n</span>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Documentation →</span>
              </Link>

              {/* Vercel AI */}
              <Link
                href="/docs/platform-vercel-ai-example"
                className="group flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-black mb-3 text-center">
                  <span className="text-sm font-medium">Securing</span>
                  <br />
                  <span className="text-3xl font-bold whitespace-nowrap">Vercel AI</span>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Documentation →</span>
              </Link>

              {/* Pydantic AI */}
              <Link
                href="/docs/platform-pydantic-example"
                className="group flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-pink-600 mb-3 text-center">
                  <span className="text-sm font-medium">Securing</span>
                  <br />
                  <span className="text-3xl font-bold whitespace-nowrap">Pydantic AI</span>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Documentation →</span>
              </Link>

              {/* OpenWebUI */}
              <Link
                href="/docs/platform-openwebui-example"
                className="group flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-blue-600 mb-3 text-center">
                  <span className="text-sm font-medium">Securing</span>
                  <br />
                  <span className="text-3xl font-bold">OpenWebUI</span>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Documentation →</span>
              </Link>
            </div>

            {/* Additional Integration Note */}
            <div className="text-center mt-12">
              <p className="text-gray-600">
                And many more through our{' '}
                <Link href="/docs/" className="text-blue-600 hover:text-blue-700 font-medium">
                  OpenAI-compatible proxy
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,transparent,white)]"></div>
          <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Newsletter
              </div>
              <p className="text-xl text-gray-600 mb-10">Short, crisp, and to the point e-mails about Archestra</p>
              <div className="flex justify-center">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </section>

        {/* Contributors Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contributors</h2>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for contributing and continuously making <b>Archestra</b> better, <b>you're awesome</b> 🫶
              </p>
              <div className="flex justify-center">
                <a
                  href="https://github.com/archestra-ai/archestra/graphs/contributors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://contrib.rocks/image?repo=archestra-ai/archestra"
                    alt="Contributors"
                    className="max-w-full"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Community Calls Hero Section */}
        <section className="py-12 bg-gradient-to-r from-teal-500 to-blue-600 text-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Weekly Community Calls</h2>
              <p className="text-lg mb-6 max-w-xl mx-auto opacity-95">Every Tuesday at 2:00 PM London Time</p>
              <Link
                href="/community-calls"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                View Details
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
