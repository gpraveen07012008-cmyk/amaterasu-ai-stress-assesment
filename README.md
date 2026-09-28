<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f5f2c6e9-a29e-48be-a2b5-cd92eff6bbe0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install --legacy-peer-deps`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start the frontend and authenticated account/signaling server together:
   `npm run dev`
4. Open the frontend URL printed in the terminal and register two accounts in separate browsers/profiles. Use each account's Dummy Call ID to place a voice call. The development demo account remains `alex.rivera` / `Password123!`.

The dev command selects available ports and configures the `/api` and `/ws` proxies to match. For a standalone backend, run `npm run server`; if you run Vite separately, set `API_SERVER_PORT` to the port printed by the backend (and `PORT` to select a backend port). Account records are kept under the ignored `.data` directory; development sessions use an ephemeral signing secret and are invalidated when the server restarts.

### Production Voice Calls

Deploy the frontend and signaling server behind HTTPS. The reverse proxy must forward `/api` and upgrade `/ws` to WebSocket connections. Set a strong server-only `AUTH_SECRET` and the exact HTTPS `PUBLIC_APP_ORIGIN`. STUN servers are configured by default; for networks requiring relay, configure `TURN_URLS` and `TURN_SHARED_SECRET` for a TURN server using time-limited shared-secret credentials. Never put these secrets in Vite variables or frontend code. Run `npm run build`, then start the server with `NODE_ENV=production` and `npm start` behind the HTTPS proxy.

Call media is exchanged directly between browsers using WebRTC. The server authenticates accounts, verifies target Call IDs, and relays call setup/ICE messages; it does not receive call audio. Real-time audio analysis is not implemented.
