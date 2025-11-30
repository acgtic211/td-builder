import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of} from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthGoogleService {
  private apiUrl = environment.apiBase + '/user-logged'; // URL to web api

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  loadUser() {
    this.http.get<User>(`${this.apiUrl}`, {
      withCredentials: true,
    }).pipe(
      catchError(() => of(null))       // Si responde 401/403 o falla, devolvemos null
    ).subscribe(user => {
      this.userSubject.next(user);
    });
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  getUserPhotoUrl(): string | null {
    return this.userSubject.value ? this.userSubject.value.picture : null;
  }

  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  logout() {
    this.http.post('/api/logout', {}, { withCredentials: true });
  }
}