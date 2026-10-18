import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGetMarketplaceItems } from '../services/api';
import type { Item, Badge } from '../types';
import {
  CoinIcon,
  ItemsIcon,
  SwapsIcon,
  PlusIcon,
  RepairAssistantIcon,
  ArrowLongRightIcon,
  BronzeBadgeIcon,
  SilverBadgeIcon,
  GoldBadgeIcon,
  PlatinumBadgeIcon,
  TagIcon,
  MapPinIcon,
  WalletIcon,
} from '../components/Icons';

const HomePage: React.FC = () => {
  const { currentUser, token } = useAuth();
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecent = async () => {
      try {
        const items = await apiGetMarketplaceItems(token || undefined);
        if (isMounted) {
          // Display top 4 recent items
          setRecentItems(items.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching marketplace items for home:', err);
      } finally {
        if (isMounted) {
          setIsLoadingItems(false);
        }
      }
    };

    fetchRecent();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const renderBadgeIcon = (badge?: Badge) => {
    switch (badge) {
      case 'Platinum':
        return <PlatinumBadgeIcon className="w-8 h-8" />;
      case 'Gold':
        return <GoldBadgeIcon className="w-8 h-8" />;
      case 'Silver':
        return <SilverBadgeIcon className="w-8 h-8" />;
      case 'Bronze':
      default:
        return <BronzeBadgeIcon className="w-8 h-8" />;
    }
  };

  const displayName = currentUser?.name || currentUser?.username || 'Trader';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2A67C9] to-[#001845] text-white p-8 md:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/20 text-[#E9D8A6] mb-3">
            Sustainable Barter Platform
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="mt-3 text-base md:text-lg text-blue-100/90 leading-relaxed">
            Trade items you no longer need, earn SwapCoins, or get instant AI-guided repair instructions for damaged goods.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/items/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E9D8A6] hover:bg-[#d8c795] text-[#001233] font-semibold text-sm transition shadow-sm hover:shadow"
            >
              <PlusIcon className="w-4 h-4" />
              <span>List an Item</span>
            </Link>
            <Link
              to="/repair-assistant"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition backdrop-blur-sm"
            >
              <RepairAssistantIcon className="w-4 h-4" />
              <span>AI Repair Assistant</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#2A67C9]/40 blur-3xl pointer-events-none" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* SwapCoins Balance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Wallet Balance
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#EE9B00]">
              <CoinIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
            {currentUser?.coins ?? 0}
            <span className="text-sm font-semibold ml-1.5 text-[#EE9B00]">Coins</span>
          </div>
          <Link
            to="/wallet"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#2A67C9] dark:text-[#E9D8A6] hover:underline"
          >
            <span>Manage wallet</span>
            <ArrowLongRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Items Listed */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Items Listed
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2A67C9]">
              <ItemsIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
            {currentUser?.itemsListed ?? 0}
          </div>
          <Link
            to="/items"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#2A67C9] dark:text-[#E9D8A6] hover:underline"
          >
            <span>View your items</span>
            <ArrowLongRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Swaps Completed */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Swaps Done
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <SwapsIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
            {currentUser?.swapsCompleted ?? 0}
          </div>
          <Link
            to="/swaps"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#2A67C9] dark:text-[#E9D8A6] hover:underline"
          >
            <span>View swap history</span>
            <ArrowLongRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Badge Tier */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Current Tier
            </span>
            <div className="p-1">
              {renderBadgeIcon(currentUser?.badge)}
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
            {currentUser?.badge || 'Bronze'}
          </div>
          <Link
            to="/profile"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#2A67C9] dark:text-[#E9D8A6] hover:underline"
          >
            <span>View rewards</span>
            <ArrowLongRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-[#001233] dark:text-[#EFEFDE] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/items/new"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-[#001845] hover:bg-gray-100 dark:hover:bg-[#001845]/70 border border-gray-200 dark:border-gray-700/60 transition group text-center"
          >
            <div className="w-10 h-10 rounded-full bg-[#2A67C9]/10 text-[#2A67C9] flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <PlusIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#001233] dark:text-[#EFEFDE]">
              List Item
            </span>
          </Link>

          <Link
            to="/items"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-[#001845] hover:bg-gray-100 dark:hover:bg-[#001845]/70 border border-gray-200 dark:border-gray-700/60 transition group text-center"
          >
            <div className="w-10 h-10 rounded-full bg-[#2A67C9]/10 text-[#2A67C9] flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <ItemsIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#001233] dark:text-[#EFEFDE]">
              Browse Market
            </span>
          </Link>

          <Link
            to="/payment-gateway"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-[#001845] hover:bg-gray-100 dark:hover:bg-[#001845]/70 border border-gray-200 dark:border-gray-700/60 transition group text-center"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[#EE9B00] flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <WalletIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#001233] dark:text-[#EFEFDE]">
              Buy Coins
            </span>
          </Link>

          <Link
            to="/repair-assistant"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-[#001845] hover:bg-gray-100 dark:hover:bg-[#001845]/70 border border-gray-200 dark:border-gray-700/60 transition group text-center"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <RepairAssistantIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#001233] dark:text-[#EFEFDE]">
              Repair AI
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Marketplace Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#001233] dark:text-[#EFEFDE]">
              Recent Marketplace Items
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Discover newly listed treasures available for swap
            </p>
          </div>
          <Link
            to="/items"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2A67C9] dark:text-[#E9D8A6] hover:underline"
          >
            <span>See all</span>
            <ArrowLongRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 p-4 animate-pulse space-y-3"
              >
                <div className="w-full h-44 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-[#001233]/90 text-[#EE9B00] shadow-sm flex items-center gap-1 backdrop-blur-sm">
                    <CoinIcon className="w-3.5 h-3.5" />
                    <span>{item.value}</span>
                  </div>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#001233] dark:text-[#EFEFDE] line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {item.owner?.avatarUrl ? (
                          <img src={item.owner.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[9px] text-gray-600 dark:text-gray-300">
                            {item.owner?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <span className="truncate max-w-[80px]">@{item.owner?.username || 'user'}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#001845] text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      {item.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#001233] rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No items in the marketplace yet. Be the first to list one!
            </p>
            <Link
              to="/items/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A67C9] text-white text-sm font-semibold hover:bg-[#2356a8] transition"
            >
              <PlusIcon className="w-4 h-4" />
              <span>List Your First Item</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
