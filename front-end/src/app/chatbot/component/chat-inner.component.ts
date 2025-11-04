import { Component, signal, computed, effect } from '@angular/core';
import { ChatUiService } from '../service/chat-ui.service';
import { NgIf, NgFor, NgClass, JsonPipe, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMode, ChatResponse, ChatService } from '../service/chat.service';
import { ChatMessage } from '../model/chat';

function uid() { return Math.random().toString(36).slice(2); }

@Component({
  selector: 'app-chat-inner',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, JsonPipe, AsyncPipe],
  templateUrl: './chat-inner.component.html',
  styleUrl: './chat-inner.component.scss'
})
export class ChatInnerComponent {
  msg = '';
  mode: ChatMode = 'faq';
  loading = signal(false);
  error = signal<string | null>(null);

  messages = signal<ChatMessage[]>([]);

  constructor(private chat: ChatService, public ui: ChatUiService) {}

  setMode(m: ChatMode) {
    this.mode = m;
  }

  send() {
    const text = this.msg?.trim();
    if (!text || this.loading()) return;
    this.error.set(null);
    
    const currentMode = this.mode;

    // push user message
    const mUser: ChatMessage = {
      id: uid(), role: 'user', content: text, mode: currentMode, createdAt: Date.now()
    };
    this.messages.update(list => [...list, mUser]);
    this.msg = '';
    this.loading.set(true);
    
    this.chat.send(text, currentMode).subscribe({
      next: (res: ChatResponse) => {
        const content = res.mode === 'faq'
          ? (res.text || '(Sin respuesta)')
          : (res.json ? 'He generado la Thing Description.' : 'No se pudo generar la TD.');

        const mAssistant: ChatMessage = {
          id: uid(), role: 'assistant', content, tdJson: res.json, mode: res.mode, createdAt: Date.now()
        };
        this.messages.update(list => [...list, mAssistant]);
        queueMicrotask(() => document.getElementById('messages')?.scrollTo({ top: 1e9, behavior: 'smooth' }));
      },
      error: (err) => {
        console.error(err);
        this.error.set('Ha ocurrido un error al contactar con el asistente.');
      },
      complete: () => this.loading.set(false)
    });
  }

  copyJson(obj: unknown) {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
  }

  asJson(v: unknown) { return v as object; }
}
