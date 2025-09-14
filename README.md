# Ellerslie School AI - ESAI-Alpha-1

A modern AI chat interface powered by Google's Gemini API, featuring user authentication and a beautiful typing animation effect.

## Features

- 🤖 **ESAI-Alpha-1 Model**: Powered by Google Gemini 2.0 Flash
- 🔐 **User Authentication**: Sign up and login system with secure password storage
- 💬 **Real-time Chat**: Interactive chat interface with typing animations
- 🎨 **Modern UI**: Beautiful gradient design with responsive layout
- 💾 **Data Persistence**: User data saved in `saveData.json`
- 🚀 **Easy Deployment**: Ready to host on any Node.js platform

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

## Development

For development with auto-restart:
```bash
npm run dev
```

## API Configuration

The AI is configured to use Google's Gemini API with the provided API key. The model is set to `gemini-2.0-flash` for optimal performance.

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Node.js server
├── package.json        # Dependencies
├── saveData.json       # User data storage (auto-created)
└── README.md          # This file
```

## Features in Detail

### Authentication System
- Secure user registration and login
- Password validation and confirmation
- Session management with localStorage
- Server-side data persistence

### AI Chat Interface
- Real-time message exchange
- Typing animation effects
- Message history
- Responsive design for all devices

### AI Personality
- ESAI-Alpha-1 model with custom personality
- Branded responses from "The Ellerslie School AI Company"
- Contextual AI responses powered by Gemini

## Deployment

This application can be deployed to any Node.js hosting platform:

- **Heroku**: Add a `Procfile` with `web: node server.js`
- **Vercel**: Configure as a Node.js application
- **Railway**: Direct deployment from GitHub
- **DigitalOcean**: Deploy as a Node.js app

## Security Notes

- User passwords are stored in plain text (consider hashing for production)
- API key is embedded in the client-side code (consider server-side proxy for production)
- CORS is enabled for development (configure appropriately for production)

## License

MIT License - Made by The Ellerslie School AI Company