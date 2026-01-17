import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleGenAI, Chat } from '@google/genai';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private http = inject(HttpClient);

  private ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
  private modelFaq = 'gemini-2.5-flash';
  private modelGen = 'gemini-2.5-flash';
  private chatFaq: Chat | null = null;
  private chatGen: Chat | null = null;

  private readyFaq: Promise<void> | null = null;
  private readyGen: Promise<void> | null = null;

  // Configuración de reintentos
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 2000;

  private initFaq(mode: string): Promise<void> {
    if (this.readyFaq) return this.readyFaq;

    this.readyFaq = (async () => {
      try {
        const context = await this.loadContext(mode);
        this.chatFaq = this.ai.chats.create({
          model: this.modelFaq,
          config: { systemInstruction: context },
        });
      } catch (error) {
        this.readyFaq = null; // Resetear si falla para permitir reintentos
        throw error;
      }
    })();

    return this.readyFaq;
  }

  private initGen(mode: string): Promise<void> {
    if (this.readyGen) return this.readyGen;

    this.readyGen = (async () => {
      try {
        const context = await this.loadContext(mode);
        this.chatGen = this.ai.chats.create({
          model: this.modelGen,
          config: { systemInstruction: context },
        });
      } catch (error) {
        this.readyGen = null; // Resetear si falla
        throw error;
      }
    })();

    return this.readyGen;
  }

  private async loadContext(mode: string): Promise<string> {
    let contextPath = '';
    if(mode === 'user-faq') contextPath = '/assets/prompts/faqPrompt.txt';
    else contextPath = '/assets/prompts/tdPrompt.txt';
    
    try {
      const txt = await firstValueFrom(this.http.get(contextPath, { responseType: 'text' }));
      return (txt && txt.trim().length > 0) ? txt : 'Contexto no disponible: archivo vacío.';
    } catch (e) {
      console.error(`No se pudo cargar ${contextPath}`, e);
      // Es mejor lanzar error para que initFaq/initGen sepan que falló
      throw new Error(`Error cargando contexto: ${contextPath}`);
    }
  }

  async getChatResponse(prompt: string, mode: string): Promise<string> {
    try {
      let activeChat: Chat | null = null;

      // 1. Inicializar según el modo
      if (mode === 'user-faq') {
        await this.initFaq(mode);
        activeChat = this.chatFaq;
      } else {
        await this.initGen(mode);
        activeChat = this.chatGen;
      }

      if (!activeChat) throw new Error('El chat no se pudo inicializar. Comprueba la ApiKey');

      // 2. Enviar mensaje con lógica de reintento
      const responseText = await this.sendMessageWithRetry(activeChat, prompt);
      return responseText;

    } catch (error: any) {
      console.error('Error final en getChatResponse:', error);
      
      // Mensaje amigable si es por cuota
      if (error.message?.includes('429') || error.status === 429) {
        return 'El sistema está recibiendo muchas solicitudes. Por favor, espera un momento e inténtalo de nuevo.';
      }
      return 'Ocurrió un error al procesar tu solicitud. Comprueba la ApiKey.';
    }
  }

  /**
   * Envía el mensaje y reintenta si recibe un error 429 (Too Many Requests)
   */
  private async sendMessageWithRetry(chat: Chat, prompt: string, retries = this.MAX_RETRIES): Promise<string> {
    try {
      const result = await chat.sendMessage({ message: prompt });
      return result?.text ?? 'No recibí respuesta.';
    } catch (error: any) {
      // Verificar si es un error de Rate Limit (429) o Servicio No Disponible (503)
      const isRateLimit = error.status === 429 || error.toString().includes('429') || error.toString().includes('quota');
      
      if (isRateLimit && retries > 0) {
        // Calcular tiempo de espera (Backoff exponencial: 2s, 4s, 8s...)
        const delay = this.BASE_DELAY_MS * Math.pow(2, this.MAX_RETRIES - retries);
        console.warn(`⚠️ Cuota excedida (429). Reintentando en ${delay/1000} segundos... Quedan ${retries} intentos.`);
        
        await this.wait(delay);
        return this.sendMessageWithRetry(chat, prompt, retries - 1);
      }

      throw error; // Si no es 429 o se acabaron los intentos, lanzar el error original
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public resetChat(mode: string) {
    if (mode === 'user-faq') {
      this.chatFaq = null;
      this.readyFaq = null; // Fuerza a recargar el chat limpio
    } else {
      this.chatGen = null;
      this.readyGen = null;
    }
  }
}
