"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { contractService, Hackathon, Project, Judge } from "@/lib/contractService";
import { useToast } from "@/components/Toast";

export default function JudgePage() {
  const { account } = useWallet();
  const { showToast } = useToast();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (account) {
      loadJudgeData();
    }
  }, [account]);

  const loadJudgeData = async () => {
    try {
      setLoading(true);
      const hackathonsData = await contractService.getHackathons();
      setHackathons(hackathonsData);
      console.log("Loaded hackathons for judge:", hackathonsData);
    } catch (error) {
      console.error("Failed to load judge data:", error);
      showToast({
        type: "error",
        title: "Failed to Load Data",
        message: "Unable to load hackathon data. Please try again.",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHackathonProjects = async (hackathonId: number) => {
    try {
      const projectsData = await contractService.getProjects(hackathonId);
      setProjects(projectsData);
      console.log("Loaded projects for hackathon:", projectsData);
    } catch (error) {
      console.error("Failed to load projects:", error);
      showToast({
        type: "error",
        title: "Failed to Load Projects",
        message: "Unable to load project data. Please try again.",
        duration: 5000
      });
    }
  };

  const handleHackathonSelect = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    loadHackathonProjects(hackathon.id);
    setActiveTab("judging");
  };

  const submitScore = async (projectId: number, score: number) => {
    if (!selectedHackathon) return;
    
    try {
      setLoading(true);
      const success = await contractService.submitScore(selectedHackathon.id, projectId, score);
      
      if (success) {
        showToast({
          type: "success",
          title: "Score Submitted",
          message: `Successfully submitted score ${score} for project ${projectId}`,
          duration: 5000
        });
        // Reload projects to update UI
        loadHackathonProjects(selectedHackathon.id);
      } else {
        showToast({
          type: "error",
          title: "Submission Failed",
          message: "Failed to submit score. Please try again.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Failed to submit score:", error);
      showToast({
        type: "error",
        title: "Submission Error",
        message: "An error occurred while submitting the score.",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Wallet Connection Required
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Please connect your wallet to access the judge dashboard.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading judge data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Judge Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Review and score projects in privacy-preserving hackathons using
            Fully Homomorphic Encryption
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("judging")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === "judging"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Judging
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Active Hackathons
                </h3>
                <p className="text-3xl font-bold text-blue-400">
                  {hackathons.filter(h => h.isActive).length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Total Projects
                </h3>
                <p className="text-3xl font-bold text-green-400">
                  {hackathons.reduce((sum, h) => sum + h.projectCount, 0)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Judging Status
                </h3>
                <p className="text-3xl font-bold text-purple-400">
                  {hackathons.filter(h => h.scoresAggregated).length}
                </p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Available Hackathons
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hackathons
                  .filter(hackathon => hackathon.isActive)
                  .map((hackathon) => (
                    <div
                      key={hackathon.id}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      onClick={() => handleHackathonSelect(hackathon)}
                    >
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {hackathon.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {hackathon.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Projects:</span>
                          <span className="text-white">{hackathon.projectCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Judges:</span>
                          <span className="text-white">{hackathon.judgeCount}</span>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <span className="text-blue-400 text-sm font-medium">
                          Click to Start Judging →
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Judging Tab */}
        {activeTab === "judging" && selectedHackathon && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Judging: {selectedHackathon.name}
                  </h2>
                  <p className="text-gray-300">
                    {selectedHackathon.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300"
                >
                  ← Back to Dashboard
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Projects to Judge
                  </h3>
                  <p className="text-gray-400">
                    This hackathon doesn't have any registered projects yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
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
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                              </svg>
                              View on GitHub
                            </a>
                          )}
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Project {project.id + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Score (1-10)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            placeholder="Enter score"
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const scoreInput = document.querySelector(`input[placeholder="Enter score"]`) as HTMLInputElement;
                            if (scoreInput && scoreInput.value) {
                              submitScore(project.id, parseInt(scoreInput.value));
                              scoreInput.value = '';
                            }
                          }}
                          disabled={loading}
                          className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300"
                        >
                          {loading ? "Submitting..." : "Submit Score"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
