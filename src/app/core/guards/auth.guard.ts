import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardia de ruta que protege las pantallas del mapa, ubicaciones y perfil.
 * Si el usuario no ha iniciado sesión ni se ha registrado, bloquea el acceso
 * y redirige de inmediato a la pantalla de login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirección inmediata y reemplazo de historial para no regresar al mapa
  router.navigate(['/login'], { replaceUrl: true });
  return false;
};

export const authChildGuard: CanActivateChildFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], { replaceUrl: true });
  return false;
};
