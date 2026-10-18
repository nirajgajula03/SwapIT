import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGetMarketplaceItems, apiGetMyItems, apiDeleteItem } from '../services/api';
import type { Item } from '../types';
import {
  SearchIcon,
  PlusIcon,
  CoinIcon,
  TrashIcon,
  TagIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  SwapsIcon,
} from '../components/Icons';

type TabView = 'marketplace' | 'my-items';

const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Furniture', 'Collectibles', 'Other'];
const CONDITIONS = ['All', 'New', 'Used - Like New', 'Used - Good', 'Used - Fair'];

const ItemsPage: React.FC = () => {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabView>('marketplace');
  const [marketplaceItems, setMarketplaceItems] = useState<Item[]>([]);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'value-low' | 'value-high'>('newest');

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [marketData, myData] = await Promise.all([
        apiGetMarketplaceItems(token || undefined),
        token ? apiGetMyItems(token) : Promise.resolve([]),
      ]);
      setMarketplaceItems(marketData || []);
      setMyItems(myData || []);
    } catch (err: any) {
      console.error('Failed to fetch items:', err);
      setError(err?.message || 'Could not load items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleDeleteItem = async (itemId: string) => {
    if (!token) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (!confirmDelete) return;

    try {
      await apiDeleteItem(itemId, token);
      setMyItems((prev) => prev.filter((i) => i.id !== itemId));
      setMarketplaceItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete item.');
    }
  };

  // Filter and sort items based on activeTab
  const currentList = activeTab === 'marketplace' ? marketplaceItems : myItems;

  const filteredItems = useMemo(() => {
    return currentList
      .filter((item) => {
        // Search query match
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.owner?.username?.toLowerCase().includes(query);

        // Category match
        const matchesCategory =
          selectedCategory === 'All' || item.category === selectedCategory;

        // Condition match
        const matchesCondition =
          selectedCondition === 'All' || item.condition === selectedCondition;

        return matchesQuery && matchesCategory && matchesCondition;
      })
      .sort((a, b) => {
        if (sortBy === 'value-low') return a.value - b.value;
        if (sortBy === 'value-high') return b.value - a.value;
        // Default newest
        return new Date(b.listedDate || 0).getTime() - new Date(a.listedDate || 0).getTime();
      });
  }, [currentList, searchQuery, selectedCategory, selectedCondition, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
            Inventory & Marketplace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse trade offerings or manage your own listed items.
          </p>
        </div>

        <Link
          to="/items/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] text-white font-semibold text-sm shadow-sm hover:shadow transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add New Item</span>
        </Link>
      </div>

      {/* Tabs and Controls Bar */}
      <div className="bg-white dark:bg-[#001233] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        {/* View Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-800 pb-3 gap-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-[#2A67C9] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#001845]'
            }`}
          >
            <span>Marketplace</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'marketplace' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            >
              {marketplaceItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my-items')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'my-items'
                ? 'bg-[#2A67C9] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#001845]'
            }`}
          >
            <span>My Items</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'my-items' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800'
              }`}
            >
              {myItems.length}
            </span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search items, titles, owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            >
              <option value="All">All Conditions</option>
              {CONDITIONS.filter((c) => c !== 'All').map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="value-low">Sort: Coins (Low to High)</option>
              <option value="value-high">Sort: Coins (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Grid of Items */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 p-4 animate-pulse space-y-4"
            >
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#001233] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
            <SearchIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#001233] dark:text-[#EFEFDE]">
            No items found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {activeTab === 'my-items'
              ? "You haven't listed any items yet, or none match your search."
              : 'Try clearing your filters or search terms to see more items.'}
          </p>
          {activeTab === 'my-items' && (
            <Link
              to="/items/new"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-[#2A67C9] text-white text-sm font-semibold hover:bg-[#2356a8] transition"
            >
              <PlusIcon className="w-4 h-4" />
              <span>List Your First Item</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOwner = currentUser?.username && item.owner?.username === currentUser.username;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Image & Badges */}
                <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                    }}
                  />

                  {/* SwapCoin Value Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-[#001233]/95 text-[#EE9B00] shadow-sm flex items-center gap-1 backdrop-blur-sm">
                    <CoinIcon className="w-3.5 h-3.5" />
                    <span>{item.value} Coins</span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                    {item.category}
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-[#001233] dark:text-[#EFEFDE] line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Condition & Distance */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#001845] font-medium text-gray-700 dark:text-gray-300">
                      {item.condition}
                    </span>
                    {typeof item.distance === 'number' && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                        {item.distance} km away
                      </span>
                    )}
                  </div>

                  {/* Owner & Actions Footer */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {item.owner?.avatarUrl ? (
                          <img
                            src={item.owner.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-gray-600 dark:text-gray-300">
                            {item.owner?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate max-w-[90px]">
                        @{item.owner?.username || 'user'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {activeTab === 'my-items' || isOwner ? (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Delete Item"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/swaps', { state: { targetItem: item } })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2A67C9] hover:bg-[#2356a8] text-white text-xs font-semibold transition cursor-pointer"
                        >
                          <SwapsIcon className="w-3.5 h-3.5" />
                          <span>Swap</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ItemsPage;
