import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiAddItem } from '../services/api';
import {
  ArrowLeftIcon,
  UploadIcon,
  AlertTriangleIcon,
  CoinIcon,
  CameraIcon,
} from '../components/Icons';

const CONDITIONS = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'] as const;
const CATEGORIES = ['Electronics', 'Apparel', 'Furniture', 'Collectibles', 'Other'] as const;

const SAMPLE_IMAGES = [
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60' },
  { label: 'Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60' },
  { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' },
  { label: 'Vintage Chair', url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&auto=format&fit=crop&q=60' },
];

const UploadItemPage: React.FC = () => {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    condition: 'Used - Good' as (typeof CONDITIONS)[number],
    value: 50,
    category: 'Electronics' as (typeof CATEGORIES)[number],
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'value' ? (value === '' ? '' : Math.max(1, Number(value))) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('You must be logged in to list an item.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Item name is required.');
      return;
    }

    if (Number(formData.value) <= 0) {
      setError('Item value in SwapCoins must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl:
          formData.imageUrl.trim() ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        condition: formData.condition,
        value: Number(formData.value),
        category: formData.category,
        listedDate: new Date().toISOString(),
        distance: Math.floor(Math.random() * 10) + 1,
        owner: {
          username: currentUser?.username || 'user',
          avatarUrl: currentUser?.avatarUrl || '',
        },
      };

      await apiAddItem(payload, token);
      navigate('/items');
    } catch (err: any) {
      console.error('Failed to add item:', err);
      setError(err?.message || 'Error submitting item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center gap-3">
        <Link
          to="/items"
          className="p-2 rounded-xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#001845] transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001233] dark:text-[#EFEFDE]">
            List an Item for Swap
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Share what you have with the community and exchange for what you need.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-400 text-sm">
          <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#001233] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Item Title */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Item Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Sony WH-1000XM4 Wireless Headphones"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
          />
        </div>

        {/* Category & Condition Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="condition"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Condition *
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimated Value in SwapCoins */}
        <div>
          <label
            htmlFor="value"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Estimated Value (SwapCoins) *
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#EE9B00]">
              <CoinIcon className="w-5 h-5" />
            </div>
            <input
              id="value"
              name="value"
              type="number"
              min="1"
              value={formData.value}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Estimated market value to determine fair coin balance adjustments during swaps.
          </p>
        </div>

        {/* Image URL & Preview */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Image URL
          </label>
          <div className="relative">
            <CameraIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
            />
          </div>

          {/* Quick presets */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400">Quick samples:</span>
            {SAMPLE_IMAGES.map((sample) => (
              <button
                type="button"
                key={sample.label}
                onClick={() => setFormData((p) => ({ ...prevPreset(p), imageUrl: sample.url }))}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#001845] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Image Preview Card */}
          {formData.imageUrl && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-[#001845] rounded-xl border border-gray-200 dark:border-gray-700/60 flex items-center gap-4">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                }}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-[#001233] dark:text-[#EFEFDE]">Image preview</span>
                <p>Verify that your item picture displays correctly above.</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Description & Details
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Include condition details, reasons for swapping, accessories included, etc."
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
          />
        </div>

        {/* Form Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
          <Link
            to="/items"
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#001845] transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] disabled:opacity-60 text-white font-semibold text-sm shadow-md transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing Item...</span>
              </>
            ) : (
              <>
                <UploadIcon className="w-4 h-4" />
                <span>List Item</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper for preset
function prevPreset<T>(p: T): T {
  return p;
}

export default UploadItemPage;
