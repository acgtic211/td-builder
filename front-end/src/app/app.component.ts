import { Component, OnInit } from '@angular/core';
import { AuthGoogleService } from './services/auth/auth-google.service';
import { HeaderComponent } from './components/header/header.component';
import { NavigatorComponent } from './components/navigator/navigator.component';
import { RouterOutlet } from '@angular/router';
import { DialogHostComponent } from './components/dialog-host/dialog-host.component';
import { ChatbotComponent } from './chatbot/view/chatbot.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavigatorComponent, DialogHostComponent, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private authGoogleService: AuthGoogleService) {}

  ngOnInit() {
    this.authGoogleService.loadUser();   // al arrancar, preguntamos al backend "oye, quién soy?"
  }
}