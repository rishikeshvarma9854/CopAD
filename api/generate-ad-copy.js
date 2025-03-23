export default function handler(req, res) {
  // Always return mock data without any API calls
  const { productName = 'Product', brandName = 'Brand', productDescription = 'Description', platform = 'All', tone = 'Professional', ageRange = '25-34' } = req.body || {};
  
  // Add randomization to ensure different content on regeneration
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000);
  
  // Array of possible headline templates
  const headlineTemplates = [
    `Introducing ${productName} by ${brandName}`,
    `${brandName}'s New ${productName} - A Game Changer`,
    `Experience the Magic of ${brandName}'s ${productName}`,
    `${productName}: Reimagined by ${brandName}`,
    `The Future is Here: ${brandName}'s ${productName}`,
    `Why Everyone Loves ${brandName}'s ${productName}`,
    `${productName} - ${brandName}'s Latest Innovation`,
    `Transform Your Life with ${brandName}'s ${productName}`,
    `${brandName} Presents: The Revolutionary ${productName}`,
    `Meet ${productName}: ${brandName}'s Answer to Your Needs`
  ];
  
  // Array of possible body templates
  const bodyTemplates = [
    `Discover the amazing features of our ${productName}. ${productDescription} Try it today and see the difference ${brandName} can make in your life.`,
    `${brandName} proudly presents ${productName}. ${productDescription} Join thousands of satisfied customers who have made the smart choice.`,
    `Looking for the best solution? ${brandName}'s ${productName} is here for you. ${productDescription} Don't miss this opportunity!`,
    `Elevate your experience with ${brandName}'s ${productName}. ${productDescription} Available now for a limited time.`,
    `${productDescription} That's why ${brandName}'s ${productName} stands out from the competition. Try it today!`,
    `${brandName}'s ${productName} is designed with you in mind. ${productDescription} See the difference quality makes.`,
    `Why settle for less when you can have ${brandName}'s ${productName}? ${productDescription} Order now!`,
    `${productDescription} Experience the ${brandName} difference with our innovative ${productName}.`,
    `${brandName}'s ${productName} is changing the game. ${productDescription} Be part of the revolution!`,
    `The wait is over! ${brandName}'s ${productName} is finally here. ${productDescription} Get yours today.`
  ];
  
  // Select random headlines and bodies based on timestamp and random seed
  const getRandomItem = (array, index) => {
    return array[(index + randomSeed) % array.length];
  };
  
  const mockCopies = [
    {
      headline: getRandomItem(headlineTemplates, 0),
      body: getRandomItem(bodyTemplates, 0),
      platform
    },
    {
      headline: getRandomItem(headlineTemplates, 3),
      body: getRandomItem(bodyTemplates, 3),
      platform
    },
    {
      headline: getRandomItem(headlineTemplates, 7),
      body: getRandomItem(bodyTemplates, 7),
      platform
    }
  ];

  // In a real app, this would save to the database
  // For our mock implementation, we'll update the history in memory
  // This won't persist across serverless function invocations, but it's a start
  try {
    // Import the mock history (this is just for demonstration)
    const historyModule = require('./ad-copy-history');
    if (historyModule.default && typeof historyModule.default === 'function') {
      // Add to mock history if possible
      if (Array.isArray(historyModule.mockHistory)) {
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
