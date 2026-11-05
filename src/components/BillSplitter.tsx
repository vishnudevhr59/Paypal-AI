import React, { useState } from 'react';
import {
  Split,
  Plus,
  Trash2,
  Users,
  Percent,
  CheckCircle2,
  Copy,
  Check,
  Send,
  DollarSign,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PaymentOrder, SplitParticipant } from '../types';

interface BillSplitterProps {
  onPaySelfShare: (order: PaymentOrder) => void;
}

export const BillSplitter: React.FC<BillSplitterProps> = ({ onPaySelfShare }) => {
  const [billTitle, setBillTitle] = useState('Weekend Dinner at Osteria');
  const [subtotal, setSubtotal] = useState<number>(120.0);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [customTip, setCustomTip] = useState<string>('');
  const [participants, setParticipants] = useState<SplitParticipant[]>([
    {
      id: 'p1',
      name: 'You (Organizer)',
      amount: 47.2,
      isSelf: true,
      status: 'PENDING',
    },
    {
      id: 'p2',
      name: 'Alice Johnson',
      emailOrPhone: 'alice.j@example.com',
      amount: 47.2,
      isSelf: false,
      status: 'REQUESTED',
    },
    {
      id: 'p3',
      name: 'Bob Miller',
      emailOrPhone: 'bob.m@example.com',
      amount: 47.2,
      isSelf: false,
      status: 'PENDING',
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recalculate shares when subtotal, tip, or participants change
  const activeTipPercent = customTip ? parseFloat(customTip) || 0 : tipPercent;
  const tipAmount = (subtotal * activeTipPercent) / 100;
  const grandTotal = subtotal + tipAmount;
  const count = participants.length || 1;
  const perPersonShare = grandTotal / count;

  const handleApplyPreset = (title: string, amount: number, people: string[]) => {
    setBillTitle(title);
    setSubtotal(amount);
    setTipPercent(18);
    setCustomTip('');
    const newCount = people.length + 1;
    const share = (amount + (amount * 0.18)) / newCount;

    setParticipants([
      { id: 'p1', name: 'You (Organizer)', amount: share, isSelf: true, status: 'PENDING' },
      ...people.map((name, idx) => ({
        id: `p-${Date.now()}-${idx}`,
        name,
        amount: share,
        emailOrPhone: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        isSelf: false,
        status: 'PENDING' as const,
      })),
    ]);
  };

  const handleAddParticipant = () => {
    const newIdx = participants.length + 1;
    const newParticipant: SplitParticipant = {
      id: `p-${Date.now()}`,
      name: `Friend ${newIdx}`,
      amount: perPersonShare,
      isSelf: false,
      status: 'PENDING',
    };
    setParticipants([...participants, newParticipant]);
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus =
          p.status === 'PENDING'
            ? 'REQUESTED'
            : p.status === 'REQUESTED'
            ? 'SETTLED'
            : 'PENDING';
        return { ...p, status: nextStatus };
      })
    );
  };

  const copyPayPalLink = (participant: SplitParticipant) => {
    const link = `https://paypal.me/payapp/${perPersonShare.toFixed(2)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(participant.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Smart Bill & Expense Splitter</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
              P2P PayPal Settlement
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Split group receipts effortlessly, calculate exact tips, and generate instant PayPal payment requests.
          </p>
        </div>

        {/* Preset scenario chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleApplyPreset('Trattoria Dinner', 135, ['Dave', 'Sarah'])}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700"
          >
            🍕 Dinner ($135)
          </button>
          <button
            onClick={() => handleApplyPreset('Weekend Mountain Cabin', 480, ['Liam', 'Emma', 'Noah'])}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700"
          >
            🏡 Cabin ($480)
          </button>
          <button
            onClick={() => handleApplyPreset('Grocery Restock', 84.5, ['Roommate'])}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700"
          >
            🛒 Groceries ($84)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bill Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            1. Bill Breakdown
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Expense Title</label>
            <input
              type="text"
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Subtotal Amount ($ USD)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="number"
                step="0.01"
                value={subtotal}
                onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          {/* Tip Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tip Percentage</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[0, 15, 18, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    setTipPercent(pct);
                    setCustomTip('');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !customTip && tipPercent === pct
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Summary Math Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tip ({activeTipPercent}%):</span>
              <span className="font-mono text-slate-200">${tipAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800 text-sm">
              <span>Grand Total:</span>
              <span className="font-mono text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-400 font-bold pt-1 text-sm">
              <span>Each ({count} people):</span>
              <span className="font-mono">${perPersonShare.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay My Portion via Sandbox */}
          <button
            onClick={() =>
              onPaySelfShare({
                recipient: billTitle,
                amount: perPersonShare,
                currency: 'USD',
                category: 'Dining',
                memo: `My share of ${billTitle} ($${perPersonShare.toFixed(2)})`,
              })
            }
            className="w-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="font-black italic">Pay</span>Pal My Share (${perPersonShare.toFixed(2)})
          </button>
        </div>

        {/* Right Column: Participants & PayPal Settlement Links */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>2. Group Settlement Tracker ({participants.length})</span>
            </h3>
            <button
              onClick={handleAddParticipant}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Person</span>
            </button>
          </div>

          <div className="space-y-3">
            {participants.map((p, idx) => (
              <div
                key={p.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      p.isSelf
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      {p.isSelf && (
                        <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 text-[10px] rounded font-semibold">
                          Organizer
                        </span>
                      )}
                    </div>
                    {p.emailOrPhone && (
                      <span className="text-xs text-slate-500">{p.emailOrPhone}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      ${perPersonShare.toFixed(2)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <button
                    onClick={() => handleToggleStatus(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      p.status === 'SETTLED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : p.status === 'REQUESTED'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                    }`}
                    title="Click to toggle settlement status"
                  >
                    {p.status === 'SETTLED'
                      ? '✓ Settled'
                      : p.status === 'REQUESTED'
                      ? '⏳ Requested'
                      : '○ Pending'}
                  </button>

                  {/* Copy PayPal.Me Link */}
                  {!p.isSelf && (
                    <button
                      onClick={() => copyPayPalLink(p)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title="Copy PayPal payment request link"
                    >
                      {copiedId === p.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {!p.isSelf && (
                    <button
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0079C1]" />
              <span>Each link routes through PayPal P2P with exact pre-calculated amount.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
