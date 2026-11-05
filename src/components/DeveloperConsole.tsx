import React, { useState } from 'react';
import {
  Terminal,
  Play,
  KeyRound,
  FileCode,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { PayPalConfig } from '../types';
import { testPayPalToken, createPayPalOrder, updatePayPalConfig } from '../services/api';

interface DeveloperConsoleProps {
  paypalConfig: PayPalConfig | null;
  onRefreshConfig: () => void;
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({
  paypalConfig,
  onRefreshConfig,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'API_INSPECTOR' | 'PYTHON_CODE' | 'CONFIG'>('API_INSPECTOR');
  const [activeCodeFile, setActiveCodeFile] = useState<'paypal_service.py' | 'main.py' | 'server.ts'>('paypal_service.py');

  // API Inspector State
  const [testAmount, setTestAmount] = useState('45.00');
  const [testCurrency, setTestCurrency] = useState('USD');
  const [testDesc, setTestDesc] = useState('Hackathon Verification Payment');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  // Sandbox Config State
  const [inputClientId, setInputClientId] = useState('');
  const [inputSecret, setInputSecret] = useState('');
  const [configMessage, setConfigMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleTestToken = async () => {
    setApiLoading(true);
    setLastAction('POST /v1/oauth2/token');
    try {
      const data = await testPayPalToken();
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const handleTestOrder = async () => {
    setApiLoading(true);
    setLastAction('POST /v2/checkout/orders');
    try {
      const data = await createPayPalOrder({
        amount: parseFloat(testAmount) || 45.0,
        currency: testCurrency,
        description: testDesc,
        recipient: 'Comcast Broadband Services',
      });
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const handleSaveSandboxKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigMessage('Validating Sandbox credentials against api-m.sandbox.paypal.com...');
    try {
      const res = await updatePayPalConfig(inputClientId, inputSecret);
      setConfigMessage(res.message);
      onRefreshConfig();
    } catch (err: any) {
      setConfigMessage(`Error: ${err.message}`);
    }
  };

  const pythonServiceCode = `"""
Payapp - PayPal Sandbox Payment Service Module
Official PayPal AI Hackathon Submission
"""

import os
import base64
import logging
from typing import Dict, Any, Optional
import requests
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("PayappPayPalService")

load_dotenv()

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE_URL", "https://api-m.sandbox.paypal.com")

class PayPalSandboxService:
    """Production-grade client for PayPal Sandbox Orders and Auth APIs."""

    def __init__(self, client_id: Optional[str] = None, client_secret: Optional[str] = None):
        self.client_id = client_id or PAYPAL_CLIENT_ID
        self.client_secret = client_secret or PAYPAL_CLIENT_SECRET
        self.api_base = PAYPAL_API_BASE.rstrip("/")

    def get_access_token(self) -> str:
        """
        Authenticates with PayPal Sandbox via OAuth 2.0 Client Credentials flow.
        Endpoint: POST https://api-m.sandbox.paypal.com/v1/oauth2/token
        """
        url = f"{self.api_base}/v1/oauth2/token"
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_auth = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")

        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {"grant_type": "client_credentials"}

        logger.info("Requesting OAuth2 access token from: %s", url)
        response = requests.post(url, headers=headers, data=data, timeout=10)
        response.raise_for_status()
        return response.json().get("access_token")

    def create_order(
        self,
        amount: float,
        currency: str = "USD",
        description: str = "Payapp Smart Payment",
        reference_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a PayPal Order using Orders v2 API with dynamic amount and currency.
        Endpoint: POST https://api-m.sandbox.paypal.com/v2/checkout/orders
        """
        token = self.get_access_token()
        url = f"{self.api_base}/v2/checkout/orders"
        formatted_amount = f"{amount:.2f}"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": reference_id or f"PAYAPP_{os.urandom(4).hex()}",
                    "description": description,
                    "amount": {
                        "currency_code": currency.upper(),
                        "value": formatted_amount,
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency.upper(),
                                "value": formatted_amount,
                            }
                        },
                    },
                    "items": [
                        {
                            "name": description,
                            "unit_amount": {
                                "currency_code": currency.upper(),
                                "value": formatted_amount,
                            },
                            "quantity": "1",
                            "category": "DIGITAL_GOODS",
                        }
                    ],
                }
            ],
            "application_context": {
                "brand_name": "Payapp Financial AI",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
            },
        }

        logger.info("Dispatching PayPal Sandbox Order creation: %s %s", currency, formatted_amount)
        response = requests.post(url, headers=headers, json=payload, timeout=12)
        response.raise_for_status()
        return response.json()

    def capture_order(self, order_id: str) -> Dict[str, Any]:
        """
        Captures payment for an approved PayPal Order.
        Endpoint: POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture
        """
        token = self.get_access_token()
        url = f"{self.api_base}/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        response = requests.post(url, headers=headers, json={}, timeout=12)
        response.raise_for_status()
        return response.json()
`;

  const pythonMainCode = `"""
Payapp - FastAPI Backend Entrypoint
Official PayPal AI Hackathon Submission
"""

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from paypal_service import PayPalSandboxService

app = FastAPI(
    title="Payapp API - Intelligent PayPal AI Payment Companion",
    description="Backend services for natural language payment orchestration and PayPal Sandbox Orders execution.",
    version="1.0.0",
)

paypal_client = PayPalSandboxService()

class CreateOrderRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to pay")
    currency: str = Field(default="USD", description="Currency ISO code")
    description: str = Field(default="Payapp Automated Payment", description="Payment memo")

@app.post("/api/paypal/token")
def get_token():
    try:
        token = paypal_client.get_access_token()
        return {"access_token": token, "token_type": "Bearer", "sandbox": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/paypal/orders")
def create_order(request: CreateOrderRequest):
    try:
        order = paypal_client.create_order(
            amount=request.amount,
            currency=request.currency,
            description=request.description,
        )
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")

@app.post("/api/paypal/orders/{order_id}/capture")
def capture_order(order_id: str):
    try:
        result = paypal_client.capture_order(order_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Capture failed: {str(e)}")
`;

  const handleCopyCode = () => {
    const code = activeCodeFile === 'paypal_service.py' ? pythonServiceCode : pythonMainCode;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Judge & Developer Sandbox Console</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
              Developer Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time payload inspection, live OAuth2 token testing, and ready-to-run Python/FastAPI module source.
          </p>
        </div>

        {/* Console Sub Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('API_INSPECTOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'API_INSPECTOR'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live API Inspector
          </button>
          <button
            onClick={() => setActiveSubTab('PYTHON_CODE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'PYTHON_CODE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Python / FastAPI Code
          </button>
          <button
            onClick={() => setActiveSubTab('CONFIG')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'CONFIG'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sandbox Credentials
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE API INSPECTOR */}
      {activeSubTab === 'API_INSPECTOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Sandbox Action Dispatcher</span>
            </h3>

            {/* Test 1: OAuth2 Token */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">OAuth 2.0 Token Flow</span>
                <span className="text-[10px] font-mono text-emerald-400">POST /v1/oauth2/token</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dispatches client credentials to PayPal Sandbox endpoint to retrieve temporary Bearer token.
              </p>
              <button
                onClick={handleTestToken}
                disabled={apiLoading}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold rounded-lg text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {apiLoading && lastAction === 'POST /v1/oauth2/token' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Test Token Generation</span>
              </button>
            </div>

            {/* Test 2: Orders v2 Create */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">Orders v2 Create Flow</span>
                <span className="text-[10px] font-mono text-blue-400">POST /v2/checkout/orders</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Dynamic Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Currency Code</label>
                <select
                  value={testCurrency}
                  onChange={(e) => setTestCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              <button
                onClick={handleTestOrder}
                disabled={apiLoading}
                className="w-full py-2 bg-[#0079C1] hover:bg-[#00609C] text-white font-semibold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {apiLoading && lastAction === 'POST /v2/checkout/orders' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Create Sandbox Order</span>
              </button>
            </div>
          </div>

          {/* Response Payload Viewer */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Live Response Payload {lastAction && `(${lastAction})`}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Target: {paypalConfig?.apiBase || 'https://api-m.sandbox.paypal.com'}
              </span>
            </div>

            <div className="flex-1 bg-black/90 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 max-h-[460px]">
              {apiResponse ? (
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              ) : (
                <div className="text-slate-500 italic py-16 text-center">
                  Click "Test Token Generation" or "Create Sandbox Order" to view real response JSON from the PayPal sandbox gateway.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PYTHON CODE VIEWER */}
      {activeSubTab === 'PYTHON_CODE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-yellow-400" />
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveCodeFile('paypal_service.py')}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                    activeCodeFile === 'paypal_service.py'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  paypal_service.py
                </button>
                <button
                  onClick={() => setActiveCodeFile('main.py')}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                    activeCodeFile === 'main.py'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  main.py (FastAPI)
                </button>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 self-start sm:self-auto cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied Code!' : 'Copy Module'}</span>
            </button>
          </div>

          <div className="bg-black/90 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800 max-h-[500px]">
            <pre>
              {activeCodeFile === 'paypal_service.py' ? pythonServiceCode : pythonMainCode}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: SANDBOX CREDENTIALS */}
      {activeSubTab === 'CONFIG' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">PayPal Sandbox Credentials</h3>
              <p className="text-xs text-slate-400">
                Configure your PayPal Developer Dashboard Sandbox Client ID and Secret Key.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSandboxKeys} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sandbox Client ID
              </label>
              <input
                type="text"
                placeholder="A21AAL_EXAMPLE_CLIENT_ID..."
                value={inputClientId}
                onChange={(e) => setInputClientId(e.target.value)}
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
                value={inputSecret}
                onChange={(e) => setInputSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {configMessage && (
              <div className="p-3 bg-slate-950 rounded-xl border border-blue-500/30 text-xs text-blue-300">
                {configMessage}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#0079C1] hover:bg-[#00609C] text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Connect Live Sandbox Keys
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputClientId('');
                  setInputSecret('');
                  handleSaveSandboxKeys({ preventDefault: () => {} } as any);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700"
              >
                Use Interactive Simulator
              </button>
            </div>
          </form>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-white block">Where do I get Sandbox Keys?</span>
            <p>
              1. Sign in to <a href="https://developer.paypal.com/dashboard/applications/sandbox" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">developer.paypal.com <ExternalLink className="w-3 h-3" /></a>
            </p>
            <p>2. Go to <strong>Apps & Credentials &gt; Sandbox</strong>.</p>
            <p>3. Copy the Client ID & Secret into this form or your <code className="text-slate-300">.env</code> file.</p>
          </div>
        </div>
      )}
    </div>
  );
};
