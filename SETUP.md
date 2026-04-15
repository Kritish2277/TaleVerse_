# TaleVerse Setup & Run Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js v16+ and npm
- MongoDB Atlas account (free tier OK)

### Step 1: Server Setup

```bash
cd taleverse/server
npm install

# Create .env from template
cp .env.example .env

# Edit .env with your MongoDB connection string and JWT secret
# Example:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taleverse
# JWT_SECRET=my_super_secret_key_32_characters_or_more
# PORT=5000
```

Start server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 2: Client Setup

In a new terminal:

```bash
cd taleverse/client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### Step 3: Open Browser

Visit `http://localhost:5173` and you're ready!

---

## Architecture Overview

**Frontend (React + Vite)**
- Pages: Splash → Welcome → Auth → Home (with story list & leaderboard)
- Real-time features: Socket.IO for live contributions, typing indicators, presence
- Theme: Lavender-based light/dark mode with glassmorphism UI
- Auth: JWT stored in localStorage, passed in API headers and socket auth

**Backend (Express + Node.js)**
- Routes: Auth (JWT), Stories (CRUD), Contributions (add/list), Votes, Users, Leaderboard
- Auth Middleware: Validates JWT on protected endpoints
- Socket.IO: Real-time rooms per story, presence tracking, typing events
- Database: MongoDB (Mongoose schemas for User, Story, Contribution, Vote)

---

## Key Features

| Feature | Status | Details |
|---------|--------|---------|
| User Auth | ✅ | JWT signup/login with bcrypt |
| Create Stories | ✅ | Authenticated users only |
| Contribute Text | ✅ | Add story segments in real time |
| Vote System | ✅ | Upvote/downvote contributions → author points |
| Leaderboard | ✅ | Top 20 users by points |
| Real-time Presence | ✅ | See who's writing (avatars in header) |
| Typing Indicators | ✅ | See when users are composing |
| Dark/Light Mode | ✅ | Persists to localStorage |
| JWT Auth | ✅ | Protected sockets & API routes |
| Tests | ✅ | Auth middleware unit tests with Jest |

---

## Running Tests

```bash
cd taleverse/server
npm test
```

Verifies JWT middleware rejects missing tokens and accepts valid JWTs.

---

## Environment Variables

### Server (.env)

Required:
- `MONGO_URI` - MongoDB Atlas connection string (e.g., `mongodb+srv://...`)
- `JWT_SECRET` - Secret for signing JWTs (min 32 chars recommended)

Optional:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - `development` or `production` (default: development)

### Client (.env) - Optional

If your server runs on a different host:
- `VITE_API_BASE=http://your-server:5000/api`

---

## API Quick Reference

### Authentication
```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","displayName":"Alice"}'

# Sign in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

Response: `{user: {...}, token: "eyJ..."}`

### Create a Story
```bash
curl -X POST http://localhost:5000/api/stories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Story","content":"Once upon a time..."}'
```

### List Stories
```bash
curl http://localhost:5000/api/stories
```

### Add Contribution
```bash
curl -X POST http://localhost:5000/api/stories/STORY_ID/contributions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"And then..."}'
```

### Vote on Contribution
```bash
curl -X POST http://localhost:5000/api/votes/CONTRIBUTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":1}'  # 1 for upvote, -1 for downvote
```

### Get Leaderboard
```bash
curl http://localhost:5000/api/leaderboard
```

### Get User Profile
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Socket.IO Real-Time Events

The client connects to the socket server with JWT auth. Once connected to a story room:

**Client sends:**
```javascript
socket.emit('join:story', storyId)
socket.emit('leave:story', storyId)
socket.emit('typing:start', storyId)
socket.emit('typing:stop', storyId)
```

**Server broadcasts:**
```javascript
// When a new contribution is posted
'contribution:added', {contribution_obj}

// When someone votes (updates contribution)
'vote:updated', {contribution_id, delta}

// Presence list updated (join/leave/typing)
'presence:update', [{userId, displayName, typing}]
```

---

## Project Structure

```
taleverse/
├── README.md                    # Main project overview
├── SETUP.md                     # This file (setup & run guide)
│
├── client/                      # Frontend (Vite + React)
│   ├── src/
│   │   ├── pages/              # 8 pages (Splash, Welcome, etc.)
│   │   ├── components/         # Header, Logo, ThemeToggle
│   │   ├── context/            # AuthContext, PresenceContext
│   │   ├── services/           # API, auth, contributions, votes, socket
│   │   ├── styles/             # theme variables, global CSS
│   │   ├── App.jsx             # Routes
│   │   └── main.jsx            # Entry
│   ├── package.json            # Dependencies (react, vite, socket.io-client)
│   └── vite.config.js
│
└── server/                      # Backend (Express + Node.js)
    ├── models/                 # Mongoose schemas (User, Story, Contribution, Vote)
    ├── controllers/            # Business logic (auth, stories, votes, etc.)
    ├── routes/                 # Express route handlers (6 route files)
    ├── middleware/             # JWT auth middleware
    ├── tests/                  # Jest tests
    ├── app.js                  # Express app
    ├── server.js               # Entry + Socket.IO setup
    ├── package.json            # Dependencies (express, mongoose, socket.io, etc.)
    └── .env.example
```

---

## Common Issues

### "Connection refused" on http://localhost:5000/api

**Solution:** Start the server first: `cd server && npm run dev`

### MongoDB connection error

**Solution:**
1. Check MONGO_URI in `.env` is correct
2. Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for dev)
3. Ensure connection string includes username & password

### Sockets not connecting

**Solution:**
1. Check server is running on port 5000
2. Check client VITE_API_BASE if using custom port
3. Open browser DevTools → Network → WS tab to see socket connection status

### "Unauthorized" on protected routes

**Solution:**
1. Sign in first and get a JWT token
2. Add token to API requests: `Authorization: Bearer <token>`
3. For socket connections, token is sent in handshake auth automatically

---

## Next Steps

### Short Term (this week)
- Add vote UI (upvote/downvote buttons on contributions)
- Wire leaderboard page to fetch & display top users
- Add profile editing

### Medium Term (next 2 weeks)
- Export story as PDF
- Email notifications
- Story tags/categories
- Pagination

### Long Term (future)
- Story-to-audio (TTS)
- Mobile app (React Native)
- Video collaboration
- AI suggestions

---

## Troubleshooting Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

# Check if port 5000 is in use
# Mac/Linux:
lsof -i :5000
# Windows:
netstat -ano | findstr :5000

# Kill process using port 5000 (Mac/Linux):
kill -9 <PID>
```

---

## Production Deployment

Before deploying:

1. **Security**
   - Use strong `JWT_SECRET` (32+ random chars)
   - Set NODE_ENV=production
   - Enable HTTPS
   - Restrict Socket.IO CORS origin

2. **Database**
   - Use MongoDB Atlas (cloud) or managed instance
   - Enable automatic backups
   - Use connection pooling

3. **Environment**
   - Store secrets in environment, not in code
   - Use `.env` file or CI/CD secrets

4. **Monitoring**
   - Add error logging (e.g., Sentry)
   - Set up alerts for critical errors
   - Monitor server uptime

---

**Enjoy building stories together! 🚀📖**
