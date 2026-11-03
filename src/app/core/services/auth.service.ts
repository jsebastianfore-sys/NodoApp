import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_STORAGE_KEY = 'geoexplore_current_user';
  private readonly GOOGLE_CLIENT_ID_KEY = 'geoexplore_google_client_id';

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$: Observable<UserProfile | null> =
    this.currentUserSubject.asObservable();

  private isScriptLoaded = false;
  private readonly router = inject(Router);
  constructor() {
    // private readonly router: inject(Router);
    this.cargarUsuarioGuardado();
  }

  /**
   * Carga la sesión del usuario guardada localmente si existe.
   */
  private cargarUsuarioGuardado(): void {
    const raw = localStorage.getItem(this.USER_STORAGE_KEY);
    if (raw) {
      try {
        const user = JSON.parse(raw) as UserProfile;
        // Si la sesión guardada era de invitado (guest), eliminarla de inmediato
        if (
          !user ||
          (user as any).provider === 'guest' ||
          user.email === 'invitado@geoexplore.app'
        ) {
          localStorage.removeItem(this.USER_STORAGE_KEY);
          this.currentUserSubject.next(null);
          return;
        }
        this.currentUserSubject.next(user);
      } catch (err) {
        console.error('Error al recuperar sesión guardada:', err);
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    }
  }

  /**
   * Retorna el usuario actual síncronamente.
   */
  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * Indica si hay una sesión activa.
   */
  public isAuthenticated(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }

  /**
   * Obtiene el Client ID de Google configurado en environment o en localStorage.
   */
  public getGoogleClientId(): string {
    const saved = localStorage.getItem(this.GOOGLE_CLIENT_ID_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
    return (environment.googleClientId || '').trim();
  }

  /**
   * Permite guardar o actualizar el Google Client ID en tiempo de ejecución.
   */
  public setGoogleClientId(clientId: string): void {
    if (clientId && clientId.trim()) {
      localStorage.setItem(this.GOOGLE_CLIENT_ID_KEY, clientId.trim());
    }
  }

  /**
   * Carga dinámicamente el SDK oficial de Google Identity Services si no está presente.
   */
  public loadGoogleIdentityScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google?.accounts?.oauth2) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      // Si ya existe la etiqueta de script
      const existingScript = document.getElementById('google-jssdk');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (e) => reject(e));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = () =>
        reject(
          new Error('No se pudo descargar el SDK de Google Identity Services.'),
        );
      document.head.appendChild(script);
    });
  }

  /**
   * AUTENTICACIÓN REAL CON GOOGLE (OAuth 2.0 UserInfo)
   * Abre la ventana emergente oficial de cuentas de Google, solicita autorización al usuario
   * y obtiene su nombre real, correo real y foto de perfil real directamente desde la API de Google.
   */
  public async loginWithGoogle(): Promise<UserProfile> {
    const clientId = this.getGoogleClientId();

    if (!clientId) {
      throw new Error('MISSING_CLIENT_ID');
    }

    // Aseguramos que el SDK de Google esté cargado
    await this.loadGoogleIdentityScript();

    return new Promise<UserProfile>((resolve, reject) => {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              reject(
                new Error(
                  tokenResponse.error_description || tokenResponse.error,
                ),
              );
              return;
            }

            try {
              // Consultar la API oficial de Google UserInfo con el token recibido
              const response = await fetch(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                },
              );

              if (!response.ok) {
                throw new Error(
                  'Error al obtener el perfil de la cuenta de Google.',
                );
              }

              const info = await response.json();

              const user: UserProfile = {
                id: info.sub || 'google_' + Date.now(),
                nombre: info.name || info.given_name || 'Usuario Google',
                email: info.email,
                avatar:
                  info.picture ||
                  'https://lh3.googleusercontent.com/a/default-user=s120-p',
                provider: 'google',
                createdAt: new Date().toISOString(),
                accessToken: tokenResponse.access_token,
              };

              this.persistirSesion(user);
              resolve(user);
            } catch (fetchErr: any) {
              reject(fetchErr);
            }
          },
          error_callback: (error: any) => {
            reject(
              new Error(
                error.message || 'Error al abrir la ventana de Google.',
              ),
            );
          },
        });

        // Abre el cuadro oficial de inicio de sesión de Google
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err: any) {
        reject(
          new Error(
            err.message ||
              'No se pudo iniciar el flujo de autenticación con Google.',
          ),
        );
      }
    });
  }

  /**
   * Ingreso instantáneo seleccionando cuenta de Google
   * (Sin necesidad de contraseña ni formulario de registro manual)
   */
  public async loginWithGoogleEmail(
    email: string,
    nombre?: string,
  ): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!email || !email.includes('@')) {
      throw new Error('Por favor ingresa un correo de Google válido.');
    }

    const emailNormalizado = email.trim().toLowerCase();
    const nombreLimpio =
      nombre?.trim() || emailNormalizado.split('@')[0].replace(/[._]/g, ' ');
    const capitalizado =
      nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1);

    const user: UserProfile = {
      id: 'google_' + Date.now(),
      nombre: capitalizado,
      email: emailNormalizado,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(capitalizado)}&backgroundColor=4285F4`,
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    this.persistirSesion(user);
    return user;
  }

  /**
   * Iniciar sesión con correo y contraseña.
   */
  public async login(email: string, password: string): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email || !password) {
      throw new Error('Por favor completa todos los campos.');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const nombreGenerado = email.split('@')[0].replace(/[._]/g, ' ');
    const capitalizado =
      nombreGenerado.charAt(0).toUpperCase() + nombreGenerado.slice(1);

    const user: UserProfile = {
      id: 'usr_' + Date.now(),
      nombre: capitalizado || 'Usuario Explorador',
      email: email.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: 'local',
      createdAt: new Date().toISOString(),
    };

    this.persistirSesion(user);
    return user;
  }

  /**
   * Registro de nueva cuenta con nombre, correo y contraseña.
   */
  public async register(
    nombre: string,
    email: string,
    password: string,
  ): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (!nombre || !email || !password) {
      throw new Error('Por favor completa todos los campos requeridos.');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener un mínimo de 6 caracteres.');
    }

    const user: UserProfile = {
      id: 'usr_' + Date.now(),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      provider: 'local',
      createdAt: new Date().toISOString(),
    };

    this.persistirSesion(user);
    return user;
  }

  /**
   * Simular recuperación de contraseña
   */
  public async requestPasswordReset(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (!email) {
      throw new Error('Ingresa un correo electrónico válido.');
    }
  }

  /**
   * Cierra la sesión activa y redirige al login.
   */
  public logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private persistirSesion(user: UserProfile): void {
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
