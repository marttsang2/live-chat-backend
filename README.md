# Live Chat Backend

A real-time chat backend built with Node.js, WebSocket, and OpenAI integration.

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn package manager

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=8080
   NODE_ENV=development
   ```

3. **Start the server:**
   ```bash
   # Production mode
   npm start
   
   # Development mode
   npm run dev
   ```

## Features

- WebSocket-based real-time communication
- OpenAI GPT integration with FAQ knowledge base
- CSV-based FAQ data integration for retail clothing support
- Session-based conversation history
- Traditional Chinese language support
- Express.js server with static file serving

## API

The server runs on `http://localhost:8080` and accepts WebSocket connections.

### WebSocket Message Format

Send messages in the following JSON format:
```json
{
  "role": "user",
  "content": "Your message here"
}
```

The server will respond with:
```json
{
  "role": "assistant", 
  "content": "AI response here"
}
```

## How to Call WebSocket

### 1. Browser (HTML/JavaScript)
Open `examples/websocket-client.html` in your browser for a complete chat interface.

### 2. Node.js Client
```bash
# Interactive chat
node examples/websocket-client.js --interactive

# Automated test
node examples/websocket-client.js --auto
```

### 3. Simple JavaScript (Browser Console)
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected!');
    ws.send(JSON.stringify({
        role: 'user',
        content: '有什麼付款方式？'
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Response:', message.content);
};
```

### 4. cURL WebSocket Test
```bash
# Install wscat for testing
npm install -g wscat

# Connect and test
wscat -c ws://localhost:8080
# Then send: {"role":"user","content":"有什麼付款方式？"}
```

## Project Structure

- `server.js` - Main server file with WebSocket and OpenAI integration
- `package.json` - Node.js project configuration and dependencies
- `retail clothes 100FAQ.csv` - FAQ knowledge base for retail clothing support
- `public/` - Static files served by Express (if exists)

## Dependencies

- **express** - Web framework for Node.js
- **ws** - WebSocket library
- **openai** - OpenAI API client
- **dotenv** - Environment variable loader
- **csv-parser** - CSV file parsing for FAQ data 