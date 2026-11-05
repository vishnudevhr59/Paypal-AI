import { ParsedIntentResponse, PaymentOrder, PayPalConfig, TransactionRecord } from '../types';

export async function parsePaymentIntent(
  prompt: string,
  receiptImageBase64?: string
): Promise<ParsedIntentResponse> {
  const response = await fetch('/api/ai/parse-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, receiptImageBase64 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to parse payment intent' }));
    throw new Error(err.error || 'Server error parsing intent');
  }

  return response.json();
}

export async function sendChatMessage(message: string): Promise<{ reply: string; timestamp: string }> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Chat failed');
  }

  return response.json();
}

export async function createPayPalOrder(order: {
  amount: number;
  currency?: string;
  description: string;
  recipient?: string;
  items?: Array<{ name: string; price: number; quantity: number }>;
  metadata?: any;
}) {
  const response = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Order creation failed' }));
    throw new Error(err.error || 'Failed to create PayPal Sandbox order');
  }

  return response.json();
}

export async function capturePayPalOrder(orderId: string, amount: number) {
  const response = await fetch('/api/paypal/capture-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Capture failed' }));
    throw new Error(err.error || 'Failed to capture PayPal order');
  }

  return response.json();
}

export async function getPayPalConfig(): Promise<PayPalConfig> {
  const response = await fetch('/api/paypal/config');
  if (!response.ok) {
    return {
      mode: 'sandbox',
      apiBase: 'https://api-m.sandbox.paypal.com',
      hasLiveCreds: false,
      clientIdPreview: null,
    };
  }
  return response.json();
}

export async function updatePayPalConfig(
  clientId: string,
  clientSecret: string
): Promise<{ success: boolean; isRealLiveSandbox: boolean; message: string }> {
  const response = await fetch('/api/paypal/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  return response.json();
}

export async function testPayPalToken(clientId?: string, clientSecret?: string) {
  const response = await fetch('/api/paypal/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  return response.json();
}
