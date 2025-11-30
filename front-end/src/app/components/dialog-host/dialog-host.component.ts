import { Component, HostListener, inject } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { DialogService } from '../../services/dialog/dialog.service';

@Component({
  selector: 'app-dialog-host',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './dialog-host.component.html',
  styleUrl: './dialog-host.component.scss'
})
export class DialogHostComponent {
  dialog = inject(DialogService);

  @HostListener('window:keydown.escape', ['$event'])
  onEsc() { if (this.dialog.active()?.dismissible) this.dialog.dismiss(); }
}
