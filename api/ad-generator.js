export default function handler(req, res) {
  // Always return mock data without any API calls
  const { productName = 'Product', brandName = 'Brand', productDescription = 'Description', platform = 'All', tone = 'Professional', ageRange = '25-34' } = req.body || {};
  
  const mockCopies = [
    {
      headline: `Introducing ${productName} by ${brandName}`,
      body: `Discover the amazing features of our ${productName}. ${productDescription} Try it today and see the difference ${brandName} can make in your life.`,
      platform
    },
    {
      headline: `${brandName}'s New ${productName} - A Game Changer`,
      body: `${brandName} proudly presents ${productName}. ${productDescription} Join thousands of satisfied customers who have made the smart choice.`,
      platform
    },
    {
      headline: `Experience the Magic of ${brandName}'s ${productName}`,
      body: `Looking for the best solution? ${brandName}'s ${productName} is here for you. ${productDescription} Don't miss this opportunity!`,
      platform
    }
  ];

  // In a real app, this would save to the database
  // For our mock implementation, we'll update the history in memory
  try {
    // Import the mock history (this is just for demonstration)
    const historyModule = require('./ad-copy-history');
    if (historyModule.mockHistory && Array.isArray(historyModule.mockHistory)) {
      // Add to mock history if possible
      historyModule.mockHistory.unshift({
        id: Date.now(),
        productName,
        brandName,
        platform,
        tone,
        ageRange,
        createdAt: new Date().toISOString(),
        copies: mockCopies
      });
      // Keep only the last 10 items
      if (historyModule.mockHistory.length > 10) {
        historyModule.mockHistory.pop();
      }
    }
  } catch (error) {
    // Ignore errors, this is just a best-effort approach
    console.log('Note: Could not update history, but generation will still work');
  }

  // Return success response with mock data
  return res.status(200).json({
    success: true,
    data: {
      copies: mockCopies
    }
  });
}
