import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CoinIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  ArrowLeftIcon,
} from '../components/Icons';

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

const PACKAGES: CoinPackage[] = [
  {
    id: 'pkg-100',
    name: 'Starter Bundle',
    coins: 100,
    price: 5,
  },
  {
    id: 'pkg-500',
    name: 'Trader Pack',
    coins: 500,
    price: 20,
    popular: true,
    savings: 'Save 20%',
  },
  {
    id: 'pkg-1000',
    name: 'Merchant Vault',
    coins: 1000,
    price: 35,
    savings: 'Save 30%',
  },
];

const PaymentGatewayPage: React.FC = () => {
  const { addCoins, currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedPackage, setSelectedPackage] = useState<CoinPackage>(PACKAGES[1]);
  const [formData, setFormData] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardHolder: currentUser?.name || 'Jane Doe',
    expiryDate: '12/28',
    cvc: '123',
    postalCode: '90210',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Simulate gateway latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Call auth context addCoins
      await addCoins(selectedPackage.coins);

      // Navigate to success receipt
      navigate('/payment-success', {
        state: {
          coins: selectedPackage.coins,
          price: selectedPackage.price,
          packageName: selectedPackage.name,
          transactionId: `SWP-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('Payment failure:', err);
      setError(err?.message || 'Payment simulation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/wallet')}
          className="p-2 rounded-xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#001845] transition cursor-pointer"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
            Purchase SwapCoins
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Top up your balance to propose high-value trade exchanges.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-400 text-sm">
          <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Package Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
          Select Coin Bundle
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPackage.id === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative p-6 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2A67C9] bg-white dark:bg-[#001233] shadow-lg ring-2 ring-[#2A67C9]/20'
                    : 'border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#001233]/60 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EE9B00] text-[#001233] shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-sm text-[#001233] dark:text-[#EFEFDE]">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center gap-1.5 my-3 text-[#EE9B00]">
                    <CoinIcon className="w-7 h-7" />
                    <span className="text-3xl font-black text-[#001233] dark:text-[#EFEFDE]">
                      {pkg.coins}
                    </span>
                    <span className="text-xs font-bold text-[#EE9B00]">Coins</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="text-xl font-black text-[#001233] dark:text-[#EFEFDE]">
                    ${pkg.price}
                    <span className="text-xs font-normal text-gray-400 ml-1">USD</span>
                  </div>
                  {pkg.savings && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      {pkg.savings}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Checkout Form */}
      <div className="bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-[#001233] dark:text-[#EFEFDE]">
              Payment Information
            </h3>
            <p className="text-xs text-gray-400">
              Simulated sandbox checkout for testing and demonstration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-[#001845] text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Demo Mode
            </span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Cardholder Name
            </label>
            <input
              type="text"
              name="cardHolder"
              value={formData.cardHolder}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Card Number
            </label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Expiry Date
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                CVC / CVV
              </label>
              <input
                type="password"
                name="cvc"
                maxLength={4}
                value={formData.cvc}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
              />
            </div>
          </div>

          {/* Total & Pay button */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-400">Total charge:</span>
              <p className="text-2xl font-black text-[#001233] dark:text-[#EFEFDE]">
                ${selectedPackage.price}.00{' '}
                <span className="text-xs font-normal text-gray-400">
                  for +{selectedPackage.coins} SwapCoins
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-8 py-3.5 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] disabled:opacity-60 text-white font-bold text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay ${selectedPackage.price}.00</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentGatewayPage;
