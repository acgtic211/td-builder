import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleGenAI, Chat } from '@google/genai';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private http = inject(HttpClient);

  private ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
  private model = 'gemini-2.5-flash'; // puedes cambiarlo si quieres
  private chat: Chat | null = null;

  // Promesa de inicialización para asegurar contexto+chat listos
  private ready: Promise<void> | null = null;

  /** Llama a esto antes de usar el servicio, o se auto-llama desde getChatResponse */
  private init(): Promise<void> {
    if (this.ready) return this.ready;

    this.ready = (async () => {
      const context = await this.loadContext();
      // Crea el chat **después** de tener el contexto cargado
      this.chat = this.ai.chats.create({
        model: this.model,
        config: {
          systemInstruction: context, // ya es string, no Promise
        },
        // history: [] // opcional: historial inicial
      });
    })();

    return this.ready;
  }

  /** Carga el contexto desde /assets; si falla, devuelve un fallback claro */
  private async loadContext(): Promise<string> {
    try {
      const txt = await this.http
        .get('/assets/prompts/prompt.txt', { responseType: 'text' })
        .toPromise();
      return (txt && txt.trim().length > 0)
        ? txt
        : 'Contexto no disponible: prompt.txt vacío.';
    } catch (e) {
      console.error('No se pudo cargar /assets/prompts/prompt.txt', e);
      return 'Contexto no disponible: error cargando prompt.txt.';
    }
  }

  /** Envía un mensaje. Se asegura de que el chat está inicializado. */
  async getChatResponse(prompt: string): Promise<string> {
    try {
      await this.init(); // garantiza chat creado
      if (!this.chat) throw new Error('Chat no inicializado');

      const result = await this.chat.sendMessage({ message: prompt });
      return result?.text ?? 'No recibí respuesta.';
    } catch (error) {
      console.error('Error getChatResponse:', error);
      return 'Ocurrió un error contactando con Gemini.';
    }
  }
}
