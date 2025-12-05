import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TdService } from '../../services/td/td.service';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { td_schema } from './tdSchema/td_schema';

@Component({
  selector: 'app-json',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './json.component.html',
  styleUrl: './json.component.scss'
})
export class JsonComponent {
  @ViewChild('finalValidacion') finalValidacion!: ElementRef;
  
  private ajv = new Ajv({ strict: false, allErrors: true });
  
  public errores: string[] = [];

  constructor(public tdService: TdService) {
    addFormats(this.ajv)
  }

  scrollAlFinal() {
    if (this.finalValidacion) {
      this.finalValidacion.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  get highlightedJsonTD(): string {
    const json = JSON.stringify(this.tdService.obtenerTD(), null, 2);
    return json.replace(
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

  get esValido(): boolean {
    const td = this.tdService.obtenerTD();
    const valido = this.ajv.validate(td_schema, td);

    this.errores = valido
      ? []
      : (this.ajv.errors || []).map(error =>
          `${error.instancePath || '/'} ${error.message}`
        );

    return valido;
  }
}
