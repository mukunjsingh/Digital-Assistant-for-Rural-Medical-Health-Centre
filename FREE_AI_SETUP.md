# Free AI Chat Setup Guide

## Problem: OpenAI API is Paid 💰

Yes, **OpenAI API requires payment** and credits. You need to:
- Sign up at https://platform.openai.com
- Add a payment method
- Purchase credits

**Cost**: Approximately $0.001-0.002 per message (gpt-3.5-turbo)

---

## ✅ Solution 1: Use Google Gemini (FREE)

Google Gemini offers a **free tier** with generous limits!

### Setup Steps:

1. **Get Free API Key**:
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key

2. **Update your `backend/.env` file**:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```
   
   **Note**: The default model is now `gemini-1.5-flash` (free and fast). You can also use `gemini-1.5-pro` for better quality.

3. **Restart backend**:
   ```bash
   cd backend
   npm run dev
   ```

**That's it!** The chat will now use Gemini's free API.

---

## ✅ Solution 2: Use Enhanced Mock Responses (FREE, No API Key Needed)

If you don't want to use any external API, you can use the **enhanced mock system** that provides better responses than the old keyword system.

### Setup Steps:

1. **Update your `backend/.env` file**:
   ```env
   AI_PROVIDER=mock
   ```

2. **Restart backend**:
   ```bash
   cd backend
   npm run dev
   ```

### What This Does:

- ✅ Works **immediately** - no API key needed
- ✅ **Better responses** than old keyword system
- ✅ Handles more topics (fever, cough, headache, stomach issues, appointments)
- ✅ Provides structured, helpful advice
- ✅ Free forever - no API costs

### Limitations:

- ❌ Not as intelligent as real AI (OpenAI/Gemini)
- ❌ Limited to common health topics
- ❌ Cannot answer complex or unique questions
- ❌ Responses are template-based

---

## Quick Comparison

| Option | Cost | Setup | Quality | Best For |
|--------|------|-------|---------|----------|
| **OpenAI** | Paid (~$0.001/message) | Add API key | ⭐⭐⭐⭐⭐ | Production, best quality |
| **Gemini** | FREE | Add API key | ⭐⭐⭐⭐ | Free, good quality |
| **Mock/Enhanced** | FREE | Set `AI_PROVIDER=mock` | ⭐⭐⭐ | Testing, no API needed |

---

## Recommended: Use Gemini (Free)

For the **best free option**, use Gemini:

```env
# backend/.env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

**Why Gemini?**
- ✅ Free tier with good limits
- ✅ Real AI responses
- ✅ Handles any health question
- ✅ Easy setup

---

## Troubleshooting "Failed to Fetch" Error

If you're getting "Failed to fetch" error:

### Check 1: API Key Configuration
```bash
cd backend
npm run check-ai
```

### Check 2: Network/CORS Issues
- Make sure backend is running on port 5000
- Check browser console for CORS errors
- Verify `CORS_ORIGIN` in `.env` matches your frontend URL

### Check 3: API Quota/Credits
- **OpenAI**: Check balance at https://platform.openai.com/usage
- **Gemini**: Check quota at https://makersuite.google.com

### Check 4: Use Mock Mode (No API)
If you just want it to work without any API:
```env
AI_PROVIDER=mock
```
Then restart backend. No API key needed!

---

## Current Status Check

Run this to see what's configured:

```bash
cd backend
npm run check-ai
```

Or visit: http://localhost:5000/api/ai-chat/health

---

## My Recommendation

1. **For Production/Best Quality**: Use Gemini (free, real AI)
2. **For Testing/Development**: Use Mock mode (no setup needed)
3. **If You Have Budget**: Use OpenAI (best quality)

**Start with Gemini** - it's free and works great! 🚀

