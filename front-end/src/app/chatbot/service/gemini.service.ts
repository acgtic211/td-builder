import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleGenAI, Chat } from '@google/genai';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private http = inject(HttpClient);

  private ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
  private modelFaq = 'gemini-2.0-flash';
  private modelGen = 'gemini-2.5-flash';
  private chatFaq: Chat | null = null;
  private chatGen: Chat | null = null;

  private readyFaq: Promise<void> | null = null;
  private readyGen: Promise<void> | null = null;

  private initFaq(mode: string): Promise<void> {
    if (this.readyFaq) return this.readyFaq;

    this.readyFaq = (async () => {
      const context = await this.loadContext(mode);
      
      this.chatFaq = this.ai.chats.create({
        model: this.modelFaq,
        config: {
          systemInstruction: context,
        },
      });
    })();

    return this.readyFaq;
  }

  private initGen(mode: string): Promise<void> {
    if (this.readyGen) return this.readyGen;

    this.readyGen = (async () => {
      const context = await this.loadContext(mode);
  
      this.chatGen = this.ai.chats.create({
        model: this.modelGen,
        config: {
          systemInstruction: context,
        },
      });
    })();

    return this.readyGen;
  }

  private async loadContext(mode: string): Promise<string> {
    var context = '';

    if(mode === 'user-faq') context = '/assets/prompts/faqPrompt.txt';
    else context = '/assets/prompts/tdPrompt.txt';
    
    try {
      const txt = await this.http
        .get(context, { responseType: 'text' })
        .toPromise();
      return (txt && txt.trim().length > 0)
        ? txt
        : 'Contexto no disponible: prompt.txt vacío.';
    } catch (e) {
      console.error('No se pudo cargar /assets/prompts/prompt.txt', e);
      return 'Contexto no disponible: error cargando prompt.txt.';
    }
  }

  async getChatResponse(prompt: string, mode: string): Promise<string> {
    try {
      if(mode === 'user-faq'){
        await this.initFaq(mode);
        if (!this.chatFaq ) throw new Error('Chat no inicializado');
        const result = await this.chatFaq.sendMessage({ message: prompt });
        return result?.text ?? 'No recibí respuesta.';
      }else{
        await this.initGen(mode);
        if (!this.chatGen ) throw new Error('Chat no inicializado');
        const result = await this.chatGen.sendMessage({ message: prompt });
        return result?.text ?? 'No recibí respuesta.';
      }
    } catch (error) {
      console.error('Error getChatResponse:', error);
      return 'Ocurrió un error contactando con Gemini.';
    }
  }
}
