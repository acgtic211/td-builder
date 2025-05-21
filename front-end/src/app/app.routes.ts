import { Routes, RouterModule } from '@angular/router';
import { InfoComponent } from './views/info/info.component';
import { EditorComponent } from './views/editor/editor.component';
import { JsonComponent } from './views/json/json.component';
import { GrafoComponent } from './views/grafo/grafo.component';

export const routes: Routes = [
  { path: 'info', component: InfoComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'json', component: JsonComponent},
  { path: 'grafo', component: GrafoComponent },
  //Redirigir a /info si la ruta es vacía o no coincide con ninguna de las anteriores
  { path: '', redirectTo: 'info', pathMatch: 'full' },
  { path: '**', redirectTo: 'info' }
];
