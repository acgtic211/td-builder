import { Component, EventEmitter, Output } from '@angular/core';
import { AuthGoogleService } from '../../services/auth-google.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @Output() cerrar = new EventEmitter<void>();

  constructor(private authGoogleService: AuthGoogleService) { }

  loginWithGoogle() {
    this.authGoogleService.login();
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
