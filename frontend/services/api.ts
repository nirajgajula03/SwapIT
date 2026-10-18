import type { Item, Swap, UserProfile } from '../types';

export const API_BASE = 'http://localhost:5000/api';

/**
 * Helper to handle fetch responses and error extraction
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && (errorData.message || errorData.error)) {
        errorMessage = errorData.message || errorData.error;
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * Authentication: Login
 */
export async function apiLogin(username: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<{ token: string }>(res);
}

/**
 * Authentication: Signup
 */
export async function apiSignup(userData: any): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse<{ token: string }>(res);
}

/**
 * Current user profile
 */
export async function apiGetMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<UserProfile>(res);
}

/**
 * Update current user profile
 */
export async function apiUpdateProfile(updates: Partial<UserProfile>, token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  return handleResponse<UserProfile>(res);
}

/**
 * Add coins to wallet
 */
export async function apiAddCoins(amount: number, token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/me/add-coins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  return handleResponse<any>(res);
}

/**
 * Get all available marketplace items
 */
export async function apiGetMarketplaceItems(token?: string): Promise<Item[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/items/marketplace`, {
    method: 'GET',
    headers,
  });
  return handleResponse<Item[]>(res);
}

/**
 * Get current user's listed items
 */
export async function apiGetMyItems(token: string): Promise<Item[]> {
  const res = await fetch(`${API_BASE}/items/my-items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Item[]>(res);
}

/**
 * Add a new item
 */
export async function apiAddItem(item: any, token: string): Promise<Item> {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  return handleResponse<Item>(res);
}

/**
 * Delete an item by ID
 */
export async function apiDeleteItem(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<void>(res);
}

/**
 * Get user's swaps
 */
export async function apiGetSwaps(token: string): Promise<Swap[]> {
  const res = await fetch(`${API_BASE}/swaps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Swap[]>(res);
}

/**
 * Propose a new swap
 */
export async function apiProposeSwap(data: any, token: string): Promise<Swap> {
  const res = await fetch(`${API_BASE}/swaps/propose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Swap>(res);
}

/**
 * Accept or reject a swap proposal
 */
export async function apiRespondToSwap(id: string, action: string, token: string): Promise<Swap> {
  const res = await fetch(`${API_BASE}/swaps/${id}/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  return handleResponse<Swap>(res);
}
