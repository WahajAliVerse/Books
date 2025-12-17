const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// Create an Express server
const app = express();

// Proxy middleware for API requests to the RAG backend
const apiProxy = createProxyMiddleware('/api', {
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding to backend
  },
});

// Apply proxy middleware
app.use('/api', apiProxy);

// Serve the Docusaurus build directory
app.use(express.static(path.join(__dirname, 'build')));

// For any routes that don't match static files, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log(`Proxying /api requests to http://localhost:8000`);
});