const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const { createLogger, format, transports } = require('winston');
const fs = require('fs');

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

// Logger configuration
const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp(),
		format.json()
	),
	transports: [
		new transports.Console(),
		new transports.File({ filename: 'proxy.log' }) // Log to a file
	],
});

// Use morgan to log requests
app.use(morgan('combined', {
	stream: {
		write: message => logger.info(message.trim()),
	}
}));

// Middleware to capture request body
app.use(express.json()); // Support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies

// Proxy middleware configuration with request and response logging
app.use('/api', (req, res, next) => {
	req.headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;

	// Log request details including body
	logger.info({
		message: 'Request received',
		method: req.method,
		url: req.url,
		headers: req.headers,
		body: req.body
	});

	next();
}, createProxyMiddleware({
	target: targetUrl,
	changeOrigin: true,
	pathRewrite: {
		'^/api': '', // Removes /api prefix if needed for the destination endpoint
	},
	onProxyRes(proxyRes, req, res) {
		const bodyChunks = [];
		proxyRes.on('data', chunk => {
			bodyChunks.push(chunk);
		});
		proxyRes.on('end', () => {
			const body = Buffer.concat(bodyChunks).toString('utf-8');

			// Log response details including body
			logger.info({
				message: 'Response received',
				statusCode: proxyRes.statusCode,
				headers: proxyRes.headers,
				body: body,
				method: req.method,
				url: req.url,
			});
		});
	},
}));

// Start proxy server
app.listen(port, () => {
	console.log(`Proxy server is running on http://localhost:${port}`);
});
