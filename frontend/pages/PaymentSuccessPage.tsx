import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircleIcon,
  CoinIcon,
  WalletIcon,
  HomeIcon,
  ArrowLongRightIcon,
} from '../components/Icons';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const state = location.state as
    | {
        coins?: number;
        price?: number;
        packageName?: string;
        transactionId?: string;
        date?: string;
      }
    | undefined;

  const purchasedCoins = state?.coins ?? 100;
  const pricePaid = state?.price ?? 5;
  const transactionId = state?.transactionId ?? `SWP-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 p-8 sm:p-10 shadow-xl text-center space-y-6">
        {/* Animated Checkmark Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 ring-8 ring-emerald-500/10">
          <svg
            className="w-10 h-10 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Payment Successful
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#001233] dark:text-[#EFEFDE] mt-1">
            SwapCoins Deposited!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            Your payment has been processed and your balance has been credited immediately.
          </p>
        </div>

        {/* Deposit Summary Box */}
        <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-[#001845] border border-amber-200/60 dark:border-gray-700/60 space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#EE9B00]">
            <CoinIcon className="w-7 h-7" />
            <span className="text-3xl font-black">+{purchasedCoins}</span>
            <span className="text-sm font-bold">SwapCoins</span>
          </div>

          <div className="pt-3 border-t border-amber-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 flex justify-between">
            <span>New Wallet Balance:</span>
            <span className="font-bold text-[#001233] dark:text-[#EFEFDE]">
              {currentUser?.coins ?? purchasedCoins} Coins
            </span>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="text-left text-xs space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-[#001845]/50 border border-gray-100 dark:border-gray-800/80">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Reference ID</span>
            <span className="font-mono text-[#001233] dark:text-[#EFEFDE]">{transactionId}</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Amount Charged</span>
            <span className="font-semibold text-[#001233] dark:text-[#EFEFDE]">
              ${pricePaid}.00 USD
            </span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Payment Method</span>
            <span className="text-[#001233] dark:text-[#EFEFDE]">Visa ending in 4242</span>
          </div>
        </div>

        {/* Action Navigation Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/wallet"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] text-white font-bold text-xs shadow-md transition"
          >
            <WalletIcon className="w-4 h-4" />
            <span>Go to Wallet</span>
          </Link>

          <Link
            to="/home"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#001845] text-[#001233] dark:text-[#EFEFDE] font-bold text-xs transition"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
