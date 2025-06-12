const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Retrieve environment variables with LLM_PROXY_ prefix
const targetUrl = process.env.LLM_PROXY_URL;
const port = process.env.LLM_PROXY_PORT;
const subscriptionKey = process.env.LLM_PROXY_SUBSCRIPTION_KEY;

// Check if the required environment variables are set.
if (!targetUrl) {
	console.error('Error: LLM_PROXY_URL is required but is not set.');
	process.exit(1);
}

if (!port) {
	console.error('Error: LLM_PROXY_PORT is required but is not set.');
	process.exit(1);
}

if (!subscriptionKey) {
	console.error('Error: LLM_PROXY_SUBSCRIPTION_KEY is required but is not set.');
	process.exit(1);
}

const app = express();

// Proxy middleware configuration
app.use('/api', (req, res, next) => {
	req.headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;
	next();
}, createProxyMiddleware({
	target: targetUrl,
	changeOrigin: true,
	pathRewrite: {
		'^/api': '', // Removes /api prefix if needed for the destination endpoint
	},
}));

// Start proxy server
app.listen(port, () => {
	console.log(`Proxy server is running on http://localhost:${port}`);
});
