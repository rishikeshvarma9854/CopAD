// Consistent storage key with version for future changes
const STORAGE_KEY = 'adCopyHistory_v1';

// Type definitions
export interface AdCopy {
  headline: string;
  body: string;
  platform: string;
}

export interface HistoryItem {
  id: number;
  productName: string;
  brandName: string;
  platform: string;
  tone: string;
  ageRange: string | null;
  createdAt: string;
  copies: AdCopy[];
}

// Save history to localStorage
export function saveHistory(item: HistoryItem): void {
  try {
    // Get existing history
    const history = getHistory();
    
    // Add new item to beginning
    history.unshift(item);
    
    // Keep only the last 10 items
    const updatedHistory = history.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

// Get history from localStorage
export function getHistory(): HistoryItem[] {
  try {
    const historyStr = localStorage.getItem(STORAGE_KEY);
    if (!historyStr) return [];
    
    return JSON.parse(historyStr);
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

// Clear history from localStorage
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// Create a new history item
export function createHistoryItem(data: any, formData: any): HistoryItem {
  return {
    id: Date.now(),
    productName: formData.productName || 'Product',
    brandName: formData.brandName || 'Brand',
    platform: formData.platform || 'All',
    tone: formData.tone || 'Professional',
    ageRange: formData.ageRange || null,
    createdAt: new Date().toISOString(),
    copies: data.data.copies
  };
}
