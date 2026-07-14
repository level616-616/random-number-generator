import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Copy, ClipboardCheck, RotateCw } from 'lucide-react';
import { HistoryItem } from '../types';

interface PasswordsTabProps {
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export default function PasswordsTab({ onAddHistory }: PasswordsTabProps) {
  const [length, setLength] = useState<number>(16);
  const [useUppercase, setUseUppercase] = useState<boolean>(true);
  const [useLowercase, setUseLowercase] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [excludeConfusing, setExcludeConfusing] = useState<boolean>(false);

  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [strengthInfo, setStrengthInfo] = useState<{ score: number; text: string; color: string }>({
    score: 0,
    text: '',
    color: 'bg-slate-200',
  });

  const generatePassword = () => {
    let charset = '';
    let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowercase = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeConfusing) {
      // Exclude l, 1, I, o, 0, O etc.
      uppercase = uppercase.replace(/[IO]/g, '');
      lowercase = lowercase.replace(/[lo]/g, '');
      numbers = numbers.replace(/[01]/g, '');
    }

    if (useUppercase) charset += uppercase;
    if (useLowercase) charset += lowercase;
    if (useNumbers) charset += numbers;
    if (useSymbols) charset += symbols;

    if (!charset) {
      setPassword('');
      return;
    }

    let generated = '';
    // Ensure at least one character from each selected set is in the password (optional, let's keep it simple and clean)
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generated += charset[randomIndex];
    }

    setPassword(generated);
    setCopied(false);

    // Save to history log silently
    onAddHistory({
      type: 'password',
      result: `${generated.slice(0, 3)}... (Length: ${length})`,
      details: `Generated secure string of length ${length}`,
    });
  };

  // Evaluate password strength
  useEffect(() => {
    if (!password) {
      setStrengthInfo({ score: 0, text: 'No Password', color: 'bg-white/10' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 14) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Normalize to 1-4
    let strengthScore = 1;
    if (score >= 5) strengthScore = 4; // Strong
    else if (score >= 4) strengthScore = 3; // Good
    else if (score >= 3) strengthScore = 2; // Fair
    else strengthScore = 1; // Weak

    let text = 'Weak';
    let color = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    if (strengthScore === 2) {
      text = 'Fair';
      color = 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
    } else if (strengthScore === 3) {
      text = 'Good';
      color = 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]';
    } else if (strengthScore === 4) {
      text = password.length >= 20 ? 'Military Grade' : 'Strong';
      color = password.length >= 20 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
    }

    setStrengthInfo({ score: strengthScore, text, color });
  }, [password]);

  // Generate a password on first load or when checkboxes toggle
  useEffect(() => {
    generatePassword();
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeConfusing]);

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="passwords-tab-container">
      {/* Settings Form */}
      <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2.5">
            Password Length ({length} characters)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="pwd-length-slider"
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex border border-white/10 rounded-xl bg-white/5 overflow-hidden w-28 shadow-2xs">
              <button
                id="pwd-length-dec"
                type="button"
                onClick={() => setLength((prev) => Math.max(6, prev - 1))}
                className="w-1/3 py-2 text-slate-400 hover:bg-white/5 active:bg-white/10 font-bold border-r border-white/10 cursor-pointer"
              >
                -
              </button>
              <div className="w-1/3 py-2 text-center font-bold text-white text-sm select-none flex items-center justify-center">
                {length}
              </div>
              <button
                id="pwd-length-inc"
                type="button"
                onClick={() => setLength((prev) => Math.min(64, prev + 1))}
                className="w-1/3 py-2 text-slate-400 hover:bg-white/5 active:bg-white/10 font-bold border-l border-white/10 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-3">
            Include Characters
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer group" id="check-upper-lbl">
              <input
                id="pwd-use-upper"
                type="checkbox"
                checked={useUppercase}
                onChange={(e) => setUseUppercase(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-600 border-white/10 bg-white/5 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white select-none transition-colors">
                Uppercase (A-Z)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group" id="check-lower-lbl">
              <input
                id="pwd-use-lower"
                type="checkbox"
                checked={useLowercase}
                onChange={(e) => setUseLowercase(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-600 border-white/10 bg-white/5 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white select-none transition-colors">
                Lowercase (a-z)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group" id="check-num-lbl">
              <input
                id="pwd-use-num"
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-600 border-white/10 bg-white/5 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white select-none transition-colors">
                Numbers (0-9)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group" id="check-symbol-lbl">
              <input
                id="pwd-use-symbol"
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-600 border-white/10 bg-white/5 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white select-none transition-colors">
                Symbols (!@#$%)
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <label className="flex items-center space-x-3 cursor-pointer group" id="check-confusing-lbl">
            <input
              id="pwd-exclude-confusing"
              type="checkbox"
              checked={excludeConfusing}
              onChange={(e) => setExcludeConfusing(e.target.checked)}
              className="w-4 h-4 rounded-sm text-indigo-600 border-white/10 bg-white/5 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-300 group-hover:text-white select-none transition-colors">
              Exclude Confusing Characters (e.g., 1, l, O, 0)
            </span>
          </label>
        </div>

        <button
          id="btn-regenerate-password"
          type="button"
          onClick={generatePassword}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-[0_0_25px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCw className="w-5 h-5" />
          REGENERATE PASSWORD
        </button>
      </div>

      {/* Result Display Canvas */}
      <div className="backdrop-blur-2xl bg-white/5 rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
        <AnimatePresence mode="wait">
          {!password ? (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-slate-400"
            >
              <Key className="w-12 h-12 stroke-[1.25] mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">No character set selected</p>
              <p className="text-xs text-slate-500 mt-1">Please check at least one character type above.</p>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-center space-y-5"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Generated Secure Key
              </span>

              {/* Password text rendering */}
              <div className="px-5 py-4 bg-white/10 border border-white/10 rounded-2xl max-w-xl mx-auto break-all font-mono text-base sm:text-lg font-bold text-white tracking-wider flex items-center justify-center select-all shadow-inner">
                {password}
              </div>

              {/* Strength Meter */}
              <div className="max-w-xs mx-auto space-y-2" id="strength-meter-container">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Strength:</span>
                  <span className="uppercase text-[10px] tracking-widest font-extrabold text-white">
                    {strengthInfo.text}
                  </span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 transition-all duration-350 ${
                        step <= strengthInfo.score ? strengthInfo.color : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Copy action */}
              <div className="flex justify-center pt-2">
                <button
                  id="btn-copy-password"
                  type="button"
                  onClick={copyToClipboard}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    copied
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5'
                  }`}
                >
                  {copied ? (
                    <>
                      <ClipboardCheck className="w-4.5 h-4.5 text-emerald-400" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4.5 h-4.5" />
                      COPY PASSWORD
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
