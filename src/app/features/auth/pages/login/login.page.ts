import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSpinner,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
  arrowBackOutline,
  logoGoogle,
  logoApple,
  logoFacebook,
  compassOutline,
  sparklesOutline,
  arrowForwardOutline,
  chevronBackOutline,
  logInOutline,
  personAddOutline,
  shieldCheckmarkOutline,
  helpCircleOutline,
  closeOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../../core/services/auth.service';

type AuthViewMode = 'welcome' | 'login' | 'register' | 'forgot';

/** Mínimo de caracteres de la contraseña: debe coincidir con el RegisterDto del backend. */
const PASSWORD_MIN_LENGTH = 8;

/**
 * Pantalla de autenticación: bienvenida, inicio de sesión, registro y recuperación.
 * La validación de esta pantalla es solo para dar respuesta inmediata al usuario;
 * la validación real la hace el backend. Los mensajes de error que muestra
 * llegan ya traducidos desde AuthService (err.message).
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonIcon, IonSpinner, CommonModule, FormsModule],
})
export class LoginPage implements OnInit {
  // Vista actual: 'welcome', 'login', 'register' o 'forgot'
  currentMode: AuthViewMode = 'welcome';

  // Formulario de inicio de sesión
  loginEmail = '';
  loginPassword = '';
  showLoginPassword = false;

  // Formulario de registro
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  showRegisterPassword = false;

  // Recuperación de contraseña
  forgotEmail = '';

  // Selector de cuenta de Google (deshabilitado: ver submitGoogleLogin)
  showGooglePicker = false;
  googlePickerEmail = '';
  googlePickerName = '';

  // Estados de la vista
  isLoading = false;
  errorMessage = '';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly alertCtrl = inject(AlertController);

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      personOutline,
      eyeOutline,
      eyeOffOutline,
      arrowBackOutline,
      logoGoogle,
      logoApple,
      logoFacebook,
      compassOutline,
      sparklesOutline,
      arrowForwardOutline,
      chevronBackOutline,
      logInOutline,
      personAddOutline,
      shieldCheckmarkOutline,
      helpCircleOutline,
      closeOutline,
    });
  }

  ngOnInit(): void {
    // Si ya hay sesión (cargada al arrancar la app), entra directo al mapa
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/map'], { replaceUrl: true });
    }
  }

  setMode(mode: AuthViewMode): void {
    this.errorMessage = '';
    this.currentMode = mode;
  }

  toggleLoginPassword(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword(): void {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  /** Inicio de sesión con correo y contraseña contra el backend. */
  async submitLogin(): Promise<void> {
    this.errorMessage = '';

    if (!this.loginEmail.trim() || !this.loginPassword) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    this.isLoading = true;
    try {
      const user = await this.authService.login(
        this.loginEmail.trim(),
        this.loginPassword,
      );
      await this.mostrarToast(`¡Bienvenido de nuevo, ${user.nombre}!`);
      this.router.navigate(['/map'], { replaceUrl: true });
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al iniciar sesión.';
    } finally {
      this.isLoading = false;
    }
  }

  /** Registro de una cuenta nueva; al terminar, inicia sesión automáticamente. */
  async submitRegister(): Promise<void> {
    this.errorMessage = '';

    if (
      !this.registerName.trim() ||
      !this.registerEmail.trim() ||
      !this.registerPassword
    ) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.registerPassword.length < PASSWORD_MIN_LENGTH) {
      this.errorMessage = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
      return;
    }

    this.isLoading = true;
    try {
      const user = await this.authService.register(
        this.registerName.trim(),
        this.registerEmail.trim(),
        this.registerPassword,
      );
      await this.mostrarToast(
        `¡Cuenta creada con éxito! Bienvenido, ${user.nombre}`,
      );
      this.router.navigate(['/map'], { replaceUrl: true });
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al crear la cuenta.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Inicio de sesión con Google: pendiente.
   * Antes abría un selector que dejaba entrar con cualquier correo sin verificarlo;
   * se deshabilitó por seguridad hasta implementar la verificación en el backend.
   */
  async submitGoogleLogin(): Promise<void> {
    this.errorMessage = '';
    this.showGooglePicker = false;
    await this.mostrarToast(
      'El inicio de sesión con Google estará disponible próximamente.',
    );
  }

  /** Se conserva porque la plantilla lo referencia; el selector ya no se abre. */
  async confirmGooglePickerLogin(): Promise<void> {
    this.showGooglePicker = false;
    await this.submitGoogleLogin();
  }

  closeGooglePicker(): void {
    this.showGooglePicker = false;
  }

  /** Se conserva porque la plantilla lo referencia. */
  async solicitarGoogleClientId(): Promise<void> {
    await this.submitGoogleLogin();
  }

  /** Aviso para proveedores aún no disponibles (Apple, Facebook). */
  async socialLoginComingSoon(provider: string): Promise<void> {
    await this.mostrarToast(
      `El acceso con ${provider} estará disponible próximamente. Por favor inicia sesión con tu correo.`,
    );
  }

  /** Recuperación de contraseña: pendiente en el backend. */
  async submitForgotPassword(): Promise<void> {
    this.errorMessage = '';

    if (!this.forgotEmail.trim()) {
      this.errorMessage = 'Por favor escribe tu correo electrónico.';
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.requestPasswordReset(this.forgotEmail.trim());
      await this.mostrarToast('Se enviaron las instrucciones a tu correo.');
      this.setMode('login');
    } catch (err: any) {
      this.errorMessage =
        err.message || 'No se pudo enviar el correo de recuperación.';
    } finally {
      this.isLoading = false;
    }
  }

  private async mostrarToast(msg: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: 'top',
      cssClass: 'auth-toast',
    });
    await toast.present();
  }
}
