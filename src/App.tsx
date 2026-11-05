/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AICopilot } from './components/AICopilot';
import { SubscriptionAudit } from './components/SubscriptionAudit';
import { BillSplitter } from './components/BillSplitter';
import { TransactionHistory } from './components/TransactionHistory';
import { DeveloperConsole } from './components/DeveloperConsole';
import { PayPalSandboxModal } from './components/PayPalSandboxModal';
import { SettingsModal } from './components/SettingsModal';
import { PaymentOrder, TransactionRecord, PayPalConfig } from './types';
import { getPayPalConfig } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('copilot');
  const [paypalConfig, setPayPalConfig] = useState<PayPalConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeCheckoutOrder, setActiveCheckoutOrder] = useState<PaymentOrder | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Seed with realistic completed PayPal Sandbox transactions
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'TX-101',
      orderId: 'PAYID-M7X9921',
      captureId: 'CAP-998241',
      payee: 'Comcast Xfinity Internet',
      amount: 45.0,
      currency: 'USD',
      timestamp: '2026-11-03T14:32:00Z',
      status: 'COMPLETED',
      category: 'Utilities',
      memo: 'Monthly High-Speed Fiber Internet Bill',
      isLiveSandbox: false,
      fee: 1.45,
    },
    {
      id: 'TX-102',
      orderId: 'PAYID-K449012',
      captureId: 'CAP-331902',
      payee: 'Osteria Morini Dinner',
      amount: 47.2,
      currency: 'USD',
      timestamp: '2026-11-02T20:15:00Z',
      status: 'COMPLETED',
      category: 'Dining',
      memo: 'Split bill settlement (1 of 3)',
      isLiveSandbox: false,
      fee: 1.45,
    },
    {
      id: 'TX-103',
      orderId: 'PAYID-N881903',
      captureId: 'CAP-771239',
      payee: 'ConEd Power & Gas',
      amount: 82.5,
      currency: 'USD',
      timestamp: '2026-10-29T09:10:00Z',
      status: 'COMPLETED',
      category: 'Utilities',
      memo: 'Residential Electric Service Settlement',
      isLiveSandbox: false,
      fee: 1.45,
    },
  ]);

  const refreshConfig = async () => {
    try {
      const cfg = await getPayPalConfig();
      setPayPalConfig(cfg);
    } catch (e) {
      console.warn('Could not fetch PayPal config', e);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const handleTriggerCheckout = (order: PaymentOrder) => {
    setActiveCheckoutOrder(order);
    setIsCheckoutModalOpen(true);
  };

  const handlePaymentSuccess = (transaction: TransactionRecord) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-[#0079C1] selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        paypalConfig={paypalConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        transactionCount={transactions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'copilot' && (
          <AICopilot
            onTriggerCheckout={handleTriggerCheckout}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionAudit onPaySubscription={handleTriggerCheckout} />
        )}

        {activeTab === 'splitter' && (
          <BillSplitter onPaySelfShare={handleTriggerCheckout} />
        )}

        {activeTab === 'transactions' && (
          <TransactionHistory transactions={transactions} />
        )}

        {activeTab === 'developer' && (
          <DeveloperConsole
            paypalConfig={paypalConfig}
            onRefreshConfig={refreshConfig}
          />
        )}
      </main>

      {/* Modals */}
      <PayPalSandboxModal
        order={activeCheckoutOrder}
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        paypalConfig={paypalConfig}
        onConfigUpdated={refreshConfig}
      />
    </div>
  );
}
