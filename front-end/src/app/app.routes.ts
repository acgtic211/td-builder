import { Routes, RouterModule } from '@angular/router';
import { InfoComponent } from './views/info/info.component';
import { EditorComponent } from './views/editor/editor.component';
import { JsonComponent } from './views/json/json.component';
import { GrafoComponent } from './views/grafo/grafo.component';
import { MyTdsComponent } from './views/my-tds/my-tds.component';
import { authGuard } from './guards/auth.guard';
import { ChatbotComponent } from './chatbot/view/chatbot.component';

export const routes: Routes = [
  { path: 'info', component: InfoComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'json', component: JsonComponent},
  { path: 'grafo', component: GrafoComponent },
  { path: 'chat', component: ChatbotComponent },
  
  // <-- protegida
  { path: 'my-tds', component: MyTdsComponent, canActivate: [authGuard] },
  //Redirigir a /info si la ruta es vacía o no coincide con ninguna de las anteriores
  { path: '', redirectTo: 'info', pathMatch: 'full' },
  { path: '**', redirectTo: 'info' }
];
