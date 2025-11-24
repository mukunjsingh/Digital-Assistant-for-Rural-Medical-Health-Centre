# Quick Setup Guide for AI Chat

If you're seeing "AI service is temporarily unavailable" error, follow these steps:

## Step 1: Check Your Backend .env File

Navigate to the `backend` folder and ensure you have a `.env` file. If it doesn't exist, create one.

## Step 2: Add Required Environment Variables

Add these lines to your `backend/.env` file:

```env
# Choose your AI provider: 'openai' or 'gemini'
AI_PROVIDER=openai

# For OpenAI (if AI_PROVIDER=openai)
OPENAI_API_KEY=your_actual_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# For Gemini (if AI_PROVIDER=gemini)
# GEMINI_API_KEY=your_actual_api_key_here
# GEMINI_MODEL=gemini-pro
```

## Step 3: Get Your API Key

### Option A: Using OpenAI (Recommended for beginners)

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-...`)
5. Paste it in your `.env` file as `OPENAI_API_KEY=sk-...`
6. Save the file

**Note**: OpenAI requires a paid account with credits. You may need to add payment information.

### Option B: Using Google Gemini (Free tier available)

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. In your `.env` file, set:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_copied_key_here
   ```
6. Save the file

## Step 4: Restart Your Backend Server

After adding the API key:

1. Stop your backend server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```

3. Verify the server starts without errors

## Step 5: Test the Configuration

### Option 1: Check Health Endpoint

Open your browser and go to:
```
http://localhost:5000/api/ai-chat/health
```

You should see:
```json
{
  "status": "configured",
  "provider": "openai",
  "hasApiKey": true,
  "message": "AI service is configured with openai"
}
```

If you see `"status": "not_configured"`, check your `.env` file again.

### Option 2: Test in Chat UI

1. Go to http://localhost:3000/chat
2. Type a message like "Hello"
3. If configured correctly, you should get an AI response

## Common Issues

### Issue: "AI_NOT_CONFIGURED" error

**Solution**: 
- Check that `.env` file exists in the `backend` folder (not root folder)
- Verify the API key variable name matches exactly: `OPENAI_API_KEY` or `GEMINI_API_KEY`
- Make sure there are no spaces around the `=` sign
- Restart the backend server after making changes

### Issue: "INVALID_API_KEY" error

**Solution**:
- Verify you copied the entire API key correctly
- For OpenAI, key should start with `sk-`
- Check if the API key has expired or been revoked
- Generate a new API key from the provider's website

### Issue: "RATE_LIMIT" error

**Solution**:
- You may have exceeded your API quota
- Check your API account for usage limits
- Wait a few minutes and try again
- Consider upgrading your API plan

### Issue: Backend server won't start

**Solution**:
- Check console for error messages
- Verify `.env` file syntax is correct (no quotes needed around values)
- Ensure MongoDB is running
- Check that all required packages are installed: `npm install`

## Verify Your .env File Location

Your `.env` file should be here:
```
pbl/
└── backend/
    ├── .env          ← Should be here
    ├── server.js
    ├── package.json
    └── ...
```

NOT here:
```
pbl/
├── .env          ← Wrong location
└── backend/
```

## Example .env File

Here's a complete example `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rural_health_db
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000

# AI Service Configuration
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-abc123xyz789...
OPENAI_MODEL=gpt-3.5-turbo
```

## Still Having Issues?

1. Check the backend console logs for detailed error messages
2. Visit `/api/ai-chat/health` endpoint to see configuration status
3. Verify Node.js version (should be 18+ for native fetch support)
4. Check internet connection (API calls require internet)

## Testing Without API Key (Fallback)

If you want to test without an API key temporarily, you can modify the code to use a fallback response, but the AI chat feature won't work properly without a valid API key.

