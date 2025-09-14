# Deployment Guide - Ellerslie School AI

## Quick Start (Local Development)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   Open your browser and go to: `http://localhost:3000`

## Production Deployment

### Option 1: Heroku

1. **Create a Heroku App**
   ```bash
   heroku create your-ai-app-name
   ```

2. **Add a Procfile**
   Create a file named `Procfile` in the root directory:
   ```
   web: node server.js
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Option 2: Railway

1. **Connect GitHub Repository**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will automatically detect it's a Node.js app

2. **Configure Environment**
   - No additional configuration needed
   - Railway will run `npm install` and `npm start` automatically

### Option 3: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure for Node.js**
   - Vercel will detect the Node.js app
   - Make sure to set the build command to `npm install`
   - Set the start command to `node server.js`

### Option 4: DigitalOcean App Platform

1. **Create New App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select Node.js as the runtime

2. **Configure Build Settings**
   - Build Command: `npm install`
   - Run Command: `node server.js`
   - Source Directory: `/`

## Environment Variables

For production, consider setting these environment variables:

```bash
PORT=3000
NODE_ENV=production
```

## Security Considerations

### For Production Deployment:

1. **Hash Passwords**
   - Currently passwords are stored in plain text
   - Implement bcrypt or similar for production

2. **API Key Security**
   - Move the Gemini API key to environment variables
   - Use server-side proxy for API calls

3. **HTTPS**
   - Enable HTTPS in production
   - Use SSL certificates

4. **Rate Limiting**
   - Implement rate limiting for API calls
   - Add request throttling

## Monitoring

### Health Check Endpoint
The app includes a basic health check at `/api/users` that returns the current user data.

### Logs
Monitor application logs for:
- User registration/login attempts
- API errors
- Server performance

## Scaling

### Database
- Currently uses JSON file storage
- For production, consider migrating to:
  - PostgreSQL
  - MongoDB
  - Firebase

### Caching
- Implement Redis for session management
- Cache AI responses for common queries

## Backup

### Data Backup
- The `saveData.json` file contains all user data
- Implement regular backups of this file
- Consider automated backup solutions

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **API Key Issues**
   - Verify the Gemini API key is correct
   - Check API quotas and limits

3. **CORS Issues**
   - Ensure CORS is properly configured
   - Check domain whitelist

### Logs
Check server logs for detailed error information:
```bash
# If using PM2
pm2 logs

# If using Docker
docker logs container-name

# If using systemd
journalctl -u your-service-name
```

## Performance Optimization

1. **Enable Gzip Compression**
2. **Implement CDN for static assets**
3. **Add database indexing**
4. **Implement connection pooling**
5. **Add caching layers**

## Support

For issues or questions:
- Check the application logs
- Verify API key configuration
- Ensure all dependencies are installed
- Check network connectivity

---

**Made by The Ellerslie School AI Company** 🤖