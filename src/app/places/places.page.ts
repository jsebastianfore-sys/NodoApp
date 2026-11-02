import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';
import { PUNTOS, PuntoInteres } from '../home/home.page';
import { addIcons } from 'ionicons';
import {
  mapOutline, businessOutline, searchOutline,
  navigateOutline, locationOutline, bookmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss'],
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
    CommonModule, FormsModule
  ]
})
export class PlacesPage implements OnInit {
  puntos: PuntoInteres[] = PUNTOS;
  filtroTexto: string = '';
  categoriaActiva: string = 'Todos';

  categorias: string[] = ['Todos', 'Parque', 'Estadio', 'Universidad', 'Centro_Comercial', 'Museo_Nacional', 'biblioteca'];

  private router = inject(Router);

  constructor() {
    addIcons({
      mapOutline,
      businessOutline,
      searchOutline,
      navigateOutline,
      locationOutline,
      bookmarkOutline
    });
  }

  ngOnInit() {}

  get puntosFiltrados(): PuntoInteres[] {
    return this.puntos.filter(p => {
      const matchText = this.filtroTexto.trim() === '' ||
        p.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        p.tipo.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const matchCat = this.categoriaActiva === 'Todos' || p.tipo === this.categoriaActiva;
      return matchText && matchCat;
    });
  }

  setCategoria(cat: string) {
    this.categoriaActiva = cat;
  }

  irAlMapa(lat: number, lng: number) {
    this.router.navigate(['/map'], { queryParams: { destLat: lat, destLng: lng } });
  }

  obtenerEmoji(tipo: string): string {
    const map: Record<string, string> = {
      Casa: '🏠',
      biblioteca: '📚',
      Estadio: '⚽',
      Parque: '🎡',
      Universidad: '🎓',
      Aeropuerto: '✈️',
      Centro_Comercial: '🛍️',
      Sena: '🏛️',
      Portal_20_de_Julio: '🚌',
      Parque_San_Cristobal: '🌳',
      Monserrate: '⛰️',
      Plaza_de_Bolivar: '🏛️',
      Museo_Nacional: '🎨',
      Plaza_Paloquemao: '🍎',
      Alkosto_Venecia: '🛒',
      Hospital_Mederi: '🏥',
      Mcdonalds: '🍔',
      Cine_Colombia: '🎬',
      Homecenter_El_Dorado: '🔨',
      Tienda_D1_Normandia: '🏬'
    };
    return map[tipo] || '📍';
  }
}
