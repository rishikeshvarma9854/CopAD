export default function handler(req, res) {
  // Always return mock data without any API calls
  const { productName = 'Product', brandName = 'Brand', productDescription = 'Description', platform = 'All' } = req.body || {};
  
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

  // Return success response with mock data
  return res.status(200).json({
    success: true,
    data: {
      copies: mockCopies
    }
  });
}
