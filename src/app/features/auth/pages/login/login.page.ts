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
import {
  AuthService,
  UserProfile,
} from '../../../../core/services/auth.service';

type AuthViewMode = 'welcome' | 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonIcon, IonSpinner, CommonModule, FormsModule],
})
export class LoginPage implements OnInit {
  // Modo de vista actual: 'welcome' (como pantalla 1), 'login' (como pantalla 2), 'register' o 'forgot'
  currentMode: AuthViewMode = 'welcome';

  // Campos de formulario Login
  loginEmail = '';
  loginPassword = '';
  showLoginPassword = false;

  // Campos de formulario Registro
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  showRegisterPassword = false;

  // Recuperación de contraseña
  forgotEmail = '';

  // Selector de cuenta de Google directo
  showGooglePicker = false;
  googlePickerEmail = '';
  googlePickerName = '';

  // Estados de carga
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

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

  ngOnInit() {
    // Si ya existe una sesión guardada, se puede ingresar directo o permanecer en login si lo desea
    if (this.authService.isAuthenticated()) {
      // Dejamos en welcome con opción de continuar o iniciar otra cuenta
    }
  }

  setMode(mode: AuthViewMode) {
    this.errorMessage = '';
    this.currentMode = mode;
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  /**
   * Procesa el inicio de sesión con correo y contraseña
   */
  async submitLogin() {
    this.errorMessage = '';

    if (!this.loginEmail.trim() || !this.loginPassword) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    this.isLoading = true;
    try {
      const user = await this.authService.login(
        this.loginEmail,
        this.loginPassword,
      );
      await this.mostrarToast(`¡Bienvenido de nuevo, ${user.nombre}!`);
      this.router.navigate(['/map']);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al iniciar sesión.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Procesa el registro de nuevo usuario
   */
  async submitRegister() {
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

    if (this.registerPassword.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.isLoading = true;
    try {
      const user = await this.authService.register(
        this.registerName,
        this.registerEmail,
        this.registerPassword,
      );
      await this.mostrarToast(
        `¡Cuenta creada con éxito! Bienvenido, ${user.nombre}`,
      );
      this.router.navigate(['/map']);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al crear la cuenta.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Inicio de sesión con Google:
   * Si hay Client ID configurado usa la ventana oficial de Google (accounts.google.com).
   * Si aún no está configurado, abre el selector de cuentas de Google para ingresar
   * con tu correo de Google al instante sin registros ni contraseñas.
   */
  async submitGoogleLogin() {
    this.errorMessage = '';
    const clientId = this.authService.getGoogleClientId();

    if (clientId) {
      this.isLoading = true;
      try {
        const user = await this.authService.loginWithGoogle();
        await this.mostrarToast(
          `¡Bienvenido, ${user.nombre}! Has iniciado sesión con Google.`,
        );
        this.router.navigate(['/map']);
      } catch (err: any) {
        if (err.message === 'MISSING_CLIENT_ID') {
          this.showGooglePicker = true;
        } else {
          this.errorMessage = err.message || 'No se pudo conectar con Google.';
        }
      } finally {
        this.isLoading = false;
      }
    } else {
      // Abre el selector de cuenta de Google directo
      this.showGooglePicker = true;
    }
  }

  /**
   * Confirma el acceso con la cuenta de Google seleccionada
   */
  async confirmGooglePickerLogin() {
    this.errorMessage = '';

    if (
      !this.googlePickerEmail.trim() ||
      !this.googlePickerEmail.includes('@')
    ) {
      this.errorMessage =
        'Por favor ingresa un correo de Google válido (ej: tu.correo@gmail.com).';
      return;
    }

    this.isLoading = true;
    try {
      const user = await this.authService.loginWithGoogleEmail(
        this.googlePickerEmail,
        this.googlePickerName,
      );
      this.showGooglePicker = false;
      await this.mostrarToast(
        `¡Cuenta Google verificada! Bienvenido, ${user.nombre}`,
      );
      this.router.navigate(['/map']);
    } catch (err: any) {
      this.errorMessage =
        err.message || 'Error al conectar con tu cuenta de Google.';
    } finally {
      this.isLoading = false;
    }
  }

  closeGooglePicker() {
    this.showGooglePicker = false;
  }

  /**
   * Solicita el Client ID de Google Cloud si no está configurado aún en environment.ts
   */
  async solicitarGoogleClientId() {
    const alert = await this.alertCtrl.create({
      header: 'Autenticación Real con Google',
      subHeader: 'Se requiere tu Client ID de Google Cloud',
      message:
        'Para abrir la ventana oficial de Google, ingresa el Client ID OAuth 2.0 de tu consola de Google Cloud (también puedes definirlo en src/environments/environment.ts):',
      inputs: [
        {
          name: 'clientId',
          type: 'text',
          placeholder: 'ej: 123456789-xyz.apps.googleusercontent.com',
          value: this.authService.getGoogleClientId(),
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Conectar con Google',
          handler: (data) => {
            const val = (data?.clientId || '').trim();
            if (val) {
              this.authService.setGoogleClientId(val);
              setTimeout(() => this.submitGoogleLogin(), 250);
            } else {
              this.errorMessage =
                'Debes ingresar un Google Client ID válido para autenticar con Google.';
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Notificación para redes sociales aún en desarrollo
   */
  async socialLoginComingSoon(provider: string) {
    await this.mostrarToast(
      `El acceso con ${provider} estará disponible próximamente. Por favor inicia sesión con Google o correo.`,
    );
  }

  /**
   * Envío de correo de recuperación
   */
  async submitForgotPassword() {
    if (!this.forgotEmail.trim()) {
      this.errorMessage = 'Por favor escribe tu correo electrónico.';
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.requestPasswordReset(this.forgotEmail);
      await this.mostrarToast('Se enviaron las instrucciones a tu correo.');
      this.setMode('login');
    } catch (err: any) {
      this.errorMessage =
        err.message || 'No se pudo enviar el correo de recuperación.';
    } finally {
      this.isLoading = false;
    }
  }

  private async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: 'top',
      cssClass: 'auth-toast',
    });
    await toast.present();
  }
}
