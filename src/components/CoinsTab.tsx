import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, RotateCcw } from 'lucide-react';
import { HistoryItem } from '../types';

interface CoinsTabProps {
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export default function CoinsTab({ onAddHistory }: CoinsTabProps) {
  const [coinCount, setCoinCount] = useState<number>(1);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [results, setResults] = useState<('Heads' | 'Tails')[]>([]);
  
  // Local Stats counter
  const [stats, setStats] = useState({
    total: 0,
    heads: 0,
    tails: 0,
  });

  const flipCoins = () => {
    setIsFlipping(true);

    let elapsed = 0;
    const duration = 800; // ms
    const intervalTime = 60; // ms

    const interval = setInterval(() => {
      // Shuffling temp results
      const tempResults: ('Heads' | 'Tails')[] = [];
      for (let i = 0; i < coinCount; i++) {
        tempResults.push(Math.random() < 0.5 ? 'Heads' : 'Tails');
      }
      setResults(tempResults);
      elapsed += intervalTime;

      if (elapsed >= duration) {
        clearInterval(interval);

        // Final results
        const finalResults: ('Heads' | 'Tails')[] = [];
        let headsAdd = 0;
        let tailsAdd = 0;

        for (let i = 0; i < coinCount; i++) {
          const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';
          finalResults.push(outcome);
          if (outcome === 'Heads') headsAdd++;
          else tailsAdd++;
        }

        setResults(finalResults);
        setStats((prev) => ({
          total: prev.total + coinCount,
          heads: prev.heads + headsAdd,
          tails: prev.tails + tailsAdd,
        }));
        setIsFlipping(false);

        // Save to global history
        const resultText = finalResults.join(', ');
        const detailsText = `Flipped ${coinCount} coin${coinCount > 1 ? 's' : ''}`;
        onAddHistory({
          type: 'coin',
          result: resultText,
          details: detailsText,
        });
      }
    }, intervalTime);
  };

  const resetStats = () => {
    setStats({ total: 0, heads: 0, tails: 0 });
    setResults([]);
  };

  const getPercentage = (value: number) => {
    if (stats.total === 0) return 0;
    return Math.round((value / stats.total) * 100);
  };

  return (
    <div className="space-y-6" id="coins-tab-container">
      {/* Configuration Form */}
      <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
            Number of Coins ({coinCount})
          </label>
          <div className="flex items-center gap-4">
            <input
              id="coin-count-slider"
              type="range"
              min="1"
              max="10"
              value={coinCount}
              onChange={(e) => setCoinCount(parseInt(e.target.value, 10))}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex border border-white/10 rounded-xl bg-white/5 overflow-hidden w-28 shadow-2xs">
              <button
                id="coin-count-dec"
                type="button"
                onClick={() => setCoinCount((prev) => Math.max(1, prev - 1))}
                className="w-1/3 py-2 text-slate-400 hover:bg-white/5 active:bg-white/10 font-bold border-r border-white/10 cursor-pointer"
              >
                -
              </button>
              <div className="w-1/3 py-2 text-center font-bold text-white text-sm select-none flex items-center justify-center">
                {coinCount}
              </div>
              <button
                id="coin-count-inc"
                type="button"
                onClick={() => setCoinCount((prev) => Math.min(10, prev + 1))}
                className="w-1/3 py-2 text-slate-400 hover:bg-white/5 active:bg-white/10 font-bold border-l border-white/10 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            id="btn-flip-coins"
            type="button"
            onClick={flipCoins}
            disabled={isFlipping}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-[0_0_25px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Coins className={`w-5 h-5 ${isFlipping ? 'animate-spin' : ''}`} />
            {isFlipping ? 'Flipping Coins...' : 'FLIP COINS'}
          </button>
          
          <button
            id="btn-reset-coin-stats"
            type="button"
            onClick={resetStats}
            title="Reset Stats"
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white active:scale-[0.98] p-3.5 rounded-2xl transition-all flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
          id="coin-stats-bar"
        >
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-3.5 rounded-2xl text-center shadow-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Flips</span>
            <span className="text-xl font-extrabold text-white tabular-nums">{stats.total}</span>
          </div>
          <div className="backdrop-blur-xl bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-center shadow-md">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Heads</span>
            <span className="text-xl font-extrabold text-amber-300 tabular-nums">
              {stats.heads} <span className="text-xs font-semibold opacity-75">({getPercentage(stats.heads)}%)</span>
            </span>
          </div>
          <div className="backdrop-blur-xl bg-slate-500/10 border border-slate-500/20 p-3.5 rounded-2xl text-center shadow-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tails</span>
            <span className="text-xl font-extrabold text-slate-300 tabular-nums">
              {stats.tails} <span className="text-xs font-semibold opacity-75">({getPercentage(stats.tails)}%)</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* Coins Canvas */}
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
              <Coins className="w-12 h-12 stroke-[1.25] mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">Ready to flip!</p>
              <p className="text-xs text-slate-500 mt-1">Pick coin count and spin the heads and tails.</p>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-wrap justify-center gap-6 sm:gap-8 max-h-[240px] overflow-y-auto p-4"
            >
              {results.map((outcome, idx) => (
                <motion.div
                  key={`${idx}-${outcome}`}
                  animate={{
                    rotateY: isFlipping ? [0, 360, 720, 1080, 1440] : 0,
                    y: isFlipping ? [-20, -50, -20, 0] : 0,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeInOut',
                  }}
                  className="relative cursor-pointer select-none pb-4"
                >
                  {/* Detailed Vector Coins */}
                  {outcome === 'Heads' ? (
                    // Gold Crown Head Coin
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 border-2 border-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10 relative group">
                      <div className="absolute inset-1 rounded-full border border-dashed border-amber-100 opacity-60" />
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-600/30 flex items-center justify-center">
                        <span className="text-amber-9 text-base font-black select-none">H</span>
                      </div>
                      <span className="absolute bottom-[-18px] left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-amber-400 tracking-wider">
                        HEADS
                      </span>
                    </div>
                  ) : (
                    // Silver Crest Tail Coin
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-slate-300 via-slate-100 to-slate-500 border-2 border-slate-500 flex items-center justify-center shadow-lg shadow-slate-500/10 relative group">
                      <div className="absolute inset-1 rounded-full border border-dashed border-slate-200 opacity-60" />
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border border-slate-500/30 flex items-center justify-center">
                        <span className="text-slate-800 text-base font-black select-none">T</span>
                      </div>
                      <span className="absolute bottom-[-18px] left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-slate-400 tracking-wider">
                        TAILS
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
