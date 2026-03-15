# Deployment Guide

## Architecture Overview

This project has **two separate components**:

### 1. Express Server (for Render.com) ✅
- **File**: `src/server.ts`
- **Purpose**: HTTP API for your agent with tools
- **Deployment**: Render.com, Railway, Heroku, etc.
- **Access**: Anyone can call it via HTTP

### 2. MCP Server (local only) 🖥️
- **File**: `src/mcp-server.ts`
- **Purpose**: Claude Desktop integration
- **Deployment**: Runs locally on your machine
- **Access**: Only Claude Desktop on your machine

---

## Deploying to Render.com

### Option 1: Using Render Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository

3. **Configure Service**
   - **Name**: `ai-devs` (or your choice)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or paid (your choice)

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add: `AI_DEVS_API_KEY` = your actual API key
   - Add: `NODE_ENV` = `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

### Option 2: Using render.yaml (Infrastructure as Code)

The `render.yaml` file is already created in your project root.

1. **Set up Render**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will auto-detect `render.yaml`

2. **Add Secret Environment Variables**
   - In Render dashboard, go to your service
   - Add `AI_DEVS_API_KEY` in Environment tab

---

## Testing Your Deployment

Once deployed, Render will give you a URL like: `https://ai-devs-xxxx.onrender.com`

### Test the health endpoint:
```bash
curl https://your-app.onrender.com/
```

Expected response: `Server alive`

### Test the agent:
```bash
curl -X POST https://your-app.onrender.com/ \
  -H "Content-Type: application/json" \
  -d '{
    "sessionID": "test-session-123",
    "msg": "Check package ID ABC123"
  }'
```

---

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `AI_DEVS_API_KEY` | Your hub.ag3nts.org API key | Yes |
| `PORT` | Port number (auto-set by Render) | No |
| `NODE_ENV` | Set to `production` | Recommended |

---

## Troubleshooting

### Logs
View logs in Render dashboard:
- Go to your service
- Click "Logs" tab
- Watch real-time logs

### Common Issues

**Issue**: Build fails
- **Solution**: Check that all dependencies are in `package.json`
- **Solution**: Ensure `"type": "module"` is set for ES modules

**Issue**: Server crashes on startup
- **Solution**: Check environment variables are set
- **Solution**: Check logs for specific error messages

**Issue**: Timeouts
- **Solution**: Render free tier spins down after 15 min inactivity
- **Solution**: First request after inactivity takes ~30 seconds

---

## Local MCP Server (Not for Render.com)

The MCP server (`src/mcp-server.ts`) is **only for local use** with Claude Desktop:

```bash
npm run mcp
```

See `MCP_SERVER_README.md` for Claude Desktop configuration.

---

## Cost Considerations

### Render.com Free Tier
- ✅ Free for hobby projects
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ 750 hours/month free (enough for 1 service 24/7)
- ⚠️ Slow cold starts (15-30 seconds)

### Render.com Paid Tier ($7+/month)
- ✅ Always running (no spin down)
- ✅ Faster performance
- ✅ More memory/CPU options

---

## Continuous Deployment

Once set up, Render automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main
# Render auto-deploys
```

Monitor deployment in Render dashboard.

---

## Security Notes

- ✅ Never commit `.env` file (already in `.gitignore`)
- ✅ Use Render environment variables for secrets
- ✅ Consider adding API key authentication to your endpoints
- ✅ Consider rate limiting for production use
