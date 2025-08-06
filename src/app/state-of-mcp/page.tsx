'use client';

import { BarChart3, CheckCircle, Globe, Mail, Package, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

import Footer from '@components/Footer';
import Header from '@components/Header';
import { Card, CardContent } from '@components/ui/card';

export default function StateOfMCPPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    // Rate limiting: 1 min between signups
    const timestamp = Date.now();
    const previousTimestamp = localStorage.getItem('loops-form-timestamp');
    if (previousTimestamp && Number(previousTimestamp) + 60000 > timestamp) {
      setError('Too many signups, please try again in a little while');
      setIsSubmitting(false);
      return;
    }
    localStorage.setItem('loops-form-timestamp', String(timestamp));

    try {
      const formBody = 'userGroup=&mailingLists=&email=' + encodeURIComponent(email);

      const res = await fetch('https://app.loops.so/api/newsletter-form/cmdehe4lw18tnwy0ifkz89qqk', {
        method: 'POST',
        body: formBody,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitted(true);
        setEmail('');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('Too many signups, please try again in a little while');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
      localStorage.setItem('loops-form-timestamp', '');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate random particles
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      duration: number;
      delay: number;
      opacity: number;
    }>
  >([]);

  useEffect(() => {
    const generatedParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.3,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #fda085 75%, #667eea 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite',
          }}
        />

        {/* Floating Cube Particles */}
        <div className="absolute inset-0 z-0" style={{ perspective: '1000px' }}>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                transformStyle: 'preserve-3d',
                animation: `floatPath${particle.id % 5} ${
                  particle.duration
                }s ease-in-out ${particle.delay}s infinite, rotateCube ${particle.duration / 2}s linear infinite`,
              }}
            >
              <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                {/* Front face */}
                <div
                  className="absolute w-full h-full"
                  style={{
                    background: `rgba(255, 255, 255, ${particle.opacity})`,
                    border: `1px solid rgba(255, 255, 255, ${particle.opacity * 1.5})`,
                    boxShadow: `0 0 ${particle.size}px rgba(255, 255, 255, ${particle.opacity * 0.5})`,
                    transform: `translateZ(${particle.size / 2}px)`,
                  }}
                />
                {/* Back face */}
                <div
                  className="absolute w-full h-full"
                  style={{
                    background: `rgba(255, 255, 255, ${particle.opacity * 0.8})`,
                    border: `1px solid rgba(255, 255, 255, ${particle.opacity * 1.2})`,
                    transform: `translateZ(-${particle.size / 2}px) rotateY(180deg)`,
                  }}
                />
                {/* Top face */}
                <div
                  className="absolute w-full h-full"
                  style={{
                    background: `rgba(255, 255, 255, ${particle.opacity * 0.9})`,
                    border: `1px solid rgba(255, 255, 255, ${particle.opacity * 1.3})`,
                    transform: `rotateX(90deg) translateZ(${particle.size / 2}px)`,
                  }}
                />
                {/* Bottom face */}
                <div
                  className="absolute w-full h-full"
                  style={{
                    background: `rgba(255, 255, 255, ${particle.opacity * 0.7})`,
                    border: `1px solid rgba(255, 255, 255, ${particle.opacity})`,
                    transform: `rotateX(-90deg) translateZ(${particle.size / 2}px)`,
                  }}
                />
                {/* Right face */}
                <div
                  className="absolute w-full h-full"
                  style={{
                    background: `rgba(255, 255, 255, ${particle.opacity * 0.85})`,
                    border: `1px solid rgba(255, 255, 255, ${particle.opacity * 1.1})`,
                    transform: `rotateY(90deg) translateZ(${particle.size / 2}px)`,
                  }}
                />
                {/* Left face */}
                <div
                  className="absolute w-full h-full"
                  style={{
                    background: `rgba(255, 255, 255, ${particle.opacity * 0.75})`,
                    border: `1px solid rgba(255, 255, 255, ${particle.opacity * 0.9})`,
                    transform: `rotateY(-90deg) translateZ(${particle.size / 2}px)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/20 via-white/40 to-white/60" />

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes rotateCube {
            0% {
              transform: rotateX(0deg) rotateY(0deg);
            }
            100% {
              transform: rotateX(360deg) rotateY(360deg);
            }
          }

          @keyframes floatPath0 {
            0%,
            100% {
              transform: translateY(0vh) translateX(0vw) scale(1);
            }
            33% {
              transform: translateY(-30vh) translateX(10vw) scale(1.2);
            }
            66% {
              transform: translateY(20vh) translateX(-5vw) scale(0.8);
            }
          }

          @keyframes floatPath1 {
            0%,
            100% {
              transform: translateY(0vh) translateX(0vw) scale(1);
            }
            25% {
              transform: translateY(25vh) translateX(-15vw) scale(1.3);
            }
            50% {
              transform: translateY(-20vh) translateX(20vw) scale(0.9);
            }
            75% {
              transform: translateY(10vh) translateX(-10vw) scale(1.1);
            }
          }

          @keyframes floatPath2 {
            0%,
            100% {
              transform: translateY(0vh) translateX(0vw) scale(1) rotate(0deg);
            }
            20% {
              transform: translateY(-15vh) translateX(-8vw) scale(1.15) rotate(90deg);
            }
            40% {
              transform: translateY(30vh) translateX(12vw) scale(0.85) rotate(180deg);
            }
            60% {
              transform: translateY(-25vh) translateX(-15vw) scale(1.2) rotate(270deg);
            }
            80% {
              transform: translateY(15vh) translateX(10vw) scale(0.95) rotate(360deg);
            }
          }

          @keyframes floatPath3 {
            0%,
            100% {
              transform: translateY(0vh) translateX(0vw) scale(1);
            }
            50% {
              transform: translateY(40vh) translateX(-20vw) scale(1.4);
            }
          }

          @keyframes floatPath4 {
            0%,
            100% {
              transform: translateY(0vh) translateX(0vw) scale(1);
            }
            30% {
              transform: translateY(-35vh) translateX(25vw) scale(0.7);
            }
            60% {
              transform: translateY(15vh) translateX(-30vw) scale(1.25);
            }
            90% {
              transform: translateY(-10vh) translateX(15vw) scale(1.1);
            }
          }
        `}</style>

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">State of MCP Report Q3 2025</h1>
            </div>

            <p className="text-xl sm:text-2xl text-gray-600 mb-8">
              A Comprehensive Empirical Analysis of the Model Context Protocol Ecosystem
            </p>

            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              An exhaustive examination of 900+ MCP server implementations, examining adoption trajectories,
              architectural patterns, and the evolution of AI agent instrumentation frameworks.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-7xl mx-auto mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - Preview Cards */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 hover:border-blue-200 transition-colors">
                    <CardContent className="p-6">
                      <BarChart3 className="h-10 w-10 text-blue-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Quantitative Analysis: 900+ Implementations</h3>
                      <p className="text-gray-600 text-sm">
                        Systematic evaluation of code quality metrics, dependency graphs, and protocol adherence
                        standards
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-green-200 transition-colors">
                    <CardContent className="p-6">
                      <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">100k+ Inference Calls</h3>
                      <p className="text-gray-600 text-sm">LLM-powered feature extraction and source code analysis</p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-purple-200 transition-colors">
                    <CardContent className="p-6">
                      <Package className="h-10 w-10 text-purple-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Software Supply Chain Risk Assessment</h3>
                      <p className="text-gray-600 text-sm">
                        Vulnerability analysis, dependency risk quantification, and third-party component evaluation
                        methodologies
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-yellow-200 transition-colors">
                    <CardContent className="p-6">
                      <Users className="h-10 w-10 text-yellow-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Open Source Community Health Metrics</h3>
                      <p className="text-gray-600 text-sm">
                        Statistical analysis of contributor diversity, maintenance velocity, and ecosystem
                        sustainability indicators
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-red-200 transition-colors">
                    <CardContent className="p-6">
                      <Globe className="h-10 w-10 text-red-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Protocol Specification Compliance Study</h3>
                      <p className="text-gray-600 text-sm">
                        Empirical measurement of feature adoption rates and implementation conformance to specification
                        standards
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-indigo-200 transition-colors">
                    <CardContent className="p-6">
                      <Zap className="h-10 w-10 text-indigo-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Predictive Analysis: 2026 Protocol Trajectory</h3>
                      <p className="text-gray-600 text-sm">
                        Examining MCP's potential for standardization: enterprise adoption patterns and evolutionary
                        pathways
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right side - Email Collection Form */}
              <div className="lg:col-span-1">
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-8 sm:p-12">
                    <div className="text-center mb-8">
                      <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Subscribe for Early Access</h2>
                      <p className="text-gray-600">
                        Register for priority distribution of the State of MCP Report upon publication. Receive
                        evidence-based insights to inform your AI infrastructure decisions.
                      </p>
                    </div>

                    {!isSubmitted ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting}
                            required
                          />
                          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Processing...' : 'Subscribe'}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                          Privacy Policy: Your information will be used solely for report distribution. Unsubscribe
                          available.
                        </p>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscription Confirmed</h3>
                        <p className="text-gray-600">
                          You will receive notification upon publication of the State of MCP Report.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
