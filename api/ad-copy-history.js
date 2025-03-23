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

// GET handler for history
function getHistory(req, res) {
  // Return empty array - we'll use client-side data only
  return res.status(200).json({
    success: true,
    data: []
  });
}

// DELETE handler for clearing history
function clearHistory(req, res) {
  // Just return success - clearing happens on client
  return res.status(200).json({
    success: true,
    message: 'History cleared successfully'
  });
}
