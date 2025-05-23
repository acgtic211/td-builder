import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, NgSwitchCase, NgSwitch } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { atributosForm, atributosInteracciones, atributosSchema, Interaccion, TipoSchema } from '../../../variables';
import { FormComponent } from '../../../components/form/form.component';

interface Tipo{
  nombre: string;
  schema: TipoSchema;
}

@Component({
  selector: 'app-propiedad',
  standalone: true,
  imports: [NgIf, NgFor, NgSwitchCase, NgSwitch, FormsModule, NgClass, FormComponent],
  templateUrl: './propiedad.component.html',
  styleUrl: './propiedad.component.scss'
})
export class PropiedadComponent implements OnInit {
  @Input() datos: any = {};
  @Output() datosChange = new EventEmitter<any>();
  
  atributosDrop: any[] = [];
  atributosComunes: string[] = [];
  formularioDatos: any = {};

  tipos: Tipo[] = [
    {nombre: 'Integer', schema: TipoSchema.INTEGER },
    {nombre: 'Number', schema: TipoSchema.NUMBER },
    {nombre: 'Boolean', schema: TipoSchema.BOOLEAN },
    {nombre: 'String', schema: TipoSchema.STRING },
    {nombre: 'Array', schema: TipoSchema.ARRAY },
    {nombre: 'Object', schema: TipoSchema.OBJECT }
  ];

  typeSelected: Tipo = { nombre: '', schema: TipoSchema.COMUN };
  atributosFormUsados: string[] = [];

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

    // Detectar atributos personalizados existentes
    this.atributosDrop = Object.keys(this.datos)
      .filter(nombre =>
        !['@type', 'type', 'title', 'description', 'nombre'].includes(nombre)
      )
      .map(nombre => {
        const attrInfo =
          atributosInteracciones.find(a => a.nombre === nombre) ??
          atributosSchema.find(a => a.nombre === nombre);

        const tipo = attrInfo?.type ?? 'string';

        return { nombre, type: tipo };
      });

    const tieneForms = this.atributosDrop.some(attr => attr.nombre === 'forms');
    if (!tieneForms) {
      this.atributosDrop.unshift({ nombre: 'forms', type: 'form' });
    }

    // Asignar tipo seleccionado si ya existía
    const tipoExistente = this.datos['type'];
    const encontrado = this.tipos.find(t => t.nombre.toLowerCase() === tipoExistente?.toLowerCase());
    if (encontrado) {
      this.typeSelected = encontrado;
    }

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

    this.datosChange.emit(datosFiltrados);
  }

  seleccionarTipo(nombreTipo: string) {
    const seleccionado = this.tipos.find(t => t.nombre === nombreTipo);
    if (seleccionado) {
      this.typeSelected = seleccionado;
      this.datos['type'] = seleccionado.nombre.toLowerCase();
  
      // ❗ Filtrar atributos que ya no sean válidos para el nuevo tipo
      const compatibles = new Set(
        atributosInteracciones
          .filter(attr => attr.interaccion === Interaccion.PROPIEDAD)
          .map(attr => attr.nombre)
          .concat(
            atributosSchema
              .filter(attr =>
                attr.schema === TipoSchema.COMUN || attr.schema === seleccionado.schema
              )
              .map(attr => attr.nombre)
          )
      );
  
      this.atributosDrop = this.atributosDrop.filter(attr => compatibles.has(attr.nombre));
      this.actualizarAtributos();
      this.emitirCambios();
    }
  }

  actualizarAtributos() {
    const tipoSchemaSeleccionado = this.typeSelected.schema;
  
    const interaccionesPropiedad = atributosInteracciones
      .filter(attr => attr.interaccion === Interaccion.PROPIEDAD || (attr.interaccion === Interaccion.COMUN && attr.nombre != 'uriVariables'))
      .map(attr => attr.nombre);
  
    const schemaComunesYTipo = atributosSchema
      .filter(attr =>
        attr.schema === TipoSchema.COMUN || attr.schema === tipoSchemaSeleccionado
      )
      .map(attr => attr.nombre);
  
    // Incluir atributosForm solo si hay un atributo 'form'
    const incluirForm = this.atributosDrop.some(attr => attr.type === 'form');
    const formAttrs = incluirForm ? atributosForm.map(attr => attr.nombre) : [];
  
    const todos = [...new Set([...interaccionesPropiedad, ...schemaComunesYTipo, ...formAttrs])];
  
    const usados = [
      ...this.atributosDrop.map(a => a.nombre),
      ...this.atributosFormUsados
    ];
  
    this.atributosComunes = todos.filter(attr => !usados.includes(attr));
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

    // ⛔ Evitar que atributosForm se usen fuera del <app-form>
    if (atributosForm.some(a => a.nombre === nombre)) return;

    const attrInfo =
      atributosInteracciones.find(a => a.nombre === nombre) ??
      atributosSchema.find(a => a.nombre === nombre);

    const tipo = attrInfo?.type ?? 'string';

    this.atributosDrop.push({ nombre, type: tipo });

    // ✅ Valor por defecto en datos
    this.datos[nombre] = tipo === 'boolean' ? true : '';

    this.actualizarAtributos();
    this.emitirCambios();
  }


  eliminarAtributo(nombre: string) {
    this.atributosDrop = this.atributosDrop.filter(attr => attr.nombre !== nombre);
    delete this.datos[nombre];
    this.actualizarAtributos();
    this.emitirCambios();
  }

  tieneAtributoForm(): boolean {
    return this.atributosDrop.some(attr => {
      const definicion = atributosInteracciones.find(a => a.nombre === attr.nombre);
      return definicion?.type === 'form';
    });
  }

  actualizarAtributosForm(usados: string[]) {
    this.atributosFormUsados = usados;
    this.actualizarAtributos();
  }

  //Para color
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