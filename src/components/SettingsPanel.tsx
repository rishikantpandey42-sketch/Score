import React, { useState } from 'react';
import { CompetitionConfig } from '../types';
import { 
  Settings, Save, RefreshCw, Moon, Sun, ShieldAlert, Palette, HelpCircle, GraduationCap 
} from 'lucide-react';

interface SettingsPanelProps {
  config: CompetitionConfig;
  onUpdateConfig: (newConfig: CompetitionConfig) => void;
  onResetCompetition: () => void;
  onResetCurrentRound: () => void;
}

export default function SettingsPanel({
  config,
  onUpdateConfig,
  onResetCompetition,
  onResetCurrentRound
}: SettingsPanelProps) {
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [competitionName, setCompetitionName] = useState(config.competitionName);
  const [theme, setTheme] = useState(config.theme);

  // House Names State
  const [redName, setRedName] = useState(config.houseNames.red);
  const [blueName, setBlueName] = useState(config.houseNames.blue);
  const [greenName, setGreenName] = useState(config.houseNames.green);
  const [yellowName, setYellowName] = useState(config.houseNames.yellow);

  // Custom Category State
  const [cat1Name, setCat1Name] = useState(config.category1Name);
  const [cat1Classes, setCat1Classes] = useState(config.category1Classes);
  const [cat2Name, setCat2Name] = useState(config.category2Name);
  const [cat2Classes, setCat2Classes] = useState(config.category2Classes);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      schoolName,
      competitionName,
      theme,
      houseNames: {
        red: redName,
        blue: blueName,
        green: greenName,
        yellow: yellowName
      },
      category1Name: cat1Name,
      category1Classes: cat1Classes,
      category2Name: cat2Name,
      category2Classes: cat2Classes
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    onUpdateConfig({
      ...config,
      theme: nextTheme
    });
  };

  return (
    <div className="space-y-6" id="settings-panel-wrapper">
      
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-content-grid">
        
        {/* Core Settings Form */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm" id="core-settings-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-700">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">General Customization</h3>
                <p className="text-slate-400 text-[11px]">School details and competition boundaries</p>
              </div>
            </div>
            {isSaved && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full animate-fade-in font-sans">
                Changes Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6" id="settings-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="school-comp-row">
              <div>
                <label htmlFor="settings-school-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  School Name
                </label>
                <input
                  id="settings-school-name"
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label htmlFor="settings-competition-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Competition Name
                </label>
                <input
                  id="settings-competition-name"
                  type="text"
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Custom Category Settings */}
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-slate-500" />
                Category Labels
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="category-settings-inputs">
                {/* Category 1 Details */}
                <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Category 1
                  </span>
                  <div>
                    <label htmlFor="cat1-label-input" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label>
                    <input
                      id="cat1-label-input"
                      type="text"
                      value={cat1Name}
                      onChange={(e) => setCat1Name(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="cat1-classes-input" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Classes range</label>
                    <input
                      id="cat1-classes-input"
                      type="text"
                      value={cat1Classes}
                      onChange={(e) => setCat1Classes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Category 2 Details */}
                <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Category 2
                  </span>
                  <div>
                    <label htmlFor="cat2-label-input" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label>
                    <input
                      id="cat2-label-input"
                      type="text"
                      value={cat2Name}
                      onChange={(e) => setCat2Name(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="cat2-classes-input" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Classes range</label>
                    <input
                      id="cat2-classes-input"
                      type="text"
                      value={cat2Classes}
                      onChange={(e) => setCat2Classes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* House / Team Names Settings */}
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-slate-500" />
                House Team Customization
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="house-names-grid">
                <div>
                  <label htmlFor="red-house-input" className="block text-[10px] font-bold text-red-500 uppercase mb-1.5">Red House Team Name</label>
                  <input
                    id="red-house-input"
                    type="text"
                    value={redName}
                    onChange={(e) => setRedName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50/20 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="blue-house-input" className="block text-[10px] font-bold text-blue-500 uppercase mb-1.5">Blue House Team Name</label>
                  <input
                    id="blue-house-input"
                    type="text"
                    value={blueName}
                    onChange={(e) => setBlueName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="green-house-input" className="block text-[10px] font-bold text-green-500 uppercase mb-1.5">Green House Team Name</label>
                  <input
                    id="green-house-input"
                    type="text"
                    value={greenName}
                    onChange={(e) => setGreenName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50/20 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="yellow-house-input" className="block text-[10px] font-bold text-amber-500 uppercase mb-1.5">Yellow House Team Name</label>
                  <input
                    id="yellow-house-input"
                    type="text"
                    value={yellowName}
                    onChange={(e) => setYellowName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3" id="settings-footer-actions">
              <button
                id="settings-save-btn"
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Configurations
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Controls (Resets, Theme, Logs) */}
        <div className="space-y-6" id="settings-sidebar-controls">
          
          {/* Theme card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm" id="settings-theme-card">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Aesthetic Theme</h4>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              Instantly toggle the primary design environment variables.
            </p>
            <button
              id="theme-toggle-settings"
              onClick={handleThemeToggle}
              className="w-full py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-500 fill-current" />
                  Switch to Dark Mode
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500 fill-current" />
                  Switch to Light Mode
                </>
              )}
            </button>
          </div>

          {/* Danger zone / Admin resets */}
          <div className="bg-red-50/40 border border-red-100 rounded-2xl p-6 space-y-4" id="settings-danger-zone">
            <div className="flex items-center gap-1.5 text-red-600">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">Danger Administrative Zone</h4>
            </div>
            
            <p className="text-slate-500 text-[11px] leading-relaxed">
              These commands are destructive and overwrite currently loaded memory models. Ensure active scores are documented before executing.
            </p>

            <div className="space-y-2.5 pt-2" id="danger-actions-row">
              <button
                id="reset-current-round-settings"
                onClick={() => {
                  if (window.confirm("WARNING: Are you sure you want to reset the current round? All scores and history logs from the active round will be wiped! This cannot be undone.")) {
                    onResetCurrentRound();
                  }
                }}
                className="w-full py-2.5 px-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Current Round
              </button>

              <button
                id="reset-competition-settings"
                onClick={() => {
                  if (window.confirm("CRITICAL WARNING: Are you sure you want to reset the entire competition? This will reset ALL house scores to 0, wipe all history logs, and re-initialize questions for both categories! This is irreversible.")) {
                    onResetCompetition();
                  }
                }}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Scoreboard (All 0)
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
