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
    const url = `${this.apiUrl}/ai/chat`;

    return this.http.post<ChatResponse>(url, {mode, message}).pipe(
      map((res: ChatResponse) => {
        // Si el modo es FAQ → nada especial, devuelve texto.
        if (res.mode === 'faq') {
          return {
            mode: 'faq',
            text: res.text ?? ''
          };
        }

        // Si el modo es TD → intentar convertir texto a JSON
        if (res.mode === 'td') {
          try {
            const parsed = typeof res.text === 'string'
              ? JSON.parse(res.text)
              : res.json; // por si ya viene como JSON desde backend

            return {
              mode: 'td',
              json: parsed
            };
          } catch (err) {
            console.error('Error al parsear TD JSON:', err);
            return {
              mode: 'td',
              json: null // o podrías devolver error
            };
          }
        }

        return res;
      })
    );
  }
}

export function parseTd(tdString: string) {
  let td: any;
  try {
    td = JSON.parse(tdString);
  } catch (e) {
    throw new Error("TD no es JSON válido: " + (e as Error).message);
  }

  const requiredKeys = ["@context","id","title","security","securityDefinitions","properties","actions","events","links"];
  for (const k of requiredKeys) {
    if (!(k in td)) throw new Error(`Falta la clave requerida: ${k}`);
  }
  if (td["@context"] !== "https://www.w3.org/2019/wot/td/v1") {
    throw new Error("Valor inválido de @context");
  }
  if (td.security !== "nosec_sc") throw new Error("security debe ser 'nosec_sc'");
  if (!td.securityDefinitions?.nosec_sc || td.securityDefinitions.nosec_sc.scheme !== "nosec") {
    throw new Error("securityDefinitions.nosec_sc.scheme debe ser 'nosec'");
  }

  // Tipos básicos esperados
  if (typeof td.title !== "string") throw new Error("title debe ser string");
  if (typeof td.id !== "string") throw new Error("id debe ser string");
  if (typeof td.properties !== "object" || Array.isArray(td.properties)) throw new Error("properties debe ser objeto");
  if (typeof td.actions !== "object" || Array.isArray(td.actions)) throw new Error("actions debe ser objeto");
  if (typeof td.events !== "object" || Array.isArray(td.events)) throw new Error("events debe ser objeto");
  if (!Array.isArray(td.links)) throw new Error("links debe ser array");

  return td as Record<string, unknown>;
}

