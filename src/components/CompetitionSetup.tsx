import React, { useState } from 'react';
import { CompetitionConfig, CategoryData } from '../types';
import { DEFAULT_ROUNDS } from '../data';
import { BookOpen, GraduationCap, Play, Trophy, ShieldAlert } from 'lucide-react';

interface CompetitionSetupProps {
  config: CompetitionConfig;
  onUpdateConfig: (newConfig: CompetitionConfig) => void;
  onStart: (selectedCategory: 'category_1' | 'category_2', initialRoundIndex: number) => void;
  category1: CategoryData;
  category2: CategoryData;
}

export default function CompetitionSetup({
  config,
  onUpdateConfig,
  onStart,
  category1,
  category2
}: CompetitionSetupProps) {
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [competitionName, setCompetitionName] = useState(config.competitionName);
  const [selectedCategory, setSelectedCategory] = useState<'category_1' | 'category_2'>('category_1');
  const [startingRoundIndex, setStartingRoundIndex] = useState(0);

  const [cat1Classes, setCat1Classes] = useState(config.category1Classes);
  const [cat2Classes, setCat2Classes] = useState(config.category2Classes);

  const handleStart = () => {
    if (!schoolName.trim() || !competitionName.trim()) return;
    
    onUpdateConfig({
      ...config,
      schoolName,
      competitionName,
      category1Classes: cat1Classes,
      category2Classes: cat2Classes
    });

    onStart(selectedCategory, startingRoundIndex);
  };

  const activeCategoryData = selectedCategory === 'category_1' ? category1 : category2;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" id="setup-container">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="setup-card">
        
        {/* Header / Brand */}
        <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden" id="setup-header">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(100,116,139,0.15),transparent)]"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
                TMPS Scoreboard System
              </span>
              <h1 className="text-3xl font-bold tracking-tight mt-3 text-slate-100 font-sans">
                Inter-House Quiz Scoreboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Official Event Score Management & Projector Leaderboard
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl backdrop-blur-sm self-start md:self-auto">
              <Trophy className="w-10 h-10 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Host Institution</p>
                <p className="text-sm font-semibold text-white">TMPS International</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-8" id="setup-body">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="basic-info-fields">
            <div>
              <label htmlFor="school-name-input" className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                School Name
              </label>
              <input
                id="school-name-input"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors bg-slate-50/50 hover:bg-slate-50 font-sans"
                placeholder="Enter School/College Name..."
              />
            </div>
            <div>
              <label htmlFor="competition-name-input" className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                Competition Name
              </label>
              <input
                id="competition-name-input"
                type="text"
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors bg-slate-50/50 hover:bg-slate-50 font-sans"
                placeholder="Enter Competition Title..."
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Choose Category */}
          <div id="category-selector-section">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Select Competition Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="category-cards-grid">
              
              {/* Category 1 Card */}
              <button
                id="setup-cat1-btn"
                type="button"
                onClick={() => setSelectedCategory('category_1')}
                className={`flex flex-col text-left p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedCategory === 'category_1'
                    ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/20'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Category 1
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-4">Classes 1–6</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Tailored scoring rules, questions, and rounds customized for primary and intermediate students.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-400">
                  <span>Questions Loaded: {category1.questions.length}</span>
                  <span>Rounds: {category1.rounds.length}</span>
                </div>
              </button>

              {/* Category 2 Card */}
              <button
                id="setup-cat2-btn"
                type="button"
                onClick={() => setSelectedCategory('category_2')}
                className={`flex flex-col text-left p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedCategory === 'category_2'
                    ? 'border-slate-900 bg-slate-50/60 ring-1 ring-slate-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/20'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Category 2
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-4">Classes 9–12</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Advanced questions, fast-paced rounds, and rigid marking structures designed for senior secondary batches.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-400">
                  <span>Questions Loaded: {category2.questions.length}</span>
                  <span>Rounds: {category2.rounds.length}</span>
                </div>
              </button>

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Customize Category Class Range & Initial Round */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="round-and-class-inputs">
            <div>
              <label htmlFor="class-range-input" className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                Class Range for Selected Category
              </label>
              {selectedCategory === 'category_1' ? (
                <input
                  id="class-range-input-cat1"
                  type="text"
                  value={cat1Classes}
                  onChange={(e) => setCat1Classes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                  placeholder="e.g. Classes 1–6"
                />
              ) : (
                <input
                  id="class-range-input-cat2"
                  type="text"
                  value={cat2Classes}
                  onChange={(e) => setCat2Classes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                  placeholder="e.g. Classes 9–12"
                />
              )}
              <p className="text-[11px] text-slate-400 mt-1.5">You can customize the text description of the grade boundaries.</p>
            </div>

            <div>
              <label htmlFor="starting-round-select" className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                Starting Round
              </label>
              <select
                id="starting-round-select"
                value={startingRoundIndex}
                onChange={(e) => setStartingRoundIndex(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50 hover:bg-slate-50 transition-all"
              >
                {activeCategoryData.rounds.map((roundName, index) => (
                  <option key={roundName} value={index}>
                    Round {index + 1}: {roundName}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">Choose which round gets activated first upon launching.</p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100" id="setup-footer-actions">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All systems fully operational & locally persisted.</span>
            </div>
            <button
              id="start-competition-btn"
              type="button"
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Competition Scoreboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
