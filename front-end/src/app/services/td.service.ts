import { Injectable } from '@angular/core';
import { seguridadMap } from '../variables';
@Injectable({
  providedIn: 'root'
})

export class TdService {
   private td: any = {
    '@context': 'https://www.w3.org/2019/wot/td/v1',
    id: '',
    title: '',
    security: 'nosec',
    securityDefinitions: {
      "nosec": {
        "scheme": "nosec"
      }
    },
    properties: {},
    actions: {},
    events: {},
    links: []
  };

  obtenerTD() {
    return this.generarTDOrdenado();
  }

  actualizarContext(context: string) {
    this.td['@context'] = context;
  }

  actualizarTitulo(titulo: string) {
    this.td.title = titulo;
  }

  actualizarId(id: string) {
    this.td.id = id;
  }

  actualizarDescripcion(desc: string) {
    this.td.description = desc;
  }

  actualizarTipo(tipo: string) {
    this.td['@type'] = tipo;
  }

  actualizarSeguridad(nombreEsquema: string, scheme: string) {
    this.td.securityDefinitions = {
      [nombreEsquema]: { scheme }
    };
    this.td.security = nombreEsquema;
  }

  addProperty(nombre: string, prop: any) {
    this.td.properties[nombre] = prop;
  }

  getProperties() {
    return this.td.properties;
  }

  addAction(nombre: string, prop: any) {
    this.td.actions[nombre] = prop;
  }

  getAction() {
    return this.td.actions;
  }

  addEvent(nombre: string, prop: any) {
    this.td.events[nombre] = prop;
  }

  getEvent() {
    return this.td.events;
  }

  addLink(direccion: string, prop: any) {
    this.td.links.push({
      href: direccion, ...prop
    });
  }

  eliminarLink(href: string) {
    this.td.links = this.td.links.filter((l: any) => l.href !== href);
  }

  getLink(href: string) {
    return this.td.links.find((link: any) => link.href === href);
  }

  resetTD() {
    this.td = {
      '@context': 'https://www.w3.org/2019/wot/td/v1',
      id: '',
      title: '',
      security: '',
      securityDefinitions: {},
      properties: {},
      actions: {},
      events: {},
      links: []
    };
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
}
