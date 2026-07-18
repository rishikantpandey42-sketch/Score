import React, { useState } from 'react';
import { CategoryData, CompetitionConfig, Question } from '../types';
import { 
  Plus, Minus, RotateCcw, Award, CheckCircle, HelpCircle, 
  ArrowRight, ArrowLeft, RefreshCw, Trophy, Check, AlertTriangle, HelpCircle as HelpIcon, Flame 
} from 'lucide-react';

interface DashboardProps {
  categoryData: CategoryData;
  config: CompetitionConfig;
  onUpdateScore: (teamId: 'red' | 'blue' | 'green' | 'yellow', points: number, actionType: any, description: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUpdateCurrentRound: (roundIndex: number) => void;
  onResetCurrentRound: () => void;
  onResetCompetition: () => void;
  onUpdateQuestionIndex: (index: number) => void;
  onUpdateQuestionStatus: (questionId: string, status: any, scoredTeam?: any, pointsAwarded?: number) => void;
  onFinishCompetition: () => void;
}

export default function Dashboard({
  categoryData,
  config,
  onUpdateScore,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onUpdateCurrentRound,
  onResetCurrentRound,
  onResetCompetition,
  onUpdateQuestionIndex,
  onUpdateQuestionStatus,
  onFinishCompetition
}: DashboardProps) {
  const { scores, currentRoundIndex, rounds, questions, currentQuestionIndex } = categoryData;
  const currentRoundName = rounds[currentRoundIndex] || 'General';

  // State for manual score adjustment input inside individual house panels
  const [customPoints, setCustomPoints] = useState<Record<string, string>>({
    red: '',
    blue: '',
    green: '',
    yellow: ''
  });

  // State for Admin Per-Question Panel
  const [selectedScoringTeam, setSelectedScoringTeam] = useState<'red' | 'blue' | 'green' | 'yellow' | null>(null);

  // Filter questions for the active round
  const roundQuestions = questions.filter(q => q.round === currentRoundName);
  const activeQuestion = roundQuestions[currentQuestionIndex];

  // Calculate leader and differences
  const teams = (Object.keys(scores) as Array<'red' | 'blue' | 'green' | 'yellow'>).map(id => ({
    id,
    name: config.houseNames[id],
    color: config.houseColors[id],
    score: scores[id]
  }));

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const leaderScore = sortedTeams[0]?.score || 0;

  // Compile team meta rankings
  let currentRank = 1;
  const teamRankMap = sortedTeams.reduce((acc, t, idx) => {
    if (idx > 0 && t.score < sortedTeams[idx - 1].score) {
      currentRank = idx + 1;
    }
    acc[t.id as 'red' | 'blue' | 'green' | 'yellow'] = {
      rank: currentRank,
      isLeader: t.score === leaderScore && leaderScore > 0,
      difference: leaderScore - t.score
    };
    return acc;
  }, {} as Record<'red' | 'blue' | 'green' | 'yellow', { rank: number; isLeader: boolean; difference: number }>);

  // Score handlers for manual actions
  const handleScoreButton = (teamId: 'red' | 'blue' | 'green' | 'yellow', points: number, actionLabel: string) => {
    const teamName = config.houseNames[teamId];
    onUpdateScore(
      teamId, 
      points, 
      points > 0 ? 'correct' : 'wrong', 
      `${actionLabel} points adjusted for ${teamName} inside round ${currentRoundName}`
    );
  };

  const handleCustomPointsSubmit = (teamId: 'red' | 'blue' | 'green' | 'yellow') => {
    const value = customPoints[teamId];
    const points = parseInt(value, 10);
    if (isNaN(points)) return;

    const teamName = config.houseNames[teamId];
    onUpdateScore(
      teamId, 
      points, 
      'manual', 
      `Manual score adjustment of ${points > 0 ? '+' : ''}${points} points applied to ${teamName}`
    );

    setCustomPoints({
      ...customPoints,
      [teamId]: ''
    });
  };

  // Admin Per-Question Scoring Console Handlers
  const handleAdminQuestionScore = (action: 'correct' | 'wrong' | 'passed_1' | 'passed_2' | 'review') => {
    if (!activeQuestion) return;
    if (!selectedScoringTeam) {
      alert("Please select a team/house first that is answering or passing!");
      return;
    }

    const teamId = selectedScoringTeam;
    const teamName = config.houseNames[teamId];
    const questionNumLabel = `Question #${currentQuestionIndex + 1}`;
    const isRapidFire = currentRoundName.toLowerCase().includes('rapid');

    let points = 0;
    let desc = '';
    let nextStatus: Question['status'] = 'unanswered';

    if (action === 'correct') {
      points = isRapidFire ? 200 : 100;
      desc = `Admin scored ${teamName} CORRECT (+${points}) for ${questionNumLabel}`;
      nextStatus = 'correct';
    } else if (action === 'wrong') {
      points = isRapidFire ? -100 : 0;
      desc = `Admin scored ${teamName} INCORRECT (${points > 0 ? '+' : ''}${points}) for ${questionNumLabel}`;
      nextStatus = 'wrong';
    } else if (action === 'passed_1') {
      points = 50;
      desc = `First PASS correct answer by ${teamName} (+50) for ${questionNumLabel}`;
      nextStatus = 'passed';
    } else if (action === 'passed_2') {
      points = 25;
      desc = `Second PASS correct answer by ${teamName} (+25) for ${questionNumLabel}`;
      nextStatus = 'passed';
    } else if (action === 'review') {
      points = 0;
      desc = `${questionNumLabel} marked UNDER REVIEW for administrative validation`;
      nextStatus = 'review';
    }

    // Apply score update
    if (points !== 0) {
      onUpdateScore(teamId, points, nextStatus, desc);
    } else {
      // Log status updates without point changes
      onUpdateScore(teamId, 0, 'review', desc);
    }

    // Update status of the active question slot
    onUpdateQuestionStatus(activeQuestion.id, nextStatus, teamId, points);
  };

  // Skip, next, prev buttons for questions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < roundQuestions.length - 1) {
      onUpdateQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      onUpdateQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Reset the active question slot to unanswered
  const handleResetQuestion = () => {
    if (!activeQuestion) return;
    if (window.confirm("Reset this question slot to unanswered? This does not subtract points already scored. (Please use Undo/Redo or manual adjustments below to align scores).")) {
      onUpdateQuestionStatus(activeQuestion.id, 'unanswered', null, 0);
    }
  };

  // Round Navigation
  const handleNextRound = () => {
    if (currentRoundIndex < rounds.length - 1) {
      if (window.confirm(`Advance to Round ${currentRoundIndex + 2}: ${rounds[currentRoundIndex + 1]}?`)) {
        onUpdateCurrentRound(currentRoundIndex + 1);
        setSelectedScoringTeam(null);
      }
    } else {
      onFinishCompetition();
    }
  };

  const handlePrevRound = () => {
    if (currentRoundIndex > 0) {
      if (window.confirm(`Return to Round ${currentRoundIndex}: ${rounds[currentRoundIndex - 1]}?`)) {
        onUpdateCurrentRound(currentRoundIndex - 1);
        setSelectedScoringTeam(null);
      }
    }
  };

  const getStatusColor = (status: Question['status']) => {
    switch(status) {
      case 'correct': return 'bg-emerald-500 text-white border-emerald-600';
      case 'wrong': return 'bg-red-500 text-white border-red-600';
      case 'passed': return 'bg-blue-500 text-white border-blue-600';
      case 'review': return 'bg-amber-500 text-white border-amber-600';
      default: return 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6" id="dashboard-wrapper">
      
      {/* -------------------- SECTION 1: PER-QUESTION ADMIN SCORING MODULE -------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs" id="admin-question-scoring-section">
        
        {/* Ribbon Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                Live Question Marker
              </h3>
              <p className="text-slate-400 text-[11px]">Select a question number slot to record official live scores</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl" id="question-navigator-buttons">
            <button
              id="prev-question-btn"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-35 text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer"
              title="Previous Question"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-extrabold text-slate-600 dark:text-slate-300 px-3 select-none">
              Q{currentQuestionIndex + 1} of {roundQuestions.length}
            </span>
            <button
              id="next-question-btn"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === roundQuestions.length - 1}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-35 text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer"
              title="Next Question"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Selector Ribbon */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/60" id="question-selector-ribbon">
          <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-2 font-mono">Select Question Slot:</p>
          <div className="flex flex-wrap gap-2">
            {roundQuestions.map((q, idx) => {
              const isActive = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  id={`ribbon-q-btn-${idx}`}
                  type="button"
                  onClick={() => onUpdateQuestionIndex(idx)}
                  className={`w-9 h-9 text-xs font-bold font-mono rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isActive 
                      ? 'ring-2 ring-indigo-500 scale-105 shadow-sm font-black' 
                      : ''
                  } ${getStatusColor(q.status)}`}
                >
                  <span>{q.number}</span>
                  {q.scoredTeam && (
                    <span 
                      className="w-1.5 h-1.5 rounded-full mt-0.5" 
                      style={{ backgroundColor: config.houseColors[q.scoredTeam] }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeQuestion ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="admin-question-inner-grid">
            
            {/* Left Box: Active Slot Details */}
            <div className="lg:col-span-5 bg-slate-50/75 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col justify-between" id="operator-active-q-details">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full font-mono">
                    Round: {currentRoundName}
                  </span>
                  
                  {activeQuestion.status !== 'unanswered' && (
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      activeQuestion.status === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' :
                      activeQuestion.status === 'wrong' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50' :
                      activeQuestion.status === 'passed' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50' :
                      'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
                    }`}>
                      {activeQuestion.status}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans">
                    Question #{activeQuestion.number}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1.5 font-sans leading-relaxed">
                    Ask this question manually to the teams. Once the answer is given, select the team and apply the judging score.
                  </p>
                </div>

                {activeQuestion.status !== 'unanswered' && activeQuestion.scoredTeam && (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Recorded Scoring</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.houseColors[activeQuestion.scoredTeam] }}></span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        {config.houseNames[activeQuestion.scoredTeam]}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        ({activeQuestion.pointsAwarded! > 0 ? `+${activeQuestion.pointsAwarded}` : activeQuestion.pointsAwarded} pts)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">ACTIVE SCORING UNIT</span>
                <button
                  id="reset-q-status-btn"
                  type="button"
                  onClick={handleResetQuestion}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  title="Wipe Question Status"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Box: Scoring Judges Panels */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5" id="operator-scoring-judges-panel">
              
              {/* Step 1: Select Team */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2.5">
                  Step 1: Select House Team Answering/Passing
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="scoring-team-selector-grid">
                  {(['red', 'blue', 'green', 'yellow'] as const).map(teamId => {
                    const isSelected = selectedScoringTeam === teamId;
                    const teamColor = config.houseColors[teamId];
                    return (
                      <button
                        key={teamId}
                        id={`score-select-team-${teamId}`}
                        type="button"
                        onClick={() => setSelectedScoringTeam(teamId)}
                        className={`py-3 px-2 rounded-xl border-2 transition-all cursor-pointer text-center text-xs font-bold ${
                          isSelected 
                            ? 'border-slate-900 dark:border-white shadow-xs scale-[1.03]' 
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                        style={{ borderLeftColor: teamColor, borderLeftWidth: isSelected ? '2px' : '4px' }}
                      >
                        <span className="block truncate text-slate-800 dark:text-slate-200">{config.houseNames[teamId]}</span>
                        <span className="block font-mono text-[9px] text-slate-400 mt-0.5">Score: {scores[teamId]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Scoring Decision */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2.5">
                  Step 2: Submit Judging Decision
                </label>
                <div className="space-y-2.5" id="judging-actions-row">
                  
                  {/* Primary Grid: Correct vs Wrong */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="judging-correct-btn"
                      type="button"
                      onClick={() => handleAdminQuestionScore('correct')}
                      disabled={!selectedScoringTeam}
                      className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      Correct Answer ({currentRoundName.toLowerCase().includes('rapid') ? '+200' : '+100'})
                    </button>
                    <button
                      id="judging-wrong-btn"
                      type="button"
                      onClick={() => handleAdminQuestionScore('wrong')}
                      disabled={!selectedScoringTeam}
                      className="py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-45 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Minus className="w-4 h-4" />
                      Wrong Answer ({currentRoundName.toLowerCase().includes('rapid') ? '-100' : '0'})
                    </button>
                  </div>

                  {/* Secondary Grid: Pass options & Under Review */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      id="judging-pass1-btn"
                      type="button"
                      onClick={() => handleAdminQuestionScore('passed_1')}
                      disabled={!selectedScoringTeam || currentRoundName.toLowerCase().includes('rapid')}
                      className="py-2.5 px-1 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50/45 dark:hover:bg-blue-950/20 disabled:opacity-45 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Answering correctly on First Pass"
                    >
                      1st Pass (+50)
                    </button>
                    <button
                      id="judging-pass2-btn"
                      type="button"
                      onClick={() => handleAdminQuestionScore('passed_2')}
                      disabled={!selectedScoringTeam || currentRoundName.toLowerCase().includes('rapid')}
                      className="py-2.5 px-1 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50/45 dark:hover:bg-blue-950/20 disabled:opacity-45 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Answering correctly on Second Pass"
                    >
                      2nd Pass (+25)
                    </button>
                    <button
                      id="judging-review-btn"
                      type="button"
                      onClick={() => handleAdminQuestionScore('review')}
                      disabled={!selectedScoringTeam}
                      className="py-2.5 px-1 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50/45 dark:hover:bg-amber-950/20 disabled:opacity-45 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Hold question scores for manual review"
                    >
                      Hold Review
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700" id="manual-scoring-only-state">
            <HelpIcon className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300">No Question Slots Found</h4>
          </div>
        )}

      </div>

      {/* -------------------- SECTION 2: FOUR-COLUMN SCOREBOARD -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" id="four-columns-scoreboard-row">
        {(['red', 'blue', 'green', 'yellow'] as const).map(teamId => {
          const teamName = config.houseNames[teamId];
          const teamColor = config.houseColors[teamId];
          const score = scores[teamId];
          const rankMeta = teamRankMap[teamId] || { rank: 4, isLeader: false, difference: 0 };
          const isRapidFire = currentRoundName.toLowerCase().includes('rapid');

          return (
            <div 
              key={teamId}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col justify-between relative ${
                rankMeta.isLeader 
                  ? 'border-amber-300 dark:border-amber-700/50 shadow-md ring-1 ring-amber-400/10' 
                  : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
              id={`scoreboard-column-${teamId}`}
            >
              {/* Highlight bar inside card */}
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: teamColor }}></div>
              
              <div>
                {/* Column Card Header */}
                <div className="flex items-start justify-between mb-3 pt-1">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none uppercase">{teamName}</h3>
                    <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase font-bold tracking-widest">
                      {teamId} Team
                    </p>
                  </div>
                  
                  {/* Position medal/pill */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rankMeta.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                    rankMeta.rank === 2 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                    'bg-slate-50 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500'
                  }`}>
                    {rankMeta.rank === 1 ? '🥇 1st' : rankMeta.rank === 2 ? '🥈 2nd' : rankMeta.rank === 3 ? '🥉 3rd' : '4th'}
                  </span>
                </div>

                {/* Score representation */}
                <div className="flex items-baseline gap-2 py-4 border-b border-slate-100 dark:border-slate-800/80 mb-4 justify-between">
                  <div>
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                      {score}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono ml-1.5">pts</span>
                  </div>
                  {rankMeta.isLeader ? (
                    <span className="text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Leader
                    </span>
                  ) : (
                    score > 0 && (
                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                        -{rankMeta.difference} pts
                      </span>
                    )
                  )}
                </div>

                {/* Operator score click-actions */}
                <div className="space-y-2 mb-4" id={`scoreboard-clicks-${teamId}`}>
                  <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-mono">
                    Increment Score Updates
                  </label>

                  {/* Scoring Layout dependent on Normal vs. Rapid Fire */}
                  {!isRapidFire ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        id={`column-${teamId}-correct`}
                        type="button"
                        onClick={() => handleScoreButton(teamId, 100, "Correct Answer")}
                        className="py-2 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition-all cursor-pointer text-center"
                      >
                        +100
                      </button>
                      <button
                        id={`column-${teamId}-pass1`}
                        type="button"
                        onClick={() => handleScoreButton(teamId, 50, "First Pass Correct")}
                        className="py-2 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg transition-all cursor-pointer text-center"
                      >
                        +50
                      </button>
                      <button
                        id={`column-${teamId}-pass2`}
                        type="button"
                        onClick={() => handleScoreButton(teamId, 25, "Second Pass Correct")}
                        className="py-2 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg transition-all cursor-pointer text-center"
                      >
                        +25
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {/* Attempt 1 */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          id={`column-${teamId}-rf-c1`}
                          type="button"
                          onClick={() => handleScoreButton(teamId, 200, "RF Attempt 1 Correct")}
                          className="py-1.5 px-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 font-bold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          +200
                        </button>
                        <button
                          id={`column-${teamId}-rf-w1`}
                          type="button"
                          onClick={() => handleScoreButton(teamId, -100, "RF Attempt 1 Wrong")}
                          className="py-1.5 px-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-bold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          -100
                        </button>
                      </div>

                      {/* Attempt 2 */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          id={`column-${teamId}-rf-c2`}
                          type="button"
                          onClick={() => handleScoreButton(teamId, 100, "RF Attempt 2 Correct")}
                          className="py-1.5 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                        >
                          +100 RF
                        </button>
                        <button
                          id={`column-${teamId}-rf-w2`}
                          type="button"
                          onClick={() => handleScoreButton(teamId, -50, "RF Attempt 2 Wrong")}
                          className="py-1.5 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                        >
                          -50
                        </button>
                      </div>

                      {/* Attempt 3 */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          id={`column-${teamId}-rf-c3`}
                          type="button"
                          onClick={() => handleScoreButton(teamId, 50, "RF Attempt 3 Correct")}
                          className="py-1.5 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                        >
                          +50 RF
                        </button>
                        <button
                          id={`column-${teamId}-rf-w3`}
                          type="button"
                          onClick={() => handleScoreButton(teamId, -25, "RF Attempt 3 Wrong")}
                          className="py-1.5 px-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                        >
                          -25
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Deduction Quick Button */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      id={`column-${teamId}-minus50`}
                      type="button"
                      onClick={() => handleScoreButton(teamId, -50, "Quick Deduction")}
                      className="py-1.5 px-1 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-850 text-slate-500 font-bold text-[10px] rounded-lg transition-all cursor-pointer text-center"
                    >
                      Deduct -50
                    </button>
                    <button
                      id={`column-${teamId}-minus25`}
                      type="button"
                      onClick={() => handleScoreButton(teamId, -25, "Quick Deduction")}
                      className="py-1.5 px-1 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-850 text-slate-500 font-bold text-[10px] rounded-lg transition-all cursor-pointer text-center"
                    >
                      Deduct -25
                    </button>
                  </div>

                </div>
              </div>

              {/* Custom Input Modifier */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80" id={`scoreboard-custom-${teamId}`}>
                <div className="flex gap-1.5">
                  <input
                    id={`custom-input-${teamId}`}
                    type="number"
                    value={customPoints[teamId]}
                    onChange={(e) => setCustomPoints({ ...customPoints, [teamId]: e.target.value })}
                    className="flex-1 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-slate-900 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
                    placeholder="Custom +/-"
                  />
                  <button
                    id={`custom-submit-${teamId}`}
                    onClick={() => handleCustomPointsSubmit(teamId)}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* -------------------- SECTION 3: ROUND MANAGEMENT MODULE -------------------- */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6" id="round-management-panel">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 border border-white/10 p-3 rounded-xl">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Quiz session manager</span>
            <h4 className="text-base font-bold text-white mt-1">
              Active Round {currentRoundIndex + 1} of {rounds.length}: <strong className="text-amber-300 font-sans">{currentRoundName}</strong>
            </h4>
          </div>
        </div>

        {/* Round Fast Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end" id="round-actions-row">
          <button
            id="prev-round-btn"
            onClick={handlePrevRound}
            disabled={currentRoundIndex === 0}
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Round
          </button>
          
          <button
            id="reset-round-btn"
            onClick={() => {
              if (window.confirm(`WARNING: Are you sure you want to reset scores and history logs for Round ${currentRoundIndex + 1}: ${currentRoundName}? This is destructive.`)) {
                onResetCurrentRound();
              }
            }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset active round score totals"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Round
          </button>

          <button
            id="next-round-btn"
            onClick={handleNextRound}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {currentRoundIndex === rounds.length - 1 ? (
              <>
                Finish Competition <Trophy className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Next Round: {rounds[currentRoundIndex + 1]} <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
