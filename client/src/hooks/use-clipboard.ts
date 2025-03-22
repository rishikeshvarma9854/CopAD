/**
 * Hook for copying text to clipboard
 */
export function useClipboard() {
  /**
   * Copy text to clipboard
   * @param text The text to copy
   * @returns A promise that resolves when the text is copied
   */
  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!navigator.clipboard) {
      console.error('Clipboard API not available');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy text: ', error);
      return false;
    }
  };

  return { copyToClipboard };
}
