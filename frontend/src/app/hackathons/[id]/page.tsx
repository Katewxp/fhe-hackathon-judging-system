"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletContext";
import { contractService, Hackathon, Project, Judge } from "@/lib/contractService";
import { useToast } from "@/components/Toast";

export default function HackathonDetailPage() {
  const params = useParams();
  const hackathonId = parseInt(params.id as string);
  const { account } = useWallet();
  const { showToast } = useToast();
  
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (hackathonId >= 0) {
      loadHackathonDetails();
    }
  }, [hackathonId]);

  const loadHackathonDetails = async () => {
    try {
      setLoading(true);
      
      // Load hackathon data
      const hackathonData = await contractService.getHackathon(hackathonId);
      if (hackathonData) {
        setHackathon(hackathonData);
        
        // Load projects and judges
        const [projectsData, judgesData] = await Promise.all([
          contractService.getProjects(hackathonId),
          contractService.getJudges(hackathonId)
        ]);
        
        setProjects(projectsData);
        setJudges(judgesData);
      } else {
        showToast({
          type: "error",
          title: "Hackathon Not Found",
          message: "The requested hackathon could not be found.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Failed to load hackathon details:", error);
      showToast({
        type: "error",
        title: "Failed to Load Data",
        message: "Unable to load hackathon details. Please try again.",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (day: number) => {
    const date = new Date(day * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (hackathon: Hackathon) => {
    if (hackathon.rankingsPublished) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          🏆 Results Published
        </span>
      );
    } else if (hackathon.scoresAggregated) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          ⚖️ Judging Complete
        </span>
      );
    } else if (hackathon.isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          🚀 Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
          ⏸️ Inactive
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Hackathon Not Found
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            The hackathon you're looking for doesn't exist.
          </p>
          <Link
            href="/hackathons"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Back to Hackathons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href="/hackathons"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Hackathons
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2">
                {hackathon.name}
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl">
                {hackathon.description}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(hackathon)}
              {account && account === hackathon.organizer && (
                <div className="mt-3">
                  <Link
                    href="/organize"
                    className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300"
                  >
                    Manage Hackathon
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {hackathon.projectCount}
              </div>
              <div className="text-sm text-gray-400">Projects</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {hackathon.judgeCount}
              </div>
              <div className="text-sm text-gray-400">Judges</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {formatDate(hackathon.startDay)}
              </div>
              <div className="text-sm text-gray-400">Start Date</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {formatDate(hackathon.endDay)}
              </div>
              <div className="text-sm text-gray-400">End Date</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "projects", label: "Projects" },
              { id: "judges", label: "Judges" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Hackathon Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {hackathon.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Timeline
                    </h3>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span className="text-white">{formatDate(hackathon.startDay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End Date:</span>
                        <span className="text-white">{formatDate(hackathon.endDay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-white">
                          {hackathon.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {hackathon.projectCount}
                    </div>
                    <div className="text-sm text-gray-400">Projects Registered</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {hackathon.judgeCount}
                    </div>
                    <div className="text-sm text-gray-400">Judges Assigned</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {hackathon.scoresAggregated ? "✓" : "⏳"}
                    </div>
                    <div className="text-sm text-gray-400">Scores Aggregated</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Registered Projects
              </h2>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Projects Yet
                  </h3>
                  <p className="text-gray-400">
                    This hackathon doesn't have any registered projects yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {project.name}
                          </h3>
                          <p className="text-gray-300 text-sm mb-3">
                            {project.description}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Team Lead:</span>
                              <span className="text-white font-mono">
                                {project.teamLead.slice(0, 6)}...{project.teamLead.slice(-4)}
                              </span>
                            </div>
                            {project.githubUrl && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">GitHub:</span>
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  View Repository
                                </a>
                              </div>
                            )}
                            {project.demoUrl && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Demo:</span>
                                <a
                                  href={project.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:text-green-300"
                                >
                                  Live Demo
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Project {project.id + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Judges Tab */}
          {activeTab === "judges" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Assigned Judges
              </h2>
              {judges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚖️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Judges Assigned
                  </h3>
                  <p className="text-gray-400">
                    This hackathon doesn't have any assigned judges yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {judges.map((judge, index) => (
                    <div
                      key={judge.address}
                      className="bg-white/5 border border-white/10 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Judge {index + 1}
                          </h3>
                          <p className="text-gray-300 text-sm font-mono mb-3">
                            {judge.address}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Status:</span>
                              <span className={`font-medium ${
                                judge.isRegistered 
                                  ? "text-green-400" 
                                  : "text-red-400"
                              }`}>
                                {judge.isRegistered ? "Registered" : "Not Registered"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Projects Scored:</span>
                              <span className="text-white">
                                {judge.projectsScored}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">All Scores Submitted:</span>
                              <span className={`font-medium ${
                                judge.hasSubmittedAllScores 
                                  ? "text-green-400" 
                                  : "text-yellow-400"
                              }`}>
                                {judge.hasSubmittedAllScores ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            judge.hasSubmittedAllScores
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}>
                            {judge.hasSubmittedAllScores ? "Complete" : "In Progress"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
