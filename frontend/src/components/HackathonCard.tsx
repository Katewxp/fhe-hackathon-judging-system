"use client";

import { useState } from "react";
import Link from "next/link";

interface HackathonCardProps {
  id: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  projectCount: number;
  judgeCount: number;
  scoresAggregated: boolean;
  rankingsPublished: boolean;
}

export default function HackathonCard({
  id,
  name,
  description,
  startTime,
  endTime,
  isActive,
  projectCount,
  judgeCount,
  scoresAggregated,
  rankingsPublished,
}: HackathonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = () => {
    if (rankingsPublished) return "from-green-500 to-emerald-500";
    if (scoresAggregated) return "from-yellow-500 to-orange-500";
    if (isActive) return "from-blue-500 to-cyan-500";
    return "from-gray-500 to-slate-500";
  };

  const getStatusText = () => {
    if (rankingsPublished) return "Results Published";
    if (scoresAggregated) return "Scores Aggregated";
    if (isActive) return "Active";
    return "Ended";
  };

  return (
    <div
      className={`relative group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 transition-all duration-500 transform hover:scale-105 hover:bg-white/20 ${
        isHovered ? "shadow-2xl" : "shadow-lg"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-r ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
            {name}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{formatDate(startTime)} - {formatDate(endTime)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-cyan-400">{projectCount}</div>
            <div className="text-xs text-gray-400">Projects</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-purple-400">{judgeCount}</div>
            <div className="text-xs text-gray-400">Judges</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>
              {rankingsPublished ? "100%" : scoresAggregated ? "75%" : isActive ? "50%" : "25%"}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor()} transition-all duration-500`}
              style={{
                width: rankingsPublished ? "100%" : scoresAggregated ? "75%" : isActive ? "50%" : "25%"
              }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link
            href={`/hackathons/${id}`}
            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            {rankingsPublished ? "View Results" : scoresAggregated ? "View Scores" : "View Details"}
          </Link>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}
