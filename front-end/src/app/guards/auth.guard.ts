import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthGoogleService } from '../services/auth-google.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthGoogleService);
  const router = inject(Router);

  // Pase rápido si ya tenemos el id del usuario
  if (auth.getUserId()) return true;

  // Si aún no está inicializado, miramos el observable una sola vez
  return auth.loggedIn$.pipe(
    take(1),
    map(isLogged =>
      isLogged
        ? true
        : router.createUrlTree(['/info'], { queryParams: { returnUrl: state.url } })
    )
  );
};
