import { Component } from '@angular/core';
import { ChatUiService } from '../service/chat-ui.service';
import { ChatInnerComponent } from '../component/chat-inner.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [ChatInnerComponent, NgIf],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent {
  
  constructor(public ui: ChatUiService) {}

  rutaLogo: string = 'assets/chatwot.jpg';

  closePopup() {
    this.ui.close();
  }
}
