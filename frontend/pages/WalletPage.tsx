import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { CoinTransaction, Badge } from '../types';
import {
  CoinIcon,
  PlusIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  BronzeBadgeIcon,
  SilverBadgeIcon,
  GoldBadgeIcon,
  PlatinumBadgeIcon,
  TrophyIcon,
  ClockIcon,
} from '../components/Icons';

const BADGE_TIERS: { name: Badge; threshold: number; perks: string[] }[] = [
  { name: 'Bronze', threshold: 0, perks: ['Base swap rights', '5% transaction bonus'] },
  { name: 'Silver', threshold: 250, perks: ['Zero fee swaps', 'Priority AI repair assistance'] },
  { name: 'Gold', threshold: 600, perks: ['Featured item listings', '10% coin bonus on reloads'] },
  { name: 'Platinum', threshold: 1200, perks: ['VIP badge & verified badge', 'Unlimited active listings'] },
];

const INITIAL_TRANSACTIONS: CoinTransaction[] = [
  {
    id: 'tx-1',
    username: 'current_user',
    type: 'Credit',
    description: 'Welcome Sign-up Bonus',
    amount: 100,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 360).toISOString(),
    source: 'bonus',
  },
  {
    id: 'tx-2',
    username: 'current_user',
    type: 'Credit',
    description: 'Item Swapped (Vintage Watch)',
    amount: 40,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 360).toISOString(),
    source: 'swap',
  },
  {
    id: 'tx-3',
    username: 'current_user',
    type: 'Debit',
    description: 'Swap Coin Difference (Headphones)',
    amount: 25,
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 360).toISOString(),
    source: 'swap',
  },
];

const WalletPage: React.FC = () => {
  const { currentUser, addCoins } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<CoinTransaction[]>(INITIAL_TRANSACTIONS);
  const [quickAddAmount, setQuickAddAmount] = useState<number | ''>(50);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async () => {
    if (!quickAddAmount || Number(quickAddAmount) <= 0) return;
    setIsAdding(true);
    try {
      await addCoins(Number(quickAddAmount));
      // Add local record
      const newTx: CoinTransaction = {
        id: `tx-${Date.now()}`,
        username: currentUser?.username || 'user',
        type: 'Credit',
        description: `Manual Wallet Top-up`,
        amount: Number(quickAddAmount),
        date: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: 'purchased',
      };
      setTransactions((prev) => [newTx, ...prev]);
      setQuickAddAmount('');
    } catch (err: any) {
      alert(err?.message || 'Failed to add coins.');
    } finally {
      setIsAdding(false);
    }
  };

  const renderBadgeIcon = (badge?: Badge) => {
    switch (badge) {
      case 'Platinum':
        return <PlatinumBadgeIcon className="w-10 h-10" />;
      case 'Gold':
        return <GoldBadgeIcon className="w-10 h-10" />;
      case 'Silver':
        return <SilverBadgeIcon className="w-10 h-10" />;
      case 'Bronze':
      default:
        return <BronzeBadgeIcon className="w-10 h-10" />;
    }
  };

  // Compute Badge Progress
  const currentBadge = currentUser?.badge || 'Bronze';
  const totalCoinsEarned = currentUser?.totalCoinsEarned || (currentUser?.coins ?? 100);

  let nextTier = BADGE_TIERS[1];
  let currentTierIndex = 0;
  if (currentBadge === 'Bronze') {
    nextTier = BADGE_TIERS[1];
    currentTierIndex = 0;
  } else if (currentBadge === 'Silver') {
    nextTier = BADGE_TIERS[2];
    currentTierIndex = 1;
  } else if (currentBadge === 'Gold') {
    nextTier = BADGE_TIERS[3];
    currentTierIndex = 2;
  } else {
    nextTier = BADGE_TIERS[3];
    currentTierIndex = 3;
  }

  const currentTierThreshold = BADGE_TIERS[currentTierIndex].threshold;
  const nextTierThreshold = nextTier.threshold;
  const progressPercent =
    currentBadge === 'Platinum'
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((totalCoinsEarned - currentTierThreshold) /
                (nextTierThreshold - currentTierThreshold)) *
                100
            )
          )
        );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Wallet Balance Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#001233] to-[#001845] text-white p-8 md:p-10 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#E9D8A6] font-bold">
              SwapIt Coin Vault
            </span>
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                {currentUser?.coins ?? 0}
              </h1>
              <span className="text-xl md:text-2xl font-bold text-[#EE9B00]">
                SwapCoins
              </span>
            </div>
            <p className="text-sm text-gray-300 max-w-md">
              Use SwapCoins to equalize item valuations during trades and unlock premium tier benefits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/payment-gateway')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#EE9B00] hover:bg-[#d98c00] text-[#001233] font-bold text-sm shadow-lg hover:shadow-xl transition cursor-pointer"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Purchase Coins</span>
            </button>

            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <input
                type="number"
                placeholder="Coins"
                value={quickAddAmount}
                onChange={(e) =>
                  setQuickAddAmount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-20 px-3 py-2 text-sm rounded-xl bg-transparent text-white placeholder-white/50 focus:outline-none"
              />
              <button
                onClick={handleQuickAdd}
                disabled={isAdding || !quickAddAmount}
                className="px-3.5 py-2 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer"
              >
                {isAdding ? 'Adding...' : '+ Quick Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative coin glow */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#EE9B00]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Grid: Badge Tier Progress & Tier Perks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Progress Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                {renderBadgeIcon(currentUser?.badge)}
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-gray-400">Current Standing</span>
                <h3 className="text-xl font-black text-[#001233] dark:text-[#EFEFDE]">
                  {currentBadge} Member
                </h3>
              </div>
            </div>

            {currentBadge !== 'Platinum' && (
              <div className="text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400">Next Tier</span>
                <p className="text-sm font-bold text-[#2A67C9] dark:text-[#E9D8A6]">
                  {nextTier.name} ({nextTier.threshold} Coins)
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
              <span>Progress to {nextTier.name}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-[#001845] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2A67C9] to-[#EE9B00] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">
              {currentBadge === 'Platinum'
                ? 'You have reached the highest tier! Enjoy maximum benefits.'
                : `${Math.max(0, nextTierThreshold - totalCoinsEarned)} more SwapCoins earned needed to level up.`}
            </p>
          </div>

          {/* Tier levels map */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {BADGE_TIERS.map((tier) => {
              const isAchieved =
                tier.name === currentBadge ||
                (currentBadge === 'Platinum' && tier.name !== 'Platinum') ||
                (currentBadge === 'Gold' && (tier.name === 'Bronze' || tier.name === 'Silver')) ||
                (currentBadge === 'Silver' && tier.name === 'Bronze');

              return (
                <div
                  key={tier.name}
                  className={`p-3 rounded-2xl border text-center transition ${
                    tier.name === currentBadge
                      ? 'border-[#2A67C9] bg-blue-50/50 dark:bg-blue-950/20'
                      : isAchieved
                      ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#001845]/50'
                      : 'border-dashed border-gray-300 dark:border-gray-800 opacity-60'
                  }`}
                >
                  <div className="mx-auto w-8 h-8 flex items-center justify-center mb-1">
                    {renderBadgeIcon(tier.name)}
                  </div>
                  <h4 className="text-xs font-bold text-[#001233] dark:text-[#EFEFDE]">
                    {tier.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {tier.threshold} Coins
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Card */}
        <div className="bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrophyIcon className="w-5 h-5 text-[#EE9B00]" />
              <h3 className="font-bold text-[#001233] dark:text-[#EFEFDE] text-base">
                Your Tier Benefits
              </h3>
            </div>
            <ul className="space-y-3">
              {BADGE_TIERS.find((t) => t.name === currentBadge)?.perks.map((perk, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/payment-gateway"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-[#001845] hover:bg-gray-200 dark:hover:bg-gray-700 text-[#001233] dark:text-[#EFEFDE] text-xs font-bold transition"
            >
              <span>Explore Coin Bundles</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#001233] dark:text-[#EFEFDE]">
              Transaction History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Record of SwapCoin deposits, earnings, and swap deductions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#001845]/50 transition"
                >
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold ${
                        tx.type === 'Credit' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {tx.type === 'Credit' ? (
                        <ArrowUpCircleIcon className="w-4 h-4" />
                      ) : (
                        <ArrowDownCircleIcon className="w-4 h-4" />
                      )}
                      <span>{tx.type}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#001233] dark:text-[#EFEFDE]">
                    {tx.description}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 capitalize">
                    {tx.source}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-extrabold ${
                      tx.type === 'Credit' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {tx.type === 'Credit' ? `+${tx.amount}` : `-${tx.amount}`} Coins
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
