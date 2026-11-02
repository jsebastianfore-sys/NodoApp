import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonButtons, ModalController, AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  closeOutline, mapOutline, locationOutline,
  calendarOutline, bookmarkOutline, navigateOutline,
  alarmOutline, timeOutline
} from 'ionicons/icons';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-place-detail-modal',
  template: `
    <ion-header class="ion-no-border detail-header">
      <ion-toolbar>
        <ion-title>Detalle del Lugar</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()" class="close-btn">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="detail-content ion-padding" *ngIf="place">
      <!-- Media Header Card -->
      <div class="card-media-wrapper">
        <img
          *ngIf="place.photo"
          [src]="place.photo"
          alt="Foto del lugar"
          class="place-photo"
        />
        <div *ngIf="!place.photo" class="placeholder-photo">
          <div class="placeholder-icon">
            <ion-icon name="location-outline"></ion-icon>
          </div>
          <span>Sin fotografía adjunta</span>
        </div>
        <div class="media-overlay">
          <span class="category-pill" *ngIf="place.category">
            <ion-icon name="bookmark-outline"></ion-icon>
            {{ place.category }}
          </span>
        </div>
      </div>

      <!-- Main Info -->
      <div class="info-card">
        <h2 class="place-title">{{ place.title || place.nombre || 'Lugar Guardado' }}</h2>

        <div class="meta-row" *ngIf="place.date">
          <ion-icon name="calendar-outline"></ion-icon>
          <span>Guardado: {{ place.date | date:'dd MMM yyyy, hh:mm a' }}</span>
        </div>

        <div class="coords-row">
          <div class="coord-tag">
            <strong>Lat:</strong> {{ place.lat | number:'1.5-5' }}
          </div>
          <div class="coord-tag">
            <strong>Lng:</strong> {{ place.lng | number:'1.5-5' }}
          </div>
        </div>

        <div class="desc-box" *ngIf="place.description">
          <label class="desc-label">Notas & Descripción:</label>
          <p class="desc-text">{{ place.description }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions-wrapper">
        <button class="btn-route-action" (click)="goToMap()">
          <ion-icon name="navigate-outline"></ion-icon>
          <span>Ir al Mapa y trazar ruta</span>
        </button>

        <button class="btn-reminder-action" (click)="mostrarOpcionesRecordatorio()">
          <ion-icon name="alarmOutline"></ion-icon>
          <span>Recordarme visitar este lugar</span>
        </button>
      </div>
    </ion-content>
  `,
  styles: [`
    .detail-header ion-toolbar {
      --background: rgba(255, 255, 255, 0.95);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);

      ion-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--ion-text-color, #0f172a);
      }
      .close-btn {
        --color: #64748b;
      }
    }

    .detail-content {
      --background: #f8fafc;
    }

    .card-media-wrapper {
      position: relative;
      width: 100%;
      height: 230px;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      margin-bottom: 18px;

      .place-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .placeholder-photo {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #6366f1;

        .placeholder-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }

        span {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
        }
      }

      .media-overlay {
        position: absolute;
        bottom: 12px;
        left: 12px;

        .category-pill {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          letter-spacing: 0.02em;
        }
      }
    }

    .info-card {
      background: #ffffff;
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 12px;

      .place-title {
        font-size: 19px;
        font-weight: 800;
        color: var(--ion-text-color, #0f172a);
        margin: 0;
        letter-spacing: -0.02em;
      }

      .meta-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: #64748b;
        font-weight: 500;

        ion-icon {
          font-size: 15px;
          color: #4f46e5;
        }
      }

      .coords-row {
        display: flex;
        gap: 8px;

        .coord-tag {
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11.5px;
          color: #475569;
          font-weight: 500;
        }
      }

      .desc-box {
        margin-top: 6px;
        padding-top: 10px;
        border-top: 1px solid #f1f5f9;

        .desc-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.04em;
          display: block;
          margin-bottom: 4px;
        }

        .desc-text {
          font-size: 14px;
          color: #334155;
          line-height: 1.5;
          margin: 0;
        }
      }
    }

    .actions-wrapper {
      margin-top: 20px;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .btn-route-action {
        width: 100%;
        padding: 14px;
        border-radius: 14px;
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        color: white;
        border: none;
        font-size: 15px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        box-shadow: 0 8px 20px -3px rgba(79, 70, 229, 0.35);
        transition: transform 0.15s ease;

        &:active {
          transform: scale(0.98);
        }

        ion-icon {
          font-size: 20px;
        }
      }

      .btn-reminder-action {
        width: 100%;
        padding: 12px;
        border-radius: 14px;
        background: rgba(79, 70, 229, 0.08);
        color: #4f46e5;
        border: 1px solid rgba(79, 70, 229, 0.2);
        font-size: 13.5px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: background 0.15s ease;

        &:active {
          background: rgba(79, 70, 229, 0.15);
        }

        ion-icon {
          font-size: 18px;
        }
      }
    }

    @media (prefers-color-scheme: dark) {
      .detail-header ion-toolbar {
        --background: rgba(15, 23, 42, 0.95);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .detail-content {
        --background: #0b0f19;
      }
      .info-card {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);

        .place-title {
          color: #f8fafc;
        }
        .meta-row {
          color: #94a3b8;
        }
        .coords-row .coord-tag {
          background: #0f172a;
          color: #cbd5e1;
        }
        .desc-box {
          border-top-color: #334155;
          .desc-text {
            color: #cbd5e1;
          }
        }
      }

      .actions-wrapper .btn-reminder-action {
        background: rgba(79, 70, 229, 0.2);
        color: #a5b4fc;
        border-color: rgba(79, 70, 229, 0.35);
      }
    }
  `],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, CommonModule
  ]
})
export class PlaceDetailModalComponent {
  @Input() place: any;

  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private notificationsService = inject(NotificationsService);

  constructor() {
    addIcons({
      closeOutline,
      mapOutline,
      locationOutline,
      calendarOutline,
      bookmarkOutline,
      navigateOutline,
      alarmOutline,
      timeOutline
    });
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  goToMap() {
    return this.modalCtrl.dismiss({ lat: this.place.lat, lng: this.place.lng }, 'route');
  }

  async mostrarOpcionesRecordatorio() {
    const alert = await this.alertCtrl.create({
      header: '⏰ Programar Recordatorio',
      message: `¿Cuándo deseas que te recordemos visitar "${this.place.title || this.place.nombre || 'este lugar'}"?`,
      buttons: [
        {
          text: '⚡ En 10 segundos (Prueba)',
          handler: () => {
            this.notificationsService.programarRecordatorio(
              this.place.title || this.place.nombre || 'Lugar Guardado',
              this.place.description || 'Visita pendiente',
              10,
              { lat: this.place.lat, lng: this.place.lng }
            );
          }
        },
        {
          text: '☕ En 1 hora',
          handler: () => {
            this.notificationsService.programarRecordatorio(
              this.place.title || this.place.nombre || 'Lugar Guardado',
              this.place.description || 'Visita pendiente',
              3600,
              { lat: this.place.lat, lng: this.place.lng }
            );
          }
        },
        {
          text: '🌅 Mañana (24 horas)',
          handler: () => {
            this.notificationsService.programarRecordatorio(
              this.place.title || this.place.nombre || 'Lugar Guardado',
              this.place.description || 'Visita pendiente',
              86400,
              { lat: this.place.lat, lng: this.place.lng }
            );
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }
}
