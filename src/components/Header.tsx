import React from 'react';
import { ShieldCheck, Zap, KeyRound, Bot, Split, RefreshCw, History, Terminal } from 'lucide-react';
import { PayPalConfig } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  paypalConfig: PayPalConfig | null;
  onOpenSettings: () => void;
  transactionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  paypalConfig,
  onOpenSettings,
  transactionCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003087] via-[#0079C1] to-[#00457C] shadow-lg shadow-blue-500/20 text-white font-extrabold text-xl tracking-tight">
              <span>P</span>
              <span className="text-yellow-400 -ml-0.5">P</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Pay<span className="text-[#0079C1]">app</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                  AI Hackathon
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Intelligent Payment Companion & Financial Copilot
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'copilot'
                  ? 'bg-[#0079C1] text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-[#0079C1] text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Subscription Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('splitter')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'splitter'
                  ? 'bg-[#0079C1] text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Smart Split</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-[#0079C1] text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Orders ({transactionCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('developer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'developer'
                  ? 'bg-[#0079C1] text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Judge & Dev Console</span>
            </button>
          </nav>

          {/* Right Controls: Sandbox Status & Settings */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              title="Configure PayPal Sandbox Credentials"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  paypalConfig?.hasLiveCreds ? 'bg-emerald-400' : 'bg-yellow-400'
                }`}
              />
              <span className="hidden sm:inline">
                {paypalConfig?.hasLiveCreds ? 'PayPal Live Sandbox' : 'Sandbox Simulator'}
              </span>
              <KeyRound className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto space-x-1">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'copilot' ? 'bg-[#0079C1] text-white' : 'text-slate-400'
            }`}
          >
            AI Copilot
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'subscriptions' ? 'bg-[#0079C1] text-white' : 'text-slate-400'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('splitter')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'splitter' ? 'bg-[#0079C1] text-white' : 'text-slate-400'
            }`}
          >
            Smart Split
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'transactions' ? 'bg-[#0079C1] text-white' : 'text-slate-400'
            }`}
          >
            Orders ({transactionCount})
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'developer' ? 'bg-[#0079C1] text-white' : 'text-slate-400'
            }`}
          >
            Dev Console
          </button>
        </div>
      </div>
    </header>
  );
};
