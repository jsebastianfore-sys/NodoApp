import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline,
  locationOutline,
  cameraOutline,
  mapOutline,
  trashOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  chevronForwardOutline,
  informationCircleOutline,
  notificationsOutline,
  notificationsCircleOutline,
  checkmarkCircleOutline,
  logOutOutline,
  logoGoogle,
} from 'ionicons/icons';
import { LocationsService } from '../core/services/locations.service';
import { NotificationsService } from '../core/services/notifications.service';
import { AuthService, UserProfile } from '../core/services/auth.service';
import { PUNTOS } from '../home/home.page';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class ProfilePage implements OnInit {
  totalLugares = 0;
  totalConFoto = 0;
  totalPuntosInteres = PUNTOS.length;
  permisoNotificaciones: 'granted' | 'denied' | 'prompt' = 'prompt';

  public authService = inject(AuthService);
  public currentUser$: Observable<UserProfile | null> =
    this.authService.currentUser$;

  private locationsService = inject(LocationsService);
  private notificationsService = inject(NotificationsService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  constructor() {
    addIcons({
      personOutline,
      locationOutline,
      cameraOutline,
      mapOutline,
      trashOutline,
      shieldCheckmarkOutline,
      sparklesOutline,
      chevronForwardOutline,
      informationCircleOutline,
      notificationsOutline,
      notificationsCircleOutline,
      checkmarkCircleOutline,
      logOutOutline,
      logoGoogle,
    });
  }

  async ngOnInit() {
    this.locationsService.ubicaciones$.subscribe((ubicaciones) => {
      this.totalLugares = ubicaciones.length;
      this.totalConFoto = ubicaciones.filter((u) => !!u.photo).length;
    });

    await this.actualizarEstadoPermiso();
  }

  async actualizarEstadoPermiso() {
    this.permisoNotificaciones =
      await this.notificationsService.obtenerEstadoPermiso();
  }

  async solicitarPermisoNotificaciones() {
    const concedido = await this.notificationsService.verificarPermisos();
    await this.actualizarEstadoPermiso();
    if (concedido) {
      this.mostrarToast(
        '✅ Permisos de notificaciones concedidos correctamente',
      );
    }
  }

  async probarNotificacionLocal() {
    await this.notificationsService.notificarPrueba();
  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  async confirmarLimpiarTodo() {
    const alert = await this.alertCtrl.create({
      header: 'Reiniciar Lugares',
      message:
        '¿Estás seguro de que deseas eliminar todas las ubicaciones guardadas? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar Todo',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem('misUbicaciones');
            this.locationsService.cargarUbicaciones();
            this.mostrarToast('Se han eliminado todos los lugares guardados.');
          },
        },
      ],
    });

    await alert.present();
  }

  async confirmarCerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Deseas salir de tu cuenta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: () => {
            this.authService.logout();
            this.mostrarToast('Has cerrado sesión correctamente.');
          },
        },
      ],
    });

    await alert.present();
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: 'top',
    });
    await toast.present();
  }
}
