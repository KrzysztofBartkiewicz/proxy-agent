# Deploy to Render.com - Quick Guide

## ✅ Fixed Issue

**Problem:** OpenRouter was receiving invalid JSON Schema
```
"Invalid schema for function 'check_package': schema must be a JSON Schema of 'type: \"object\"', got 'type: \"None\"'."
```

**Solution:** Replaced `zod-to-json-schema` with manual JSON Schema definitions that match OpenAI's exact requirements.

---

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Fix JSON Schema for OpenRouter API"
git push origin main
```

### 2. Deploy on Render.com

#### Option A: Dashboard (Recommended)

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `ai-devs` (or your choice)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free or Starter

5. **Add Environment Variables:**
   - `AI_DEVS_API_KEY` = your API key from hub.ag3nts.org
   - `OPENROUTER_API_KEY` = your OpenRouter API key
   - `NODE_ENV` = `production`

6. Click **"Create Web Service"**

#### Option B: Using render.yaml

The `render.yaml` file is already in your project. Just:

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will auto-detect the config
5. Add environment variables in the dashboard

---

## 🧪 Testing After Deployment

Once deployed, Render gives you a URL like: `https://ai-devs-xxxx.onrender.com`

### Test 1: Health Check
```bash
curl https://your-app.onrender.com/
```
Expected: `Server alive`

### Test 2: Check Package
```bash
curl -X POST https://your-app.onrender.com/ \
  -H "Content-Type: application/json" \
  -d '{
    "sessionID": "test-123",
    "msg": "Check package ABC123"
  }'
```

Expected: JSON response with package info

### Test 3: Conversation
```bash
# First message
curl -X POST https://your-app.onrender.com/ \
  -H "Content-Type: application/json" \
  -d '{
    "sessionID": "session-456",
    "msg": "Hi, how are you?"
  }'

# Second message (same session)
curl -X POST https://your-app.onrender.com/ \
  -H "Content-Type: application/json" \
  -d '{
    "sessionID": "session-456",
    "msg": "Can you check package XYZ789?"
  }'
```

---

## 📋 Environment Variables Needed

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_DEVS_API_KEY` | ✅ Yes | Your hub.ag3nts.org API key |
| `OPENROUTER_API_KEY` | ✅ Yes | Your OpenRouter API key |
| `PORT` | ❌ No | Auto-set by Render |
| `NODE_ENV` | ⚙️ Recommended | Set to `production` |

---

## 🔍 Checking Logs

1. Go to your service in Render Dashboard
2. Click **"Logs"** tab
3. Watch for:
   - ✅ `Server is running on port XXXX`
   - ✅ Successful API calls
   - ❌ Any errors

---

## ⚠️ Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Make sure all dependencies are in `package.json` and rebuild
```bash
# On Render Dashboard
Manual Deploy → Clear build cache & deploy
```

### Issue: "Environment variable undefined"
**Solution:** Check Environment tab in Render Dashboard, add missing variables

### Issue: "OpenRouter error: 401"
**Solution:** `OPENROUTER_API_KEY` is missing or invalid

### Issue: "Packages API error"
**Solution:** `AI_DEVS_API_KEY` is missing or invalid

### Issue: App sleeps/slow start
**Solution:** Free tier spins down after 15 min. Upgrade to paid tier ($7/month) for always-on

---

## 🎯 What Was Fixed

### Before
```typescript
// Used zod-to-json-schema converter
parameters: zodToJsonSchema(schema)
// Result: Invalid schema with type: "None"
```

### After
```typescript
// Manual JSON Schema that OpenAI expects
parameters: {
  type: 'object',
  properties: {
    packageid: {
      type: 'string',
      description: 'Package ID'
    }
  },
  required: ['packageid']
}
// Result: Valid schema ✅
```

---

## ✅ Verification Checklist

Before deploying, ensure:

- [ ] All files committed to git
- [ ] `.env` file is in `.gitignore` (yes by default)
- [ ] `package.json` has all dependencies
- [ ] Environment variables ready
- [ ] Tested locally with `npm start`

After deploying:

- [ ] Deployment succeeded (check Render logs)
- [ ] Health check endpoint works (`GET /`)
- [ ] Can handle chat messages (`POST /`)
- [ ] LLM responds correctly
- [ ] Tool calls work (check package)
- [ ] No errors in logs

---

## 🔗 Useful Links

- **Render Dashboard:** https://dashboard.render.com/
- **Render Docs:** https://render.com/docs
- **OpenRouter Docs:** https://openrouter.ai/docs
- **Your API:** Check hub.ag3nts.org for your key

---

## 💡 Pro Tips

1. **Use Environment Groups:** In Render, create an Environment Group for shared secrets
2. **Enable Auto-Deploy:** Render auto-deploys on git push
3. **Monitor Logs:** Keep logs tab open during first deploy
4. **Test Locally First:** Always test with `npm start` before deploying
5. **Free Tier Limits:** Spins down after 15 min, 750 hours/month

---

## 🆘 Still Having Issues?

If you get errors:

1. Check Render logs for specific error messages
2. Verify all environment variables are set
3. Test the exact same payload locally first
4. Check OpenRouter dashboard for API usage/errors
5. Ensure your API keys are valid and have credits

The most common issue is missing or incorrect environment variables!
