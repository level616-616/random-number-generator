import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, RotateCcw } from 'lucide-react';
import { DiceType, DiceRollResult, HistoryItem } from '../types';

interface DiceTabProps {
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export default function DiceTab({ onAddHistory }: DiceTabProps) {
  const [selectedDie, setSelectedDie] = useState<DiceType>('d6');
  const [diceCount, setDiceCount] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [results, setResults] = useState<DiceRollResult[]>([]);
  const [rollSum, setRollSum] = useState<number>(0);

  const diceTypes: { type: DiceType; sides: number; label: string }[] = [
    { type: 'd4', sides: 4, label: 'D4' },
    { type: 'd6', sides: 6, label: 'D6' },
    { type: 'd8', sides: 8, label: 'D8' },
    { type: 'd10', sides: 10, label: 'D10' },
    { type: 'd12', sides: 12, label: 'D12' },
    { type: 'd20', sides: 20, label: 'D20' },
    { type: 'd100', sides: 100, label: 'D100' },
  ];

  const rollDice = () => {
    setIsRolling(true);

    const targetSides = diceTypes.find((d) => d.type === selectedDie)?.sides || 6;

    let elapsed = 0;
    const duration = 750; // roll duration in ms
    const intervalTime = 50;

    const interval = setInterval(() => {
      // Shuffling mock values
      const tempResults: DiceRollResult[] = [];
      for (let i = 0; i < diceCount; i++) {
        tempResults.push({
          die: selectedDie,
          value: Math.floor(Math.random() * targetSides) + 1,
        });
      }
      setResults(tempResults);
      setRollSum(tempResults.reduce((sum, item) => sum + item.value, 0));
      elapsed += intervalTime;

      if (elapsed >= duration) {
        clearInterval(interval);

        // Final results
        const finalResults: DiceRollResult[] = [];
        for (let i = 0; i < diceCount; i++) {
          finalResults.push({
            die: selectedDie,
            value: Math.floor(Math.random() * targetSides) + 1,
          });
        }
        const sum = finalResults.reduce((acc, curr) => acc + curr.value, 0);

        setResults(finalResults);
        setRollSum(sum);
        setIsRolling(false);

        // Save to global history
        const resultText = `${finalResults.map((r) => r.value).join(', ')} (Sum: ${sum})`;
        const detailsText = `Rolled ${diceCount}x ${selectedDie.toUpperCase()}`;
        onAddHistory({
          type: 'dice',
          result: resultText,
          details: detailsText,
        });
      }
    }, intervalTime);
  };

  const resetTab = () => {
    setSelectedDie('d6');
    setDiceCount(1);
    setResults([]);
    setRollSum(0);
  };

  // Render D6 Pip Configurations beautifully
  const renderD6Pips = (val: number) => {
    const pipClasses = "w-2.5 h-2.5 rounded-full bg-white shadow-xs";
    
    // Grid alignment index mapping
    const layouts: { [key: number]: number[] } = {
      1: [5],
      2: [1, 9],
      3: [1, 5, 9],
      4: [1, 3, 7, 9],
      5: [1, 3, 5, 7, 9],
      6: [1, 3, 4, 6, 7, 9],
    };

    const activePips = layouts[val] || [];

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-12 h-12 p-2 bg-white/10 rounded-xl border border-white/10 shadow-inner">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pos) => (
          <div key={pos} className="flex items-center justify-center">
            {activePips.includes(pos) && <div className={pipClasses} />}
          </div>
        ))}
      </div>
    );
  };

  // Render SVG polygon/shapes for other dice types
  const renderDieShape = (die: DiceType, val: number) => {
    const commonClass = "w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative";

    switch (die) {
      case 'd4':
        return (
          <div className={commonClass}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full fill-white/10 stroke-indigo-400 stroke-[4.5] stroke-linejoin-round">
              <polygon points="50,15 90,80 10,80" />
            </svg>
            <span className="relative z-10 text-xl font-extrabold text-white mt-4.5 tabular-nums select-all">{val}</span>
          </div>
        );
      case 'd6':
        return renderD6Pips(val);
      case 'd8':
        return (
          <div className={commonClass}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full fill-white/10 stroke-indigo-400 stroke-[3.5] stroke-linejoin-round">
              <polygon points="50,5 95,50 50,95 5,50" />
              <line x1="5" y1="50" x2="95" y2="50" />
              <line x1="50" y1="5" x2="50" y2="95" />
            </svg>
            <span className="relative z-10 text-xl font-extrabold text-white tabular-nums select-all">{val}</span>
          </div>
        );
      case 'd10':
        return (
          <div className={commonClass}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full fill-white/10 stroke-indigo-400 stroke-[3.5] stroke-linejoin-round">
              <polygon points="50,5 90,35 50,95 10,35" />
              <polygon points="50,35 90,35 50,95 10,35" fill="none" />
              <line x1="50" y1="5" x2="50" y2="35" />
            </svg>
            <span className="relative z-10 text-xl font-extrabold text-white -mt-2.5 tabular-nums select-all">{val}</span>
          </div>
        );
      case 'd12':
        return (
          <div className={commonClass}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full fill-white/10 stroke-indigo-400 stroke-[3.5] stroke-linejoin-round">
              <polygon points="50,5 92,30 76,82 24,82 8,30" />
              <polygon points="50,22 75,40 65,70 35,70 25,40" fill="none" />
              <line x1="50" y1="5" x2="50" y2="22" />
              <line x1="92" y1="30" x2="75" y2="40" />
              <line x1="76" y1="82" x2="65" y2="70" />
              <line x1="24" y1="82" x2="35" y2="70" />
              <line x1="8" y1="30" x2="25" y2="40" />
            </svg>
            <span className="relative z-10 text-lg font-extrabold text-white tabular-nums select-all">{val}</span>
          </div>
        );
      case 'd20':
        return (
          <div className={commonClass}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full fill-white/10 stroke-indigo-400 stroke-[3.25]" strokeLinejoin="round">
              <polygon points="50,5 93,30 93,70 50,95 7,70 7,30" />
              <polygon points="50,25 80,45 65,75 35,75 20,45" fill="none" />
              <line x1="50" y1="5" x2="50" y2="25" />
              <line x1="93" y1="30" x2="80" y2="45" />
              <line x1="93" y1="70" x2="65" y2="75" />
              <line x1="50" y1="95" x2="50" y2="75" />
              <line x1="7" y1="70" x2="35" y2="75" />
              <line x1="7" y1="30" x2="20" y2="45" />
            </svg>
            <span className="relative z-10 text-base font-extrabold text-white tabular-nums select-all">{val}</span>
          </div>
        );
      case 'd100':
        return (
          <div className="w-14 h-14 flex items-center justify-center bg-white/10 border border-indigo-400 rounded-full shadow-inner">
            <span className="text-xl font-extrabold text-white tabular-nums select-all">{val}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="dice-tab-container">
      {/* Configuration Form */}
      <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-3">
            Select Die Type
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {diceTypes.map((die) => {
              const isSelected = selectedDie === die.type;
              return (
                <button
                  key={die.type}
                  id={`dice-select-${die.type}`}
                  type="button"
                  onClick={() => setSelectedDie(die.type)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400/20 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{die.label}</span>
                  <span className="text-[9px] opacity-60 font-semibold">{die.sides} sides</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
            Number of Dice to Roll ({diceCount})
          </label>
          <div className="flex items-center gap-4">
            <input
              id="dice-count-slider"
              type="range"
              min="1"
              max="12"
              value={diceCount}
              onChange={(e) => setDiceCount(parseInt(e.target.value, 10))}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex border border-white/10 rounded-xl bg-white/5 overflow-hidden w-28 shadow-2xs">
              <button
                id="dice-count-dec"
                type="button"
                onClick={() => setDiceCount((prev) => Math.max(1, prev - 1))}
                className="w-1/3 py-2 text-slate-400 hover:bg-white/5 active:bg-white/10 font-bold border-r border-white/10 cursor-pointer"
              >
                -
              </button>
              <div className="w-1/3 py-2 text-center font-bold text-white text-sm select-none flex items-center justify-center">
                {diceCount}
              </div>
              <button
                id="dice-count-inc"
                type="button"
                onClick={() => setDiceCount((prev) => Math.min(12, prev + 1))}
                className="w-1/3 py-2 text-slate-400 hover:bg-white/5 active:bg-white/10 font-bold border-l border-white/10 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            id="btn-roll-dice"
            type="button"
            onClick={rollDice}
            disabled={isRolling}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-[0_0_25px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-bounce' : ''}`} />
            {isRolling ? 'Rolling Dice...' : 'ROLL DICE'}
          </button>
          
          <button
            id="btn-reset-dice"
            type="button"
            onClick={resetTab}
            title="Reset"
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white active:scale-[0.98] p-3.5 rounded-2xl transition-all flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Roller Canvas */}
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
              <Dices className="w-12 h-12 stroke-[1.25] mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">Ready to roll the dice!</p>
              <p className="text-xs text-slate-500 mt-1">Select your favorite die and rolling count above.</p>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center space-y-6 flex flex-col items-center justify-center"
            >
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-h-[240px] overflow-y-auto p-4 w-full">
                {results.map((roll, idx) => (
                  <motion.div
                    key={`${idx}-${roll.value}`}
                    initial={{
                      scale: 0.3,
                      rotate: Math.random() * 360 - 180,
                      x: Math.random() * 40 - 20,
                      y: Math.random() * 40 - 20,
                    }}
                    animate={{
                      scale: 1,
                      rotate: isRolling ? Math.random() * 720 - 360 : 0,
                      x: 0,
                      y: 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 180,
                      damping: 15,
                    }}
                    className="p-1.5 flex flex-col items-center gap-1.5 relative"
                  >
                    {/* Visual die container */}
                    <div className="drop-shadow-[0_0_15px_rgba(129,140,248,0.2)] rounded-2xl transition-all hover:scale-110">
                      {renderDieShape(roll.die, roll.value)}
                    </div>
                  </motion.div>
                ))}
              </div>

              {diceCount > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-black flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.35)] border border-indigo-400/25"
                >
                  <span className="text-xs uppercase font-bold text-indigo-200 tracking-wider">Total Sum:</span>
                  <span className="text-lg tabular-nums">{rollSum}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
