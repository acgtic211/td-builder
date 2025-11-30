import { Injectable, signal } from '@angular/core';
import { DialogAction, DialogOptions, DialogResult } from '../../models/dialog.types';

@Injectable({ providedIn: 'root' })
export class DialogService {
  // Estado actual del diálogo (o null si no hay)
  active = signal<(DialogOptions & { _resolve?: (r: DialogResult)=>void }) | null>(null);

  open(options: DialogOptions): Promise<DialogResult> {
    return new Promise<DialogResult>((resolve) => {
      this.active.set({ ...options, _resolve: resolve });
    });
  }

  info(title: string, message: string, opts?: { okText?: string; dismissible?: boolean }): Promise<'ok'|'dismiss'> {
    const actions: DialogAction[] = [
      { id: 'ok', label: opts?.okText ?? 'OK', variant: 'primary' }
    ];

    return this.open({ title, message, actions, dismissible: opts?.dismissible ?? true }) as any;
  }

  confirm(
    title: string,
    message: string,
    opts?: { okText?: string; cancelText?: string; danger?: boolean; dismissible?: boolean }
  ): Promise<'ok'|'cancel'|'dismiss'> {

    const actions: DialogAction[] = [
      { id: 'cancel', label: opts?.cancelText ?? 'Cancelar', variant: 'default' },
      { id: 'ok',     label: opts?.okText     ?? 'Aceptar',  variant: opts?.danger ? 'danger' : 'primary' }
    ];

    return this.open({ title, message, actions, dismissible: opts?.dismissible ?? true }) as any;
  }

  resolve(result: DialogResult) {
    const d = this.active();
    d?._resolve?.(result);
    this.active.set(null);
  }

  dismiss() { this.resolve('dismiss'); }
}
