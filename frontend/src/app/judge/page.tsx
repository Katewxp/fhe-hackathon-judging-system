"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { contractService, Hackathon, Project, Judge } from "@/lib/contractService";
import { useToast } from "@/components/Toast";
import { ethers } from "ethers";

export default function JudgePage() {
  const { account } = useWallet();
  const { showToast } = useToast();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scores, setScores] = useState<{[projectId: number]: number}>({});
  const [submittingAll, setSubmittingAll] = useState(false);
  const [isJudgeRegistered, setIsJudgeRegistered] = useState<{[hackathonId: number]: boolean}>({});

  useEffect(() => {
    if (account) {
      loadJudgeData();
    }
  }, [account]);

  // Set signer when account changes
  useEffect(() => {
    if (account && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      provider.getSigner().then(signer => {
        contractService.setSigner(signer);
      }).catch(error => {
        console.error("Failed to set signer:", error);
      });
    }
  }, [account]);

  const loadJudgeData = async () => {
    try {
      setLoading(true);
      const hackathonsData = await contractService.getHackathons();
      setHackathons(hackathonsData);
      console.log("Loaded hackathons for judge:", hackathonsData);
      
      // Check if current user is registered as judge for each hackathon
      if (account) {
        const judgeStatus: {[hackathonId: number]: boolean} = {};
        for (const hackathon of hackathonsData) {
          try {
            const judgeData = await contractService.getJudge(hackathon.id, account);
            judgeStatus[hackathon.id] = judgeData.isRegistered;
          } catch (error) {
            console.error(`Failed to check judge status for hackathon ${hackathon.id}:`, error);
            judgeStatus[hackathon.id] = false;
          }
        }
        setIsJudgeRegistered(judgeStatus);
      }
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
      console.log("Attempting to submit score:", { hackathonId: selectedHackathon.id, projectId, score });
      
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
    } catch (error: any) {
      console.error("Failed to submit score:", error);
      
      let errorMessage = "An error occurred while submitting the score.";
      
      if (error.message?.includes("No signer available")) {
        errorMessage = "Wallet not connected. Please connect your wallet first.";
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = "Contract interaction failed. The contract may not be deployed or the function may fail.";
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = "Insufficient funds for transaction.";
      } else if (error.code === 'USER_REJECTED') {
        errorMessage = "Transaction was rejected by user.";
      }
      
      showToast({
        type: "error",
        title: "Submission Error",
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const submitAllScores = async () => {
    if (!selectedHackathon) return;
    
    const projectIds = Object.keys(scores).map(Number);
    if (projectIds.length === 0) {
      showToast({
        type: "warning",
        title: "No Scores to Submit",
        message: "Please enter scores for at least one project before submitting.",
        duration: 5000
      });
      return;
    }
    
    try {
      setSubmittingAll(true);
      let successCount = 0;
      let failCount = 0;
      
      showToast({
        type: "info",
        title: "Submitting Scores",
        message: `Submitting ${projectIds.length} scores...`,
        duration: 3000
      });
      
      for (const projectId of projectIds) {
        try {
          const success = await contractService.submitScore(selectedHackathon.id, projectId, scores[projectId]);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
          // Add small delay between submissions
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to submit score for project ${projectId}:`, error);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        showToast({
          type: "success",
          title: "Batch Submission Complete",
          message: `Successfully submitted ${successCount} scores${failCount > 0 ? `, ${failCount} failed` : ''}`,
          duration: 8000
        });
        // Clear scores and reload projects
        setScores({});
        loadHackathonProjects(selectedHackathon.id);
      } else {
        showToast({
          type: "error",
          title: "All Submissions Failed",
          message: "Failed to submit any scores. Please try again.",
          duration: 8000
        });
      }
    } catch (error) {
      console.error("Failed to submit all scores:", error);
      showToast({
        type: "error",
        title: "Batch Submission Error",
        message: "An error occurred while submitting scores. Please try again.",
        duration: 8000
      });
    } finally {
      setSubmittingAll(false);
    }
  };

  const updateScore = (projectId: number, score: number) => {
    setScores(prev => ({
      ...prev,
      [projectId]: score
    }));
  };

  const registerAsJudge = async (hackathonId: number) => {
    if (!account) return;
    
    try {
      setLoading(true);
      const success = await contractService.registerJudge(hackathonId, account);
      
      if (success) {
        showToast({
          type: "success",
          title: "Judge Registration Successful!",
          message: "You have been successfully registered as a judge for this hackathon.",
          duration: 5000
        });
        
        // Update judge status
        setIsJudgeRegistered(prev => ({
          ...prev,
          [hackathonId]: true
        }));
        
        // Reload data
        await loadJudgeData();
      } else {
        showToast({
          type: "error",
          title: "Registration Failed",
          message: "Failed to register as judge. Please try again.",
          duration: 5000
        });
      }
    } catch (error: any) {
      console.error("Failed to register as judge:", error);
      
      let errorMessage = "An error occurred while registering as judge.";
      
      if (error.message?.includes("Already registered")) {
        errorMessage = "You are already registered as a judge for this hackathon.";
      } else if (error.message?.includes("Hackathon not found")) {
        errorMessage = "Hackathon not found. Please try again.";
      } else if (error.message?.includes("Hackathon not active")) {
        errorMessage = "This hackathon is not currently active.";
      }
      
      showToast({
        type: "error",
        title: "Registration Error",
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Wallet Connection Required
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Please connect your wallet to access the judge dashboard.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading judge data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("judging")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === "judging"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg"
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
                <p className="text-3xl font-bold text-yellow-400">
                  {hackathons.filter(h => h.isActive).length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Total Projects
                </h3>
                <p className="text-3xl font-bold text-orange-400">
                  {hackathons.reduce((sum, h) => sum + h.projectCount, 0)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Judging Status
                </h3>
                <p className="text-3xl font-bold text-amber-400">
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
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    >
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {hackathon.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {hackathon.description}
                      </p>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Projects:</span>
                          <span className="text-white">{hackathon.projectCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Judges:</span>
                          <span className="text-white">{hackathon.judgeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Your Status:</span>
                          <span className={`font-medium ${
                            isJudgeRegistered[hackathon.id] 
                              ? "text-green-400" 
                              : "text-red-400"
                          }`}>
                            {isJudgeRegistered[hackathon.id] ? "Registered" : "Not Registered"}
                          </span>
                        </div>
                      </div>
                      
                      {isJudgeRegistered[hackathon.id] ? (
                        <button
                          onClick={() => handleHackathonSelect(hackathon)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                        >
                          Start Judging →
                        </button>
                      ) : (
                        <button
                          onClick={() => registerAsJudge(hackathon.id)}
                          disabled={loading}
                          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300"
                        >
                          {loading ? "Registering..." : "Register as Judge"}
                        </button>
                      )}
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
                          <div className="flex flex-wrap gap-3 mb-3">
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
                                GitHub
                              </a>
                            )}
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-green-400 hover:text-green-300 text-sm"
                              >
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Demo
                              </a>
                            )}
                          </div>
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
                            placeholder="Enter score (1-10)"
                            value={scores[project.id] || ''}
                            onChange={(e) => updateScore(project.id, parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (scores[project.id]) {
                              submitScore(project.id, scores[project.id]);
                            }
                          }}
                          disabled={loading || !scores[project.id]}
                          className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-300"
                        >
                          {loading ? "Submitting..." : "Submit Score"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Batch Submit Button */}
              {projects.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={submitAllScores}
                    disabled={submittingAll || Object.keys(scores).length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all duration-300 flex items-center gap-2"
                  >
                    {submittingAll ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting All...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Submit All Scores ({Object.keys(scores).length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
