import { Component, OnDestroy, OnInit, signal } from '@angular/core';

import { AuthGoogleService } from '../../services/auth/auth-google.service';
import { TdService } from '../../services/td/td.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ThingDescriptionDto } from '../../models/thing-description.model';
import { NgFor, NgIf } from '@angular/common';
import { seguridadMap } from '../../models/variables';
import { DialogService } from '../../services/dialog/dialog.service';
import JSZip from 'jszip';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-my-tds',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './my-tds.component.html',
  styleUrl: './my-tds.component.scss'
})
export class MyTdsComponent  implements OnInit {
  constructor(private authGoogleService: AuthGoogleService, private tdService: TdService, private router: Router, private dialog: DialogService) { }

  rutaImagenLupa: string = 'assets/lupa.jpg'
  rutaImagenBasura: string = 'assets/trash.png'
  private apiUrl = environment.apiBase + '/logout';

  $user = this.authGoogleService.user$;

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  tds = signal<ThingDescriptionDto[]>([]);

  // 🔎 estado del buscador
  term = signal<string>('');
  private debounceId?: any;

  ngOnInit() {
    this.loadUserTds();
  }

  private loadUserTds(name?: string) {
    this.loading.set(true);
    const obs = name && name.trim()
      ? this.tdService.searchTds(name.trim()) // crea otro método
      : this.tdService.getUserTds();

    obs.subscribe({
      next: rows => { this.tds.set(rows || []); this.loading.set(false); },
      error: err => { console.error(err); this.error.set('No se pudieron cargar las TDs.'); this.loading.set(false); }
    });
  }

  countProperties(td: any): number { return td && typeof td.properties === 'object' ? Object.keys(td.properties).length : 0; }
  countActions(td: any): number    { return td && typeof td.actions    === 'object' ? Object.keys(td.actions).length    : 0; }
  countEvents(td: any): number     { return td && typeof td.events     === 'object' ? Object.keys(td.events).length     : 0; }
  countLinks(td: any): number      { return Array.isArray(td?.links) ? td.links.length : 0; }

  // 🔎 handlers de búsqueda
  onSearchInput(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.term.set(value);
    clearTimeout(this.debounceId);
    this.debounceId = setTimeout(() => this.loadUserTds(this.term().trim()), 300);
  }

  onSearchSubmit(ev: Event) {
    ev.preventDefault();
    clearTimeout(this.debounceId);
    this.loadUserTds(this.term().trim());
  }

  openEditor(item: ThingDescriptionDto) {
    this.tdService.setIdUpdate(item.id);
    this.tdService.setIsUpdate(true);
    this.cargarTD(item.td);
    this.tdService.setNameTD(item.name);
    this.router.navigate(['/editor']);
  }

  cargarTD(json: any){
    if (!json || typeof json !== 'object') {
      alert('El archivo no contiene un TD válido.');
      return;
    }

    this.tdService.resetTD();
    
    // Solo carga propiedades conocidas del TD
    if (json['@context']) this.tdService.actualizarContext(json['@context']);
    if (json['@type']) this.tdService.actualizarTipo(json['@type']);
    if (json.title) this.tdService.actualizarTitulo(json.title);
    if (json.id) this.tdService.actualizarId(json.id);
    if (json.description) this.tdService.actualizarDescripcion(json.description);

    if (json.security && json.securityDefinitions) {
      const nombreEsquema = json.security;
      const def = json.securityDefinitions[nombreEsquema];
      const scheme = def?.scheme || seguridadMap[nombreEsquema] || 'nosec';
      this.tdService.actualizarSeguridad(nombreEsquema, scheme);
    }

    if (json.properties && typeof json.properties === 'object') {
      for (const key in json.properties) {
        this.tdService.addProperty(key, json.properties[key]);
      }
    }

    if (json.actions && typeof json.actions === 'object') {
      for (const key in json.actions) {
        this.tdService.addAction(key, json.actions[key]);
      }
    }

    if (json.events && typeof json.events === 'object') {
      for (const key in json.events) {
        this.tdService.addEvent(key, json.events[key]);
      }
    }

    if (Array.isArray(json.links)) {
      for (const link of json.links) {
        if (link?.href) {
          this.tdService.addLink(link.href, link);
        }
      }
    }
  }

  async deleteTd(item: ThingDescriptionDto, ev: MouseEvent) {
    ev.stopPropagation(); ev.preventDefault();

    const res = await this.dialog.confirm('Delete Thing Description',
      `Are you sure you want to delete "${item.name || 'this Thing Description'}"?`,
      { okText: 'Yes, delete', cancelText: 'No', danger: true }
    );
    if (res !== 'ok') return;

    // optimista: quitamos de la vista ya
    const prev = [...this.tds()];
    this.tds.update(list => list.filter(t => t.id !== item.id));

    this.tdService.deleteTd(item.id).subscribe({
      next: () => { /* todo ok, ya está quitado */ },
      error: err => {
        console.error(err);
        // rollback si falla
        this.tds.set(prev);
        alert('No se pudo borrar la TD.');
      }
    });
  }

  async downloadAll() {
    const lista = this.tds();
    if (!lista || lista.length === 0) {
      alert('No hay TDs para descargar.');
      return;
    }

    const zip = new JSZip();

    // helper para nombres válidos de archivo
    const safe = (s: string, fallback = 'thing-description') =>
      (s || fallback)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-_.]/gi, '');

    // añade cada TD como JSON con pretty print
    lista.forEach((item, i) => {
      const base = safe(item.name || `td-${item.id || i + 1}`);
      const json = JSON.stringify(item.td ?? {}, null, 2);
      zip.file(`${base}.json`, json);
    });

    // genera el ZIP (blob)
    const blob = await zip.generateAsync({ type: 'blob' });

    // Opción A (Chromium): diálogo de guardar con nombre sugerido
    try {
      const anyWindow = window as any;
      if (typeof anyWindow.showSaveFilePicker === 'function') {
        const handle = await anyWindow.showSaveFilePicker({
          suggestedName: 'thing-descriptions.zip',
          types: [{
            description: 'ZIP file',
            accept: { 'application/zip': ['.zip'] }
          }]
        });
        const stream = await handle.createWritable();
        await stream.write(blob);
        await stream.close();
        return;
      }
    } catch (e) {
      // usuario canceló o no disponible -> caemos al fallback
      console.warn('Guardado cancelado o no disponible, usando descarga directa:', e);
      return;
    }

    // Opción B (fallback universal): descarga directa
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thing-descriptions.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async logOut() {
    const res = await this.dialog.confirm('Log out', 'Are you sure you want to log out?', {
      okText: 'Yes', cancelText: 'No'
    });
    if (res === 'ok') {
      //this.authGoogleService.logout();
      window.location.href = this.apiUrl;
      this.tdService.setIdUpdate(-1);
      this.tdService.setIsUpdate(false);
      this.router.navigateByUrl('/info');
    }
  }
}
