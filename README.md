# Payapp - Intelligent AI Payment Companion
> **Built for the PayPal AI Hackathon**  
> *Transforming natural language into secure PayPal Sandbox transactions, eradicating subscription fatigue, and streamlining peer-to-peer bill splitting.*

---

## 🌟 Executive Summary

**Payapp** is an intelligent, AI-powered financial companion built natively on top of the **PayPal Developer Platform (Orders v2 & OAuth2 Sandbox APIs)** and powered by **Google Gemini 3.8 Flash**. 

Payapp eliminates three major real-world financial friction points:
1. **Subscription Fatigue & Hidden Drains**: Modern consumers average 12+ recurring subscriptions, losing ~$300/year to unused services and silent price hikes. Payapp audits recurring charges, calculates monthly burn rates, and recommends immediate action.
2. **Tedious Manual Bill Splitting**: Splitting group dinners, rent, or utilities requires manual math, switching between calculation tools, and awkward tracking. Payapp parses unstructured group receipts or prompts, calculates exact shares and tips, and generates one-click PayPal settlement requests.
3. **Conversational Commerce**: Users want to execute payments naturally ("Pay my $45 internet bill to Comcast" or "Send $30 to Mom") without navigating cumbersome bank portals. Payapp parses natural language into strict JSON payment intents and dispatches genuine PayPal Sandbox Orders in seconds.

---

## 🚀 Key Features

| Feature | Description | PayPal Integration |
|---|---|---|
| **AI Payment Orchestrator** | Natural language intent parser extracts payee, amount, currency, memo, and category | Triggers `POST /v2/checkout/orders` with dynamic payload |
| **Interactive PayPal Sandbox Checkout** | Seamless in-app test checkout flow simulating or executing live sandbox transactions | Uses official OAuth2 Client Credentials & Orders Capture API |
| **Smart Expense & Receipt Splitter** | Multimodal OCR + NLP parses receipt text/photos, divides itemized shares, and tracks participant status | Generates PayPal payment links & order IDs per participant |
| **Subscription Fatigue Guard** | AI audits active subscriptions, detects price creeping, calculates burn, and flags candidates for cancellation | Direct recurring bill payments & cancelation suggestions |
| **Developer & Judge Sandbox Console** | Live inspection of PayPal request/response payloads, OAuth tokens, and API call logs | Real-time diagnostics for hackathon judges |

---

## 🛠️ Architecture & Tech Stack

```
payapp/
├── server.ts                    # Full-Stack Express API proxy & Gemini AI integration
├── python_backend/              # Dedicated Python / FastAPI backend suite
│   ├── paypal_service.py        # Production PayPal Sandbox OAuth2 & Orders v2 module
│   ├── main.py                  # FastAPI REST endpoints
│   ├── requirements.txt         # Python dependencies (FastAPI, requests, pydantic)
│   └── .env.example             # Python environment variable template
├── src/
│   ├── App.tsx                  # Main reactive dashboard & tab orchestration
│   ├── components/
│   │   ├── AICopilot.tsx        # Conversational payment copilot with quick prompt chips
│   │   ├── BillSplitter.tsx     # Interactive bill & receipt splitter with PayPal requests
│   │   ├── SubscriptionAudit.tsx# Recurring charges & subscription fatigue detector
│   │   ├── PayPalSandboxModal.tsx# Live PayPal Sandbox checkout & capture interface
│   │   ├── TransactionHistory.tsx# Audit log of executed orders with PayPal IDs
│   │   └── DeveloperConsole.tsx # Raw PayPal API inspector & Python code viewer
│   ├── services/
│   │   └── paypalApi.ts         # Client-side API client for server endpoints
│   ├── types/                   # TypeScript interfaces for payments, intents, & orders
│   ├── index.css                # Tailwind CSS styling with fintech design tokens
│   └── main.tsx                 # React DOM mount point
├── package.json
└── README.md
```

---

## 🔑 How to Setup PayPal Sandbox Credentials

1. Go to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Log in with your PayPal developer credentials.
3. Under **Apps & Credentials**, select the **Sandbox** toggle.
4. Click **Create App** (or use the default "Default Application").
5. Copy your **Client ID** and **Secret Key**.
6. Set them in your environment file (`.env`):
   ```env
   PAYPAL_CLIENT_ID="your_sandbox_client_id_here"
   PAYPAL_CLIENT_SECRET="your_sandbox_client_secret_here"
   PAYPAL_API_BASE_URL="https://api-m.sandbox.paypal.com"
   ```
> **Note for Judges**: If you do not have sandbox credentials handy, Payapp includes an **Interactive Sandbox Simulator** that mimics authentic PayPal v2 responses (`PAYID-...`, `CAP-...`, status codes, breakdown mathematics) with zero friction!

---

## 💻 Local Installation & Quickstart

### Option A: Full-Stack React + Node (Recommended for AI Studio Preview)
```bash
# 1. Install dependencies
npm install

# 2. Run dev server (runs full-stack Express + Vite on port 3000)
npm run dev

# 3. Open in browser
http://localhost:3000
```

### Option B: Standalone Python / FastAPI Backend
```bash
# 1. Navigate to python backend
cd python_backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows

# 3. Install requirements
pip install -r requirements.txt

# 4. Configure .env with your credentials
cp .env.example .env

# 5. Launch FastAPI server
python main.py
# Server runs on http://localhost:8000 (Interactive Swagger docs at /docs)
```

---

## 🏆 Hackathon Requirements Fulfillment

1. **Meaningful PayPal Integration**:
   - Implements RFC-compliant OAuth 2.0 basic auth against `https://api-m.sandbox.paypal.com/v1/oauth2/token`.
   - Constructs Orders v2 requests (`POST /v2/checkout/orders`) with dynamic currency, purchase units, item breakdowns, and `intent: "CAPTURE"`.
   - Executes capture flow (`POST /v2/checkout/orders/{id}/capture`) with verification of order status and seller receivable breakdown.
2. **Meaningful AI Integration**:
   - Uses Google Gemini 3.8 Flash with strict JSON response schemas.
   - Extracts structured intent types: `CREATE_PAYMENT`, `SPLIT_EXPENSE`, `SUBSCRIPTION_AUDIT`, `INVOICE_REQUEST`.
   - Multimodal OCR parses uploaded receipt photos or bills and auto-populates PayPal checkout.
3. **Clean Code Structure**:
   - Modular architecture separating AI services, PayPal gateways, and modern React/Tailwind UX.
   - Comprehensive test harnesses, developer console, and exportable Python module.
