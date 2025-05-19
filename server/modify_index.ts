/**
 * This file replaces the Express.js server functionality with a proxy to FastAPI
 * when running in development mode.
 */
import express, { Express, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serveStatic, setupVite, log } from './vite';

const app = express();

// Set up Vite for the frontend
setupVite(app, null).then(() => {
  // Add proxy to FastAPI server for all API requests
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5001', // FastAPI server address
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api', // No path rewriting needed
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      log(`Proxying ${req.method} ${req.url} to FastAPI`, 'proxy');
    },
    onProxyRes: (proxyRes, req, res) => {
      log(`Received response from FastAPI for ${req.method} ${req.url}`, 'proxy');
    },
    onError: (err, req, res) => {
      log(`Proxy error: ${err.message}`, 'proxy');
      res.status(500).json({ error: 'FastAPI server not available' });
    }
  }));

  // Mock auth endpoint for development
  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.json({
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@devplatform.co",
      username: "johndoe",
    });
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  });

  // Start the Express server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    log(`serving on port ${PORT}`);
    
    // Start the FastAPI server in a separate process
    const { spawn } = require('child_process');
    const fastapi = spawn('bash', ['-c', 'cd backend && python3 -m uvicorn api.app:app --host 0.0.0.0 --port 5001 --reload']);
    
    fastapi.stdout.on('data', (data: Buffer) => {
      console.log(`[FastAPI] ${data.toString().trim()}`);
    });
    
    fastapi.stderr.on('data', (data: Buffer) => {
      console.error(`[FastAPI Error] ${data.toString().trim()}`);
    });
    
    fastapi.on('close', (code: number) => {
      console.log(`FastAPI server exited with code ${code}`);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down servers...');
      fastapi.kill();
      process.exit(0);
    });
  });
});