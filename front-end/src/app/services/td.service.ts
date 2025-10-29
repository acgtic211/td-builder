import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, empty, map, Observable, of, tap, throwError } from 'rxjs';
import { AuthGoogleService } from './auth-google.service';
import { ThingDescriptionDto } from '../models/thing-description.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class TdService {
  constructor(private http: HttpClient, private authGoogleService: AuthGoogleService) { 
    this.loadState();
  }

  // === Configuración / Persistencia ===
  private apiUrl = environment.apiBase + '/save'; // URL to web api
  private STORAGE_KEY = 'tdb:editor:v1';
  private persistTimer: any;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true
  };

  private _isUpdate$ = new BehaviorSubject<boolean>(false);
  readonly isUpdate$ = this._isUpdate$.asObservable();
  private idUpdate = -1;

  private name: string = 'Thing´s Name';

  private td: any = {
    '@context': 'https://www.w3.org/2019/wot/td/v1',
    id: '',
    title: '',
    security: 'nosec_sc',
    securityDefinitions: {
      "nosec_sc": {
        "scheme": "nosec"
      }
    },
    properties: {},
    actions: {},
    events: {},
    links: []
  };

  setIsUpdate(v: boolean) { this._isUpdate$.next(v); this.touch();}

  getIdUpdate() {
    return this.idUpdate;
  }

  setIdUpdate(id: number) {
    this.idUpdate = id;
    this.touch();
  }

  obtenerTD() {
    return this.generarTDOrdenado();
  }

  getNameTD() {
    return this.name;
  }

  setNameTD(nuevoNombre: string) {
    this.name = nuevoNombre;
    this.touch();
  }

  actualizarContext(context: string) {
    this.td['@context'] = context;
    this.touch();
  }

  actualizarTitulo(titulo: string) {
    this.td.title = titulo;
    this.touch();
  }

  actualizarId(id: string) {
    this.td.id = id;
    this.touch();
  }

  actualizarDescripcion(desc: string) {
    this.td.description = desc;
    this.touch();
  }

  actualizarTipo(tipo: string) {
    this.td['@type'] = tipo;
    this.touch();
  }

  actualizarSeguridad(nombreEsquema: string, scheme: string) {
    this.td.securityDefinitions = {
      [nombreEsquema]: { scheme }
    };
    this.td.security = nombreEsquema;
    this.touch();
  }

  addProperty(nombre: string, prop: any) {
    this.td.properties[nombre] = prop;
    this.touch();
  }

  getProperties() {
    return this.td.properties;
  }

  removeProperty(nombre: string): boolean {
    if (this.td?.properties && this.td.properties[nombre] != null) {
      delete this.td.properties[nombre];
      this.touch(); 
      return true;
    }
    return false;
  }

  addAction(nombre: string, prop: any) {
    this.td.actions[nombre] = prop;
    this.touch();
  }

  getAction() {
    return this.td.actions;
  }

  removeAction(nombre: string): boolean {
    if (this.td?.actions && this.td.actions[nombre] != null) {
      delete this.td.actions[nombre];
      this.touch();
      return true;
    }
    return false;
  }

  addEvent(nombre: string, prop: any) {
    this.td.events[nombre] = prop;
    this.touch();
  }

  getEvent() {
    return this.td.events;
  }

  removeEvent(nombre: string): boolean {
    if (this.td?.events && this.td.events[nombre] != null) {
      delete this.td.events[nombre];
      this.touch();
      return true;
    }
    return false;
  }

  addLink(direccion: string, prop: any) {
    this.td.links.push({
      href: direccion, ...prop
    });
    this.touch();
  }

  eliminarLink(href: string) {
    this.td.links = this.td.links.filter((l: any) => l.href !== href);
    this.touch();
  }

  getLink(href: string) {
    return this.td.links.find((link: any) => link.href === href);
  }

  resetTD() {
    this.name = 'Thing´s Name';

    this.td = {
      '@context': 'https://www.w3.org/2019/wot/td/v1',
      id: '',
      title: '',
      security: 'nosec_sc',
      securityDefinitions: {
        "nosec_sc": {
          "scheme": "nosec"
        }
      },
      properties: {},
      actions: {},
      events: {},
      links: []
    };
    this.touch();
  }

  private generarTDOrdenado() {
    const ordenado: any = {
      '@context': this.td['@context'],
      ...(this.td['@type'] && { '@type': this.td['@type'] }),
      title: this.td.title,
      ...(this.td.id && {'id': this.td.id}),
      security: this.td.security,
      securityDefinitions: this.td.securityDefinitions,
      ...(this.td.description && {'description': this.td.description}),
      properties: this.td.properties
    };

    if (Object.keys(this.td.actions).length) ordenado.actions = this.td.actions;
    if (Object.keys(this.td.events).length) ordenado.events = this.td.events;
    if (Array.isArray(this.td.links) && this.td.links.length > 0) ordenado.links = this.td.links;

    return ordenado;
  }

  //Métodos para persistencia local (localStorage)
  /** Guarda el estado con un pequeño debounce para no machacar el storage en cada tecla */
  private touch() {
    clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => this.saveState(), 150);
  }

  private saveState() {
    try {
      const state = {
        name: this.name,
        td: this.td,
        isUpdate: this._isUpdate$.value,
        idUpdate: this.idUpdate
      };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('No se pudo persistir el estado del TD.', e);
    }
  }

  private loadState() {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state?.td && typeof state.td === 'object') this.td = state.td;
      if (typeof state?.name === 'string') this.name = state.name;
      if (typeof state?.isUpdate === 'boolean') this._isUpdate$.next(state.isUpdate);
      if (typeof state?.idUpdate === 'number') this.idUpdate = state.idUpdate;
    } catch (e) {
      console.warn('Estado persistido corrupto, se ignora.', e);
    }
  }

  /** Para borrar el cache manualmente si lo necesitas */
  clearPersisted() {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  //Métodos para interación con la API REST del backend
  guardarTD(nombre: string): Observable<any> {
    const userId = this.authGoogleService.getUserId();

    if (!userId) return throwError(() => new Error('Usuario no autenticado'));
    if (!nombre || !nombre.trim()) return throwError(() => new Error('El nombre de la ThingDescription es obligatorio'));
 
    const payload = { name: nombre.trim(), tdJson: this.generarTDOrdenado() };
    const url = `${this.apiUrl}/${encodeURIComponent(userId)}/addThingDescriptions`;

    return this.http.post<ThingDescriptionDto>(url, payload, {
    ...this.httpOptions,
    observe: 'response' as const
  }).pipe(
    map(res => {
      // 1) Preferir el body (tu back ya devuelve el objeto guardado con id)
      const bodyId = res.body?.id;
      if (bodyId != null) return bodyId;
      throw new Error('No se pudo obtener el ID de la TD creada');
    }),
    catchError(err => {
      console.error('Error guardando la TD', err);
      return throwError(() => err);
    })
  );
  }

  updateTD(nombre: string): Observable<any> {
    if (!nombre || !nombre.trim()) return throwError(() => new Error('El nombre de la ThingDescription es obligatorio'));

    const payload = { name: nombre.trim(), tdJson: this.generarTDOrdenado() };
    const url = `${this.apiUrl}/update/${encodeURIComponent(this.getIdUpdate())}`;

    return this.http.put<void>(url, payload, this.httpOptions)
  }

  getUserTds(userId: string): Observable<ThingDescriptionDto[]> {
    const url = `${this.apiUrl}/${encodeURIComponent(userId)}/getThingDescriptions`;

    return this.http.get<ThingDescriptionDto[]>(url, this.httpOptions);
  }

  getOneUserTd(userId: string): Observable<ThingDescriptionDto> {
    const url = `${this.apiUrl}/${encodeURIComponent(userId)}/td-${encodeURIComponent(userId)}`;
    return this.http.get<ThingDescriptionDto>(url, this.httpOptions);
  }

  deleteTd(id: number) {
    const url = `${this.apiUrl}/delete-td/${id}`;
    return this.http.delete<void>(url, this.httpOptions);
  }

  searchTds(id: string, term: string): Observable<ThingDescriptionDto[]> {
  if (!term.trim()) return of([]);
  const url = `${this.apiUrl}/${encodeURIComponent(id)}/thing-descriptions?name=${encodeURIComponent(term)}`;
  
  return this.http.get<ThingDescriptionDto[]>(url, this.httpOptions)
    .pipe(
      tap(x => x.length ?
        console.log(`found tds matching "${term}"`) :
        console.log(`no tds matching "${term}"`))
    );
  }
}
