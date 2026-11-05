import React, { useState } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SubscriptionItem, PaymentOrder } from '../types';

interface SubscriptionAuditProps {
  onPaySubscription: (order: PaymentOrder) => void;
}

export const SubscriptionAudit: React.FC<SubscriptionAuditProps> = ({ onPaySubscription }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([
    {
      id: 'sub-1',
      name: 'Netflix Premium (4K UHD)',
      cost: 22.99,
      billingCycle: 'MONTHLY',
      category: 'Streaming',
      status: 'PRICE_INCREASED',
      reason: 'Silent price creep: increased by 21% from $18.99 earlier this year.',
      lastCharged: '2026-10-15',
      nextRenewal: '2026-11-15',
    },
    {
      id: 'sub-2',
      name: 'Metro City Gym & Fitness',
      cost: 49.99,
      billingCycle: 'MONTHLY',
      category: 'Fitness',
      status: 'UNUSED_CANDIDATE',
      reason: 'High cancellation candidate: 0 check-ins logged in past 45 days.',
      lastCharged: '2026-10-01',
      nextRenewal: '2026-11-01',
    },
    {
      id: 'sub-3',
      name: 'Spotify Family Plan',
      cost: 16.99,
      billingCycle: 'MONTHLY',
      category: 'Streaming',
      status: 'ACTIVE',
      reason: 'Actively used across 4 family members. Good value per capita.',
      lastCharged: '2026-10-20',
      nextRenewal: '2026-11-20',
    },
    {
      id: 'sub-4',
      name: 'AWS Cloud Dev Tier',
      cost: 38.50,
      billingCycle: 'MONTHLY',
      category: 'Cloud',
      status: 'ESSENTIAL',
      reason: 'Critical production hosting for microservices & databases.',
      lastCharged: '2026-10-28',
      nextRenewal: '2026-11-28',
    },
    {
      id: 'sub-5',
      name: 'Adobe Creative Cloud',
      cost: 54.99,
      billingCycle: 'MONTHLY',
      category: 'Productivity',
      status: 'UNUSED_CANDIDATE',
      reason: 'Low usage frequency: opened only twice in last 30 days.',
      lastCharged: '2026-10-12',
      nextRenewal: '2026-11-12',
    },
    {
      id: 'sub-6',
      name: 'Google One 2TB Backup',
      cost: 9.99,
      billingCycle: 'MONTHLY',
      category: 'Cloud',
      status: 'ESSENTIAL',
      reason: '78% quota consumed. Essential photo & cloud storage.',
      lastCharged: '2026-10-05',
      nextRenewal: '2026-11-05',
    },
  ]);

  const [filter, setFilter] = useState<'ALL' | 'FLAGGED' | 'ACTIVE' | 'CANCELLED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSub, setNewSub] = useState({
    name: '',
    cost: '',
    category: 'Streaming' as SubscriptionItem['category'],
    billingCycle: 'MONTHLY' as SubscriptionItem['billingCycle'],
  });

  // Calculate metrics
  const activeSubs = subscriptions.filter((s) => s.status !== 'CANCELLED');
  const monthlyBurn = activeSubs.reduce((acc, curr) => acc + curr.cost, 0);
  const annualBurn = monthlyBurn * 12;

  const flaggedSubs = subscriptions.filter(
    (s) => s.status === 'UNUSED_CANDIDATE' || s.status === 'PRICE_INCREASED'
  );
  const potentialSavings = flaggedSubs.reduce((acc, curr) => acc + curr.cost, 0);

  const handleCancelSub = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === 'CANCELLED' ? 'ACTIVE' : 'CANCELLED',
              reason: s.status === 'CANCELLED' ? undefined : 'Flagged for cancellation by user to eliminate waste.',
            }
          : s
      )
    );
  };

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.name || !newSub.cost) return;

    const item: SubscriptionItem = {
      id: `sub-${Date.now()}`,
      name: newSub.name,
      cost: parseFloat(newSub.cost),
      category: newSub.category,
      billingCycle: newSub.billingCycle,
      status: 'ACTIVE',
      lastCharged: new Date().toISOString().split('T')[0],
      nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Manually logged subscription tracker.',
    };

    setSubscriptions((prev) => [item, ...prev]);
    setNewSub({ name: '', cost: '', category: 'Streaming', billingCycle: 'MONTHLY' });
    setShowAddModal(false);
  };

  const filteredSubs = subscriptions.filter((s) => {
    if (filter === 'FLAGGED') return s.status === 'UNUSED_CANDIDATE' || s.status === 'PRICE_INCREASED';
    if (filter === 'ACTIVE') return s.status === 'ACTIVE' || s.status === 'ESSENTIAL';
    if (filter === 'CANCELLED') return s.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner & Pitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Subscription Fatigue Guard</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded">
              Anti-Drain Shield
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detect hidden micro-charges, silent price creep, and unused recurring services before they bill again.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-3.5 py-2 bg-[#0079C1] hover:bg-[#00609C] text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Monthly Burn</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </span>
          <div className="text-2xl font-extrabold text-white">${monthlyBurn.toFixed(2)}</div>
          <p className="text-[11px] text-slate-500">Across {activeSubs.length} active recurring services</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Annual Run-Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </span>
          <div className="text-2xl font-extrabold text-white">${annualBurn.toFixed(2)}</div>
          <p className="text-[11px] text-slate-500">Projected 12-month drain</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-1 bg-emerald-950/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>Identified Savings</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="text-2xl font-extrabold text-emerald-400">${potentialSavings.toFixed(2)}<span className="text-xs font-normal text-slate-400">/mo</span></div>
          <p className="text-[11px] text-emerald-300/80">From {flaggedSubs.length} flagged services</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Fatigue Score</span>
            <ShieldAlert className="w-4 h-4 text-yellow-400" />
          </span>
          <div className="text-2xl font-extrabold text-yellow-400">Moderate</div>
          <p className="text-[11px] text-slate-500">2 services exceed usage threshold</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['ALL', 'FLAGGED', 'ACTIVE', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === tab
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'ALL' && `All (${subscriptions.length})`}
            {tab === 'FLAGGED' && `⚠️ Flagged Drains (${flaggedSubs.length})`}
            {tab === 'ACTIVE' && `Active (${activeSubs.length})`}
            {tab === 'CANCELLED' && `Cancelled`}
          </button>
        ))}
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubs.map((sub) => {
          const isFlagged = sub.status === 'UNUSED_CANDIDATE' || sub.status === 'PRICE_INCREASED';
          const isCancelled = sub.status === 'CANCELLED';

          return (
            <div
              key={sub.id}
              className={`bg-slate-900 border rounded-2xl p-4.5 space-y-3.5 transition-all flex flex-col justify-between ${
                isCancelled
                  ? 'border-slate-800/60 opacity-60'
                  : isFlagged
                  ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Name, Cost, and Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{sub.name}</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {sub.category} • {sub.billingCycle.toLowerCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-white">
                      ${sub.cost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/mo</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="mt-2.5">
                  {sub.status === 'PRICE_INCREASED' && (
                    <div className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-[11px] flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Price Creep Detected</span>
                    </div>
                  )}
                  {sub.status === 'UNUSED_CANDIDATE' && (
                    <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-[11px] flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Unused / Zero Logins</span>
                    </div>
                  )}
                  {sub.status === 'ESSENTIAL' && (
                    <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-[11px] flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Essential Service</span>
                    </div>
                  )}
                  {sub.status === 'CANCELLED' && (
                    <div className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
                      <span>Cancelled / Inactive</span>
                    </div>
                  )}
                </div>

                {/* AI Reason / Note */}
                {sub.reason && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-2.5 leading-relaxed">
                    💡 {sub.reason}
                  </p>
                )}
              </div>

              {/* Renewal info & Action buttons */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Renewal: {sub.nextRenewal}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isCancelled && (
                    <button
                      onClick={() =>
                        onPaySubscription({
                          recipient: sub.name,
                          amount: sub.cost,
                          currency: 'USD',
                          category: 'Subscription',
                          memo: `Monthly renewal for ${sub.name}`,
                          dueDate: sub.nextRenewal,
                        })
                      }
                      className="flex-1 py-1.5 px-2 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="font-black italic">Pay</span>Pal Renew
                    </button>
                  )}

                  <button
                    onClick={() => handleCancelSub(sub.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isCancelled
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        : 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
                    }`}
                  >
                    {isCancelled ? 'Restore' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Subscription Tracker</h3>
            <form onSubmit={handleAddSubscription} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disney+, GitHub, Gym..."
                  value={newSub.name}
                  onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cost ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="14.99"
                    value={newSub.cost}
                    onChange={(e) => setNewSub({ ...newSub, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cycle</label>
                  <select
                    value={newSub.billingCycle}
                    onChange={(e) => setNewSub({ ...newSub, billingCycle: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="WEEKLY">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                <select
                  value={newSub.category}
                  onChange={(e) => setNewSub({ ...newSub, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Streaming">Streaming</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#0079C1] hover:bg-[#00609C] text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
