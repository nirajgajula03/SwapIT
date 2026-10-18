export interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  condition: 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair';
  value: number; // Estimated value in SwapCoins
  category: 'Electronics' | 'Apparel' | 'Furniture' | 'Collectibles' | 'Other';
  listedDate: string;
  owner: {
    username: string;
    avatarUrl: string;
  };
  distance: number; // in kilometers
}

export interface Swap {
  id: string;
  userItem: Item;
  otherUserItem: Item;
  proposerUsername: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Rejected';
  date: string;
  feedbackGiven?: boolean;
  coinDifference: number; 
}

export interface CoinTransaction {
  id: string;
  username: string;
  type: 'Credit' | 'Debit';
  description: string;
  amount: number; // in SwapCoins
  date: string;
  expiryDate: string;
  source: 'earned' | 'purchased' | 'bonus' | 'swap';
}

export interface RepairAnalysisResult {
    detectedIssue: string;
    repairSummary: string;
    estimatedCost: string;
    requiredParts: string[];
    isDIYFriendly: boolean;
}

export type Badge = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  location: string;
  memberSince: string;
  coins: number;
  itemsListed: number;
  swapsCompleted: number;
  dob: string;
  badge: Badge;
  totalCoinsEarned: number; // This might be a computed value
}

// A more minimal User type for registration, password is not stored in state
export interface User extends Omit<UserProfile, 'id' | 'memberSince' | 'itemsListed' | 'swapsCompleted' | 'badge' | 'coins' | 'totalCoinsEarned'> {
    password?: string;
}

export interface RepairStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface RepairGuidance {
  itemName: string;
  itemImageUrl: string;
  detectedIssue: string;
  estimatedCost: string;
  isDIYFriendly: boolean;
  requiredParts: string[];
  steps: RepairStep[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUsername: string;
  text: string;
  timestamp: string; // ISO string
}

export interface ChatConversation {
  id: string;
  item: Pick<Item, 'id' | 'name' | 'imageUrl'>;
  otherUser: {
    username: string;
    avatarUrl: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    senderUsername: string;
  };
  unreadCount: number;
}

export interface RepairShop {
  title: string;
  uri: string;
}
