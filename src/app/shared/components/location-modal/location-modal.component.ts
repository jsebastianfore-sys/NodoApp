import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonButtons, ModalController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cameraOutline, closeOutline, saveOutline, trashOutline,
  imageOutline, locationOutline, bookmarkOutline, sparklesOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

@Component({
  selector: 'app-location-modal',
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, CommonModule, FormsModule
  ],
})
export class LocationModalComponent {
  @Input() lat!: number;
  @Input() lng!: number;

  title = '';
  description = '';
  category = 'Favorito';
  categories = ['Favorito', 'Comida', 'Parque', 'Cultura', 'Trabajo', 'Otro'];

  photoUrl = signal<string | undefined>(undefined);
  isSaving = signal<boolean>(false);

  constructor(private modalCtrl: ModalController) {
    addIcons({
      cameraOutline,
      closeOutline,
      saveOutline,
      trashOutline,
      imageOutline,
      locationOutline,
      bookmarkOutline,
      sparklesOutline
    });
  }

  selectCategory(cat: string) {
    this.category = cat;
  }

  async takePicture() {
    try {
      const result = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      if (result.webPath) {
        const base64 = await this.webPathToBase64(result.webPath);
        this.photoUrl.set(base64);
      }
    } catch (e) {
      console.warn('Camera failed or cancelled, falling back to file input:', e);
      // Trigger file input if camera is not available or rejected
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          this.photoUrl.set(dataUrl);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async webPathToBase64(webPath: string): Promise<string> {
    const response = await fetch(webPath);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          resolve(dataUrl);
        } else {
          reject('No se pudo crear canvas');
        }
      };
      img.onerror = reject;

      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.readAsDataURL(blob);
    });
  }

  removePhoto() {
    this.photoUrl.set(undefined);
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  save() {
    const trimmedTitle = this.title.trim() || 'Lugar Guardado';
    const data = {
      id: Date.now().toString(),
      title: trimmedTitle,
      nombre: trimmedTitle,
      description: this.description.trim(),
      category: this.category,
      photo: this.photoUrl(),
      lat: this.lat,
      lng: this.lng,
      date: new Date().toISOString()
    };
    return this.modalCtrl.dismiss(data, 'confirm');
  }
}
