import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private listenerConfigured = false;

  constructor() {
    this.inicializarListeners();
  }

  private async inicializarListeners() {
    if (this.listenerConfigured) return;
    try {
      await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        const extra = action.notification.extra;
        if (extra && extra.lat && extra.lng) {
          this.router.navigate(['/map'], {
            queryParams: { destLat: extra.lat, destLng: extra.lng }
          });
        }
      });
      this.listenerConfigured = true;
    } catch (e) {
      console.warn('LocalNotifications listeners no disponibles en esta plataforma:', e);
    }
  }

  async verificarPermisos(): Promise<boolean> {
    try {
      const status: PermissionStatus = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') {
        return true;
      }
      const req = await LocalNotifications.requestPermissions();
      return req.display === 'granted';
    } catch (e) {
      // Fallback para navegador web estándar si aplica
      if ('Notification' in window) {
        if (Notification.permission === 'granted') return true;
        const p = await Notification.requestPermission();
        return p === 'granted';
      }
      return false;
    }
  }

  async obtenerEstadoPermiso(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'prompt';
    } catch (e) {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') return 'granted';
        if (Notification.permission === 'denied') return 'denied';
        return 'prompt';
      }
      return 'prompt';
    }
  }

  async notificarLugarGuardado(nombre: string, categoria: string = 'Favorito', tieneFoto: boolean = false) {
    const tienePermiso = await this.verificarPermisos();
    const id = Math.floor(Math.random() * 100000);
    const iconoTexto = tieneFoto ? '📸' : '📍';

    try {
      if (tienePermiso) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title: `${iconoTexto} ¡Nuevo lugar guardado!`,
              body: `Has guardado "${nombre}" en la categoría ${categoria}.`,
              schedule: { at: new Date(Date.now() + 500) }, // 0.5s después
              sound: undefined,
              smallIcon: 'ic_launcher'
            }
          ]
        });
      } else {
        this.mostrarToast(`${iconoTexto} Guardado: "${nombre}"`);
      }
    } catch (e) {
      console.warn('Error programando notificación local:', e);
      this.mostrarToast(`${iconoTexto} Guardado: "${nombre}"`);
    }
  }

  async notificarRutaIniciada(destino: string, distancia: string, tiempo: string) {
    const tienePermiso = await this.verificarPermisos();
    const id = Math.floor(Math.random() * 100000);

    try {
      if (tienePermiso) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title: `🚶 En camino hacia ${destino}`,
              body: `Distancia aproximada: ${distancia} • Tiempo a pie: ~${tiempo}`,
              schedule: { at: new Date(Date.now() + 500) }
            }
          ]
        });
      }
    } catch (e) {
      console.warn('Error notificando ruta:', e);
    }
  }

  async programarRecordatorio(titulo: string, lugar: string, segundosEnElFuturo: number, coords?: { lat: number; lng: number }): Promise<boolean> {
    const tienePermiso = await this.verificarPermisos();
    if (!tienePermiso) {
      this.mostrarToast('Permiso de notificaciones no concedido.');
      return false;
    }

    const id = Math.floor(Math.random() * 100000);
    const fecha = new Date(Date.now() + segundosEnElFuturo * 1000);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: `⏰ Recordatorio de Exploración: ${titulo}`,
            body: `Planeaste visitar "${lugar}". Toca aquí para ver la ruta en el mapa.`,
            schedule: { at: fecha },
            extra: coords
          }
        ]
      });

      const tiempoTexto = segundosEnElFuturo < 60
        ? `${segundosEnElFuturo} segundos`
        : segundosEnElFuturo < 3600
          ? `${Math.round(segundosEnElFuturo / 60)} minutos`
          : `${Math.round(segundosEnElFuturo / 3600)} horas`;

      this.mostrarToast(`⏰ Recordatorio programado para dentro de ${tiempoTexto}`);
      return true;
    } catch (e) {
      console.error('Error programando recordatorio:', e);
      this.mostrarToast('No se pudo programar el recordatorio en este dispositivo.');
      return false;
    }
  }

  async notificarPrueba(): Promise<boolean> {
    const tienePermiso = await this.verificarPermisos();
    if (!tienePermiso) {
      this.mostrarToast('Por favor concede permisos para recibir notificaciones.');
      return false;
    }

    const id = Math.floor(Math.random() * 100000);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: `✨ Notificación de Prueba GeoExplore`,
            body: `¡El sistema de notificaciones locales de Capacitor está funcionando a la perfección! 🎉`,
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
      this.mostrarToast('🔔 Notificación de prueba enviada (aparecerá en 1 segundo)');
      return true;
    } catch (e) {
      console.error('Error enviando notificación de prueba:', e);
      this.mostrarToast('Error enviando notificación.');
      return false;
    }
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}
