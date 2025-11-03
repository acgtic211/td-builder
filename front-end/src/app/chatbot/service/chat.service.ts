import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type ChatMode = 'faq' | 'td';

export interface ChatRequest {
  message: string;
  mode: ChatMode;
}

export interface ChatResponse {
  mode: ChatMode;
  text?: string;
  json?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiBase;

  constructor(private http: HttpClient) {}

  send(message: string, mode: ChatMode): Observable<ChatResponse> {
    const url = `${this.apiUrl}/ai/faq`;

    return this.http.post<ChatResponse>(url, { message, mode });
  }
}
