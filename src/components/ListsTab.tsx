import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Sparkles, Copy, ClipboardCheck, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';

interface ListsTabProps {
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export default function ListsTab({ onAddHistory }: ListsTabProps) {
  const [inputText, setInputText] = useState<string>('');
  const [resultsMode, setResultsMode] = useState<'pick' | 'shuffle' | 'pairs'>('pick');
  const [winner, setWinner] = useState<string | null>(null);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [pairings, setPairings] = useState<[string, string][]>([]);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { label: 'Yes / No / Maybe', items: 'Yes\nNo\nMaybe' },
    { label: 'What to eat', items: 'Pizza\nTacos\nSushi\nSalad\nBurgers\nPasta' },
    { label: 'Sample Names', items: 'Alice\nBob\nCharlie\nDiana\nEthan\nFiona' },
  ];

  const parseItems = (): string[] => {
    return inputText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const loadPreset = (items: string) => {
    setInputText(items);
    setError(null);
    clearResults();
  };

  const clearResults = () => {
    setWinner(null);
    setShuffledItems([]);
    setPairings([]);
    setError(null);
  };

  const handleAction = () => {
    const items = parseItems();

    if (items.length === 0) {
      setError('Please add at least one item to the list.');
      return;
    }

    if (resultsMode === 'pairs' && items.length < 2) {
      setError('Need at least 2 items to generate pairings.');
      return;
    }

    setError(null);
    setIsShuffling(true);
    setCopied(false);

    let elapsed = 0;
    const duration = 700; // ms
    const intervalTime = 50;

    const interval = setInterval(() => {
      // Dynamic visual shuffling of current values
      if (resultsMode === 'pick') {
        const randIdx = Math.floor(Math.random() * items.length);
        setWinner(items[randIdx]);
      } else if (resultsMode === 'shuffle') {
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        setShuffledItems(shuffled);
      }
      elapsed += intervalTime;

      if (elapsed >= duration) {
        clearInterval(interval);

        const finalItems = [...items];

        if (resultsMode === 'pick') {
          const randIdx = Math.floor(Math.random() * finalItems.length);
          const chosen = finalItems[randIdx];
          setWinner(chosen);
          
          onAddHistory({
            type: 'list',
            result: `Picked Winner: "${chosen}"`,
            details: `From a list of ${items.length} items`,
          });
        } else if (resultsMode === 'shuffle') {
          // Fisher-Yates shuffle
          for (let i = finalItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalItems[i], finalItems[j]] = [finalItems[j], finalItems[i]];
          }
          setShuffledItems(finalItems);
          
          onAddHistory({
            type: 'list',
            result: `Shuffled List: ${finalItems.slice(0, 3).join(', ')}...`,
            details: `Shuffled ${items.length} total items`,
          });
        } else if (resultsMode === 'pairs') {
          // Shuffle first
          for (let i = finalItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalItems[i], finalItems[j]] = [finalItems[j], finalItems[i]];
          }
          
          const generatedPairs: [string, string][] = [];
          for (let i = 0; i < finalItems.length; i += 2) {
            if (i + 1 < finalItems.length) {
              generatedPairs.push([finalItems[i], finalItems[i + 1]]);
            } else {
              // Odd number: pair the last one with a placeholder or triple it
              generatedPairs.push([finalItems[i], 'Unpaired / Wildcard']);
            }
          }
          setPairings(generatedPairs);
          
          onAddHistory({
            type: 'list',
            result: `Pairs: ${generatedPairs.map(p => `(${p[0]} + ${p[1]})`).slice(0, 2).join(', ')}...`,
            details: `Paired ${items.length} items into ${generatedPairs.length} groups`,
          });
        }

        setIsShuffling(false);
      }
    }, intervalTime);
  };

  const copyToClipboard = () => {
    let textToCopy = '';
    if (resultsMode === 'pick' && winner) {
      textToCopy = winner;
    } else if (resultsMode === 'shuffle' && shuffledItems.length > 0) {
      textToCopy = shuffledItems.join('\n');
    } else if (resultsMode === 'pairs' && pairings.length > 0) {
      textToCopy = pairings.map((p) => `${p[0]} ↔ ${p[1]}`).join('\n');
    }

    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    clearResults();
  };

  return (
    <div className="space-y-6" id="lists-tab-container">
      {/* Input Form */}
      <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2.5">
            Quick List Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                id={`preset-list-${p.label.replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => loadPreset(p.items)}
                className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs rounded-lg border border-white/10 shadow-2xs transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
            Enter List Items (One per line)
          </label>
          <textarea
            id="list-textarea-input"
            rows={5}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError(null);
            }}
            placeholder="Enter values here..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans transition-colors placeholder-slate-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
            Choose Action Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['pick', 'shuffle', 'pairs'] as const).map((mode) => (
              <button
                key={mode}
                id={`btn-list-mode-${mode}`}
                type="button"
                onClick={() => {
                  setResultsMode(mode);
                  clearResults();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border capitalize transition-all text-center cursor-pointer ${
                  resultsMode === mode
                    ? 'bg-indigo-600 border-indigo-400/20 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {mode === 'pick' ? 'Pick One' : mode === 'shuffle' ? 'Shuffle All' : 'Pair Up'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium border border-red-500/20">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            id="btn-list-action"
            type="button"
            onClick={handleAction}
            disabled={isShuffling}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-[0_0_25px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {resultsMode === 'pick' ? (
              <>
                <Sparkles className="w-5 h-5" />
                PICK WINNER
              </>
            ) : resultsMode === 'shuffle' ? (
              <>
                <Shuffle className="w-5 h-5" />
                SHUFFLE LIST
              </>
            ) : (
              <>
                <Shuffle className="w-5 h-5" />
                GENERATE PAIRINGS
              </>
            )}
          </button>
          
          <button
            id="btn-list-clear"
            type="button"
            onClick={handleClear}
            title="Clear list and results"
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white active:scale-[0.98] p-3.5 rounded-2xl transition-all flex items-center justify-center cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results Canvas */}
      <div className="backdrop-blur-2xl bg-white/5 rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
        <AnimatePresence mode="wait">
          {!winner && shuffledItems.length === 0 && pairings.length === 0 ? (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-slate-400"
            >
              <Shuffle className="w-12 h-12 stroke-[1.25] mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">Ready to shuffle or select!</p>
              <p className="text-xs text-slate-500 mt-1">Input your custom list above and click the Action button.</p>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center flex flex-col items-center justify-center"
            >
              {/* Pick Mode Winner */}
              {resultsMode === 'pick' && winner && (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/25 inline-block">
                    Random Pick
                  </span>
                  <div className="relative pb-2 max-w-md mx-auto">
                    <motion.div
                      key={winner}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tight py-4 px-6 bg-white/10 border border-white/10 rounded-2xl shadow-inner select-all"
                    >
                      {winner}
                    </motion.div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-emerald-500 rounded-full blur-[2px]" />
                  </div>
                </div>
              )}

              {/* Shuffle Mode results */}
              {resultsMode === 'shuffle' && shuffledItems.length > 0 && (
                <div className="space-y-4 w-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                    Shuffled Output
                  </span>
                  <div className="flex flex-col gap-2 max-w-md mx-auto max-h-[220px] overflow-y-auto p-2 border border-white/10 rounded-2xl bg-white/5">
                    {shuffledItems.map((item, idx) => (
                      <motion.div
                        key={`${idx}-${item}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                        className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl border border-white/10 shadow-2xs"
                      >
                        <span className="text-xs font-bold text-indigo-400 w-5 text-right tabular-nums">
                          {idx + 1}.
                        </span>
                        <span className="text-sm font-semibold text-white text-left truncate flex-1 select-all">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pair up results */}
              {resultsMode === 'pairs' && pairings.length > 0 && (
                <div className="space-y-4 w-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                    Generated Pairs
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto max-h-[220px] overflow-y-auto p-2">
                    {pairings.map((pair, idx) => (
                      <motion.div
                        key={`${idx}-${pair[0]}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                        className="bg-white/5 px-4 py-3 rounded-xl border border-white/10 shadow-2xs flex items-center justify-between text-left"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Pair {idx + 1}</span>
                          <span className="text-sm font-bold text-white truncate select-all">{pair[0]}</span>
                        </div>
                        <div className="text-xs text-indigo-400 font-extrabold px-1 text-center">↔</div>
                        <div className="flex flex-col text-right truncate pl-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Pair {idx + 1}</span>
                          <span className="text-sm font-bold text-white truncate select-all">{pair[1]}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy Utility */}
              <div className="mt-6">
                <button
                  id="btn-copy-list"
                  type="button"
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    copied
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5'
                  }`}
                >
                  {copied ? (
                    <>
                      <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {resultsMode === 'pick' ? 'COPY WINNER' : resultsMode === 'shuffle' ? 'COPY SHUFFLED LIST' : 'COPY PAIRS'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
