/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Dices, Coins, Shuffle, Key } from 'lucide-react';

import { HistoryItem } from './types';
import NumbersTab from './components/NumbersTab';
import DiceTab from './components/DiceTab';
import CoinsTab from './components/CoinsTab';
import ListsTab from './components/ListsTab';
import PasswordsTab from './components/PasswordsTab';
import HistoryPanel from './components/HistoryPanel';

type TabType = 'numbers' | 'dice' | 'coins' | 'lists' | 'passwords';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('numbers');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem('rng_app_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Sync history to localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('rng_app_history', JSON.stringify(newHistory));
  };

  const handleAddHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const timeString = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeString,
    };
    const updated = [newItem, ...history].slice(0, 30); // Keep last 30 items
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'numbers', label: 'Numbers', icon: <Hash className="w-4 h-4" /> },
    { id: 'dice', label: 'Dice', icon: <Dices className="w-4 h-4" /> },
    { id: 'coins', label: 'Coins', icon: <Coins className="w-4 h-4" /> },
    { id: 'lists', label: 'Lists', icon: <Shuffle className="w-4 h-4" /> },
    { id: 'passwords', label: 'Passwords', icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Mesh Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10" id="app-wrapper">
        
        {/* Simple elegant title header */}
        <header className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6" id="app-header">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shuffle className="w-6 h-6 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Nexus<span className="text-indigo-400">RNG</span>
              </h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                Precision Randomizer Suite
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400/80 font-mono tracking-wider bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            ALGORITHM: <span className="text-indigo-400 font-bold">CRYPTO-STRONG</span>
          </div>
        </header>

        {/* Responsive dual column bento layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" id="app-main-grid">
          
          {/* Main workspace section */}
          <section className="lg:col-span-2 space-y-6" id="workspace-section">
            
            {/* Elegant Tab Navigation */}
            <nav className="flex flex-wrap p-1.5 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl shadow-xl" id="navigation-tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[90px] py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.35)] border border-indigo-400/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Active module container with visual layout animations */}
            <div className="relative" id="tab-content-wrapper">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {activeTab === 'numbers' && (
                    <NumbersTab onAddHistory={handleAddHistory} />
                  )}
                  {activeTab === 'dice' && (
                    <DiceTab onAddHistory={handleAddHistory} />
                  )}
                  {activeTab === 'coins' && (
                    <CoinsTab onAddHistory={handleAddHistory} />
                  )}
                  {activeTab === 'lists' && (
                    <ListsTab onAddHistory={handleAddHistory} />
                  )}
                  {activeTab === 'passwords' && (
                    <PasswordsTab onAddHistory={handleAddHistory} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Activity Logs panel column */}
          <section id="sidebar-section">
            <HistoryPanel history={history} onClearHistory={handleClearHistory} />
          </section>
        </main>

        <footer className="pt-6 border-t border-white/5 text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-medium select-none">
          <div className="flex gap-4">
            <span>SUITE: GENERAL PURPOSE</span>
            <span>STORAGE: SECURE LOCALSTORAGE</span>
          </div>
          <div>DESIGNED WITH FROSTED GLASS THEME v2.5.0</div>
        </footer>
      </div>
    </div>
  );
}
