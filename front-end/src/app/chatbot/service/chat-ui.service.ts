import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatUiService {
  visible = signal(false);

  toggle() {
    this.visible.set(!this.visible());
  }

  open() {
    this.visible.set(true);
  }

  close() {
    this.visible.set(false);
  }
}
