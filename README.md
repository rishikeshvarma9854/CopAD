# Creative Ad Copilot

A full-stack application built with React, Vite, Express, and TypeScript.

## Deployment Instructions for Vercel

### Prerequisites

- A Vercel account
- Git repository (GitHub, GitLab, or Bitbucket)

### Steps to Deploy

1. **Push your code to GitHub**
   ```
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import your project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the repository you want to deploy

3. **Configure Environment Variables**
   - In the Vercel project settings, add the following environment variables:
     - `DATABASE_URL`: Your database connection string
     - `HUGGINGFACE_API_KEY`: Your Hugging Face API key
     - Add any other environment variables your application needs

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

## Development

### Installation

```bash
npm install
```

### Running locally

```bash
npm run dev
```

### Building for production

```bash
npm run build
```

### Starting production server

```bash
npm start
```
