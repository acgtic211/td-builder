import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesplegablesService {

  estados = {
    general: false,
    propiedades: false,
    acciones: false,
    eventos: false,
    links: false
  };

  setEstado(nombre: 'general' | 'propiedades' | 'acciones' | 'eventos' | 'links', abierto: boolean) {
    this.estados[nombre] = abierto;
  }

  getEstado(nombre: 'general' | 'propiedades' | 'acciones' | 'eventos' | 'links') {
    return this.estados[nombre];
  }
}
