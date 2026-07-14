import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, ClipboardCheck, Shuffle, RotateCcw, Info } from 'lucide-react';
import { HistoryItem } from '../types';

interface NumbersTabProps {
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export default function NumbersTab({ onAddHistory }: NumbersTabProps) {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(1);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(false);
  const [sortResults, setSortResults] = useState<'none' | 'asc' | 'desc'>('none');
  const [excludeInput, setExcludeInput] = useState<string>('');
  
  const [results, setResults] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset ranges
  const presets = [
    { label: '1 - 10', min: 1, max: 10 },
    { label: '1 - 100', min: 1, max: 100 },
    { label: '1 - 1000', min: 1, max: 1000 },
    { label: '0 - 9', min: 0, max: 9 },
  ];

  const applyPreset = (pMin: number, pMax: number) => {
    setMin(pMin);
    setMax(pMax);
    setError(null);
  };

  const handleGenerate = () => {
    // Validate inputs
    if (min >= max) {
      setError('Minimum value must be strictly less than maximum value.');
      return;
    }
    if (count < 1) {
      setError('Count must be at least 1.');
      return;
    }
    if (count > 500) {
      setError('You can generate up to 500 numbers at once.');
      return;
    }

    // Parse excluded numbers
    const excluded = excludeInput
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n));

    // Calculate pool size
    const availableNumbers = max - min + 1;
    const poolSize = availableNumbers - excluded.filter((n) => n >= min && n <= max).length;

    if (!allowDuplicates && count > poolSize) {
      setError(
        `Cannot generate ${count} unique numbers. Only ${poolSize} available in range [${min}, ${max}] after exclusions.`
      );
      return;
    }

    setError(null);
    setIsGenerating(true);
    setCopied(false);

    // Dynamic visual shuffle effect
    let elapsed = 0;
    const duration = 600; // ms
    const intervalTime = 40; // ms

    const shuffleInterval = setInterval(() => {
      const tempResults: number[] = [];
      for (let i = 0; i < Math.min(count, 30); i++) {
        tempResults.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      setResults(tempResults);
      elapsed += intervalTime;

      if (elapsed >= duration) {
        clearInterval(shuffleInterval);
        
        // Generate actual final numbers
        const finalResults: number[] = [];
        const excludedSet = new Set(excluded);

        if (allowDuplicates) {
          while (finalResults.length < count) {
            const rand = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!excludedSet.has(rand)) {
              finalResults.push(rand);
            }
          }
        } else {
          const pool: number[] = [];
          for (let i = min; i <= max; i++) {
            if (!excludedSet.has(i)) {
              pool.push(i);
            }
          }
          // Fisher-Yates shuffle
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
          for (let i = 0; i < count; i++) {
            finalResults.push(pool[i]);
          }
        }

        // Apply sorting
        if (sortResults === 'asc') {
          finalResults.sort((a, b) => a - b);
        } else if (sortResults === 'desc') {
          finalResults.sort((a, b) => b - a);
        }

        setResults(finalResults);
        setIsGenerating(false);

        // Save to global history
        const resultText = finalResults.join(', ');
        const detailsText = `Range: [${min}, ${max}] | Count: ${count}${
          allowDuplicates ? ' | Duplicates allowed' : ''
        }${sortResults !== 'none' ? ` | Sorted ${sortResults}` : ''}`;
        onAddHistory({
          type: 'number',
          result: resultText,
          details: detailsText,
        });
      }
    }, intervalTime);
  };

  const copyToClipboard = () => {
    if (results.length === 0) return;
    navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMin(1);
    setMax(100);
    setCount(1);
    setAllowDuplicates(false);
    setSortResults('none');
    setExcludeInput('');
    setResults([]);
    setError(null);
    setCopied(false);
  };

  return (
    <div className="space-y-6" id="numbers-tab-container">
      {/* Configuration Form */}
      <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-3">
            Quick Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => {
              const isSelected = min === p.min && max === p.max;
              return (
                <button
                  key={p.label}
                  id={`preset-${p.label.replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => applyPreset(p.min, p.max)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400/20 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Minimum (Min)
            </label>
            <input
              id="num-min-input"
              type="number"
              value={min}
              onChange={(e) => setMin(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Maximum (Max)
            </label>
            <input
              id="num-max-input"
              type="number"
              value={max}
              onChange={(e) => setMax(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quantity
            </label>
            <input
              id="num-count-input"
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center transition-colors"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3.5">Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duplicates & Exclude */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer group" id="dup-toggle-container">
                <input
                  id="allow-duplicates-checkbox"
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 border-white/10 bg-white/5 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-300 group-hover:text-white select-none transition-colors">
                  Allow Duplicate Numbers
                </span>
              </label>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                  Exclude Numbers
                  <span className="group relative">
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-md shadow-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                      Separate numbers by commas (e.g., 5,13,17)
                    </span>
                  </span>
                </label>
                <input
                  id="exclude-input"
                  type="text"
                  placeholder="e.g. 13, 44, 7"
                  value={excludeInput}
                  onChange={(e) => setExcludeInput(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-hidden focus:border-indigo-500 placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            {/* Sorting */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Sort Sequence
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'asc', 'desc'] as const).map((mode) => (
                  <button
                    key={mode}
                    id={`sort-mode-${mode}`}
                    type="button"
                    onClick={() => setSortResults(mode)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border capitalize transition-all text-center cursor-pointer ${
                      sortResults === mode
                        ? 'bg-indigo-600 border-indigo-400/20 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {mode === 'none' ? 'No Sort' : mode === 'asc' ? 'Asc' : 'Desc'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium border border-red-500/20 flex items-start gap-2"
          >
            <span className="font-bold">Error:</span> {error}
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            id="btn-generate-numbers"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-[0_0_25px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Shuffle className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'GENERATE NEW'}
          </button>
          
          <button
            id="btn-reset-numbers"
            type="button"
            onClick={handleReset}
            title="Reset to defaults"
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white active:scale-[0.98] p-3.5 rounded-2xl transition-all flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Result Display Canvas */}
      <div className="backdrop-blur-2xl bg-white/5 rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
        <AnimatePresence mode="wait">
          {results.length === 0 ? (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-slate-400"
            >
              <Shuffle className="w-12 h-12 stroke-[1.25] mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">Ready to roll the digits!</p>
              <p className="text-xs text-slate-500 mt-1">Configure options above and click generate.</p>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center flex flex-col items-center justify-center"
            >
              {/* Single Number Hero style */}
              {results.length === 1 ? (
                <div className="space-y-2 relative pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                    Current Result
                  </span>
                  <div className="relative">
                    <motion.div
                      key={results[0]}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 tracking-tighter tabular-nums drop-shadow-md select-all"
                    >
                      {results[0]}
                    </motion.div>
                    {/* Glowing highlight line */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-40 h-1.5 bg-indigo-500 rounded-full blur-[2px]" />
                  </div>
                </div>
              ) : (
                /* Multiple Numbers Grid style */
                <div className="space-y-4 w-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                    Generated Results ({results.length})
                  </span>
                  <div className="flex flex-wrap justify-center gap-3 max-h-[240px] overflow-y-auto p-2">
                    {results.map((num, idx) => (
                      <motion.div
                        key={`${idx}-${num}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: Math.min(idx * 0.015, 0.3) }}
                        className="min-w-12 h-12 px-3.5 flex items-center justify-center bg-white/10 border border-white/10 text-white rounded-xl text-lg font-bold shadow-xs tabular-nums hover:bg-white/15 transition-colors"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Utility actions for result */}
              <div className="mt-6 flex justify-center gap-2">
                <button
                  id="btn-copy-numbers"
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
                      COPY RESULT
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
