import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, EMPTY, catchError, filter, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthGoogleService {
  private apiUrl = environment.apiBase + '/save'; // URL to web api

  private _loggedIn = new BehaviorSubject<boolean>(false);
  readonly loggedIn$ = this._loggedIn.asObservable();

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true
  };

  constructor(private oauthService: OAuthService, private http: HttpClient) {
    this.initLogin();

    this.oauthService.events
      .pipe(filter((e) => e.type === 'token_received')) // login completado
      .subscribe(() => {
        this._loggedIn.next(this.isLoggedIn);
        this.registerIfNeeded();
      });

    this.oauthService.events.subscribe(() => {
      this._loggedIn.next(this.isLoggedIn);
    });
  }

  initLogin(): void {
    const config: AuthConfig = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      clientId: environment.clientGoogleId,
      redirectUri: window.location.origin,
      scope: 'openid profile email',
    };

    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  logout(): void {
    this.oauthService.logOut();
  }

  getPicture(): string | null {
    const claims: any = this.oauthService.getIdentityClaims();
    return claims && typeof claims === 'object' ? (claims['picture'] ?? null) : null;
  }


  getUserId(): string | null {
    const claims: any = this.oauthService.getIdentityClaims();
    return claims ? claims['sub'] : null;
  }

  get isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  private registerIfNeeded(): void {
    const id = this.getUserId();
    if (!id) return;
    // Llama al backend para registrar el usuario si no existe
    this.http
      .post<void>(`${this.apiUrl}/addUser`, { id }, this.httpOptions)
      .pipe(
        tap(() => console.log('Usuario registrado/ya existente')),
        catchError((err) => {
          console.error('Error registrando usuario', err);
          this.logout(); // forzar logout si hay error
          return EMPTY;
        })
      )
      .subscribe();
  }
}