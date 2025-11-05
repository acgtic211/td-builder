import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import { environment } from '../../environments/environment';

const ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });

const CONTEXTO = fs.readFileSync('src/app/chatbot/prompts/faqPrompt.txt', 'utf8');

async function main() {
  const model = 'gemini-2.0-flash-001';

  const cache = await ai.caches.create({
    model,
    config: {
      displayName: 'td-builder-context',
      systemInstruction: 'Eres el asistente de TD Builder. Sigue estrictamente el esquema...',
      contents: [
        { role: 'user', parts: [{ text: CONTEXTO }] }
      ],
      // TTL: tiempo de vida 24h
      ttl: '86400s'
    }
  });

  console.log('CACHE_NAME=', cache.name); // <-- guarda este valor
}

main().catch((e) => { console.error(e); process.exit(1); });
