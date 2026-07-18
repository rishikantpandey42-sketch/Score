import React from 'react';
import { HistoryItem, CompetitionConfig } from '../types';
import { History, RotateCcw, RotateCw, Trash2, Clock, Award } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  config: CompetitionConfig;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearHistory: () => void;
}

export default function HistoryPanel({
  history,
  config,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearHistory
}: HistoryPanelProps) {
  // Sort history items chronologically (latest first for display feed)
  const sortedHistory = [...history].reverse();

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col h-full" id="history-panel-container">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4" id="history-panel-header">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Action History</h2>
            <p className="text-slate-400 text-[11px]">Real-time audit log of all updates</p>
          </div>
        </div>

        {/* Undo/Redo Fast Controls */}
        <div className="flex items-center gap-1.5" id="history-fast-controls">
          <button
            id="history-undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last action (Ctrl+Z)"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="history-redo-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo action (Ctrl+Shift+Z)"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Timeline */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-4" id="history-timeline-scroll">
        {sortedHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center" id="history-empty-state">
            <Clock className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
            <p className="text-xs font-medium text-slate-400">No actions logged yet</p>
            <p className="text-[10px] text-slate-300 mt-0.5">Scoring actions will be tracked here</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-100 ml-3.5 pl-5 space-y-4 py-2" id="timeline-list">
            {sortedHistory.map((item, idx) => {
              const isRed = item.teamId === 'red';
              const isBlue = item.teamId === 'blue';
              const isGreen = item.teamId === 'green';
              const isYellow = item.teamId === 'yellow';
              const isSystem = item.teamId === 'system';

              // Decide dot color
              let dotBg = 'bg-slate-300';
              if (isRed) dotBg = 'bg-red-500';
              if (isBlue) dotBg = 'bg-blue-500';
              if (isGreen) dotBg = 'bg-green-500';
              if (isYellow) dotBg = 'bg-yellow-500';
              if (isSystem) dotBg = 'bg-slate-900';

              const teamName = !isSystem ? config.houseNames[item.teamId as 'red' | 'blue' | 'green' | 'yellow'] : 'System';

              return (
                <div key={item.id} className="relative group" id={`history-item-${item.id}`}>
                  {/* Outer absolute dot centered on line */}
                  <span className={`absolute -left-[25.5px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${dotBg} transition-transform group-hover:scale-110`}></span>
                  
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-700">
                          {teamName}
                        </span>
                        
                        {/* Point Badge */}
                        {item.points !== 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.points > 0 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {item.points > 0 ? `+${item.points}` : item.points}
                          </span>
                        )}

                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {item.round}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 shrink-0 text-right">
                      {item.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline Controls Footer */}
      {sortedHistory.length > 0 && (
        <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between text-xs" id="history-panel-footer">
          <span className="text-slate-400 font-medium">Total entries: {sortedHistory.length}</span>
          <button
            id="clear-history-btn"
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the logs and history? Score totals won't change but you won't be able to undo/redo previous steps.")) {
                onClearHistory();
              }
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-red-500 font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>
        </div>
      )}
    </div>
  );
}
