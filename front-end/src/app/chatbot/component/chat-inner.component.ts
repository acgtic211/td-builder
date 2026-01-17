import { Component, signal, effect, inject, output, ViewChild, ElementRef } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { NgIf, NgFor, NgClass, JsonPipe, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../service/gemini.service';
import { TdService } from '../../services/td/td.service';
import { DialogService } from '../../services/dialog/dialog.service';

interface Message {
  author: 'user-faq' | 'bot' | 'user-generator';
  content: string;
  tdJson?: unknown;
}

@Component({
  selector: 'app-chat-inner',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, JsonPipe, AsyncPipe, MarkdownModule],
  templateUrl: './chat-inner.component.html',
  styleUrl: './chat-inner.component.scss'
})
export class ChatInnerComponent { 
  @ViewChild('messageContainer') private messageContainer!: ElementRef<HTMLDivElement>;

  private geminiService = inject(GeminiService);
  private tdService = inject(TdService);
  private dialog = inject(DialogService);

  private STORAGE_KEY = 'tdb:chat:last15';

  loading = signal(false);
  error = signal<string | null>(null);

  close = output<void>();

  messages = signal<Message[]>([
    { author: 'bot', content: "Hello! How can I help you today?" }
  ]);

  userInput = signal('');
  isLoading = signal(false);

  mode = signal<'user-faq' | 'user-generator'>('user-faq');
  setMode(m: 'user-faq' | 'user-generator') { this.mode.set(m); this.limpiarConversacion(m)}
  modeLabel(m: Message): 'FAQ' | 'Generar TD' | 'ChatWot'{
    if (m.author === 'user-faq') return 'FAQ';;
    if (m.author === 'user-generator') return 'Generar TD';

    return 'ChatWot';
  }

  limpiarConversacion(m: 'user-faq' | 'user-generator') {
    this.geminiService.resetChat(m); // Limpia la memoria de la IA
  }

  private persistEffect = effect(() => {
    const payload = {
      mode: this.mode(),
      messages: this.messages().slice(-15),
    };
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  });

  ngOnInit(): void {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.messages)) this.messages.set(parsed.messages);
        if (parsed?.mode === 'user-faq' || parsed?.mode === 'user-generator') this.mode.set(parsed.mode);
      }
    } catch {}

    this.scrollToBottomAfterRender();
  }

  async sendMessage(): Promise<void> {
    const userMessage = this.userInput().trim();
    const messageMode = this.mode();
    if (!userMessage || this.isLoading()) return;

    let mode = this.mode();
    if (mode !== 'user-faq' && mode !== 'user-generator') mode = 'user-faq';

    this.messages.update(c => [...c, { author: mode, content: userMessage }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottomAfterRender();

    try {
      const botResponse = await this.geminiService.getChatResponse(userMessage, messageMode);

      if (mode === 'user-generator') {
        let td: unknown | null = null;
        try {
          td = JSON.parse(botResponse);
        } catch {
          const match = botResponse.match(/\{[\s\S]*\}/);
          if (match) { try { td = JSON.parse(match[0]); } catch {} }
        }
        if (td) this.messages.update(c => [...c, { author: 'bot', content: botResponse, tdJson: td }]);
        else this.messages.update(c => [...c, { author: 'bot', content: botResponse }]);
      } else {
        this.messages.update(c => [...c, { author: 'bot', content: botResponse }]);
      }
    } catch {
      this.error.set('Ocurrió un error obteniendo la respuesta.');
    } finally {
      this.isLoading.set(false);
      this.scrollToBottomAfterRender();
    }
  }

  async useTd(td: unknown) {
    if (!td || typeof td !== 'object') return;
    try {
      const anyTd = td as any;
      const name = anyTd?.title || 'TD desde chat';
      this.tdService.setFromJson(anyTd, name);
      await this.dialog.info('TD sent to editor', `The Thing Description "${name}" has been loaded successfully.`);
    } catch (e) {
      console.error(e);
      await this.dialog.info('TD not sent to editor', `Could not send the TD to the editor.`);
    }
  }
  
  private scrollToBottomAfterRender(): void {
    setTimeout(() => {
      try {
        const element = this.messageContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (err) {
        console.error('Could not scroll to bottom:', err);
      }
    }, 0);
  }

  formatContent(content: any): string {
    // 1. Si es null o undefined, devolvemos cadena vacía
    if (!content) return '';

    // 2. Si NO es un string (es un objeto o número), lo convertimos a string
    if (typeof content !== 'string') {
      content = String(content); // O JSON.stringify(content) si prefieres ver el objeto
    }
    return content.replace(/\n/g, '<br>'); 
  }

  asJson(obj: unknown): any {
    return obj;
  }
}
