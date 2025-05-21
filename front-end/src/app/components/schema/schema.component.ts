import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { atributosSchema, TipoSchema, Tipo, tiposSchema } from '../../variables';

@Component({
  selector: 'app-schema',
  standalone: true,
  imports: [ FormsModule, NgIf, NgFor, NgSwitch, NgSwitchCase ],
  templateUrl: './schema.component.html',
  styleUrl: './schema.component.scss'
})
export class SchemaComponent implements OnInit {
  @Input() datos: any = {};

  @Output() datosChange = new EventEmitter<any>();
  @Output() atributosSchemaUsados = new EventEmitter<string[]>();
  @Output() tipoSchemaSeleccionado = new EventEmitter<TipoSchema>();

  atributos: any[] = [];
  tiposSchema = tiposSchema;
  typeSelected: Tipo = { nombre: '', schema: TipoSchema.COMUN };

  ngOnInit() {
    // Inicializar this.atributos desde this.datos.atributos (si existe)
    if (Array.isArray(this.datos.atributos)) {
      this.atributos = [...this.datos.atributos];
    }

    // Si hay un tipo definido en datos, seleccionarlo
    // Si hay un tipo definido en datos, seleccionarlo
    const tipo = this.datos?.type?.toLowerCase();
    if (tipo) {
      const seleccionado = tiposSchema.find(t => t.nombre.toLowerCase() === tipo);
      if (seleccionado) {
        this.typeSelected = seleccionado;
      }
    }

    setTimeout(() => this.emitirCambios());
  }

  emitirCambios() {
    const salida: any = {};

    // Incluir campos estándar solo si tienen valor
    ['@type', 'title', 'description', 'type'].forEach(campo => {
      const valor = this.datos[campo];
      if (valor !== undefined && valor !== null && valor !== '') {
        salida[campo] = valor;
      }
    });

    // Convertir atributos a propiedades planas desde this.atributos
    if (Array.isArray(this.atributos)) {
      for (const atributo of this.atributos) {
        if (
          atributo?.nombre &&
          atributo.valor !== undefined &&
          atributo.valor !== null &&
          atributo.valor !== ''
        ) {
          salida[atributo.nombre] = atributo.valor;
        }
      }
    }

    // Emitir nombres de atributos usados
    const usados = this.atributos.map(a => a.nombre);

    this.datosChange.emit(salida);               // Emitir objeto plano
    this.atributosSchemaUsados.emit(usados);     // Emitir lista de nombres usados
      this.tipoSchemaSeleccionado.emit(this.typeSelected.schema);
  }

  seleccionarTipo(tipo: string) {
    const seleccionado = tiposSchema.find(t => t.nombre.toLowerCase() === tipo.toLowerCase());
    if (seleccionado) {
      this.typeSelected = seleccionado;

      // ✅ Filtrar atributos válidos: COMUN + tipo seleccionado
      const permitidoSchemas = [TipoSchema.COMUN, seleccionado.schema];

      this.atributos = this.atributos.filter((a: any) => {
        const def = atributosSchema.find(s => s.nombre === a.nombre);
        return def && permitidoSchemas.includes(def.schema);
      });

      this.datos['type'] = seleccionado.nombre.toLowerCase();

      this.emitirCambios();
    }     
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const nombre = event.dataTransfer?.getData('text/plain');
    if (!nombre || this.atributos.some(attr => attr.nombre === nombre)) return;

    // Asegurar que atributos esté inicializado
    const attrSch = atributosSchema.find(a => a.nombre === nombre);
    if (!attrSch) return;

    const tipo = attrSch.type;

    const tipoActual = this.typeSelected.schema ?? TipoSchema.COMUN;
    if (attrSch.schema !== TipoSchema.COMUN && attrSch.schema !== tipoActual) return;

    let valor: any = '';
    if (attrSch.type === 'boolean') {
      valor = true;
    } else if (attrSch.type === 'array') {
      valor = [''];
    }

    this.atributos.push({
      nombre,
      type: tipo,
      valor
    });

    this.emitirCambios();
  }
  

  eliminarAtributo(nombre: string) {
    this.atributos = this.atributos.filter((a: any) => a.nombre !== nombre);
    this.emitirCambios();
  }
}
