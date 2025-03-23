// Simple health check API endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', message: 'API is running' });
}
