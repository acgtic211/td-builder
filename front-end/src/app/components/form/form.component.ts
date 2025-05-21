import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { atributosForm } from '../../variables';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgSwitch, NgSwitchCase],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  @Input() datos: any = {};
  @Output() datosChange = new EventEmitter<any>();
  @Output() atributosFormUsados = new EventEmitter<string[]>();

  href: string = '';
  form: any = {};
  atributos: any[] = [];

  ngOnInit() {
    if (Array.isArray(this.datos['forms']) && this.datos['forms'].length > 0) {
      this.href = this.datos['forms'][0]['href'] || '';
      this.form = this.datos['forms'][0];
    } else {
      this.form = {};
    }

    // 🔧 Normalizar campos tipo array que vienen como string (ej. "op")
    for (const key in this.form) {
      const def = atributosForm.find(a => a.nombre === key);
      if (def?.type === 'array' && typeof this.form[key] === 'string') {
        this.form[key] = [this.form[key]]; // Convertir string a array
      }
    }

    this.atributos = Object.keys(this.form)
      .filter(nombre => nombre !== 'href')
      .map(nombre => {
        const def = atributosForm.find(a => a.nombre === nombre);
        return {
          nombre,
          type: def?.type ?? 'string',
          valor: this.form[nombre]
        };
      });

    setTimeout(() => this.emitirCambios());
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  emitirCambios() {
    const form: any = { href: this.href }; // 👈 Agregar href manualmente

    this.atributos.forEach(attr => {
      form[attr.nombre] = attr.valor;
    });

    this.datos['forms'] = [form];
    this.datosChange.emit(this.datos);

    const usados = this.atributos.map(a => a.nombre);
    this.atributosFormUsados.emit(usados);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const nombre = event.dataTransfer?.getData('text/plain');
    if (!nombre || this.atributos.some(attr => attr.nombre === nombre)) return;
  
    const attrDef = atributosForm.find(a => a.nombre === nombre);
    if (!attrDef) return;
  
    const tipo = attrDef.type;
  
    this.atributos.push({
      nombre,
      type: tipo,
      valor: tipo === 'array' ? [''] : ''
    });
  
    this.emitirCambios();
  }  

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  eliminarAtributo(nombre: string) {
    this.atributos = this.atributos.filter(attr => attr.nombre !== nombre);
    this.emitirCambios();
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
        this.atributos = this.atributos.filter(a => a !== attr);
      }
  
      this.emitirCambios();
    }
  }
}
