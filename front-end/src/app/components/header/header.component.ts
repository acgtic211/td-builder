import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../../views/login/login.component';
import { NgIf } from '@angular/common';
import { AuthGoogleService } from '../../services/auth-google.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LoginComponent, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(private authGoogleService: AuthGoogleService, private router: Router) { }
   
  loggedIn: boolean = false;
  private sub?: Subscription;
  
  rutaImagenPerfil: string = 'assets/perfil.png'
  mostrarLogin = false;

  ngOnInit() {
    this.sub = this.authGoogleService.loggedIn$.subscribe(estado => {
      this.loggedIn = estado;
      this.rutaImagenPerfil = estado
      ? (this.authGoogleService.getPicture() || 'assets/perfil.png')
      : 'assets/perfil.png';
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  openLogin(){
    if (!this.loggedIn)
      this.mostrarLogin = true;
    else
      this.router.navigateByUrl('/my-tds');    
  }

  closeLogin() {
    this.mostrarLogin = false;
  }

  onImgError(ev: Event) {
    console.log('Error al cargar la imagen de perfil, usando imagen por defecto.');
    (ev.target as HTMLImageElement).src = 'assets/perfil.png';
  }
}
