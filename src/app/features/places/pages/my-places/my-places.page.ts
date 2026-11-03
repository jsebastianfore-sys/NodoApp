import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  ModalController,
  AlertController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  trashOutline,
  navigateOutline,
  eyeOutline,
  calendarOutline,
  cameraOutline,
  mapOutline,
  sparklesOutline,
  searchOutline,
  bookmarkOutline,
} from 'ionicons/icons';
import { PlaceDetailModalComponent } from '../../../../shared/components/place-detail-modal/place-detail-modal.component';
import { LocationsService } from '../../../../core/services/locations.service';

@Component({
  selector: 'app-my-places',
  templateUrl: './my-places.page.html',
  styleUrls: ['./my-places.page.scss'],
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
export class LocationsPage implements OnInit {
  ubicaciones: any[] = [];
  filtroTexto: string = '';
  categoriaActiva: string = 'Todos';

  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private cdr = inject(ChangeDetectorRef);
  private locationsService = inject(LocationsService);

  constructor() {
    addIcons({
      locationOutline,
      trashOutline,
      navigateOutline,
      eyeOutline,
      calendarOutline,
      cameraOutline,
      mapOutline,
      sparklesOutline,
      searchOutline,
      bookmarkOutline,
    });
  }

  ngOnInit() {
    this.locationsService.ubicaciones$.subscribe((ubicaciones) => {
      this.ubicaciones = ubicaciones;
      try {
        this.cdr.detectChanges();
      } catch (e) {}
    });
  }

  get ubicacionesFiltradas(): any[] {
    return this.ubicaciones.filter((ub) => {
      const matchText =
        this.filtroTexto.trim() === '' ||
        (ub.title &&
          ub.title.toLowerCase().includes(this.filtroTexto.toLowerCase())) ||
        (ub.description &&
          ub.description
            .toLowerCase()
            .includes(this.filtroTexto.toLowerCase())) ||
        (ub.category &&
          ub.category.toLowerCase().includes(this.filtroTexto.toLowerCase()));

      let matchCat = true;
      if (this.categoriaActiva === 'Con foto') {
        matchCat = !!ub.photo;
      } else if (this.categoriaActiva !== 'Todos') {
        matchCat = ub.category === this.categoriaActiva;
      }

      return matchText && matchCat;
    });
  }

  setCategoria(cat: string) {
    this.categoriaActiva = cat;
  }

  async confirmarEliminar(index: number, event: Event) {
    event.stopPropagation();

    const alert = await this.alertCtrl.create({
      header: 'Eliminar lugar',
      message: '¿Estás seguro de que deseas eliminar este lugar guardado?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.locationsService.eliminarUbicacion(index);
          },
        },
      ],
    });

    await alert.present();
  }

  irAlMapa(lat: number, lng: number, event?: Event) {
    if (event) event.stopPropagation();
    this.router.navigate(['/map'], {
      queryParams: { destLat: lat, destLng: lng },
    });
  }

  async verDetalle(ubi: any) {
    const modal = await this.modalCtrl.create({
      component: PlaceDetailModalComponent,
      componentProps: { place: ubi },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'route' && data) {
      this.irAlMapa(data.lat, data.lng);
    }
  }
}
