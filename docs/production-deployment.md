# Production Deployment Guide

This guide covers deploying PantherKolab to production with Socket.IO support.

## Overview

PantherKolab uses a **custom Node.js server** ([server.ts](../server.ts)) that combines:
- Next.js application server
- Socket.IO server for real-time features (calls, messages)

**IMPORTANT:** You MUST use the custom server in production. The default `next start` command will NOT work because it doesn't include Socket.IO.

---

## Quick Start

### 1. Build the Application

```bash
npm run build
```

This compiles the Next.js app into the `.next` directory.

### 2. Set Up Production Environment Variables

Create a `.env.production` file (or configure environment variables in your hosting platform):

```bash
# Production Domain
NEXT_PUBLIC_APP_URL=https://pantherkolab.com

# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_4fWvgNvC3
NEXT_PUBLIC_COGNITO_CLIENT_ID=2fahfmaruotenn36rnavjm51s5

# AWS Credentials (production)
AWS_ACCESS_KEY_ID=your-production-key
AWS_SECRET_ACCESS_KEY=your-production-secret
APPSYNC_EVENT_API_ID=your-production-appsync-id

# Optional: Custom port (defaults to 3000)
PORT=3000
```

**Security Note:** Never commit `.env.production` to version control!

### 3. Start the Production Server

```bash
npm start
```

This runs: `NODE_ENV=production tsx server.ts`

The server will:
- Start Next.js in production mode
- Initialize Socket.IO server
- Bind to `0.0.0.0:3000` (all network interfaces)
- Enable CORS for `pantherkolab.com` and `www.pantherkolab.com`

---

## Configuration Details

### Server Configuration ([server.ts](../server.ts))

**Development Mode:**
- Hostname: `localhost`
- CORS: `*` (allow all origins)
- Auto-reload on file changes

**Production Mode:**
- Hostname: `0.0.0.0` (binds to all interfaces)
- CORS: Only `pantherkolab.com`, `www.pantherkolab.com`, and `NEXT_PUBLIC_APP_URL`
- Optimized build from `.next` directory

### Socket.IO Client Configuration

The client ([src/lib/socket-client.ts](../src/lib/socket-client.ts)) automatically determines the server URL:

1. **`NEXT_PUBLIC_SOCKET_URL`** (if set) - for custom Socket.IO server
2. **`NEXT_PUBLIC_APP_URL`** (if set) - production domain
3. **Development fallback:** `http://localhost:3000`
4. **Production fallback:** Current domain (`window.location.origin`)

### Transport Configuration

**Transports enabled:** WebSocket (preferred) and HTTP long-polling (fallback)

**Client side:**
```typescript
transports: ["websocket", "polling"]
```

**Server side:**
```typescript
transports: ["websocket", "polling"]
allowEIO3: true  // Compatibility with older clients
```

---

## Deployment Platforms

### AWS EC2 / VPS Deployment

1. **Install dependencies:**
   ```bash
   npm ci --production=false
   ```

2. **Build application:**
   ```bash
   npm run build
   ```

3. **Set environment variables** (use `.env.production` or export to shell)

4. **Start with process manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "pantherkolab" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure reverse proxy (nginx):**
   ```nginx
   server {
       listen 80;
       server_name pantherkolab.com www.pantherkolab.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Socket.IO specific
       location /socket.io/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable HTTPS with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d pantherkolab.com -d www.pantherkolab.com
   ```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start server
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t pantherkolab .
docker run -p 3000:3000 --env-file .env.production pantherkolab
```

### Vercel / Netlify (NOT RECOMMENDED)

⚠️ **Vercel and Netlify do NOT support custom Node.js servers with Socket.IO.**

These platforms use serverless functions which cannot maintain WebSocket connections.

**Alternative:** Deploy frontend to Vercel/Netlify and Socket.IO server separately to EC2/VPS.

---

## Troubleshooting

### WebSocket Connection Fails

**Symptoms:**
- Socket.IO falls back to polling
- Connection errors in browser console
- `ERR_CONNECTION_REFUSED` or `wss:// failed`

**Solutions:**

1. **Check server is using custom server:**
   ```bash
   # Correct (uses server.ts with Socket.IO)
   npm start

   # Wrong (Next.js standalone without Socket.IO)
   npm run start:next
   ```

2. **Verify environment variables:**
   ```bash
   echo $NEXT_PUBLIC_APP_URL
   # Should output: https://pantherkolab.com
   ```

3. **Check reverse proxy WebSocket headers:**
   ```nginx
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
   ```

4. **Verify firewall allows port 3000:**
   ```bash
   sudo ufw allow 3000
   ```

5. **Check CORS configuration:**
   - Ensure your domain is in the CORS allowed origins list in [server.ts:47-53](../server.ts#L47-L53)

### Authentication Issues

**Symptoms:**
- "Unauthorized" Socket.IO errors
- Connection immediately disconnects

**Solutions:**

1. **Verify JWT token is being sent:**
   - Check browser DevTools > Network > socket.io > Headers
   - Look for `auth.token` in connection handshake

2. **Check Cognito configuration:**
   ```bash
   # Verify environment variables match AWS Cognito
   echo $NEXT_PUBLIC_COGNITO_USER_POOL_ID
   echo $NEXT_PUBLIC_COGNITO_CLIENT_ID
   ```

3. **Update Cognito allowed callback URLs:**
   - AWS Console > Cognito > User Pools > App Integration
   - Add production domain to allowed callback URLs
   - Add production domain to allowed logout URLs

### Server Won't Start

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use`

**Solutions:**

1. **Check if port 3000 is already in use:**
   ```bash
   lsof -i :3000
   # Kill the process
   kill -9 <PID>
   ```

2. **Use a different port:**
   ```bash
   PORT=4000 npm start
   ```

---

## Monitoring

### Server Logs

```bash
# PM2 logs
pm2 logs pantherkolab

# Docker logs
docker logs <container-id>

# Direct server logs
npm start 2>&1 | tee server.log
```

### Health Check Endpoint

Add to [server.ts](../server.ts):

```typescript
server.on("request", (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", socketIO: true }));
    return;
  }
  // ... existing handler
});
```

---

## Performance Optimization

### Enable Compression

Install compression middleware:
```bash
npm install compression
```

Update [server.ts](../server.ts):
```typescript
import compression from "compression";

const server = createServer(compression(), async (req, res) => {
  // ... existing code
});
```

### Enable Rate Limiting

Prevent abuse of Socket.IO connections:

```typescript
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;

  // Limit to 5 connections per user
  const userSockets = Array.from(io.sockets.sockets.values())
    .filter(s => s.handshake.auth.userId === userId);

  if (userSockets.length >= 5) {
    return next(new Error("Too many connections"));
  }

  next();
});
```

---

## Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (not HTTP) in production
- [ ] Configure CORS to allow only your domain
- [ ] Enable `credentials: true` for cookies
- [ ] Use secure environment variables (not hardcoded)
- [ ] Enable rate limiting on Socket.IO
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use process manager (PM2) with auto-restart
- [ ] Set up server monitoring and alerts

---

## Additional Resources

- [Socket.IO Production Best Practices](https://socket.io/docs/v4/server-options/)
- [Next.js Custom Server Documentation](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
- [nginx WebSocket Proxy](https://nginx.org/en/docs/http/websocket.html)
