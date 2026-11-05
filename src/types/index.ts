export type IntentType =
  | 'CREATE_PAYMENT'
  | 'SPLIT_EXPENSE'
  | 'SUBSCRIPTION_AUDIT'
  | 'FINANCIAL_QUERY'
  | 'INVOICE_REQUEST';

export interface PaymentItem {
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentOrder {
  recipient: string;
  amount: number;
  currency: string;
  category: string;
  dueDate?: string;
  memo: string;
  items?: PaymentItem[];
}

export interface SplitParticipant {
  id: string;
  name: string;
  amount: number;
  emailOrPhone?: string;
  isSelf: boolean;
  status: 'PENDING' | 'REQUESTED' | 'SETTLED';
  paypalPaymentUrl?: string;
}

export interface SplitBreakdown {
  totalAmount: number;
  tipAmount: number;
  participants: SplitParticipant[];
  settlementNote?: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'MONTHLY' | 'ANNUAL' | 'WEEKLY';
  category: 'Streaming' | 'Productivity' | 'Fitness' | 'Cloud' | 'Utilities' | 'Other';
  status: 'ACTIVE' | 'UNUSED_CANDIDATE' | 'PRICE_INCREASED' | 'ESSENTIAL' | 'CANCELLED';
  reason?: string;
  lastCharged: string;
  nextRenewal: string;
  icon?: string;
}

export interface SubscriptionInsights {
  detectedServices: Array<{
    name: string;
    cost: number;
    billingCycle: string;
    status: 'ACTIVE' | 'UNUSED_CANDIDATE' | 'PRICE_INCREASED' | 'ESSENTIAL' | 'CANCELLED';
    reason?: string;
  }>;
  monthlyBurnRate: number;
  potentialSavings: number;
  actionPlan: string;
}

export interface ParsedIntentResponse {
  intentType: IntentType;
  summary: string;
  conversationalResponse: string;
  paymentOrder?: PaymentOrder;
  splitBreakdown?: SplitBreakdown;
  subscriptionInsights?: SubscriptionInsights;
  suggestedFollowups?: string[];
  error?: string;
}

export interface TransactionRecord {
  id: string;
  orderId: string;
  captureId?: string;
  payee: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  category: string;
  memo: string;
  isLiveSandbox: boolean;
  fee?: number;
}

export interface PayPalConfig {
  mode: 'sandbox';
  apiBase: string;
  hasLiveCreds: boolean;
  clientIdPreview: string | null;
}
