import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Dices, Coins, Shuffle, Key, Trash2, Copy, Check } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export default function HistoryPanel({ history, onClearHistory }: HistoryPanelProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const getIcon = (type: HistoryItem['type']) => {
    const classStr = "w-4 h-4 text-indigo-400";
    switch (type) {
      case 'number':
        return <Hash className={classStr} />;
      case 'dice':
        return <Dices className={classStr} />;
      case 'coin':
        return <Coins className={classStr} />;
      case 'list':
        return <Shuffle className={classStr} />;
      case 'password':
        return <Key className={classStr} />;
      default:
        return null;
    }
  };

  const handleCopyItem = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="backdrop-blur-2xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4" id="history-panel-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 uppercase tracking-widest">Activity Log</h3>
          <span className="text-[10px] font-extrabold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
            {history.length}
          </span>
        </div>
        
        {history.length > 0 && (
          <button
            id="btn-clear-history"
            type="button"
            onClick={onClearHistory}
            className="text-xs font-extrabold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR ALL
          </button>
        )}
      </div>

      <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2.5">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center text-slate-500 text-xs font-semibold"
            >
              No activities logged yet.
            </motion.div>
          ) : (
            history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-start gap-3 transition-all group relative"
              >
                {/* Mode Icon circle */}
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      {item.type}
                    </span>
                    <span className="text-[9px] text-slate-500 tabular-nums">
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white truncate select-all">
                    {item.result}
                  </div>
                  {item.details && (
                    <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {item.details}
                    </div>
                  )}
                </div>

                {/* Instant copy button on hover */}
                <button
                  type="button"
                  onClick={() => handleCopyItem(item.id, item.result)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-1.5 rounded-lg border border-white/10 shadow-md cursor-pointer"
                  title="Copy result"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
