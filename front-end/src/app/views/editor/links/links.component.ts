import { Component } from '@angular/core';
import { Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgIf, NgFor, NgClass, NgSwitchCase, NgSwitch } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { atributosLink } from '../../../models/variables';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [NgIf, NgFor, NgSwitchCase, NgSwitch, FormsModule, NgClass],
  templateUrl: './links.component.html',
  styleUrl: './links.component.scss'
})
export class LinksComponent implements OnInit {
  @Input() datos: any = {};
  @Output() datosChange = new EventEmitter<any>();
    
  atributosDrop: any[] = [];
  atributosComunes: string[] = [];
  formularioDatos: any = {};
  
  ngOnInit() {
    if (!this.datos) {
      this.datos = {
        href: ''
      };
    }

    // 🔧 Normalizar arrays: si tipo es 'array' y el valor es string, convertir a array
    for (const key in this.datos) {
      const attrInfo = atributosLink.find(a => a.nombre === key);
      if (attrInfo?.type === 'array' && typeof this.datos[key] === 'string') {
        this.datos[key] = [this.datos[key]];
      }
    }

    // Detectar atributos personalizados existentes
    this.atributosDrop = Object.keys(this.datos)
      .filter(nombre => !['href'].includes(nombre))
      .map(nombre => {
        const attrInfo = atributosLink.find(a => a.nombre === nombre);
        const tipo = attrInfo?.type ?? 'string';
        const valor = this.datos[nombre];

        return {
          nombre,
          type: tipo,
          valor
        };
      });

    this.actualizarAtributos();
  }

  emitirCambios() {
    const datosFiltrados: any = {};

    for (const clave in this.datos) {
      const valor = this.datos[clave];
      if (
        valor !== '' &&
        valor !== null &&
        valor !== undefined &&
        (typeof valor !== 'object' || Object.keys(valor).length > 0)
      ) {
        datosFiltrados[clave] = valor;
      }
    }

    this.datosChange.emit(this.datos);
  }

  actualizarAtributos() {
    const atrLink = atributosLink.map(attr => attr.nombre);

    const usados = [
      ...this.atributosDrop.map(a => a.nombre),
    ];
  
    this.atributosComunes = atrLink.filter(attr => !usados.includes(attr));
  }

  onDragStart(event: DragEvent, attr: string) {
    event.dataTransfer?.setData('text/plain', attr);
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const nombre = event.dataTransfer?.getData('text/plain');

    if (!nombre || this.atributosDrop.some(attr => attr.nombre === nombre)) return;
  
    const attrDef = atributosLink.find(a => a.nombre === nombre);
    if (!attrDef) return;
  
    const tipo = attrDef.type;
  
    this.atributosDrop.push({
      nombre,
      type: tipo,
      valor: tipo === 'array' ? [''] : ''
    });

    this.actualizarAtributos();
    this.emitirCambios();
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  agregarElemento(attr: any) {
    if (Array.isArray(attr.valor)) {
      attr.valor.push('');
      this.emitirCambios();
    }
  }
  
  eliminarElemento(attr: any, index: number) {
    if (Array.isArray(attr.valor)) {
      attr.valor.splice(index, 1);
  
      if (attr.valor.length === 0) {
        this.atributosDrop = this.atributosDrop.filter(a => a !== attr);
      }
    }
  }

  eliminarAtributo(nombre: string) {
    this.atributosDrop = this.atributosDrop.filter(attr => attr.nombre !== nombre);
    delete this.datos[nombre];
    this.actualizarAtributos();
    this.emitirCambios();
  }

  //Para color
  getClaseAtributo(nombre: string): string {
    if (atributosLink.some(a => a.nombre === nombre))
      return 'link';
    else
      return '';
  }
}
