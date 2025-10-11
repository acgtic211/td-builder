export type DialogAction = {
  id: string;                 // valor devuelto al pulsar
  label: string;              // texto del botón
  variant?: 'primary'|'danger'|'secondary'|'default';
};

export interface DialogOptions {
  title?: string;
  message?: string;
  actions: DialogAction[];
  dismissible?: boolean;      // cerrar con ESC/click en backdrop
}

export type DialogResult = string | 'dismiss';
