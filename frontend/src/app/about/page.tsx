"use client";

import Link from "next/link";

export default function AboutPage() {
  const externalLinks = [
    {
      name: "GitHub Repository",
      href: "https://github.com/Katewxp/fhe-hackathon-judging-system",
      description: "View source code and contribute",
      icon: "📚",
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "ZAMA Official",
      href: "https://zama.ai",
      description: "Learn more about FHE technology",
      icon: "🔐",
      color: "from-blue-500 to-purple-600"
    },
    {
      name: "Discord Community",
      href: "https://discord.gg/zama",
      description: "Join the ZAMA developer community",
      icon: "💬",
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "Live Demo",
      href: "https://fhe-hackathon-judging-system.vercel.app",
      description: "Try the platform live",
      icon: "🚀",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">FHE Judge</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The world's first privacy-preserving hackathon judging platform powered by 
            Fully Homomorphic Encryption (FHE) technology.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                We're revolutionizing hackathon judging by introducing unprecedented levels of privacy and fairness. 
                Our platform ensures that judge scores remain completely confidential while maintaining the integrity 
                of the evaluation process.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                By leveraging cutting-edge FHE technology, we enable secure, transparent, and bias-free judging 
                that benefits both participants and organizers.
              </p>
              <Link
                href="/hackathons"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
              >
                Explore Hackathons
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Privacy-First Approach
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Judge scores remain encrypted throughout the entire process
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Zero-knowledge proof verification
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Bias-free evaluation system
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Transparent and auditable results
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Powered by <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">FHE Technology</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fully Homomorphic Encryption enables computation on encrypted data without decryption, 
              ensuring complete privacy while maintaining functionality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-6">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                End-to-End Encryption
              </h3>
              <p className="text-gray-300">
                Scores are encrypted from submission to final aggregation, ensuring complete confidentiality.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Homomorphic Computation
              </h3>
              <p className="text-gray-300">
                Mathematical operations on encrypted scores without revealing individual values.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-6">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Zero-Knowledge Proofs
              </h3>
              <p className="text-gray-300">
                Cryptographic verification that scores are valid without revealing the actual values.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* External Links Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Get <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Connected</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our resources, join the community, and stay updated with the latest developments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {externalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  <div className="text-4xl mb-4">{link.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {link.name}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {link.description}
                  </p>
                  <div className="mt-4 flex items-center text-yellow-400 text-sm font-medium group-hover:text-yellow-300 transition-colors">
                    Visit Link
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Meet Our <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Team</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A passionate group of blockchain developers, cryptographers, and privacy advocates 
              dedicated to revolutionizing hackathon judging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lead Developer</h3>
              <p className="text-gray-400 mb-4">Blockchain & Smart Contracts</p>
              <p className="text-gray-300 text-sm">
                Expert in Solidity, FHEVM, and decentralized application development.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">🔐</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cryptography Expert</h3>
              <p className="text-gray-400 mb-4">FHE & Zero-Knowledge Proofs</p>
              <p className="text-gray-300 text-sm">
                Specialized in fully homomorphic encryption and privacy-preserving technologies.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">UX Designer</h3>
              <p className="text-gray-400 mb-4">User Experience & Interface</p>
              <p className="text-gray-300 text-sm">
                Creating intuitive and beautiful interfaces for complex cryptographic operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Our <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Values</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide our development and shape the future of hackathon judging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">🔒</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Privacy First</h3>
                  <p className="text-gray-300">
                    We believe that privacy is a fundamental right. Our platform ensures that sensitive 
                    information remains confidential while maintaining transparency where it matters.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">⚖️</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Fairness & Transparency</h3>
                  <p className="text-gray-300">
                    Every participant deserves a fair evaluation. Our system eliminates bias and 
                    provides transparent, auditable results.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">🚀</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Innovation</h3>
                  <p className="text-gray-300">
                    We're pushing the boundaries of what's possible with blockchain and cryptography, 
                    creating solutions that didn't exist before.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">🌍</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Global Impact</h3>
                  <p className="text-gray-300">
                    Our platform serves the global developer community, making advanced privacy 
                    technology accessible to everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Join</span> the Revolution?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Experience the future of hackathon judging with privacy-preserving technology. 
            Start exploring, participating, or organizing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/hackathons"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              Explore Hackathons
            </Link>
            <Link
              href="/organize"
              className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              Create Hackathon
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
