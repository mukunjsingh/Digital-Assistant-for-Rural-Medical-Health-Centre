# Digital Assistant for Rural Medical Health Centre - Frontend

A modern React.js frontend for the rural health center management system. Built with Vite, React Router, and Tailwind CSS.

## Features

- **User Authentication**: Login and registration with JWT token management
- **Symptom Checker**: Chat-based interface with AI-powered symptom analysis
  - Voice input support using Web Speech API
  - Language support (English and Hindi)
- **Appointment Booking**: Easy-to-use form for scheduling medical appointments
- **Admin Dashboard**: View all appointments and chat logs (admin only)
- **Responsive Design**: Mobile-friendly UI for all screen sizes
- **Context API**: State management for authentication

## Tech Stack

- React 18
- Vite (build tool)
- React Router DOM v6
- Tailwind CSS
- Context API
- Fetch API
- Web Speech API

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # User login
│   │   ├── Register.jsx          # User registration
│   │   ├── Chat.jsx              # Symptom checker chat
│   │   ├── Appointment.jsx       # Appointment booking
│   │   └── AdminDashboard.jsx    # Admin management
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── ProtectedRoute.jsx    # Route protection
│   │   └── ChatBubble.jsx        # Chat message component
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management
│   ├── utils/
│   │   ├── api.js                # API helper functions
│   │   └── useVoiceInput.js      # Voice input hook
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000`. All API calls are made through `src/utils/api.js`.

### Available Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Appointments:**
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - Get all appointments (admin)

**AI Chat:**
- `POST /api/ai-chat` - Chat with AI-powered health assistant (returns AI-generated responses)

**Symptoms (Legacy):**
- `POST /api/symptoms/analyze` - Analyze symptoms (keyword-based, deprecated)

**Chat Logs:**
- `POST /api/logs` - Save chat log
- `GET /api/logs` - Get all logs (admin)

## Features in Detail

### Chat Interface
- **AI-Powered Conversations**: Uses OpenAI/Gemini API for intelligent health-related responses
- Real-time symptom analysis and health questions
- Voice input with Web Speech API
- Language toggle (English/Hindi)
- Chat history automatically saved to backend
- Animated loading states
- Error handling for AI service issues

### Appointment System
- Form validation
- Date and time picker
- Patient information collection
- Success confirmation screen
- Automatic redirect after booking

### Admin Dashboard
- View all appointments in table format
- View all chat logs
- Tab-based interface
- Real-time data fetching

### Authentication
- Secure JWT token storage
- Auto-login on page refresh
- Protected routes
- Role-based access control

## Development

### Environment Variables

No environment variables needed for frontend. Backend URL is hardcoded to `http://localhost:5000`.

To change backend URL, edit `src/utils/api.js`:

```javascript
const API_URL = 'http://localhost:5000';
```

### Components

- **Navbar**: Navigation with auth-aware buttons
- **ProtectedRoute**: Wraps routes requiring authentication
- **ChatBubble**: Displays chat messages
- **useVoiceInput**: Custom hook for speech recognition

### State Management

Uses React Context API for global auth state:
- `user` - Current user object
- `token` - JWT authentication token
- `login()` - Login function
- `logout()` - Logout function
- `loading` - Initial load state

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Voice Input Support

Voice input requires:
- Modern browser (Chrome, Edge, Firefox, Safari)
- HTTPS connection (production)
- Microphone permissions

Languages supported:
- English (en-US)
- Hindi (hi-IN)

## Performance

- Code splitting with React Router
- Lazy loading of routes
- Optimized Tailwind CSS
- Minimal bundle size (~250KB gzipped)

## Known Limitations

- Voice input not available in IE or older browsers
- Requires backend to be running for full functionality
- Admin features require admin role

## Troubleshooting

### Backend connection error
- Ensure backend server is running on port 5000
- Check CORS configuration on backend
- Verify API_URL in `src/utils/api.js`

### Voice input not working
- Check browser compatibility
- Verify microphone permissions
- Ensure HTTPS in production

### Login issues
- Clear browser cache and localStorage
- Verify credentials
- Check backend authentication setup

## License

ISC
