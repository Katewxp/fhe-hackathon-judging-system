"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletContext";
import { contractService, Hackathon, Project, Judge } from "@/lib/contractService";
import { useToast } from "@/components/Toast";

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { account } = useWallet();
  const { showToast } = useToast();

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      setLoading(true);
      const hackathonsData = await contractService.getHackathons();
      setHackathons(hackathonsData);
      console.log("Loaded hackathons:", hackathonsData);
    } catch (error) {
      console.error("Failed to load hackathons:", error);
      showToast({
        type: "error",
        title: "Failed to Load Hackathons",
        message: "Unable to load hackathon data. Please try again.",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (day: number) => {
    const date = new Date(day * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesFilter = filter === "all" || 
      (filter === "active" && hackathon.isActive) ||
      (filter === "completed" && !hackathon.isActive && hackathon.rankingsPublished) ||
      (filter === "judging" && hackathon.scoresAggregated && !hackathon.rankingsPublished);

    const matchesSearch = hackathon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading hackathons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Discover
            </span>{" "}
            Hackathons
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Explore the most exciting privacy-preserving hackathons and contribute to the future of technology. 
            Join competitions, showcase your skills, and win amazing prizes.
          </p>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { id: "all", label: "All", count: hackathons.length },
                { id: "active", label: "Active", count: hackathons.filter(h => h.isActive).length },
                { id: "judging", label: "Judging", count: hackathons.filter(h => h.scoresAggregated && !h.rankingsPublished).length },
                { id: "completed", label: "Completed", count: hackathons.filter(h => !h.isActive && h.rankingsPublished).length }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    filter === filterOption.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {filterOption.label}
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredHackathons.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Hackathons Found</h3>
              <p className="text-gray-300 mb-8">
                {searchTerm ? `No hackathons match "${searchTerm}"` : "No hackathons match the selected filter"}
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHackathons.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {hackathon.name}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-3">
                          {hackathon.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            hackathon.isActive
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                          }`}
                        >
                          {hackathon.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Projects:</span>
                        <span className="text-white font-medium">
                          {hackathon.projectCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Judges:</span>
                        <span className="text-white font-medium">
                          {hackathon.judgeCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Start:</span>
                        <span className="text-white font-medium">
                          {formatDate(hackathon.startDay)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">End:</span>
                        <span className="text-white font-medium">
                          {formatDate(hackathon.endDay)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Link
                        href={`/hackathons/${hackathon.id}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                      >
                        View Details
                      </Link>
                      {account && account === hackathon.organizer && (
                        <Link
                          href="/organize"
                          className="bg-white/20 text-white py-2 px-4 rounded-lg hover:bg-white/30 transition-all duration-300"
                        >
                          Manage
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center mt-12">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-xl">
                  Load More Hackathons
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Organize</span> Your Own?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create a hackathon and bring together the brightest minds in technology. 
            Our platform makes it easy to manage projects, judges, and results.
          </p>
          <Link
            href="/organize"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25"
          >
            Create Hackathon
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
