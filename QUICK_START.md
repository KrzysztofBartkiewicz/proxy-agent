# Quick Start Guide

## 🚀 Two Ways to Use Your Tools

### 1️⃣ For Render.com (Web API)
**Use your existing Express server** → Already ready to deploy!

```bash
# Your Express server is already configured
npm start  # Runs src/server.ts
```

**Deploy to Render.com:**
1. Push to GitHub
2. Connect to Render.com
3. Add `AI_DEVS_API_KEY` environment variable
4. Deploy!

📖 Full guide: See `DEPLOYMENT.md`

**Test it:**
```bash
curl -X POST https://your-app.onrender.com/ \
  -H "Content-Type: application/json" \
  -d '{
    "sessionID": "test-123",
    "msg": "Check package ABC"
  }'
```

---

### 2️⃣ For Claude Desktop (Local MCP)
**Use the new MCP server** → For local Claude Desktop integration

```bash
npm run mcp  # Runs src/mcp-server.ts
```

**Setup Claude Desktop:**
1. Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add the MCP server config (see `MCP_SERVER_README.md`)
3. Restart Claude Desktop
4. Ask Claude to check packages!

📖 Full guide: See `MCP_SERVER_README.md`

---

## What's the Difference?

| Feature | Express Server (Render) | MCP Server (Local) |
|---------|------------------------|-------------------|
| **File** | `src/server.ts` | `src/mcp-server.ts` |
| **Runs on** | Render.com (cloud) | Your computer |
| **Used by** | External HTTP calls | Claude Desktop |
| **Access** | Public API | Local only |
| **Deploy** | Yes ✅ | No ❌ |

---

## Quick Commands

```bash
# Development (local Express server)
npm run dev

# Production (Express server for Render)
npm start

# MCP Server (Claude Desktop)
npm run mcp
```

---

## TL;DR

- **For Render.com**: Use your existing Express server (`npm start`) ✅
- **For Claude Desktop**: Use the new MCP server (`npm run mcp`) ✅
- **Both can run simultaneously**: They serve different purposes!
