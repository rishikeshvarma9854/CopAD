export default function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getHistory(req, res);
    case 'DELETE':
      return clearHistory(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Mock history data
const mockHistory = [
  {
    id: 1,
    productName: 'Smart Watch',
    brandName: 'TechWear',
    platform: 'Instagram',
    tone: 'Professional',
    ageRange: '25-34',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    copies: [
      {
        headline: 'Introducing TechWear Smart Watch',
        body: 'Track your fitness, manage notifications, and stay connected with the new TechWear Smart Watch. Perfect for busy professionals.',
        platform: 'Instagram'
      },
      {
        headline: 'TechWear Smart Watch - A Game Changer',
        body: 'TechWear proudly presents Smart Watch. Sleek design with powerful features. Join thousands of satisfied customers who have made the smart choice.',
        platform: 'Instagram'
      }
    ]
  },
  {
    id: 2,
    productName: 'Eco-Friendly Water Bottle',
    brandName: 'GreenLife',
    platform: 'Facebook',
    tone: 'Friendly',
    ageRange: '18-65',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    copies: [
      {
        headline: 'Experience the Magic of GreenLife Water Bottle',
        body: 'Looking for the best solution? GreenLife Eco-Friendly Water Bottle is here for you. Made from sustainable materials and designed to last. Do not miss this opportunity!',
        platform: 'Facebook'
      }
    ]
  }
];

// GET handler for history
function getHistory(req, res) {
  // Return mock history data
  return res.status(200).json({
    success: true,
    data: mockHistory
  });
}

// DELETE handler for clearing history
function clearHistory(req, res) {
  // In a real app, this would clear the database
  // For mock, we just return success
  return res.status(200).json({
    success: true,
    message: 'History cleared successfully'
  });
}
