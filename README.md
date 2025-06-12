# LLM Proxy Server

This server acts as a proxy to forward requests to a specified Large Language Model (LLM) provider, adding required headers for authentication.

## Setup Instructions

1. **Configure Environment Variables**:

   - Copy the example environment configuration to a new file:
     ```bash
     cp .env.example .env
     ```

   - Edit the `.env` file to specify your LLM provider details:
     ```bash
     LLM_PROXY_URL=https://custom.llm.provider.nl/api/v1/
     LLM_PROXY_SUBSCRIPTION_KEY=REPLACE
     LLM_PROXY_PORT=3000
     ```
     Ensure to replace each placeholder with your actual target URL, subscription key, and desired port.

2. **Run the Server**:

   - Start the server using Node.js:
     ```bash
     node server.js
     ```

Your server will now be running and proxying requests as configured.
