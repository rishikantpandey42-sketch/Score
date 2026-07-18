import React, { useState } from 'react';
import { CategoryData, CompetitionConfig } from '../types';
import { Trophy, HelpCircle, Shield, Maximize, Minimize, Award, Medal } from 'lucide-react';

interface LeaderboardProps {
  categoryData: CategoryData;
  config: CompetitionConfig;
}

export default function Leaderboard({
  categoryData,
  config
}: LeaderboardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { scores, currentRoundIndex, rounds, questions, currentQuestionIndex } = categoryData;

  const currentRoundName = rounds[currentRoundIndex] || 'General';

  // 1. Calculate Rankings
  const teams = (Object.keys(scores) as Array<'red' | 'blue' | 'green' | 'yellow'>).map(id => ({
    id,
    name: config.houseNames[id],
    color: config.houseColors[id],
    score: scores[id]
  }));

  // Sort by score descending
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const leaderScore = sortedTeams[0]?.score || 0;

  // Assign ranks with tie handling
  let currentRank = 1;
  const rankedTeams = sortedTeams.map((team, idx) => {
    if (idx > 0 && team.score < sortedTeams[idx - 1].score) {
      currentRank = idx + 1;
    }
    return {
      ...team,
      rank: currentRank,
      isLeader: team.score === leaderScore && leaderScore > 0,
      leaderDifference: leaderScore - team.score
    };
  });

  // Re-map ranked teams back to original IDs so we can render them in standard layout or sort layout
  const teamDetailsMap = rankedTeams.reduce((acc, t) => {
    acc[t.id as 'red' | 'blue' | 'green' | 'yellow'] = t;
    return acc;
  }, {} as Record<'red' | 'blue' | 'green' | 'yellow', typeof rankedTeams[0]>);

  // Active Question for the current round
  const roundQuestions = questions.filter(q => q.round === currentRoundName);
  const activeQuestion = roundQuestions[currentQuestionIndex];

  // Request/exit simulated fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getRankBadge = (rank: number) => {
    switch(rank) {
      case 1:
        return (
          <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            🥇 1st Place
          </span>
        );
      case 2:
        return (
          <span className="flex items-center gap-1 bg-slate-400/15 text-slate-500 border border-slate-400/25 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            🥈 2nd Place
          </span>
        );
      case 3:
        return (
          <span className="flex items-center gap-1 bg-amber-700/10 text-amber-700 border border-amber-700/25 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            🥉 3rd Place
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold">
            {rank}th Position
          </span>
        );
    }
  };

  return (
    <div 
      className={`bg-slate-900 text-white flex flex-col justify-between overflow-hidden transition-all duration-300 font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 p-8 md:p-12 h-screen' : 'rounded-2xl p-6 min-h-[580px] border border-slate-800'
      }`}
      id="leaderboard-fullscreen-node"
    >
      
      {/* Fullscreen Toolbar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5" id="leaderboard-header">
        <div className="flex items-center gap-4">
          {/* Logo / Badge */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl hidden sm:flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase font-sans">
              {config.competitionName}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] md:text-xs font-semibold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-slate-300 uppercase tracking-wider">
                {config.schoolName}
              </span>
              <span className="text-[10px] md:text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {categoryData.name} ({categoryData.classes})
              </span>
            </div>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Current active round</p>
            <p className="text-sm font-bold text-white uppercase">Round {currentRoundIndex + 1}: {currentRoundName}</p>
          </div>
          <button
            id="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content: Split layout with Live Highlights and Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 flex-1 items-stretch" id="leaderboard-main-grid">
        
        {/* Live Round Info and Ticker (Left Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6" id="projector-question-panel">
          
          {/* Active Question Box */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)]"></div>
            
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-4">
                <HelpCircle className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Now Scoring
                </span>
              </div>
              
              <h2 className="text-4xl font-black tracking-tight text-white font-sans mt-2">
                Question #{currentQuestionIndex + 1}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Round {currentRoundIndex + 1}: <strong className="text-amber-300 font-sans">{currentRoundName}</strong>
              </p>

              {activeQuestion?.status && activeQuestion.status !== 'unanswered' && (
                <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1.5 font-mono">Status</span>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${
                      activeQuestion.status === 'correct' ? 'bg-emerald-500' :
                      activeQuestion.status === 'wrong' ? 'bg-red-500' :
                      activeQuestion.status === 'passed' ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`} />
                    <span className="text-sm font-black capitalize text-slate-200">
                      {activeQuestion.status} {activeQuestion.scoredTeam ? `by ${config.houseNames[activeQuestion.scoredTeam]}` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 mt-6 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>ROUND {currentRoundIndex + 1}</span>
              <span>TMPS SCORE ENGINE</span>
            </div>
          </div>

          {/* Scrolling Score History Logs / Highlights */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col justify-between h-[180px]">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 font-mono">
                Live Log Highlights
              </h4>
              <div className="space-y-2 max-h-[110px] overflow-hidden" id="projector-ticker">
                {categoryData.history.filter(h => h.action !== 'setup').slice(-3).reverse().map((log, idx) => {
                  const teamColor = log.teamId !== 'system' ? config.houseColors[log.teamId] : '#94a3b8';
                  return (
                    <div key={log.id} className="text-xs flex items-center gap-2 text-slate-300 animate-fade-in">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                      <span className="truncate">{log.description}</span>
                    </div>
                  );
                })}
                {categoryData.history.filter(h => h.action !== 'setup').length === 0 && (
                  <p className="text-slate-500 text-xs italic">Awaiting first live points score...</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Live Rankings list (Right Columns) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4" id="projector-ranking-panel">
          {rankedTeams.map((team, idx) => {
            return (
              <div 
                key={team.id}
                className={`relative p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-6 overflow-hidden ${
                  team.isLeader 
                    ? 'bg-white/5 border-amber-500/30 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/25 scale-[1.01]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
                id={`ranking-projector-row-${team.id}`}
              >
                {/* Visual accent color pill on left */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all" 
                  style={{ backgroundColor: team.color }}
                ></div>

                <div className="flex items-center gap-4 pl-2">
                  {/* Position Badge */}
                  <div className="shrink-0 flex items-center justify-center">
                    {getRankBadge(team.rank)}
                  </div>
                  
                  {/* Name details */}
                  <div>
                    <h3 className="text-base md:text-xl font-bold tracking-tight text-white">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {team.isLeader && (
                        <span className="text-[8px] md:text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          🏆 Leader
                        </span>
                      )}
                      
                      {team.leaderDifference > 0 && (
                        <span className="text-[8px] md:text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full font-mono">
                          Trailing by: -{team.leaderDifference} pts
                        </span>
                      )}
                      
                      {team.isLeader && leaderScore > 0 && (
                        <span className="text-[8px] md:text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full font-mono">
                          Pacesetter
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex flex-col items-end shrink-0">
                  <span className="text-2xl md:text-4xl font-black tracking-tight font-mono text-white">
                    {team.score}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold font-mono mt-0.5">points</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Projector footer */}
      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4" id="leaderboard-footer">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>TMPS Quiz System — Real-time Projector Stream</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Category: <strong className="text-slate-300">{categoryData.name}</strong></span>
          <span>Round: <strong className="text-slate-300">{currentRoundName}</strong></span>
        </div>
      </div>

    </div>
  );
}
