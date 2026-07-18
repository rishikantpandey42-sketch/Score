import React from 'react';
import { CategoryData, CompetitionConfig } from '../types';
import { DEFAULT_ROUNDS } from '../data';
import { 
  Trophy, Award, TrendingUp, Download, Printer, Table, FileSpreadsheet, Sparkles 
} from 'lucide-react';

interface ReportsPanelProps {
  categoryData: CategoryData;
  config: CompetitionConfig;
}

export default function ReportsPanel({
  categoryData,
  config
}: ReportsPanelProps) {
  const { scores, history } = categoryData;

  // 1. Calculate Rankings
  const teamsArray = (Object.keys(scores) as Array<'red' | 'blue' | 'green' | 'yellow'>).map(id => ({
    id,
    name: config.houseNames[id],
    color: config.houseColors[id],
    score: scores[id]
  }));

  // Sort by score descending
  const sortedTeams = [...teamsArray].sort((a, b) => b.score - a.score);

  // Assign ranks (with tie-handling)
  let currentRank = 1;
  const rankedTeams = sortedTeams.map((team, idx) => {
    if (idx > 0 && team.score < sortedTeams[idx - 1].score) {
      currentRank = idx + 1;
    }
    return {
      ...team,
      rank: currentRank
    };
  });

  const winner = rankedTeams[0];
  const runnerUp = rankedTeams[1];

  // 2. Generate Round-by-Round Breakout Matrix
  // For each team, track their score in each round
  const roundBreakout: Record<'red' | 'blue' | 'green' | 'yellow', Record<string, number>> = {
    red: {},
    blue: {},
    green: {},
    yellow: {}
  };

  // Initialize round scores to 0
  DEFAULT_ROUNDS.forEach(r => {
    roundBreakout.red[r] = 0;
    roundBreakout.blue[r] = 0;
    roundBreakout.green[r] = 0;
    roundBreakout.yellow[r] = 0;
  });

  // Calculate scores per round from history logs
  history.forEach(item => {
    if (item.teamId !== 'system' && roundBreakout[item.teamId as 'red' | 'blue' | 'green' | 'yellow']) {
      const currentVal = roundBreakout[item.teamId as 'red' | 'blue' | 'green' | 'yellow'][item.round] || 0;
      roundBreakout[item.teamId as 'red' | 'blue' | 'green' | 'yellow'][item.round] = currentVal + item.points;
    }
  });

  // 3. Export to CSV Utility
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `TMPS QUIZ SCORE REPORT - ${config.competitionName}\n`;
    csvContent += `Category: ${categoryData.name} (${categoryData.classes})\n\n`;
    
    // Summary
    csvContent += "Rank,House Name,Final Score\n";
    rankedTeams.forEach(team => {
      csvContent += `${team.rank},"${team.name}",${team.score}\n`;
    });
    
    csvContent += "\n\nROUND BREAKOUT PERFORMANCE\n";
    csvContent += "Round Name," + rankedTeams.map(t => t.name).join(",") + "\n";
    
    DEFAULT_ROUNDS.forEach(r => {
      csvContent += `"${r}",` + rankedTeams.map(t => roundBreakout[t.id as 'red' | 'blue' | 'green' | 'yellow'][r] || 0).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TMPS_Quiz_Report_${categoryData.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Trigger Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="reports-panel-wrapper">
      
      {/* Grid: Winner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="reports-winners-cards">
        
        {/* FIRST PLACE CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border border-amber-200/60 p-6 rounded-2xl flex flex-col justify-between" id="card-winner-1">
          <div className="absolute top-4 right-4 bg-amber-500 text-white p-2 rounded-full shadow-md shadow-amber-500/20">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-600 bg-amber-100/50 px-2.5 py-1 rounded-full font-bold">
              Winner (1st Place)
            </span>
            <h3 className="text-xl font-black text-slate-800 mt-4 leading-snug">
              {winner?.score > 0 ? winner.name : 'TBD'}
            </h3>
            <p className="text-slate-500 text-xs mt-1">Outstanding overall competition run</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{winner?.score || 0}</span>
            <span className="text-slate-400 text-xs font-semibold">cumulative points</span>
          </div>
        </div>

        {/* SECOND PLACE CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-400/10 via-white to-slate-400/5 border border-slate-200/60 p-6 rounded-2xl flex flex-col justify-between" id="card-winner-2">
          <div className="absolute top-4 right-4 bg-slate-400 text-white p-2 rounded-full shadow-md shadow-slate-400/10">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-bold">
              Runner-up (2nd Place)
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-4 leading-snug">
              {runnerUp?.score > 0 ? runnerUp.name : 'TBD'}
            </h3>
            <p className="text-slate-500 text-xs mt-1">Splendid competitive execution</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{runnerUp?.score || 0}</span>
            <span className="text-slate-400 text-xs font-semibold">cumulative points</span>
          </div>
        </div>

        {/* STATS OVERVIEW CARD */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col justify-between" id="card-reports-overview">
          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Competition Stats</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Rounds Played</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {categoryData.currentRoundIndex + 1} / {DEFAULT_ROUNDS.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Actions Logged</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {history.filter(h => h.action !== 'setup').length} logs
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              id="report-print-btn"
              onClick={handlePrint}
              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report
            </button>
            <button
              id="report-csv-btn"
              onClick={handleExportCSV}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Export to Excel CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Breakout Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden" id="reports-breakout-table-card">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-700">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Round-by-Round Breakdown</h3>
              <p className="text-slate-400 text-[11px]">Cumulative points acquired inside individual rounds</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-sans uppercase">
            Score matrix
          </span>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto" id="breakout-table-wrapper">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3 pl-4 font-semibold">House / Team Name</th>
                {DEFAULT_ROUNDS.map(r => (
                  <th key={r} className="pb-3 text-right font-semibold">{r}</th>
                ))}
                <th className="pb-3 text-right pr-4 font-bold text-slate-700">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rankedTeams.map(team => (
                <tr key={team.id} className="hover:bg-slate-50/40 transition-colors" id={`breakout-row-${team.id}`}>
                  {/* Name */}
                  <td className="py-4 pl-4 font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: team.color }}></span>
                    {team.name}
                  </td>
                  
                  {/* Rounds Breakouts */}
                  {DEFAULT_ROUNDS.map(r => {
                    const roundScore = roundBreakout[team.id as 'red' | 'blue' | 'green' | 'yellow'][r] || 0;
                    return (
                      <td key={r} className="py-4 text-right font-mono text-slate-500">
                        {roundScore > 0 ? `+${roundScore}` : roundScore < 0 ? roundScore : '0'}
                      </td>
                    );
                  })}

                  {/* Cumulative Total */}
                  <td className="py-4 text-right pr-4 font-black text-sm text-slate-900 font-mono">
                    {team.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
