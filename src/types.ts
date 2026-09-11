export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'Electronics'
  | 'ID & Cards'
  | 'Keys'
  | 'Bags & Backpacks'
  | 'Clothing & Accessories'
  | 'Books & Stationery'
  | 'Jewelry & Watches'
  | 'Sports & Water Bottles'
  | 'Other';

export type ItemStatus = 'active' | 'returned';

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  category: ItemCategory;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  imageUrl: string;
  imageProvider?: 'cloudinary' | 'supabase' | 's3' | 'server';
  imageFileName?: string;
  imageFileSize?: number;
  additionalInfo?: string;
  status: ItemStatus;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageStatus {
  activeProvider: 'cloudinary' | 'supabase' | 's3' | 'server';
  providerLabel: string;
  isCloudConfigured: boolean;
  maxSizeBytes: number;
  maxSizeMB: number;
  allowedMimeTypes: string[];
}

export interface ImageUploadResponse {
  success: boolean;
  url: string;
  imageUrl: string;
  provider: 'cloudinary' | 'supabase' | 's3' | 'server';
  providerLabel: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  itemId: string;
  itemTitle: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface AIMatchResult {
  matchedItem: Item;
  similarityPercentage: number;
  matchReason: string;
  confidence: 'high' | 'medium' | 'moderate';
}

export interface DashboardStats {
  totalLost: number;
  totalFound: number;
  totalReturned: number;
  activeItems: number;
  recentItems: Item[];
}
