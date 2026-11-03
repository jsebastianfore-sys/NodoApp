import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/user.model';

/** Usuario tal como lo devuelve el backend. */
interface ApiUser {
  id: string;
  name: string;
  email: string;
}

/** Respuesta de POST /auth/login. */
interface LoginResponse {
  accessToken: string;
  user: ApiUser;
}

/** Claves en el almacenamiento del dispositivo. */
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const COMING_SOON_GOOGLE =
  'El inicio de sesión con Google estará disponible próximamente.';

/**
 * Autenticación contra el backend (NestJS).
 *
 * Mantiene los mismos métodos que usaban las pantallas (login, register, logout,
 * currentUser$, isAuthenticated…), así que no hubo que reescribirlas.
 * Los errores se lanzan con mensajes en español listos para mostrar (err.message).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/auth`;

  /** Token en memoria: lectura inmediata para el interceptor. */
  private token: string | null = null;

  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(
    null,
  );
  readonly currentUser$: Observable<UserProfile | null> =
    this.currentUserSubject.asObservable();

  get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.getValue();
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.currentUserValue !== null;
  }

  getToken(): string | null {
    return this.token;
  }

  /**
   * Recupera la sesión guardada en el dispositivo.
   * Se ejecuta al arrancar la app (provideAppInitializer en main.ts),
   * antes de que el guard revise si hay sesión.
   */
  async loadSession(): Promise<void> {
    const [{ value: token }, { value: rawUser }] = await Promise.all([
      Preferences.get({ key: TOKEN_KEY }),
      Preferences.get({ key: USER_KEY }),
    ]);

    if (!token || !rawUser) {
      return;
    }

    try {
      this.token = token;
      this.currentUserSubject.next(JSON.parse(rawUser) as UserProfile);
    } catch {
      await this.clearSession();
    }
  }

  /** Inicia sesión. POST /auth/login */
  async login(email: string, password: string): Promise<UserProfile> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.url}/login`, { email, password }),
      );
      return await this.saveSession(response);
    } catch (err) {
      throw this.toFriendlyError(err);
    }
  }

  /**
   * Registra la cuenta (POST /auth/register) y luego inicia sesión automáticamente,
   * porque el registro del backend no devuelve token.
   */
  async register(
    nombre: string,
    email: string,
    password: string,
  ): Promise<UserProfile> {
    try {
      await firstValueFrom(
        this.http.post(`${this.url}/register`, {
          name: nombre,
          email,
          password,
        }),
      );
    } catch (err) {
      throw this.toFriendlyError(err);
    }
    return this.login(email, password);
  }

  /** Cierra la sesión y vuelve al login. */
  logout(): void {
    void this.clearSession();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // --- Funciones pendientes: se conservan para no romper la pantalla de login ---

  getGoogleClientId(): string {
    return '';
  }

  setGoogleClientId(_clientId: string): void {}

  async loginWithGoogle(): Promise<UserProfile> {
    throw new Error(COMING_SOON_GOOGLE);
  }

  /** Antes permitía entrar con cualquier correo sin verificarlo. Deshabilitado por seguridad. */
  async loginWithGoogleEmail(
    _email: string,
    _nombre?: string,
  ): Promise<UserProfile> {
    throw new Error(COMING_SOON_GOOGLE);
  }

  async requestPasswordReset(_email: string): Promise<void> {
    throw new Error(
      'La recuperación de contraseña estará disponible próximamente.',
    );
  }

  // --- Internos ---

  /** Convierte la respuesta del backend al modelo que usan las pantallas y la guarda. */
  private async saveSession(response: LoginResponse): Promise<UserProfile> {
    const { user } = response;
    const profile: UserProfile = {
      id: user.id,
      nombre: user.name,
      email: user.email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      provider: 'local',
      createdAt: new Date().toISOString(),
    };

    // Primero en memoria (inmediato) y luego en el dispositivo
    this.token = response.accessToken;
    this.currentUserSubject.next(profile);

    await Promise.all([
      Preferences.set({ key: TOKEN_KEY, value: response.accessToken }),
      Preferences.set({ key: USER_KEY, value: JSON.stringify(profile) }),
    ]);

    return profile;
  }

  private async clearSession(): Promise<void> {
    this.token = null;
    this.currentUserSubject.next(null);
    await Promise.all([
      Preferences.remove({ key: TOKEN_KEY }),
      Preferences.remove({ key: USER_KEY }),
    ]);
  }

  /** Traduce los errores HTTP a un mensaje entendible para el usuario. */
  private toFriendlyError(err: unknown): Error {
    if (err instanceof HttpErrorResponse) {
      // status 0: no hubo respuesta (backend apagado, sin internet o CORS)
      if (err.status === 0) {
        return new Error('No se pudo conectar con el servidor.');
      }
      // 400 → arreglo de mensajes; 401 / 409 → texto
      const message = err.error?.message;
      if (Array.isArray(message)) {
        return new Error(message[0]);
      }
      if (typeof message === 'string') {
        return new Error(message);
      }
    }
    return new Error('Ocurrió un error inesperado. Intenta de nuevo.');
  }
}
