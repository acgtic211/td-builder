import { Component, signal, computed, effect, inject, output, ViewChild, ElementRef } from '@angular/core';
import { ChatUiService } from '../service/chat-ui.service';
import { NgIf, NgFor, NgClass, JsonPipe, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../service/gemini.service';

interface Message {
  author: 'user' | 'bot';
  content: string;
  tdJson?: unknown;
}

@Component({
  selector: 'app-chat-inner',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, JsonPipe, AsyncPipe],
  templateUrl: './chat-inner.component.html',
  styleUrl: './chat-inner.component.scss'
})
export class ChatInnerComponent { 
  @ViewChild('messageContainer') private messageContainer!: ElementRef<HTMLDivElement>;

  private geminiService = inject(GeminiService);

  loading = signal(false);
  error = signal<string | null>(null);

  close = output<void>();

  messages = signal<Message[]>([
    { author: 'bot', content: "Hello! How can I help you today?" }
  ]);

  userInput = signal('');
  isLoading = signal(false);

  mode = signal<'faq' | 'td'>('faq');
  setMode(m: 'faq' | 'td') { this.mode.set(m); }

  async sendMessage(): Promise<void> {
    const userMessage = this.userInput().trim();
    if (!userMessage || this.isLoading()) {
      return;
    }

    // Add user message to chat
    this.messages.update(current => [...current, { author: 'user', content: userMessage }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottomAfterRender();
    
    // Get bot response
    const botResponse = await this.geminiService.getChatResponse(userMessage);
    
    // Add bot message to chat
    this.messages.update(current => [...current, { author: 'bot', content: botResponse }]);
    this.isLoading.set(false);
    this.scrollToBottomAfterRender();
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

  formatContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  copyJson(obj: unknown) {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
  }

  asJson(v: unknown) { return v as object; }
}
