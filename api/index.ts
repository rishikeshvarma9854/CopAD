import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Setup Express app
const app = express();
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Simple API handler for Vercel
export default function handler(req, res) {
  // Simple API route handler
  if (req.url?.startsWith('/api/')) {
    if (req.url === '/api/health') {
      return res.status(200).json({ status: 'ok' });
    }
    
    // Add more API routes as needed
    return res.status(404).json({ error: 'API route not found' });
  }

  // For non-API routes, serve the static files
  return res.status(200).json({ message: 'This is a serverless function for API routes only' });
}
