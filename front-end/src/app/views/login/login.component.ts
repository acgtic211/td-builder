import { Component, EventEmitter, Output } from '@angular/core';
import { AuthGoogleService } from '../../services/auth/auth-google.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private apiUrl = environment.apiBase + '/login';
  @Output() cerrar = new EventEmitter<void>();

  constructor(private authGoogleService: AuthGoogleService) { }

  loginWithGoogle() {
    window.location.href = this.apiUrl;
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
