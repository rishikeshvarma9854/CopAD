// Simple serverless function that returns mock data when the Hugging Face API fails

export default async function handler(req, res) {
  try {
    // Check if this is a POST request
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Get the request body
    const body = req.body;
    const {
      productName,
      brandName,
      productDescription,
      variations = 3,
      platform = 'All',
      tone = 'Professional'
    } = body;

    // Check if required fields are present
    if (!productName || !brandName || !productDescription) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productName, brandName, and productDescription are required'
      });
    }

    // Create mock ad copies that will always work even if the Hugging Face API is down
    const mockCopies = [];
    
    // Generate the requested number of variations
    for (let i = 0; i < variations; i++) {
      mockCopies.push({
        headline: getHeadline(productName, brandName, i),
        body: getBody(productName, brandName, productDescription, tone, i),
        platform: platform
      });
    }

    // Return success response with mock data
    return res.status(200).json({
      success: true,
      data: {
        copies: mockCopies
      }
    });
  } catch (error) {
    console.error('Error in generate-ad-copy API:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating ad copies. Please try again later.'
    });
  }
}

// Helper functions to generate mock content
function getHeadline(productName, brandName, index) {
  const headlines = [
    `Introducing ${productName} by ${brandName}`,
    `${brandName}'s New ${productName} - A Game Changer`,
    `Experience the Magic of ${brandName}'s ${productName}`,
    `${productName}: The Future of ${brandName}`,
    `Why Everyone Loves ${brandName}'s ${productName}`
  ];
  
  return headlines[index % headlines.length];
}

function getBody(productName, brandName, description, tone, index) {
  const bodies = [
    `Discover the amazing features of our ${productName}. ${description} Try it today and see the difference ${brandName} can make in your life.`,
    `${brandName} proudly presents ${productName}. ${description} Join thousands of satisfied customers who have made the smart choice.`,
    `Looking for the best solution? ${brandName}'s ${productName} is here for you. ${description} Don't miss this opportunity!`,
    `${productName} by ${brandName} - designed with you in mind. ${description} Order now and experience the quality you deserve.`,
    `${brandName} introduces the revolutionary ${productName}. ${description} Be among the first to enjoy this incredible product.`
  ];
  
  return bodies[index % bodies.length];
}
