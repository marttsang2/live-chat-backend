const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { OpenAI } = require('openai');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store FAQ data
let faqData = [];

// Load FAQ data from CSV
function loadFAQData() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream('retail clothes 100FAQ.csv')
      .pipe(csv())
      .on('data', (data) => {
        results.push({
          question: data['常見問題'],
          answer: data['解答']
        });
      })
      .on('end', () => {
        faqData = results;
        console.log(`Loaded ${faqData.length} FAQ entries`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error loading FAQ data:', error);
        reject(error);
      });
  });
}

// Create system prompt with FAQ context
function createSystemPrompt() {
  const faqContext = faqData.map(item => 
    `Q: ${item.question}\nA: ${item.answer}`
  ).join('\n\n');
  
  return `你是一個專業的服裝零售客服助理。請根據以下常見問題資料庫來回答用戶問題。如果問題不在資料庫中，請提供有幫助的一般性建議。

常見問題資料庫：
${faqContext}

請用使用者提供的語言回答，保持友善和專業的語調。如果用戶問題與提供的FAQ相關，請直接引用相關答案。如果沒有完全匹配的答案，請基於相關信息提供有用的回應。`;
}

// Store conversation history per WebSocket session
const conversations = new Map();

// Initialize FAQ data on server start
loadFAQData().catch(console.error);

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  const sessionId = Date.now().toString();
  
  // Initialize conversation with FAQ-aware system prompt
  const systemPrompt = createSystemPrompt();
  conversations.set(sessionId, [{ role: 'system', content: systemPrompt }]);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.role !== 'user') return;

      // Get or initialize conversation history
      let history = conversations.get(sessionId);
      if (!history) {
        const systemPrompt = createSystemPrompt();
        history = [{ role: 'system', content: systemPrompt }];
        conversations.set(sessionId, history);
      }

      // Add user message to history
      history.push({ role: 'user', content: data.content });

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: history,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0].message.content,
      };

      // Add assistant response to history
      history.push(assistantMessage);
      conversations.set(sessionId, history);

      // Send response back to client
      ws.send(JSON.stringify(assistantMessage));
    } catch (error) {
      console.error('Error:', error);
      ws.send(JSON.stringify({ 
        role: 'assistant', 
        content: '抱歉，系統發生錯誤，請稍後再試。' 
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected');
    conversations.delete(sessionId);
  });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});