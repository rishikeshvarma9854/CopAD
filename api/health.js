// Simple health check endpoint

export default function handler(req, res) {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
}
