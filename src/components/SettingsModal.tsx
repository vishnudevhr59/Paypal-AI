import React, { useState } from 'react';
import { X, KeyRound, ExternalLink, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { PayPalConfig } from '../types';
import { updatePayPalConfig } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paypalConfig: PayPalConfig | null;
  onConfigUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  paypalConfig,
  onConfigUpdated,
}) => {
  if (!isOpen) return null;

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await updatePayPalConfig(clientId, clientSecret);
      setFeedback(res.message);
      onConfigUpdated();
      if (res.isRealLiveSandbox) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetToSimulator = async () => {
    setLoading(true);
    setClientId('');
    setClientSecret('');
    try {
      const res = await updatePayPalConfig('', '');
      setFeedback(res.message);
      onConfigUpdated();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">PayPal Sandbox Settings</h3>
              <p className="text-[11px] text-slate-400">Developer Platform Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Mode:</span>
            <span className="font-mono font-semibold text-emerald-400">
              {paypalConfig?.hasLiveCreds ? 'Live Sandbox Connected' : 'Interactive Sandbox Simulator'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sandbox Client ID
              </label>
              <input
                type="text"
                placeholder="A21AAL_EXAMPLE_CLIENT_ID..."
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sandbox Secret Key
              </label>
              <input
                type="password"
                placeholder="EK_EXAMPLE_SECRET_KEY..."
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {feedback && (
              <div className="p-3 bg-slate-950 rounded-xl border border-blue-500/30 text-xs text-blue-300">
                {feedback}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-[#0079C1] hover:bg-[#00609C] text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save & Connect</span>
              </button>
              <button
                type="button"
                onClick={handleResetToSimulator}
                disabled={loading}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700"
              >
                Simulator Mode
              </button>
            </div>
          </form>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Credentials can also be stored in the root <code className="text-slate-400">.env</code> file under{' '}
            <code className="text-slate-400">PAYPAL_CLIENT_ID</code> and{' '}
            <code className="text-slate-400">PAYPAL_CLIENT_SECRET</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
