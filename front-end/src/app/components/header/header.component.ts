import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../../views/login/login.component';
import { NgIf, AsyncPipe} from '@angular/common';
import { AuthGoogleService } from '../../services/auth/auth-google.service';
import { ChatUiService } from '../../chatbot/service/chat-ui.service';
import { use } from 'marked';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LoginComponent, NgIf, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private authGoogleService: AuthGoogleService, private router: Router, public chatUi: ChatUiService) { }
   
  user$ = this.authGoogleService.user$;
  
  rutaImagenPerfil: string = 'assets/perfil.png';
  mostrarLogin = false;

  openLogin(){
    if (!this.authGoogleService.isLoggedIn)
      this.mostrarLogin = true;
    else
      this.router.navigateByUrl('/my-tds');    
  }

  closeLogin() {
    this.mostrarLogin = false;
  }
}
