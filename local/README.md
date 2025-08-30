
# LogoMesh Local Development Setup

This folder contains configuration files for running LogoMesh locally on your PC.

## Quick Setup

1. **Download LogoMesh source code** to your PC
2. **Copy the `.env` file** from this folder to your project root
3. **Configure your environment** by editing the `.env` file
4. **Install dependencies**:
   ```bash
   npm install
   cd server && npm install
   ```
5. **Start the application**:
   ```bash
   # Terminal 1: Start backend
   cd server && npm run dev
   
   # Terminal 2: Start frontend
   npm start
   ```

## Database Configuration

### Option 1: SQLite (Easiest for local development)
```env
DATABASE_URL=sqlite:./data/logomesh.db
```
No additional setup required - SQLite file will be created automatically.

### Option 2: PostgreSQL (Recommended for production)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/logomesh
```
Requires PostgreSQL server running locally.

### Option 3: Remote PostgreSQL (Replit Database)
If you want to sync with your Replit database:
1. Get connection string from Replit Database tool
2. Set: `DATABASE_URL=your_replit_connection_string`

## User Authentication

For multi-user support, set these values:
```env
JWT_SECRET=your_secure_random_string_here
SESSION_SECRET=another_secure_random_string_here
```

## AI Features (Optional)

### Local Ollama
1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull llama2`
3. Set: `OLLAMA_URL=http://localhost:11434`

### External LLM APIs
Add your API keys to your `.env` file (do not commit them):
```env
# Example (in your .env file):
# OPENAI_API_KEY your_key_here
# ANTHROPIC_API_KEY your_key_here
```

## Development Workflow

1. **Make changes** to your local code
2. **Test locally** with your database
3. **Push to Replit** for deployment
4. **Use same database** across both environments

## Troubleshooting

- **Port conflicts**: Change `PORT=3001` to another port
- **Database issues**: Check your `DATABASE_URL` format
- **CORS errors**: Ensure `REACT_APP_API_URL` matches your backend port
- **Missing dependencies**: Run `npm install` in both root and `server/` directories

## File Structure
```
your-logomesh/
├── .env                    # Copy from local/.env and configure
├── server/
│   └── src/
└── src/
```
