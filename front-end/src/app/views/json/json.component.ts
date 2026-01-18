import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TdService } from '../../services/td/td.service';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { td_schema } from './tdSchema/td_schema';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-json',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './json.component.html',
  styleUrl: './json.component.scss'
})
export class JsonComponent implements OnInit, OnDestroy{
  @ViewChild('finalValidacion') finalValidacion!: ElementRef;
  
  private ajv = new Ajv({ strict: false, allErrors: true });
  private updateSub?: Subscription;
  
  public errores: string[] = [];
  public highlightedJsonTD: string = '';
  public esValido: boolean = true;

  constructor(public tdService: TdService) {
    addFormats(this.ajv)
  }

  ngOnInit(): void {
    // 1. Calcular vista inicial
    this.actualizarVista();

    // 2. Recalcular cuando la TD cambie
    this.updateSub = this.tdService.tdUpdated$.subscribe(() => {
      this.actualizarVista();
    });
  }

  ngOnDestroy(): void {
    this.updateSub?.unsubscribe();
  }

  scrollAlFinal() {
    if (this.finalValidacion) {
      this.finalValidacion.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  actualizarVista() {
    const td = this.tdService.obtenerTD();

    // 1. Validación AJV
    this.esValido = this.ajv.validate(td_schema, td);
    this.errores = this.esValido
      ? []
      : (this.ajv.errors || []).map(error =>
          `${error.instancePath || '/'} ${error.message}`
        );

    // 2. Generación del HTML coloreado
    const json = JSON.stringify(td, null, 2);
    this.highlightedJsonTD = json.replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\d+)/g,
      (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'key' : 'string';
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }
}
