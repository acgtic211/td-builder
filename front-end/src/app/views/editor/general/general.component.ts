import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgIf, NgFor, CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TdService } from '../../../services/td/td.service';
import { seguridadMap } from '../../../models/variables';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, CommonModule],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class GeneralComponent implements OnChanges {
  @Input() datos: any = {};
  @Input() nombre: string = '';
  @Output() nombreChange = new EventEmitter<string>();

  context = '';
  titulo = '';
  id = '';
  descripcion = '';
  selectedTipo = '';
  otroTipo = '';
  selectedSeguridad = '';
  otroSeguridad = '';

  tipos = ['Sensor', 'Actuator', 'Service', 'DataSet', 'Other'];
  
  opcionesSeguridad = Object.entries(seguridadMap).map(([key, value]) => ({
    nombreEsquema: key, 
    scheme: value    
  }));

  constructor(private tdService: TdService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && this.datos) {
      const td = this.datos;

      this.context = td['@context'] || '';
      this.titulo = td.title || '';
      this.id = td.id || '';
      this.descripcion = td.description || '';

      const tipoTd = td['@type'] || '';

      if (this.tipos.includes(tipoTd)) {
        // El tipo del TD está en la lista => seleccionamos ese botón y vaciamos el input "Other"
        this.selectedTipo = tipoTd;
        this.otroTipo = '';
      } else if (tipoTd) {
        // El tipo del TD NO está en la lista => seleccionamos "Other" y ponemos el valor en el input
        this.selectedTipo = 'Other';
        this.otroTipo = tipoTd;
      } else {
        // No hay tipo definido
        this.selectedTipo = '';
        this.otroTipo = '';
      }

      this.selectedSeguridad = (td.securityDefinitions && Object.keys(td.securityDefinitions)[0]) || '';
      this.otroSeguridad = this.selectedSeguridad &&
      !this.opcionesSeguridad.some(op => op.nombreEsquema === this.selectedSeguridad) ? this.selectedSeguridad : '';
    }
  }

  onNameChange(){
    this.tdService.setNameTD(this.nombre);
    this.nombreChange.emit(this.nombre);
  }

  onContextChange(nuevoContext: string) {
    this.tdService.actualizarContext(nuevoContext);
  }

  onTituloChange(nuevoTitulo: string) {
    this.tdService.actualizarTitulo(nuevoTitulo);
  }

  onIDChange(nuevoId: string) {
    this.tdService.actualizarId(nuevoId);
  }

  onDescripcionChange(nuevaDescripcion: string) {
    this.tdService.actualizarDescripcion(nuevaDescripcion);
  }

  seleccionarTipo(tipo: string) {
    if(this.selectedTipo === tipo) {
      this.selectedTipo = "";
      this.tdService.actualizarTipo(this.selectedTipo);
      return;
    }

    this.selectedTipo = tipo;
    this.tdService.actualizarTipo(tipo);
  }

  onOtroTipoChange(nuevoTipo: string) {
    this.otroTipo = nuevoTipo;
    if (this.selectedTipo === 'Other') {
      this.tdService.actualizarTipo(nuevoTipo);
    }
  }

  seleccionarSeguridad(tipo: string) {
    this.selectedSeguridad = tipo;

    const nombreEsquema = tipo === 'Otro' ? this.otroSeguridad : `${tipo}`;
    const scheme = seguridadMap[nombreEsquema] || 'nosec';

    this.tdService.actualizarSeguridad(nombreEsquema, scheme);
  }

  onOtroSeguridadChange(nuevoSeguridad: string) {
    this.otroSeguridad = nuevoSeguridad;
    if (this.selectedSeguridad === 'Otro') {
      const nombre = nuevoSeguridad;
      const scheme = seguridadMap[nombre] || 'nosec';
      this.tdService.actualizarSeguridad(nombre, scheme);
    }
  }
}
