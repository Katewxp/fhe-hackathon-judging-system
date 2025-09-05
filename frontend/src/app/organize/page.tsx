"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/components/Toast";
import { ethers } from "ethers";
import { contractService, Hackathon, Project, Judge } from "@/lib/contractService";

export default function OrganizePage() {
  const { account } = useWallet();
  const { showToast } = useToast();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create hackathon form state
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    maxProjects: "",
    maxJudges: ""
  });

  // Add judge form state
  const [judgeAddresses, setJudgeAddresses] = useState("");
  
  // Add project form state
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    githubUrl: "",
    demoUrl: ""
  });

  useEffect(() => {
    if (account) {
      loadOrganizerData();
    }
  }, [account]);

  // Set signer when account changes
  useEffect(() => {
    if (account && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      provider.getSigner().then(signer => {
        contractService.setSigner(signer);
      });
    }
  }, [account]);

  const loadOrganizerData = async () => {
    try {
      setLoading(true);
      const hackathonsData = await contractService.getHackathons();
      setHackathons(hackathonsData);
    } catch (error) {
      console.error("Failed to load organizer data:", error);
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

  const loadHackathonDetails = async (hackathonId: number) => {
    try {
      const [projectsData, judgesData] = await Promise.all([
        contractService.getProjects(hackathonId),
        contractService.getJudges(hackathonId)
      ]);
      setProjects(projectsData);
      setJudges(judgesData);
    } catch (error) {
      console.error("Failed to load hackathon details:", error);
      showToast({
        type: "error",
        title: "Failed to Load Details",
        message: "Unable to load hackathon details. Please try again.",
        duration: 5000
      });
    }
  };

  const createHackathon = async () => {
    try {
      setLoading(true);
      
      // Validate form
      if (!createForm.name || !createForm.description || !createForm.startTime || !createForm.endTime) {
        showToast({
          type: "warning",
          title: "Missing Information",
          message: "Please fill in all required fields to create a hackathon.",
          duration: 5000
        });
        return;
      }

      const startDate = new Date(createForm.startTime);
      const endDate = new Date(createForm.endTime);

      if (startDate >= endDate) {
        showToast({
          type: "warning",
          title: "Invalid Date Range",
          message: "End time must be after start time.",
          duration: 5000
        });
        return;
      }

      const success = await contractService.createHackathon(
        createForm.name,
        createForm.description,
        startDate,
        endDate
      );

      if (success) {
        showToast({
          type: "success",
          title: "Hackathon Created! 🎉",
          message: `${createForm.name} has been successfully created and is now live on the blockchain.`,
          duration: 8000
        });
        
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          description: "",
          startTime: "",
          endTime: "",
          maxProjects: "",
          maxJudges: ""
        });
        
        // Reload data immediately
        await loadOrganizerData();
      } else {
        showToast({
          type: "error",
          title: "Creation Failed",
          message: "Failed to create hackathon. Please check your wallet and try again.",
          duration: 8000
        });
      }
    } catch (error) {
      console.error("Failed to create hackathon:", error);
      showToast({
        type: "error",
        title: "Creation Error",
        message: "An unexpected error occurred while creating the hackathon. Please try again.",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const addJudges = async () => {
    if (!judgeAddresses || !selectedHackathon) return;

    // Parse addresses from textarea (one per line)
    const addressLines = judgeAddresses.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (addressLines.length === 0) {
      showToast({
        type: "error",
        title: "No Addresses",
        message: "Please enter at least one judge address.",
        duration: 5000
      });
      return;
    }

    // Validate all addresses
    const invalidAddresses = addressLines.filter(address => 
      !address.startsWith('0x') || address.length !== 42
    );

    if (invalidAddresses.length > 0) {
      showToast({
        type: "error",
        title: "Invalid Addresses",
        message: `Invalid address format: ${invalidAddresses[0]}. Please ensure all addresses start with 0x and are 42 characters long.`,
        duration: 6000
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Registering judges:", { hackathonId: selectedHackathon.id, addresses: addressLines });
      
      let successCount = 0;
      let failedAddresses = [];

      // Register each judge sequentially
      for (const address of addressLines) {
        try {
          const success = await contractService.registerJudge(selectedHackathon.id, address);
          if (success) {
            successCount++;
            console.log(`Successfully registered judge: ${address}`);
          } else {
            failedAddresses.push(address);
            console.error(`Failed to register judge: ${address}`);
          }
        } catch (error) {
          failedAddresses.push(address);
          console.error(`Error registering judge ${address}:`, error);
        }
      }
      
      // Show results
      if (successCount === addressLines.length) {
        showToast({
          type: "success",
          title: "All Judges Added Successfully! 👨‍⚖️",
          message: `Successfully registered ${successCount} judge(s) for ${selectedHackathon.name}.`,
          duration: 6000
        });
      } else if (successCount > 0) {
        showToast({
          type: "warning",
          title: "Partial Success",
          message: `Registered ${successCount} of ${addressLines.length} judges. ${failedAddresses.length} failed.`,
          duration: 6000
        });
      } else {
        showToast({
          type: "error",
          title: "Failed to Add Judges",
          message: "Unable to register any judges. Please check the addresses and try again.",
          duration: 6000
        });
      }
      
      setJudgeAddresses("");
      
      // Reload data
      await loadHackathonDetails(selectedHackathon.id);
      await loadOrganizerData(); // Also refresh the main list
    } catch (error: any) {
      console.error("Failed to add judges:", error);
      
      let errorMessage = "An error occurred while registering the judges. Please try again.";
      
      if (error.message?.includes("ENS name")) {
        errorMessage = "Invalid address format. Please enter valid Ethereum addresses.";
      } else if (error.message?.includes("No signer available")) {
        errorMessage = "Wallet not connected. Please connect your wallet first.";
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = "Contract interaction failed. The contract may not be deployed or some judges may already be registered.";
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = "Insufficient funds for transaction.";
      } else if (error.code === 'USER_REJECTED') {
        errorMessage = "Transaction was rejected by user.";
      }
      
      showToast({
        type: "error",
        title: "Judge Registration Error",
        message: errorMessage,
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const addProject = async () => {
    if (!selectedHackathon || !projectForm.name.trim() || !projectForm.description.trim()) return;

    try {
      setLoading(true);
      console.log("Registering project:", { hackathonId: selectedHackathon.id, projectForm });
      
      const success = await contractService.registerProject(
        selectedHackathon.id,
        projectForm.name.trim(),
        projectForm.description.trim(),
        projectForm.githubUrl.trim(),
        projectForm.demoUrl.trim()
      );
      
      if (success) {
        showToast({
          type: "success",
          title: "Project Added Successfully! 🚀",
          message: `Project "${projectForm.name}" has been registered for ${selectedHackathon.name}.`,
          duration: 6000
        });
        
        // Reset form
        setProjectForm({
          name: "",
          description: "",
          githubUrl: "",
          demoUrl: ""
        });
        
        // Reload data
        await loadHackathonDetails(selectedHackathon.id);
        await loadOrganizerData(); // Also refresh the main list
      } else {
        showToast({
          type: "error",
          title: "Failed to Add Project",
          message: "Unable to register the project. Please try again.",
          duration: 6000
        });
      }
    } catch (error: any) {
      console.error("Failed to add project:", error);
      
      let errorMessage = "An error occurred while registering the project. Please try again.";
      
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
        title: "Project Registration Error",
        message: errorMessage,
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const aggregateScores = async () => {
    if (!selectedHackathon) return;

    try {
      setLoading(true);
      
      // Aggregate scores for all projects
      const success = await contractService.aggregateScores(selectedHackathon.id, 0);
      
      if (success) {
        showToast({
          type: "success",
          title: "Scores Aggregated! 📊",
          message: `All scores for ${selectedHackathon.name} have been successfully aggregated using FHE.`,
          duration: 8000
        });
        
        // Reload data
        await loadOrganizerData();
        if (selectedHackathon) {
          await loadHackathonDetails(selectedHackathon.id);
        }
      } else {
        showToast({
          type: "error",
          title: "Aggregation Failed",
          message: "Failed to aggregate scores. Please ensure all judges have submitted their scores.",
          duration: 8000
        });
      }
    } catch (error) {
      console.error("Failed to aggregate scores:", error);
      showToast({
        type: "error",
        title: "Aggregation Error",
        message: "An error occurred while aggregating scores. Please try again.",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const publishRankings = async () => {
    if (!selectedHackathon) return;

    try {
      setLoading(true);
      
      // Create ranking array (for demo, just use project IDs in order)
      const projectIds = Array.from({ length: selectedHackathon.totalProjects }, (_, i) => i);
      
      const success = await contractService.publishRankings(selectedHackathon.id, projectIds);
      
      if (success) {
        showToast({
          type: "success",
          title: "Rankings Published! 🏆",
          message: `Final rankings for ${selectedHackathon.name} are now live and visible to the public.`,
          duration: 10000
        });
        
        // Reload data
        await loadOrganizerData();
        if (selectedHackathon) {
          await loadHackathonDetails(selectedHackathon.id);
        }
      } else {
        showToast({
          type: "error",
          title: "Publication Failed",
          message: "Failed to publish rankings. Please ensure scores are aggregated first.",
          duration: 8000
        });
      }
    } catch (error) {
      console.error("Failed to publish rankings:", error);
      showToast({
        type: "error",
        title: "Publication Error",
        message: "An error occurred while publishing rankings. Please try again.",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (days: number) => {
    const date = new Date(days * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleHackathonSelect = async (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    await loadHackathonDetails(hackathon.id);
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold text-white mb-4">Wallet Required</h1>
          <p className="text-gray-300 mb-8">Please connect your wallet to access the organizer dashboard.</p>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <p className="text-sm text-gray-400">
              As an organizer, you'll be able to:
            </p>
            <ul className="text-sm text-gray-300 mt-2 space-y-1">
              <li>• Create and manage hackathons</li>
              <li>• Register projects and judges</li>
              <li>• Monitor judging progress</li>
              <li>• Publish final results</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Organize
            </span>{" "}
            Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Create and manage hackathons, oversee projects and judges, 
            and ensure smooth execution of your innovation competitions.
          </p>
          
          {/* Organizer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{hackathons.length}</div>
              <div className="text-gray-400">Hackathons</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {hackathons.reduce((sum, h) => sum + h.projectCount, 0)}
              </div>
              <div className="text-gray-400">Total Projects</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {hackathons.reduce((sum, h) => sum + h.judgeCount, 0)}
              </div>
              <div className="text-gray-400">Total Judges</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {hackathons.filter(h => h.rankingsPublished).length}
              </div>
              <div className="text-gray-400">Completed</div>
            </div>
          </div>

          {/* Create Hackathon Button */}
          <div className="mt-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-500/25"
            >
              Create New Hackathon
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center mb-8">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "hackathons", label: "Hackathons" },
              { id: "projects", label: "Projects" },
              { id: "judges", label: "Judges" },
              { id: "results", label: "Results" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 mx-2 mb-2 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white mb-6">Overview</h3>
                
                {hackathons.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚀</div>
                    <h4 className="text-xl text-white mb-2">No Hackathons Yet</h4>
                    <p className="text-gray-300 mb-8">Create your first hackathon to get started!</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                    >
                      Create Hackathon
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contractService.sortHackathons(hackathons).map((hackathon) => (
                      <div
                        key={hackathon.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                        onClick={() => handleHackathonSelect(hackathon)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-semibold text-white">{hackathon.name}</h4>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            hackathon.rankingsPublished 
                              ? "bg-green-500/20 text-green-400" 
                              : hackathon.scoresAggregated 
                              ? "bg-yellow-500/20 text-yellow-400"
                              : hackathon.isActive
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}>
                            {hackathon.rankingsPublished ? "Completed" : 
                             hackathon.scoresAggregated ? "Judging" : 
                             hackathon.isActive ? "Active" : "Ended"}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{hackathon.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Projects:</span>
                            <span className="text-white ml-2">{hackathon.projectCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Judges:</span>
                            <span className="text-white ml-2">{hackathon.judgeCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Start:</span>
                            <span className="text-white ml-2">{formatDate(hackathon.startDay)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">End:</span>
                            <span className="text-white ml-2">{formatDate(hackathon.endDay)}</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {!hackathon.scoresAggregated && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHackathonSelect(hackathon);
                                setActiveTab("projects");
                              }}
                              className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                            >
                              Manage Hackathon
                            </button>
                          )}
                          {hackathon.scoresAggregated && !hackathon.rankingsPublished && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                publishRankings();
                              }}
                              className="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                            >
                              Publish Results
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "hackathons" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Manage Hackathons</h3>
                
                {hackathons.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚀</div>
                    <h4 className="text-xl text-white mb-2">No Hackathons Yet</h4>
                    <p className="text-gray-300 mb-8">Create your first hackathon to get started!</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                    >
                      Create Hackathon
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hackathons.map((hackathon) => (
                      <div key={hackathon.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-semibold text-white">{hackathon.name}</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                handleHackathonSelect(hackathon);
                                setActiveTab("projects");
                              }}
                              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                            >
                              Manage Projects
                            </button>
                            <button
                              onClick={() => {
                                handleHackathonSelect(hackathon);
                                setActiveTab("judges");
                              }}
                              className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                            >
                              Manage Judges
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4">{hackathon.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <span className="text-white ml-2">
                              {hackathon.rankingsPublished ? "Completed" : 
                               hackathon.scoresAggregated ? "Judging" : 
                               hackathon.isActive ? "Active" : "Ended"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Projects:</span>
                            <span className="text-white ml-2">{hackathon.projectCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Judges:</span>
                            <span className="text-white ml-2">{hackathon.judgeCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">End Date:</span>
                            <span className="text-white ml-2">{formatDate(hackathon.endDay)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Project Management</h3>
                
                {!selectedHackathon ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h4 className="text-xl text-white mb-2">Select a Hackathon</h4>
                    <p className="text-gray-300">Choose a hackathon to manage its projects.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h4 className="text-xl font-semibold text-white mb-2">{selectedHackathon.name}</h4>
                      <p className="text-gray-300 text-sm mb-4">{selectedHackathon.description}</p>
                      
                      {/* Add Project Form */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Project Name *
                            </label>
                            <input
                              type="text"
                              placeholder="Enter project name"
                              value={projectForm.name}
                              onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              GitHub URL
                            </label>
                            <input
                              type="url"
                              placeholder="https://github.com/username/repo"
                              value={projectForm.githubUrl}
                              onChange={(e) => setProjectForm({...projectForm, githubUrl: e.target.value})}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Project Description *
                          </label>
                          <textarea
                            placeholder="Describe your project, its features, and technologies used..."
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-vertical"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Demo URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://your-demo-site.com"
                            value={projectForm.demoUrl}
                            onChange={(e) => setProjectForm({...projectForm, demoUrl: e.target.value})}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={addProject}
                            disabled={loading || !projectForm.name.trim() || !projectForm.description.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-black font-medium rounded-lg transition-all duration-300"
                          >
                            {loading ? "Adding..." : "Add Project"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {projects.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-300">No projects registered yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projects.map((project) => (
                          <div key={project.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-lg font-semibold text-white mb-2">{project.name}</h5>
                                <p className="text-gray-300 text-sm mb-3">{project.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                                  >
                                    GitHub
                                  </a>
                                  <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
                                  >
                                    Demo
                                  </a>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-gray-400">Team Lead:</div>
                                <div className="text-white font-mono">{project.teamLead}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "judges" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Judge Management</h3>
                
                {!selectedHackathon ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👨‍⚖️</div>
                    <h4 className="text-xl text-white mb-2">Select a Hackathon</h4>
                    <p className="text-gray-300">Choose a hackathon to manage its judges.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h4 className="text-xl font-semibold text-white mb-2">{selectedHackathon.name}</h4>
                      <p className="text-gray-300 text-sm mb-4">{selectedHackathon.description}</p>
                      
                      {/* Add Judges Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Judge Addresses (one per line)
                          </label>
                          <textarea
                            placeholder="0x1234567890123456789012345678901234567890&#10;0xabcdefabcdefabcdefabcdefabcdefabcdefabcd&#10;0x9876543210987654321098765432109876543210"
                            value={judgeAddresses}
                            onChange={(e) => setJudgeAddresses(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-vertical"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-400">
                            {judgeAddresses.split('\n').filter(line => line.trim().length > 0).length} address(es) entered
                          </div>
                          <button
                            onClick={addJudges}
                            disabled={loading || !judgeAddresses.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-black font-medium rounded-lg transition-all duration-300"
                          >
                            {loading ? "Adding..." : "Add Judges"}
                          </button>
                        </div>
                        {judgeAddresses && (
                          <div className="text-sm">
                            {judgeAddresses.split('\n').map((line, index) => {
                              const address = line.trim();
                              if (!address) return null;
                              
                              const isValid = address.startsWith('0x') && address.length === 42;
                              return (
                                <div key={index} className={`flex items-center gap-2 ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                                  <span>{isValid ? '✅' : '❌'}</span>
                                  <span className="font-mono text-xs">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {judges.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-300">No judges registered yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {judges.map((judge, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="text-white font-mono">{judge.address}</div>
                                  <div className="text-sm text-gray-400">
                                    Projects scored: {judge.projectsScored}/{selectedHackathon.totalProjects}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-3 py-1 text-xs rounded-full ${
                                judge.hasSubmittedAllScores 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}>
                                {judge.hasSubmittedAllScores ? "Complete" : "In Progress"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "results" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Results Management</h3>
                
                {!selectedHackathon ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h4 className="text-xl text-white mb-2">Select a Hackathon</h4>
                    <p className="text-gray-300">Choose a hackathon to manage its results.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h4 className="text-xl font-semibold text-white mb-2">{selectedHackathon.name}</h4>
                      <p className="text-gray-300 text-sm mb-4">{selectedHackathon.description}</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <div className="text-white font-medium">Judging Progress</div>
                            <div className="text-sm text-gray-400">
                              {judges.filter(j => j.hasSubmittedAllScores).length} of {judges.length} judges completed
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-400">
                              {judges.length > 0 ? Math.round((judges.filter(j => j.hasSubmittedAllScores).length / judges.length) * 100) : 0}%
                            </div>
                            <div className="text-sm text-gray-400">Complete</div>
                          </div>
                        </div>

                        {!selectedHackathon.scoresAggregated && judges.every(j => j.hasSubmittedAllScores) && judges.length > 0 && (
                          <button
                            onClick={aggregateScores}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300"
                          >
                            {loading ? "Aggregating..." : "Aggregate Scores"}
                          </button>
                        )}

                        {selectedHackathon.scoresAggregated && !selectedHackathon.rankingsPublished && (
                          <button
                            onClick={publishRankings}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300"
                          >
                            {loading ? "Publishing..." : "Publish Final Rankings"}
                          </button>
                        )}

                        {selectedHackathon.rankingsPublished && (
                          <div className="text-center py-8">
                            <div className="text-6xl mb-4">🎉</div>
                            <h4 className="text-xl text-white mb-2">Results Published!</h4>
                            <p className="text-gray-300">Final rankings are now available to the public.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Hackathon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Hackathon</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hackathon Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter hackathon name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe your hackathon"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={createHackathon}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300"
              >
                {loading ? "Creating..." : "Create Hackathon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
