// Consistent storage key with version for future changes
const STORAGE_KEY = 'adCopyHistory_v2';

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

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Save history to localStorage
export function saveHistory(item: HistoryItem): void {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return;
  }
  
  try {
    // Get existing history
    const history = getHistory();
    
    // Add new item to beginning
    history.unshift(item);
    
    // Keep only the last 10 items
    const updatedHistory = history.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    console.log('History saved successfully', updatedHistory);
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

// Get history from localStorage
export function getHistory(): HistoryItem[] {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return [];
  }
  
  try {
    const historyStr = localStorage.getItem(STORAGE_KEY);
    if (!historyStr) return [];
    
    const parsedHistory = JSON.parse(historyStr);
    console.log('Retrieved history:', parsedHistory);
    return parsedHistory;
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

// Clear history from localStorage
export function clearHistory(): void {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('History cleared successfully');
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
