import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgIf, NgFor, NgSwitchCase, NgSwitch, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { atributosForm, atributosInteracciones, atributosSchema, Interaccion, TipoSchema, tiposSchema } from '../../../models/variables';
import { FormComponent } from '../../../components/form/form.component';
import { SchemaComponent } from '../../../components/schema/schema.component';

@Component({
  selector: 'app-accion',
  standalone: true,
  imports: [NgIf, NgFor, NgSwitchCase, NgSwitch, FormsModule, NgClass, FormComponent, SchemaComponent],
  templateUrl: './accion.component.html',
  styleUrl: './accion.component.scss'
})

export class AccionComponent implements OnInit {
  @Input() datos: any = {};
  @Output() datosChange = new EventEmitter<any>();

  atributosDrop: any[] = [];
  atributosComunes: string[] = [];
  atributosFormUsados: string[] = [];
  atributosSchemaUsadosMap: Record<string, string[]> = {};

  ngOnInit() {
    if (!this.datos) {
      this.datos = {
        '@type': '',
        type: '',
        title: '',
        description: ''
      };
    }

    if (!this.datos.hasOwnProperty('forms')) {
      this.datos['forms'] = [];
    }

    this.atributosDrop = Object.keys(this.datos)
      .filter(nombre => !['@type', 'type', 'title', 'description', 'nombre'].includes(nombre))
      .map(nombre => {
        const attrInfo =
          atributosInteracciones.find(a => a.nombre === nombre) ??
          atributosSchema.find(a => a.nombre === nombre);

        const tipo = attrInfo?.type ?? 'string';
        const attr: any = { nombre, type: tipo };

        // Si es schema, inicializar estructura + detectar tipoSeleccionado
        if (tipo === 'schema') {
          const schemaData = this.datos[nombre] || {};
          const typeStr = schemaData.type?.toLowerCase?.() ?? '';

          const tipoDetectado = tiposSchema.find(
            t => t.nombre.toLowerCase() === typeStr
          )?.schema ?? TipoSchema.COMUN;

          attr.schema = {
            tipoSeleccionado: tipoDetectado
          };

          if (!schemaData.atributos) {
            schemaData.atributos = [];
          }

          const clavesReservadas = ['@type', 'title', 'description', 'type', 'atributos'];

          // Recorremos las claves del objeto (ej: input: { type: "integer", minimum: 5 })
          Object.keys(schemaData).forEach(clave => {
            // Si es una propiedad válida (ej: 'minimum') y no es metadato
            if (!clavesReservadas.includes(clave)) {
              // Verificamos si existe en tu lista de atributos conocidos
              const defAtributo = atributosSchema.find(a => a.nombre === clave);
              // Evitar duplicados si Angular ya lo hubiera inicializado
              const yaExiste = schemaData.atributos.some((a: any) => a.nombre === clave);

              if (defAtributo && !yaExiste) {
                schemaData.atributos.push({
                  nombre: clave,
                  type: defAtributo.type,
                  valor: schemaData[clave]
                });
              }
            }
          });
        }
        return attr;
      });

    const tieneForms = this.atributosDrop.some(attr => attr.nombre === 'forms');
    if (!tieneForms) {
      this.atributosDrop.unshift({ nombre: 'forms', type: 'form' });
    }

    this.actualizarAtributos();
  }

  emitirCambios() {
    const datosFiltrados: any = {};

    for (const clave in this.datos) {
      const valor = this.datos[clave];
      const attr = this.atributosDrop.find(a => a.nombre === clave);

      if (attr?.type === 'schema') {
        const subObjeto: any = {};

        // Copiar campos estándar si están presentes
        ['@type', 'title', 'description', 'type'].forEach(k => {
          const v = valor[k];
          if (v !== undefined && v !== null && v !== '') {
            subObjeto[k] = v;
          }
        });

        // Atributos personalizados (valor.atributos → propiedades planas)
        if (Array.isArray(valor.atributos)) {
          for (const atributo of valor.atributos) {
            if (
              atributo?.nombre &&
              atributo.valor !== undefined &&
              atributo.valor !== null &&
              atributo.valor !== ''
            ) {
              subObjeto[atributo.nombre] = atributo.valor;
            }
          }
        }

        datosFiltrados[clave] = subObjeto;
      }

      // Atributos normales (no-schema) 
      else if (valor !== '' && valor !== null && valor !== undefined) {
        datosFiltrados[clave] = valor;
      }
    }

    this.datosChange.emit(datosFiltrados);
  }


  actualizarAtributos() {
    const interaccionesPropiedad = atributosInteracciones
      .filter(attr => attr.interaccion === Interaccion.ACCION || attr.interaccion === Interaccion.COMUN)
      .map(attr => attr.nombre);

    const incluirForm = this.atributosDrop.some(attr => attr.type === 'form');
    const formAttrs = incluirForm ? atributosForm.map(attr => attr.nombre) : [];

    const schemaDrops = this.atributosDrop.filter(attr => attr.type === 'schema');
    const totalSchemas = schemaDrops.length;

    const usadosPorAtributo: Record<string, number> = {};
    const tiposEnUso = new Set<TipoSchema>();

    schemaDrops.forEach(schema => {
      const seleccion = schema.schema?.tipoSeleccionado ?? TipoSchema.COMUN;
      tiposEnUso.add(seleccion);

      const usados = this.atributosSchemaUsadosMap[schema.nombre] || [];
      usados.forEach(nombre => {
        usadosPorAtributo[nombre] = (usadosPorAtributo[nombre] || 0) + 1;
      });
    });

    // Reunir todos los atributosSchema posibles
    const posiblesAttrs = atributosSchema
      .filter(attr =>
        attr.schema === TipoSchema.COMUN || tiposEnUso.has(attr.schema)
      )
      .map(attr => attr.nombre);

    // Filtrar los atributosSchema que todavía no están usados en todos los schemas
    const schemaDisponibles = posiblesAttrs.filter(nombre => 
      (usadosPorAtributo[nombre] || 0) < totalSchemas
    );

    const usados = [
      ...this.atributosDrop.map(a => a.nombre),
      ...this.atributosFormUsados
    ];

    this.atributosComunes = [...new Set([
      ...interaccionesPropiedad,
      ...schemaDisponibles,
      ...formAttrs
    ])].filter(attr => !usados.includes(attr));
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

    // ⛔ No permitir atributos de formulario ni de schema aquí
    if (atributosForm.some(a => a.nombre === nombre)) return;
    if (atributosSchema.some(a => a.nombre === nombre)) return;

    // Buscar información del atributo
    const attrInfo =
      atributosInteracciones.find(a => a.nombre === nombre) ??
      atributosSchema.find(a => a.nombre === nombre);

    const tipo = attrInfo?.type ?? 'string';

    const nuevoAtributo: any = {
      nombre,
      type: tipo
    };

    // ✅ Establecer valor por defecto en this.datos
    if (tipo === 'boolean') {
      this.datos[nombre] = true;
    } else if (tipo === 'object') {
      this.datos[nombre] = {};
    } else if (tipo === 'array') {
      this.datos[nombre] = [];
    } else {
      this.datos[nombre] = '';
    }

    // Si es de tipo schema, agregar estructura adicional
    if (tipo === 'schema') {
      // Este es el objeto plano que irá directamente en this.datos[nombre]
      this.datos[nombre] = {
        '@type': '',
        title: '',
        description: '',
        type: '',
        atributos: []
      };

      nuevoAtributo.schema = {
        tipoSeleccionado: TipoSchema.COMUN
      };
    }

    this.atributosDrop.push(nuevoAtributo);
    this.actualizarAtributos();
    this.emitirCambios();
  }

  eliminarAtributo(nombre: string) {
    this.atributosDrop = this.atributosDrop.filter(attr => attr.nombre !== nombre);
    delete this.datos[nombre];
    this.actualizarAtributos();
    this.emitirCambios();
  }

  actualizarAtributosForm(usados: string[]) {
    this.atributosFormUsados = usados;
    this.actualizarAtributos();
  }

  actualizarAtributosSchema({ nombre, usados }: { nombre: string, usados: string[] }) {
    this.atributosSchemaUsadosMap[nombre] = usados;
    this.actualizarAtributos();
  }

  tipoSeleccionado(nombre: string, tipo: TipoSchema) {
    const attr = this.atributosDrop.find(a => a.nombre === nombre);
    if (attr && attr.type === 'schema') {
      attr.schema.tipoSeleccionado = tipo;
      this.actualizarAtributos();
    }
  }

  getClaseAtributo(nombre: string): string {
    if (atributosInteracciones.some(a => a.nombre === nombre)) {
      return 'interaccion';
    }

    const schemaAttr = atributosSchema.find(a => a.nombre === nombre);
    if (!schemaAttr) return 'form';

    switch (schemaAttr.schema) {
      case TipoSchema.COMUN: return 'comun';
      case TipoSchema.INTEGER: return 'integer';
      case TipoSchema.NUMBER: return 'number';
      case TipoSchema.STRING: return 'string';
      case TipoSchema.BOOLEAN: return 'boolean';
      case TipoSchema.ARRAY: return 'array';
      case TipoSchema.OBJECT: return 'object';
      default: return '';
    }
  }
}