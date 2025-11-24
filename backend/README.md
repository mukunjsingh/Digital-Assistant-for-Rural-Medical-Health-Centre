# Digital Assistant for Rural Medical Health Centre - Backend API

A comprehensive backend API built with Node.js, Express, and MongoDB for managing healthcare services in rural areas.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Appointment Booking**: Complete appointment management system
- **Symptom Checker**: AI-powered symptom analysis (Dialogflow integration ready)
- **Chat Logs**: Save and retrieve chat conversation history
- **Secure API**: Protected routes, input validation, and error handling

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt Password Hashing
- Helmet (Security)
- CORS
- Morgan (Logging)

## Installation

1. Clone the repository and navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rural_health_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000

# AI Service Configuration
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

**Note**: To use the AI chat feature, you can choose:

**Option 1: Google Gemini (FREE)** - Recommended for free usage
- Get API key from https://makersuite.google.com/app/apikey
- Set `AI_PROVIDER=gemini` in `.env`

**Option 2: OpenAI (PAID)** - Requires credits/paid account
- Get API key from https://platform.openai.com/api-keys
- Set `AI_PROVIDER=openai` in `.env`
- Costs approximately $0.001-0.002 per message

**Option 3: Enhanced Mock (FREE, No API Key)** - For testing
- Set `AI_PROVIDER=mock` in `.env`
- No API key needed, but responses are template-based

See `FREE_AI_SETUP.md` for detailed instructions.

5. Make sure MongoDB is running on your system

## Running the Application

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Check AI service configuration:
```bash
npm run check-ai
```

This will verify that your API keys are properly configured.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Appointments
- `POST /api/appointments` - Create appointment (protected)
- `GET /api/appointments` - Get all appointments (admin only)
- `GET /api/appointments/my-appointments` - Get user's appointments (protected)
- `GET /api/appointments/:id` - Get appointment by ID (protected)
- `PUT /api/appointments/:id` - Update appointment (protected)
- `DELETE /api/appointments/:id` - Delete appointment (protected)

### AI Chat (New)
- `POST /api/ai-chat` - Chat with AI-powered health assistant (returns AI-generated responses)
  - Body: `{ message: string, sessionId: string, language?: string }`
  - Authentication: Optional (chat logs will be associated with user if authenticated)
  - Returns: `{ response: string, intent: string, confidence: number, suggestions: string[], model: string }`

### Symptoms (Legacy - Keyword-based)
- `POST /api/symptoms/analyze` - Analyze symptoms with keyword matching (deprecated, use /api/ai-chat instead)
- `GET /api/symptoms/history/:sessionId` - Get symptom check history (protected)

### Chat Logs
- `POST /api/logs` - Save chat log
- `GET /api/logs` - Get all chat logs (admin only)
- `GET /api/logs/session/:sessionId` - Get logs by session (admin only)
- `GET /api/logs/my-logs` - Get user's chat logs (protected)
- `DELETE /api/logs/:id` - Delete chat log (admin only)

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── appointmentController.js
│   ├── symptomController.js
│   ├── aiChatController.js   # AI chat handler
│   └── logController.js
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   └── errorHandler.js       # Error handling
├── models/
│   ├── User.js
│   ├── Appointment.js
│   └── ChatLog.js
├── routes/
│   ├── authRoutes.js
│   ├── appointmentRoutes.js
│   ├── symptomRoutes.js
│   ├── aiChatRoutes.js       # AI chat routes
│   └── logRoutes.js
├── utils/
│   ├── tokenGenerator.js
│   ├── dialogflowClient.js   # Legacy keyword-based responses
│   └── aiService.js          # AI service integration (OpenAI/Gemini)
├── .env.example
├── .gitignore
├── package.json
├── server.js                 # Application entry point
└── README.md
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## User Roles

- **user**: Regular user with access to their own data
- **admin**: Full access to all resources and user management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/rural_health_db |
| JWT_SECRET | JWT signing secret | Required |
| JWT_EXPIRE | JWT expiration time | 30d |
| CORS_ORIGIN | Allowed CORS origin | * |
| AI_PROVIDER | AI provider to use: 'openai', 'gemini', or 'groq' | openai |
| OPENAI_API_KEY | OpenAI API key (required if AI_PROVIDER=openai) | - |
| OPENAI_MODEL | OpenAI model to use | gpt-3.5-turbo |
| GROQ_API_KEY | Groq API key (required if AI_PROVIDER=groq) | - |
| GROQ_MODEL | Groq model to use | llama-3.1-8b-instant |
| GEMINI_API_KEY | Gemini API key (required if AI_PROVIDER=gemini) | - |
| GEMINI_MODEL | Gemini model to use | gemini-1.5-flash |

## Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables from `.env.example`
4. Deploy!

### Deploy to Railway

1. Install Railway CLI or use the web interface
2. Run `railway init` in the backend directory
3. Add environment variables
4. Run `railway up`

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Custom error messages

All errors return JSON with a message and optional stack trace in development mode.

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation
- Helmet security headers
- CORS configuration
- Protected routes

## Development

For development, install nodemon globally or use the included dev script:

```bash
npm run dev
```

## Testing

```bash
npm test
```

## License

ISC
