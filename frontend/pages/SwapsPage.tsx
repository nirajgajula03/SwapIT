import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  apiGetSwaps,
  apiRespondToSwap,
  apiGetMyItems,
  apiGetMarketplaceItems,
  apiProposeSwap,
} from '../services/api';
import type { Swap, Item } from '../types';
import {
  SwapsIcon,
  CoinIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  PlusIcon,
  ArrowLongRightIcon,
  ClockIcon,
} from '../components/Icons';

type StatusFilter = 'All' | 'Pending' | 'Accepted' | 'Completed' | 'Rejected';

const SwapsPage: React.FC = () => {
  const { token, currentUser, refreshCurrentUser } = useAuth();
  const location = useLocation();

  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Propose Swap Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [marketItems, setMarketItems] = useState<Item[]>([]);
  const [selectedMyItemId, setSelectedMyItemId] = useState<string>('');
  const [selectedMarketItemId, setSelectedMarketItemId] = useState<string>('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  const fetchSwaps = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await apiGetSwaps(token);
      setSwaps(data || []);
    } catch (err: any) {
      console.error('Failed to load swaps:', err);
      setError(err?.message || 'Failed to load swap proposals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [token]);

  // Check if routed with targetItem from items page
  useEffect(() => {
    const state = location.state as { targetItem?: Item } | undefined;
    if (state?.targetItem) {
      openProposeModal(state.targetItem.id);
    }
  }, [location.state]);

  const openProposeModal = async (preselectedMarketItemId?: string) => {
    if (!token) return;
    setProposalError(null);
    setIsModalOpen(true);
    try {
      const [myList, marketList] = await Promise.all([
        apiGetMyItems(token),
        apiGetMarketplaceItems(token),
      ]);
      setMyItems(myList || []);
      // Filter out current user's own items from marketplace selection
      const filteredMarket = (marketList || []).filter(
        (item) => item.owner?.username !== currentUser?.username
      );
      setMarketItems(filteredMarket);

      if (myList && myList.length > 0 && !selectedMyItemId) {
        setSelectedMyItemId(myList[0].id);
      }
      if (preselectedMarketItemId) {
        setSelectedMarketItemId(preselectedMarketItemId);
      } else if (filteredMarket && filteredMarket.length > 0 && !selectedMarketItemId) {
        setSelectedMarketItemId(filteredMarket[0].id);
      }
    } catch (err: any) {
      console.error('Error loading items for propose modal:', err);
      setProposalError('Could not load inventory items.');
    }
  };

  const handleRespond = async (swapId: string, action: 'accept' | 'reject') => {
    if (!token) return;
    try {
      const updatedSwap = await apiRespondToSwap(swapId, action, token);
      setSwaps((prev) =>
        prev.map((s) => (s.id === swapId ? { ...s, status: updatedSwap?.status || (action === 'accept' ? 'Accepted' : 'Rejected') } : s))
      );
      if (action === 'accept') {
        refreshCurrentUser();
      }
    } catch (err: any) {
      alert(err?.message || `Failed to ${action} swap.`);
    }
  };

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProposalError(null);

    if (!selectedMyItemId || !selectedMarketItemId) {
      setProposalError('Please select both your item and the item you want to swap for.');
      return;
    }

    if (!token) return;

    setIsSubmittingProposal(true);
    try {
      const myItem = myItems.find((i) => i.id === selectedMyItemId);
      const targetItem = marketItems.find((i) => i.id === selectedMarketItemId);
      const coinDiff = (targetItem?.value || 0) - (myItem?.value || 0);

      const newSwap = await apiProposeSwap(
        {
          userItemId: selectedMyItemId,
          otherItemId: selectedMarketItemId,
          userItem: myItem,
          otherUserItem: targetItem,
          coinDifference: coinDiff,
        },
        token
      );

      setSwaps((prev) => [newSwap, ...prev]);
      setIsModalOpen(false);
      setSelectedMyItemId('');
      setSelectedMarketItemId('');
    } catch (err: any) {
      console.error('Error proposing swap:', err);
      setProposalError(err?.message || 'Failed to submit proposal.');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Filtered swaps
  const filteredSwaps = swaps.filter((s) => {
    if (filterStatus === 'All') return true;
    return s.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    }
  };

  // Calculated coin diff for proposal modal preview
  const activeMyItem = myItems.find((i) => i.id === selectedMyItemId);
  const activeMarketItem = marketItems.find((i) => i.id === selectedMarketItemId);
  const modalCoinDiff =
    activeMyItem && activeMarketItem ? activeMarketItem.value - activeMyItem.value : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
            Swap Proposals
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track, accept, negotiate, and finalize your item trades.
          </p>
        </div>

        <button
          onClick={() => openProposeModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] text-white font-semibold text-sm shadow-sm hover:shadow transition cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Propose New Swap</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#001233] p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {(['All', 'Pending', 'Accepted', 'Completed', 'Rejected'] as StatusFilter[]).map((tab) => {
          const count =
            tab === 'All'
              ? swaps.length
              : swaps.filter((s) => s.status?.toLowerCase() === tab.toLowerCase()).length;

          return (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab
                  ? 'bg-[#2A67C9] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#001845]'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Swaps List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-[#001233] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse h-36"
            />
          ))}
        </div>
      ) : filteredSwaps.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#001233] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#2A67C9]">
            <SwapsIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#001233] dark:text-[#EFEFDE]">
            No {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} swaps found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Find items in the marketplace and offer a trade with one of your listed items.
          </p>
          <button
            onClick={() => openProposeModal()}
            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-[#2A67C9] text-white text-sm font-semibold hover:bg-[#2356a8] transition cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Propose a Swap</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSwaps.map((swap) => {
            const isIncoming =
              currentUser?.username &&
              swap.proposerUsername &&
              swap.proposerUsername !== currentUser.username;
            const isPending = swap.status?.toLowerCase() === 'pending';

            return (
              <div
                key={swap.id}
                className="bg-white dark:bg-[#001233] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(
                        swap.status
                      )}`}
                    >
                      {swap.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {swap.date ? new Date(swap.date).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Proposer:{' '}
                    <span className="font-bold text-[#2A67C9] dark:text-[#E9D8A6]">
                      @{swap.proposerUsername || 'trader'}
                    </span>
                    {swap.proposerUsername === currentUser?.username && (
                      <span className="ml-1 text-[11px] text-gray-400">(You)</span>
                    )}
                  </div>
                </div>

                {/* Items comparison section */}
                <div className="py-4 grid grid-cols-1 md:grid-cols-7 items-center gap-4">
                  {/* Your Item */}
                  <div className="md:col-span-3 flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-[#001845]">
                    <img
                      src={
                        swap.userItem?.imageUrl ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
                      }
                      alt={swap.userItem?.name || 'Item'}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Offered Item
                      </span>
                      <h4 className="font-bold text-sm text-[#001233] dark:text-[#EFEFDE] truncate">
                        {swap.userItem?.name || 'Item'}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-[#EE9B00] font-semibold mt-0.5">
                        <CoinIcon className="w-3.5 h-3.5" />
                        <span>{swap.userItem?.value || 0} Coins</span>
                      </div>
                    </div>
                  </div>

                  {/* Swap Exchange Arrow & Difference */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2A67C9] flex items-center justify-center font-bold">
                      ⇄
                    </div>
                    {swap.coinDifference !== undefined && swap.coinDifference !== 0 && (
                      <div
                        className={`text-[11px] font-bold mt-1 ${
                          swap.coinDifference > 0 ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      >
                        {swap.coinDifference > 0 ? `+${swap.coinDifference}` : swap.coinDifference}{' '}
                        Coins
                      </div>
                    )}
                  </div>

                  {/* Other Item */}
                  <div className="md:col-span-3 flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-[#001845]">
                    <img
                      src={
                        swap.otherUserItem?.imageUrl ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
                      }
                      alt={swap.otherUserItem?.name || 'Item'}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Requested Item
                      </span>
                      <h4 className="font-bold text-sm text-[#001233] dark:text-[#EFEFDE] truncate">
                        {swap.otherUserItem?.name || 'Item'}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-[#EE9B00] font-semibold mt-0.5">
                        <CoinIcon className="w-3.5 h-3.5" />
                        <span>{swap.otherUserItem?.value || 0} Coins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incoming actions: Accept / Reject */}
                {isPending && isIncoming && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleRespond(swap.id, 'reject')}
                      className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespond(swap.id, 'accept')}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
                    >
                      Accept Swap
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Swap Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#001233] rounded-3xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
                  Propose a Trade
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select one of your items and the marketplace item you wish to trade for.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {proposalError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-400 text-xs">
                {proposalError}
              </div>
            )}

            <form onSubmit={handleProposeSubmit} className="space-y-5">
              {/* Select Your Item */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  1. Your Offered Item
                </label>
                {myItems.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    You have not listed any items yet. You need to list an item first before proposing a swap.
                  </p>
                ) : (
                  <select
                    value={selectedMyItemId}
                    onChange={(e) => setSelectedMyItemId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
                  >
                    {myItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.value} SwapCoins - {item.condition})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Select Target Marketplace Item */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                  2. Requested Marketplace Item
                </label>
                {marketItems.length === 0 ? (
                  <p className="text-xs text-gray-500 p-3 bg-gray-50 dark:bg-[#001845] rounded-xl">
                    No other items available in the marketplace right now.
                  </p>
                ) : (
                  <select
                    value={selectedMarketItemId}
                    onChange={(e) => setSelectedMarketItemId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
                  >
                    {marketItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} by @{item.owner?.username} ({item.value} SwapCoins)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Difference Preview Box */}
              {activeMyItem && activeMarketItem && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Value adjustment:</span>
                    <p className="font-bold text-sm text-[#001233] dark:text-[#EFEFDE]">
                      {modalCoinDiff === 0
                        ? 'Even Trade (0 Coins difference)'
                        : modalCoinDiff > 0
                        ? `You pay ${modalCoinDiff} SwapCoins`
                        : `You receive ${Math.abs(modalCoinDiff)} SwapCoins`}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#EE9B00]">
                    <CoinIcon className="w-5 h-5" />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#001845] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal || myItems.length === 0 || marketItems.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] disabled:opacity-60 text-white font-semibold text-sm shadow-md transition cursor-pointer"
                >
                  {isSubmittingProposal ? 'Proposing...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapsPage;
