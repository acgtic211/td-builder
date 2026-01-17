import { Component, ElementRef, OnDestroy, OnInit, output, ViewChild } from '@angular/core';
import { NgIf, NgFor, AsyncPipe, CommonModule } from '@angular/common';
import { DesplegablesService } from '../../services/desplegables/desplegables.service';
import { TdService } from '../../services/td/td.service';
import { GeneralComponent } from './general/general.component';
import { PropiedadComponent } from './propiedad/propiedad.component';
import { AccionComponent } from './accion/accion.component';
import { EventoComponent } from './evento/evento.component';
import { LinksComponent } from './links/links.component';
import { seguridadMap } from '../../models/variables';
import { AuthGoogleService } from '../../services/auth/auth-google.service';
import { Subscription } from 'rxjs';
import { DialogService } from '../../services/dialog/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, NgFor, GeneralComponent, PropiedadComponent, AccionComponent, EventoComponent, LinksComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit, OnDestroy{
  @ViewChild('inputArchivo') inputArchivo!: ElementRef;
  user: boolean = false;
  nombreTD: string = '';
  
  mostrarPropiedad = false;
  propiedadActual: any = null;
  propiedadesLista: string[] = [];
  nombrePropiedadActual: string = '';

  mostrarAccion = false;
  accionActual: any = null;
  accionesLista: string[] = [];
  nombreAccionActual: string = '';

  mostrarEvento = false;
  eventoActual: any = null;
  eventosLista: string[] = [];
  nombreEventoActual: string = '';

  mostrarLink = false;
  linkActual: any = null;
  linksLista: { href: string; [key: string]: any }[] = [];
  direccionLinkActual: string = '';

  private readonly _panes: Array<'general'|'propiedades'|'acciones'|'eventos'|'links'> =
    ['general', 'propiedades', 'acciones', 'eventos', 'links'];

  constructor(public desplegables: DesplegablesService, public tdService: TdService, private authGoogleService: AuthGoogleService, private dialog: DialogService, private router: Router) {}
  user$ = this.authGoogleService.user$;
  isUpdate: boolean = false;
  private sub2?: Subscription;

  ngOnInit(): void {
    this.cargatTd();

    this.sub2 = this.tdService.isUpdate$.subscribe(estado => {
      this.isUpdate = estado;
    });
  }
  
  cargatTd(){
    this.nombreTD = this.tdService.getNameTD();
    this.propiedadesLista = Object.keys(this.tdService.obtenerTD().properties || {});
    this.accionesLista = Object.keys(this.tdService.obtenerTD().actions || {});
    this.eventosLista = Object.keys(this.tdService.obtenerTD().events || {});
    this.linksLista = this.tdService.obtenerTD().links || [];
  }

  ngOnDestroy() {
    this.sub2?.unsubscribe();
  }

  get areAllOpen(): boolean {
    return this._panes.every(k => this.desplegables.getEstado(k));
  }

  private setAll(open: boolean) {
    this._panes.forEach(k => this.desplegables.setEstado(k, open));
    // refresca listas si quieres forzar redibujado (no es estrictamente necesario)
    this.cargatTd();
  }

  toggleAll() {
    this.setAll(!this.areAllOpen);
  }

  onToggleGeneral(event: any) {
    this.desplegables.setEstado('general', event.target.open);
  }

  onTogglePropiedades(event: any) {
    this.desplegables.setEstado('propiedades', event.target.open);
  }

  onToggleAcciones(event: any) {
    this.desplegables.setEstado('acciones', event.target.open);
  }

  onToggleEventos(event: any) {
    this.desplegables.setEstado('eventos', event.target.open);
  }

  onToggleLinks(event: any) {
    this.desplegables.setEstado('links', event.target.open);
  }

  get generalAbierto() {
    return this.desplegables.getEstado('general');
  }

  get propiedadesAbierto() {
    return this.desplegables.getEstado('propiedades');
  }

  get accionesAbierto() {
    return this.desplegables.getEstado('acciones');
  }

  get eventosAbierto() {
    return this.desplegables.getEstado('eventos');
  }

  get linksAbierto() {
    return this.desplegables.getEstado('links');
  }

  guardarPropiedad() {
    if (this.nombrePropiedadActual !== '') {
      // Modo edición
      if (this.propiedadActual) {
        const nuevoNombre = this.propiedadActual.nombre;

        // Eliminar la propiedad anterior si el nombre cambió
        if (this.nombrePropiedadActual !== nuevoNombre) {
          delete this.tdService.obtenerTD().properties[this.nombrePropiedadActual];
        }

        // Eliminar nombre temporal del objeto antes de guardar
        const copia = { ...this.propiedadActual };
        delete copia.nombre;

        this.tdService.addProperty(nuevoNombre, copia);
        this.propiedadesLista = Object.keys(this.tdService.obtenerTD().properties || {});
      }
    } else {
      // Modo creación
      if (this.propiedadActual) {
        const nombre = this.propiedadActual.nombre;
        const copia = { ...this.propiedadActual };
        delete copia.nombre;

        this.tdService.addProperty(nombre, copia);
        this.propiedadesLista = Object.keys(this.tdService.obtenerTD().properties || {});
      }
    }

    this.cancelarPropiedad();
  }


  cancelarPropiedad() {
    this.nombrePropiedadActual = '';
    this.mostrarPropiedad = false;
    this.propiedadActual = null;
  }

  editarPropiedad(nombre: string) {
    const propiedad = this.tdService.obtenerTD().properties?.[nombre];
    this.nombrePropiedadActual = nombre;

    if (!propiedad) {
      console.warn(`No se encontró la propiedad ${nombre}`);
      return;
    }

    this.propiedadActual = {
      nombre,
      ...JSON.parse(JSON.stringify(propiedad))
    };

    this.mostrarPropiedad = true;
  }

  eliminarPropiedad(nombre: string) {
    if (this.tdService.removeProperty(nombre)) {
      this.propiedadesLista = Object.keys(this.tdService.getProperties() || {});
    } else {
      console.warn(`No se encontró la propiedad ${nombre}`);
    }
  }

  guardarAccion() {
    if (this.nombreAccionActual !== '') {
      // Modo edición
      if (this.accionActual) {
        const nuevoNombre = this.accionActual.nombre;

        // Eliminar la propiedad anterior si el nombre cambió
        if (this.nombreAccionActual !== nuevoNombre) {
          delete this.tdService.obtenerTD().actions[this.nombreAccionActual];
        }

        // Eliminar nombre temporal del objeto antes de guardar
        const copia = { ...this.accionActual };
        delete copia.nombre;

        this.tdService.addAction(nuevoNombre, copia);
        this.accionesLista = Object.keys(this.tdService.obtenerTD().actions || {});
      }
    } else {
      // Modo creación
      if (this.accionActual) {
        const nombre = this.accionActual.nombre;
        const copia = { ...this.accionActual };
        delete copia.nombre;

        this.tdService.addAction(nombre, copia);
        this.accionesLista = Object.keys(this.tdService.obtenerTD().actions || {});
      }
    }

    this.cancelarAccion();
  }

  cancelarAccion() {
    this.nombreAccionActual = '';
    this.mostrarAccion = false;
    this.accionActual = null;
  }

  editarAccion(nombre: string) {
    const accion = this.tdService.obtenerTD().actions?.[nombre];
    this.nombreAccionActual = nombre;

    if (!accion) {
      console.warn(`No se encontró la accion ${nombre}`);
      return;
    }

    // Clonamos la accion y volvemos a poner el nombre como campo editable
    this.accionActual = {
      nombre,
      ...JSON.parse(JSON.stringify(accion)) // clon profundo para evitar mutaciones
    };

    this.mostrarAccion = true;
  }

  eliminarAccion(nombre: string) {
    if (this.tdService.removeAction(nombre)) {
      this.accionesLista = Object.keys(this.tdService.getAction() || {});
    } else {
      console.warn(`No se encontró la acción ${nombre}`);
    }
  }

  guardarEvento() {
    if (this.nombreEventoActual !== '') {
      // Modo edición
      if (this.eventoActual) {
        const nuevoNombre = this.eventoActual.nombre;

        // Eliminar la propiedad anterior si el nombre cambió
        if (this.nombreEventoActual !== nuevoNombre) {
          delete this.tdService.obtenerTD().events[this.nombreEventoActual];
        }

        // Eliminar nombre temporal del objeto antes de guardar
        const copia = { ...this.eventoActual };
        delete copia.nombre;

        this.tdService.addEvent(nuevoNombre, copia);
        this.eventosLista = Object.keys(this.tdService.obtenerTD().events || {});
      }
    } else {
      // Modo creación
      if (this.eventoActual) {
        const nombre = this.eventoActual.nombre;
        const copia = { ...this.eventoActual };
        delete copia.nombre;

        this.tdService.addEvent(nombre, copia);
        this.eventosLista = Object.keys(this.tdService.obtenerTD().events || {});
      }
    }

    this.cancelarEvento();
  }

  cancelarEvento() {
    this.nombreEventoActual = '';
    this.mostrarEvento = false;
    this.eventoActual = null;
  }

  editarEvento(nombre: string) {
    const evento = this.tdService.obtenerTD().events?.[nombre];
    this.nombreEventoActual = nombre;

    if (!evento) {
      console.warn(`No se encontró el evento ${nombre}`);
      return;
    }

    // Clonamos la accion y volvemos a poner el nombre como campo editable
    this.eventoActual = {
      nombre,
      ...JSON.parse(JSON.stringify(evento)) // clon profundo para evitar mutaciones
    };

    this.mostrarEvento = true;
  }

  eliminarEvento(nombre: string) {
    if (this.tdService.removeEvent(nombre)) {
      this.eventosLista = Object.keys(this.tdService.getEvent() || {});
    } else {
      console.warn(`No se encontró el evento ${nombre}`);
    }
  }
  
  guardarLink() {
    if (this.direccionLinkActual !== '') {
      // Modo edición
      if (this.linkActual) {
        const nuevaDireccion = this.linkActual.href;

        if(nuevaDireccion.trim() === '')
          return alert(`Tienes que ingresar una dirección`);

        this.tdService.eliminarLink(this.direccionLinkActual);

        // Eliminar nombre temporal del objeto antes de guardar
        const copia = { ...this.linkActual };
        delete copia.href;

        this.tdService.addLink(nuevaDireccion, copia);
        this.linksLista = this.tdService.obtenerTD().links || [];
      }
    } else {
      // Modo creación
      if (this.linkActual) {
        const direccion = this.linkActual.href;

        if(direccion.trim() === '')
          return alert(`Tienes que ingresar una dirección`);

        console.log(direccion);
        const copia = { ...this.linkActual };
        delete copia.href;

        this.tdService.addLink(direccion, copia);
        this.linksLista = this.tdService.obtenerTD().links || [];
      }else{
        return alert(`Tienes que ingresar una dirección`);
      }
    }

    this.cancelarLink();
  }

  cancelarLink() {
    this.direccionLinkActual = '';
    this.mostrarLink = false;
    this.linkActual = null;
  }

  editarLink(href: string) {
    const links = this.tdService.obtenerTD().links;

    if (!Array.isArray(links)) {
      console.warn(`La estructura de links no es un array.`);
      return;
    }

    const link = links.find(l => l.href === href);

    if (!link) {
      console.warn(`No se encontró el link con href ${href}`);
      return;
    }

    this.direccionLinkActual = href;

    // Clonamos profundamente el objeto para evitar mutaciones directas
    this.linkActual = {
      href,
      ...JSON.parse(JSON.stringify(link))
    };

    this.mostrarLink = true;
  }

  eliminarLink(direccion: string) {
    if (this.tdService.getLink(direccion)) {
      this.tdService.eliminarLink(direccion);
      this.linksLista = this.tdService.obtenerTD().links || [];
    } else {
      console.warn(`No se encontró el link ${direccion}`);
    }
  }

  async descargarTD() {
    try {
      const td = this.tdService.obtenerTD();
      if (!td) {
        console.error('No hay TD para descargar');
        return;
      }

      // Nombre base igual que antes
      const nombreBase = this.nombreTD?.trim() || 'thing-description';
      const nombreSeguro = nombreBase
        .toLowerCase()
        .replace(/\s+/g, '-')           // espacios por guiones
        .replace(/[^a-z0-9\-]/gi, '');  // solo letras, números y guiones

      const nombreArchivo = `${nombreSeguro || 'thing-description'}.json`;

      // Crear el Blob con el contenido de la TD
      const contenido = JSON.stringify(td, null, 2);
      const blob = new Blob([contenido], { type: 'application/json' });

      // Misma lógica que downloadImages: URL + <a download> + click
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = nombreArchivo;

      document.body.appendChild(a);
      a.click();

      // Limpieza
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Error al descargar la TD:', err);
      // Aquí si quieres puedes mostrar un toast o setear un estado de error
      // this.mensajeError = 'Error al descargar la Thing Description.';
    }
  }

  abrirArchivo() {
    this.inputArchivo.nativeElement.click();
  }

  cargarArchivoTD(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const baseName = archivo.name.replace(/\.[^/.]+$/, '');

    const lector = new FileReader();
    lector.onload = () => {
      try {
        const contenido = JSON.parse(lector.result as string);
        this.procesarTDImportado(baseName, contenido);
      } catch (e) {
        alert('El archivo no es un JSON válido.');
      }
    };
    lector.readAsText(archivo);
    this.tdService.setIsUpdate(false);
    this.tdService.setIdUpdate(-1);
  }

  procesarTDImportado(name: string, json: any) {
    if (!json || typeof json !== 'object') {
      alert('El archivo no contiene un TD válido.');
      return;
    }
    this.tdService.resetTD();
    
    this.tdService.setNameTD?.(name);
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
    this.refreshLists();
    this.autoOpenSections();

    this.cargatTd();
  }

  private refreshLists() {
    const td = this.tdService.obtenerTD();
    this.propiedadesLista = Object.keys(td.properties || {});
    this.accionesLista    = Object.keys(td.actions || {});
    this.eventosLista     = Object.keys(td.events || {});
    this.linksLista       = td.links || [];
  }

  private autoOpenSections() {
    const td = this.tdService.obtenerTD();
    const hasProps   = td.properties && Object.keys(td.properties).length > 0;
    const hasActions = td.actions && Object.keys(td.actions).length > 0;
    const hasEvents  = td.events && Object.keys(td.events).length > 0;
    const hasLinks   = Array.isArray(td.links) && td.links.length > 0;

    this.desplegables.setEstado('propiedades', hasProps);
    this.desplegables.setEstado('acciones',    hasActions);
    this.desplegables.setEstado('eventos',     hasEvents);
    this.desplegables.setEstado('links',       hasLinks);
  }

  private closeAllSections() {
    this.desplegables.setEstado('propiedades', false);
    this.desplegables.setEstado('acciones',    false);
    this.desplegables.setEstado('eventos',     false);
    this.desplegables.setEstado('links',       false);
  }

  resetTD(){
    this.nombreTD = "TD Name";
    this.tdService.resetTD();
    this.cargatTd();
    this.closeAllSections();
  }

  createNewTD(){
    this.tdService.guardarTD(this.nombreTD).subscribe({
      next: async (createdId: number) => {
        const res = await this.dialog.open({
          title: 'Thing Description saved',
          message: 'What would you like to do next?',
          dismissible: true,
          actions: [
            { id: 'continue', label: 'Continue editing', variant: 'primary' },
            { id: 'new',      label: 'Create new', variant: 'secondary' },
            { id: 'list',     label: 'View my TDs', variant: 'secondary'}
          ]
        });

        switch (res) {
          case 'continue':
            // seguir editando la recién creada
            this.tdService.setIsUpdate(true);
            this.tdService.setIdUpdate(createdId);   // <-- usa el ID devuelto
            break;

          case 'new':
            this.nombreTD = 'Thing’s Name';
            this.tdService.resetTD();
            this.tdService.setIsUpdate(false);
            this.tdService.setIdUpdate(-1);
            break;

          case 'list':
            this.router.navigate(['/my-tds']);
            break;

          default:
            // dismiss o nada: no hacer nada
            break;
        }
      },
      error: e => console.error('Error', e)
    });
  }

  guardarTD() {
    if(!this.isUpdate)
      this.createNewTD();
    else
      this.updateTD();
  }

  createNew(){
    this.tdService.setIdUpdate(-1);
    this.tdService.setIsUpdate(false);
    this.resetTD();
  }

  updateTD() {
    this.tdService.updateTD(this.nombreTD).subscribe({
      next: async () => {
        const res = await this.dialog.open({
          title: 'Thing Description updated',
          message: 'What would you like to do next?',
          dismissible: true,
          actions: [
            { id: 'continue', label: 'Continue editing', variant: 'primary' },
            { id: 'new',      label: 'Create new' },
            { id: 'list',     label: 'View my TDs' }
          ]
        });

        switch (res) {
          case 'continue':
            // seguimos en modo actualización con el mismo ID ya cargado
            this.tdService.setIsUpdate(true);
            break;

          case 'new':
            this.nombreTD = 'Thing’s Name';
            this.tdService.resetTD();
            this.tdService.setIsUpdate(false);
            this.tdService.setIdUpdate(-1);
            break;

          case 'list':
            this.router.navigate(['/my-tds']);
            break;

          default:
            // dismiss: no hacemos nada
            break;
        }
      },
      error: e => console.error('Error', e)
    });
  }

  gestionarBotones(seccion: string, accion: 'guardar' | 'cancelar') {
    if (accion === 'guardar') {
      switch (seccion) {
        case 'propiedad': this.guardarPropiedad(); break;
        case 'accion':    this.guardarAccion(); break;
        case 'evento':    this.guardarEvento(); break;
        case 'link':      this.guardarLink(); break;
      }
    } else {
      // Es cancelar
      switch (seccion) {
        case 'propiedad': this.cancelarPropiedad(); break;
        case 'accion':    this.cancelarAccion(); break;
        case 'evento':    this.cancelarEvento(); break;
        case 'link':      this.cancelarLink(); break;
      }
    }
  }
}
