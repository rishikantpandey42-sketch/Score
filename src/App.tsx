import React, { useState, useEffect, useCallback } from 'react';
import { 
  CompetitionConfig, CategoryData, Question, HistoryItem 
} from './types';
import { 
  INITIAL_CONFIG, INITIAL_CATEGORY_DATA 
} from './data';

import CompetitionSetup from './components/CompetitionSetup';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import HistoryPanel from './components/HistoryPanel';
import ReportsPanel from './components/ReportsPanel';
import SettingsPanel from './components/SettingsPanel';

import { 
  Trophy, BookOpen, GraduationCap, History, Settings, BarChart2, 
  Tv, LogIn, Laptop, Globe, CloudLightning, ShieldCheck 
} from 'lucide-react';

interface CategoryStateSnapshot {
  scores: Record<'red' | 'blue' | 'green' | 'yellow', number>;
  currentRoundIndex: number;
  questions: Question[];
  currentQuestionIndex: number;
  history: HistoryItem[];
}

export default function App() {
  // --- 1. Global Configurations ---
  const [config, setConfig] = useState<CompetitionConfig>(INITIAL_CONFIG);
  const [viewMode, setViewMode] = useState<'setup' | 'operator' | 'projector'>('setup');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'reports' | 'settings'>('dashboard');
  const [activeCategory, setActiveCategory] = useState<'category_1' | 'category_2'>('category_1');

  // --- 2. Independent Categories Data State ---
  const [category1, setCategory1] = useState<CategoryData>(() => INITIAL_CATEGORY_DATA('category_1'));
  const [category2, setCategory2] = useState<CategoryData>(() => INITIAL_CATEGORY_DATA('category_2'));

  // --- 3. Undo / Redo Snapshot Histories ---
  const [cat1History, setCat1History] = useState<CategoryStateSnapshot[]>([]);
  const [cat1Pointer, setCat1Pointer] = useState<number>(-1);

  const [cat2History, setCat2History] = useState<CategoryStateSnapshot[]>([]);
  const [cat2Pointer, setCat2Pointer] = useState<number>(-1);

  // --- 4. Simulated Network Connection State ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSynced(new Date().toLocaleTimeString());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setLastSynced(new Date().toLocaleTimeString());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- 5. Initial Load from LocalStorage ---
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('tmps_scoreboard_config');
      const savedCat1 = localStorage.getItem('tmps_scoreboard_cat1');
      const savedCat2 = localStorage.getItem('tmps_scoreboard_cat2');
      const savedActiveCat = localStorage.getItem('tmps_scoreboard_active_cat');
      const savedViewMode = localStorage.getItem('tmps_scoreboard_view_mode');

      if (savedConfig) setConfig(JSON.parse(savedConfig));
      if (savedActiveCat) setActiveCategory(JSON.parse(savedActiveCat) as 'category_1' | 'category_2');
      if (savedViewMode) setViewMode(JSON.parse(savedViewMode) as 'setup' | 'operator' | 'projector');

      if (savedCat1) {
        const c1 = JSON.parse(savedCat1) as CategoryData;
        setCategory1(c1);
        const initSnapshot: CategoryStateSnapshot = {
          scores: c1.scores,
          currentRoundIndex: c1.currentRoundIndex,
          questions: c1.questions,
          currentQuestionIndex: c1.currentQuestionIndex,
          history: c1.history
        };
        setCat1History([initSnapshot]);
        setCat1Pointer(0);
      } else {
        const c1 = INITIAL_CATEGORY_DATA('category_1');
        const initSnapshot: CategoryStateSnapshot = {
          scores: c1.scores,
          currentRoundIndex: c1.currentRoundIndex,
          questions: c1.questions,
          currentQuestionIndex: c1.currentQuestionIndex,
          history: c1.history
        };
        setCat1History([initSnapshot]);
        setCat1Pointer(0);
      }

      if (savedCat2) {
        const c2 = JSON.parse(savedCat2) as CategoryData;
        setCategory2(c2);
        const initSnapshot: CategoryStateSnapshot = {
          scores: c2.scores,
          currentRoundIndex: c2.currentRoundIndex,
          questions: c2.questions,
          currentQuestionIndex: c2.currentQuestionIndex,
          history: c2.history
        };
        setCat2History([initSnapshot]);
        setCat2Pointer(0);
      } else {
        const c2 = INITIAL_CATEGORY_DATA('category_2');
        const initSnapshot: CategoryStateSnapshot = {
          scores: c2.scores,
          currentRoundIndex: c2.currentRoundIndex,
          questions: c2.questions,
          currentQuestionIndex: c2.currentQuestionIndex,
          history: c2.history
        };
        setCat2History([initSnapshot]);
        setCat2Pointer(0);
      }
    } catch (e) {
      console.error("Failed to load state from LocalStorage", e);
    }
  }, []);

  // --- 6. Persist state changes helper ---
  const saveToLocalStorage = (
    updatedConfig: CompetitionConfig, 
    updatedCat1: CategoryData, 
    updatedCat2: CategoryData,
    updatedActiveCat: 'category_1' | 'category_2',
    updatedViewMode: 'setup' | 'operator' | 'projector'
  ) => {
    try {
      localStorage.setItem('tmps_scoreboard_config', JSON.stringify(updatedConfig));
      localStorage.setItem('tmps_scoreboard_cat1', JSON.stringify(updatedCat1));
      localStorage.setItem('tmps_scoreboard_cat2', JSON.stringify(updatedCat2));
      localStorage.setItem('tmps_scoreboard_active_cat', JSON.stringify(updatedActiveCat));
      localStorage.setItem('tmps_scoreboard_view_mode', JSON.stringify(updatedViewMode));
      setLastSynced(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Failed to save state to LocalStorage", e);
    }
  };

  // Helper to commit a state mutation for Category 1
  const commitCat1State = (updated: CategoryData) => {
    setCategory1(updated);
    
    const snapshot: CategoryStateSnapshot = {
      scores: updated.scores,
      currentRoundIndex: updated.currentRoundIndex,
      questions: updated.questions,
      currentQuestionIndex: updated.currentQuestionIndex,
      history: updated.history
    };

    const nextHistory = cat1History.slice(0, cat1Pointer + 1);
    const updatedHistory = [...nextHistory, snapshot];
    setCat1History(updatedHistory);
    setCat1Pointer(updatedHistory.length - 1);

    saveToLocalStorage(config, updated, category2, activeCategory, viewMode);
  };

  // Helper to commit a state mutation for Category 2
  const commitCat2State = (updated: CategoryData) => {
    setCategory2(updated);

    const snapshot: CategoryStateSnapshot = {
      scores: updated.scores,
      currentRoundIndex: updated.currentRoundIndex,
      questions: updated.questions,
      currentQuestionIndex: updated.currentQuestionIndex,
      history: updated.history
    };

    const nextHistory = cat2History.slice(0, cat2Pointer + 1);
    const updatedHistory = [...nextHistory, snapshot];
    setCat2History(updatedHistory);
    setCat2Pointer(updatedHistory.length - 1);

    saveToLocalStorage(config, category1, updated, activeCategory, viewMode);
  };

  const getActiveCategoryData = () => {
    return activeCategory === 'category_1' ? category1 : category2;
  };

  const commitActiveCategoryData = (updated: CategoryData) => {
    if (activeCategory === 'category_1') {
      commitCat1State(updated);
    } else {
      commitCat2State(updated);
    }
  };

  // --- 7. Undo / Redo Mechanism ---
  const handleUndo = useCallback(() => {
    if (activeCategory === 'category_1') {
      if (cat1Pointer > 0) {
        const nextPointer = cat1Pointer - 1;
        const snapshot = cat1History[nextPointer];
        setCat1Pointer(nextPointer);
        
        const restored: CategoryData = {
          ...category1,
          scores: snapshot.scores,
          currentRoundIndex: snapshot.currentRoundIndex,
          questions: snapshot.questions,
          currentQuestionIndex: snapshot.currentQuestionIndex,
          history: snapshot.history
        };
        setCategory1(restored);
        saveToLocalStorage(config, restored, category2, activeCategory, viewMode);
      }
    } else {
      if (cat2Pointer > 0) {
        const nextPointer = cat2Pointer - 1;
        const snapshot = cat2History[nextPointer];
        setCat2Pointer(nextPointer);

        const restored: CategoryData = {
          ...category2,
          scores: snapshot.scores,
          currentRoundIndex: snapshot.currentRoundIndex,
          questions: snapshot.questions,
          currentQuestionIndex: snapshot.currentQuestionIndex,
          history: snapshot.history
        };
        setCategory2(restored);
        saveToLocalStorage(config, category1, restored, activeCategory, viewMode);
      }
    }
  }, [activeCategory, cat1Pointer, cat1History, cat2Pointer, cat2History, category1, category2, config, viewMode]);

  const handleRedo = useCallback(() => {
    if (activeCategory === 'category_1') {
      if (cat1Pointer < cat1History.length - 1) {
        const nextPointer = cat1Pointer + 1;
        const snapshot = cat1History[nextPointer];
        setCat1Pointer(nextPointer);

        const restored: CategoryData = {
          ...category1,
          scores: snapshot.scores,
          currentRoundIndex: snapshot.currentRoundIndex,
          questions: snapshot.questions,
          currentQuestionIndex: snapshot.currentQuestionIndex,
          history: snapshot.history
        };
        setCategory1(restored);
        saveToLocalStorage(config, restored, category2, activeCategory, viewMode);
      }
    } else {
      if (cat2Pointer < cat2History.length - 1) {
        const nextPointer = cat2Pointer + 1;
        const snapshot = cat2History[nextPointer];
        setCat2Pointer(nextPointer);

        const restored: CategoryData = {
          ...category2,
          scores: snapshot.scores,
          currentRoundIndex: snapshot.currentRoundIndex,
          questions: snapshot.questions,
          currentQuestionIndex: snapshot.currentQuestionIndex,
          history: snapshot.history
        };
        setCategory2(restored);
        saveToLocalStorage(config, category1, restored, activeCategory, viewMode);
      }
    }
  }, [activeCategory, cat1Pointer, cat1History, cat2Pointer, cat2History, category1, category2, config, viewMode]);

  // --- 8. Core Score Engine Actions ---
  const handleUpdateScore = (
    teamId: 'red' | 'blue' | 'green' | 'yellow', 
    points: number, 
    action: HistoryItem['action'], 
    description: string
  ) => {
    const activeData = getActiveCategoryData();
    const currentRound = activeData.rounds[activeData.currentRoundIndex] || 'General';

    const newScores = {
      ...activeData.scores,
      [teamId]: Math.max(0, activeData.scores[teamId] + points) // scores cannot drop below 0
    };

    const newLog: HistoryItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: activeCategory,
      round: currentRound,
      teamId,
      action,
      points,
      description
    };

    const updatedData: CategoryData = {
      ...activeData,
      scores: newScores,
      history: [...activeData.history, newLog]
    };

    commitActiveCategoryData(updatedData);
  };

  const handleUpdateCurrentRound = (roundIndex: number) => {
    const activeData = getActiveCategoryData();
    const roundName = activeData.rounds[roundIndex] || 'General';
    
    const newLog: HistoryItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: activeCategory,
      round: roundName,
      teamId: 'system',
      action: 'manual',
      points: 0,
      description: `Active round transitioned to Round ${roundIndex + 1}: ${roundName}`
    };

    const updatedData: CategoryData = {
      ...activeData,
      currentRoundIndex: roundIndex,
      currentQuestionIndex: 0, // reset round question pointer on round shift
      history: [...activeData.history, newLog]
    };

    commitActiveCategoryData(updatedData);
  };

  const handleUpdateQuestionIndex = (index: number) => {
    const activeData = getActiveCategoryData();
    commitActiveCategoryData({
      ...activeData,
      currentQuestionIndex: index
    });
  };

  const handleUpdateQuestionStatus = (
    questionId: string, 
    status: Question['status'], 
    scoredTeam: Question['scoredTeam'] = null, 
    pointsAwarded = 0
  ) => {
    const activeData = getActiveCategoryData();
    const updatedQuestions = activeData.questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          status,
          scoredTeam,
          pointsAwarded
        };
      }
      return q;
    });

    commitActiveCategoryData({
      ...activeData,
      questions: updatedQuestions
    });
  };



  // --- 9. Destructive Admin Cleanups ---
  const handleResetCurrentRound = () => {
    const activeData = getActiveCategoryData();
    const roundName = activeData.rounds[activeData.currentRoundIndex] || 'General';

    // 1. Roll back scores inside history for this round
    const roundLogs = activeData.history.filter(h => h.round === roundName && h.teamId !== 'system');
    const rolledBackScores = { ...activeData.scores };

    roundLogs.forEach(log => {
      if (rolledBackScores[log.teamId as 'red' | 'blue' | 'green' | 'yellow']) {
        rolledBackScores[log.teamId as 'red' | 'blue' | 'green' | 'yellow'] = Math.max(
          0, 
          rolledBackScores[log.teamId as 'red' | 'blue' | 'green' | 'yellow'] - log.points
        );
      }
    });

    // 2. Reset question statuses in this round
    const resetQuestions = activeData.questions.map(q => {
      if (q.round === roundName) {
        return {
          ...q,
          status: 'unanswered' as const,
          scoredTeam: null,
          pointsAwarded: 0
        };
      }
      return q;
    });

    const newLog: HistoryItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: activeCategory,
      round: roundName,
      teamId: 'system',
      action: 'reset',
      points: 0,
      description: `Wiped and reset scores for active round: ${roundName}`
    };

    const updatedData: CategoryData = {
      ...activeData,
      scores: rolledBackScores,
      questions: resetQuestions,
      currentQuestionIndex: 0,
      history: [...activeData.history, newLog]
    };

    commitActiveCategoryData(updatedData);
  };

  const handleResetCompetition = () => {
    const freshCat1 = INITIAL_CATEGORY_DATA('category_1');
    const freshCat2 = INITIAL_CATEGORY_DATA('category_2');

    setCategory1(freshCat1);
    setCategory2(freshCat2);

    setCat1History([{
      scores: freshCat1.scores,
      currentRoundIndex: freshCat1.currentRoundIndex,
      questions: freshCat1.questions,
      currentQuestionIndex: freshCat1.currentQuestionIndex,
      history: freshCat1.history
    }]);
    setCat1Pointer(0);

    setCat2History([{
      scores: freshCat2.scores,
      currentRoundIndex: freshCat2.currentRoundIndex,
      questions: freshCat2.questions,
      currentQuestionIndex: freshCat2.currentQuestionIndex,
      history: freshCat2.history
    }]);
    setCat2Pointer(0);

    saveToLocalStorage(config, freshCat1, freshCat2, activeCategory, 'setup');
    setViewMode('setup');
  };

  const handleFinishCompetition = () => {
    alert("Congratulations! The Inter-House Quiz Competition has successfully finished. Loading final reports...");
    setActiveTab('reports');
  };

  // --- 10. General configuration edits ---
  const handleUpdateConfig = (newConfig: CompetitionConfig) => {
    setConfig(newConfig);
    saveToLocalStorage(newConfig, category1, category2, activeCategory, viewMode);
  };

  const handleStartCompetition = (selectedCat: 'category_1' | 'category_2', roundIdx: number) => {
    setActiveCategory(selectedCat);
    setViewMode('operator');
    setActiveTab('dashboard');

    const targetData = selectedCat === 'category_1' ? category1 : category2;
    const updated: CategoryData = {
      ...targetData,
      currentRoundIndex: roundIdx,
      currentQuestionIndex: 0
    };

    if (selectedCat === 'category_1') {
      commitCat1State(updated);
    } else {
      commitCat2State(updated);
    }

    saveToLocalStorage(config, selectedCat === 'category_1' ? updated : category1, selectedCat === 'category_2' ? updated : category2, selectedCat, 'operator');
  };

  // Switch categories inside operator tab
  const handleCategorySwitch = (catId: 'category_1' | 'category_2') => {
    setActiveCategory(catId);
    saveToLocalStorage(config, category1, category2, catId, viewMode);
  };

  // --- 11. Keyboard Shortcuts Listener ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keybindings when actively typing inside inputs, selectors, or textareas
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.tagName === 'SELECT'
      )) {
        return;
      }

      const activeData = getActiveCategoryData();
      const currentRound = activeData.rounds[activeData.currentRoundIndex] || 'General';

      // 1. Ctrl + Z -> Undo
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }

      // 2. Ctrl + Shift + Z -> Redo
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleRedo();
      }

      // 3. Arrow Right -> Next Question / Round
      if (e.key === 'ArrowRight') {
        // If there are questions in the round, advance questions. If at the end, do nothing.
        const roundQuestions = activeData.questions.filter(q => q.round === currentRound);
        if (activeData.currentQuestionIndex < roundQuestions.length - 1) {
          handleUpdateQuestionIndex(activeData.currentQuestionIndex + 1);
        }
      }

      // 4. Arrow Left -> Prev Question / Round
      if (e.key === 'ArrowLeft') {
        if (activeData.currentQuestionIndex > 0) {
          handleUpdateQuestionIndex(activeData.currentQuestionIndex - 1);
        }
      }

      // 5. Team Scoring triggers (1, 2, 3, 4) -> Gives default +100 correct answer to associated team
      const numKey = e.key;
      if (numKey === '1' || numKey === '2' || numKey === '3' || numKey === '4') {
        e.preventDefault();
        const mapping: Record<string, 'red' | 'blue' | 'green' | 'yellow'> = {
          '1': 'red',
          '2': 'blue',
          '3': 'green',
          '4': 'yellow'
        };
        const teamId = mapping[numKey];
        if (teamId) {
          const isRapid = currentRound.toLowerCase().includes('rapid');
          const pts = isRapid ? 200 : 100;
          handleUpdateScore(
            teamId, 
            pts, 
            'correct', 
            `Shortcut ${numKey} corrected for ${config.houseNames[teamId]} (+${pts})`
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCategory, category1, category2, cat1Pointer, cat2Pointer, handleUndo, handleRedo]);

  // Render Theme Class on parent DOM node
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      if (config.theme === 'dark') {
        root.classList.add('dark');
        document.body.style.backgroundColor = '#0f172a'; // slate-900
      } else {
        root.classList.remove('dark');
        document.body.style.backgroundColor = '#f8fafc'; // slate-50
      }
    }
  }, [config.theme]);

  // --- 12. Main Setup Routing ---
  if (viewMode === 'setup') {
    return (
      <CompetitionSetup
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onStart={handleStartCompetition}
        category1={category1}
        category2={category2}
      />
    );
  }

  const activeCategoryData = getActiveCategoryData();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${config.theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`} id="app-root">
      
      {/* -------------------- BRANDED ACTION HEADER -------------------- */}
      <header className={`border-b px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs ${
        config.theme === 'dark' ? 'bg-slate-900/90 border-slate-800 backdrop-blur-sm' : 'bg-white/95 border-slate-100 backdrop-blur-sm'
      }`} id="app-navigation-header">
        
        {/* Institutional branding info */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-xl">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight leading-none uppercase">
              {config.competitionName}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                config.theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
              }`}>
                {config.schoolName}
              </span>
              <span className="text-[9px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {activeCategoryData.name} ({activeCategoryData.classes})
              </span>
            </div>
          </div>
        </div>

        {/* Categories Tab selector (Independent competition loaded instantly) */}
        <div className="flex items-center gap-4" id="category-switcher-tab">
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            <button
              id="switch-cat1-btn"
              onClick={() => handleCategorySwitch('category_1')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'category_1'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3 h-3 text-blue-500" />
              {config.category1Name}
            </button>
            <button
              id="switch-cat2-btn"
              onClick={() => handleCategorySwitch('category_2')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'category_2'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3 h-3 text-emerald-500" />
              {config.category2Name}
            </button>
          </div>

          <hr className="h-6 w-px border-l border-slate-200 dark:border-slate-700 hidden lg:block" />

          {/* Sync Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            {isOnline ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-bold uppercase">Online Sync Active</span>
              </>
            ) : (
              <>
                <CloudLightning className="w-4 h-4 text-amber-500 animate-bounce" />
                <span className="text-amber-500 font-bold uppercase">Offline Mode</span>
              </>
            )}
            <span className="text-[9px] text-slate-400/75 hidden xl:inline">({lastSynced ? `Saved ${lastSynced}` : 'LocalCache'})</span>
          </div>

        </div>

        {/* View Mode Toggle (Operator Panel vs Projector Audience view) */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start lg:self-auto" id="view-mode-button-selector">
          <button
            id="view-mode-operator-btn"
            onClick={() => setViewMode('operator')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'operator'
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Operator Panel
          </button>
          <button
            id="view-mode-projector-btn"
            onClick={() => setViewMode('projector')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'projector'
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            Projector Stream
          </button>
        </div>

      </header>

      {/* -------------------- PANEL BODY -------------------- */}
      {viewMode === 'projector' ? (
        <main className="flex-1 p-6 md:p-8" id="projector-immersive-view-container">
          <Leaderboard
            categoryData={activeCategoryData}
            config={config}
          />
        </main>
      ) : (
        <>
          {/* Operator Mode Navigation Tabs */}
          <nav className={`px-6 border-b flex gap-6 overflow-x-auto ${
            config.theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
          }`} id="operator-secondary-tabs">
            <button
              id="nav-tab-scoreboard"
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-slate-400" />
              Scoreboard Dashboard
            </button>

            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4 text-slate-400" />
              Audit History Logs
            </button>
            <button
              id="nav-tab-reports"
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reports'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-slate-400" />
              Final Score Reports
            </button>
            <button
              id="nav-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Configurations Settings
            </button>
          </nav>

          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full" id="operator-main-view-container">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start" id="operator-dashboard-split">
                
                {/* Scoreboard Panel */}
                <div className="xl:col-span-8" id="split-left-dashboard-panel">
                  <Dashboard
                    categoryData={activeCategoryData}
                    config={config}
                    onUpdateScore={handleUpdateScore}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={activeCategory === 'category_1' ? cat1Pointer > 0 : cat2Pointer > 0}
                    canRedo={activeCategory === 'category_1' ? cat1Pointer < cat1History.length - 1 : cat2Pointer < cat2History.length - 1}
                    onUpdateCurrentRound={handleUpdateCurrentRound}
                    onResetCurrentRound={handleResetCurrentRound}
                    onResetCompetition={handleResetCompetition}
                    onUpdateQuestionIndex={handleUpdateQuestionIndex}
                    onUpdateQuestionStatus={handleUpdateQuestionStatus}
                    onFinishCompetition={handleFinishCompetition}
                  />
                </div>

                {/* Audit panel as floating helper sidebar inside Operator scoreboard */}
                <div className="xl:col-span-4" id="split-right-history-panel">
                  <HistoryPanel
                    history={activeCategoryData.history}
                    config={config}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={activeCategory === 'category_1' ? cat1Pointer > 0 : cat2Pointer > 0}
                    canRedo={activeCategory === 'category_1' ? cat1Pointer < cat1History.length - 1 : cat2Pointer < cat2History.length - 1}
                    onClearHistory={() => {
                      const resetHistory: CategoryData = {
                        ...activeCategoryData,
                        history: []
                      };
                      commitActiveCategoryData(resetHistory);
                    }}
                  />
                </div>

              </div>
            )}



            {activeTab === 'history' && (
              <div className="max-w-3xl mx-auto" id="history-logs-expanded-layout">
                <HistoryPanel
                  history={activeCategoryData.history}
                  config={config}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={activeCategory === 'category_1' ? cat1Pointer > 0 : cat2Pointer > 0}
                  canRedo={activeCategory === 'category_1' ? cat1Pointer < cat1History.length - 1 : cat2Pointer < cat2History.length - 1}
                  onClearHistory={() => {
                    const resetHistory: CategoryData = {
                      ...activeCategoryData,
                      history: []
                    };
                    commitActiveCategoryData(resetHistory);
                  }}
                />
              </div>
            )}

            {activeTab === 'reports' && (
              <ReportsPanel
                categoryData={activeCategoryData}
                config={config}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onResetCompetition={handleResetCompetition}
                onResetCurrentRound={handleResetCurrentRound}
              />
            )}
          </main>
        </>
      )}

      {/* Branded watermark footer */}
      <footer className={`py-4 text-center text-[10px] font-mono border-t ${
        config.theme === 'dark' ? 'border-slate-900 bg-slate-950 text-slate-600' : 'border-slate-100 bg-slate-50 text-slate-400'
      }`} id="app-branded-footer">
        © 2026 TMPS International School & College. Live Scoreboard System. All Rights Reserved.
      </footer>

    </div>
  );
}
