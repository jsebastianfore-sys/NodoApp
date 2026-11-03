import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  ModalController,
  IonIcon,
  ToastController,
} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { addIcons } from 'ionicons';
import {
  locateOutline,
  navigateOutline,
  closeOutline,
  mapOutline,
  layersOutline,
  eyeOutline,
  bookmarkOutline,
  timeOutline,
  informationCircleOutline,
  sparklesOutline,
  compassOutline,
} from 'ionicons/icons';
import { LocationModalComponent } from '../location-modal/location-modal.component';
import { PlaceDetailModalComponent } from '../place-detail-modal/place-detail-modal.component';
import { LocationsService } from '../core/services/locations.service';
import { NotificationsService } from '../core/services/notifications.service';

export interface PuntoInteres {
  nombre: string;
  tipo: string;
  lat: number;
  lng: number;
}

export const PUNTOS: PuntoInteres[] = [
  {
    nombre: 'Casa Lopez',
    tipo: 'Casa',
    lat: 4.561207932470821,
    lng: -74.0805548679281,
  },
  {
    nombre: 'Biblioteca Principal',
    tipo: 'biblioteca',
    lat: 4.657011767024491,
    lng: -74.08944261165921,
  },
  {
    nombre: 'El Campin',
    tipo: 'Estadio',
    lat: 4.645634565629085,
    lng: -74.07776720625884,
  },
  {
    nombre: 'Parque Mundo Aventura',
    tipo: 'Parque',
    lat: 4.622247935447553,
    lng: -74.1368301164395,
  },
  {
    nombre: 'Universidad ETITC',
    tipo: 'Universidad',
    lat: 4.605977978006711,
    lng: -74.08195499024913,
  },
  {
    nombre: 'Aeropuerto El Dorado',
    tipo: 'Aeropuerto',
    lat: 4.692391450782409,
    lng: -74.13457904341355,
  },
  {
    nombre: 'Centro Mayor',
    tipo: 'Centro_Comercial',
    lat: 4.590059495750958,
    lng: -74.12406519148085,
  },
  {
    nombre: 'Sena',
    tipo: 'Sena',
    lat: 4.595271501518269,
    lng: -74.11280498026517,
  },
  {
    nombre: 'Portal 20 de Julio',
    tipo: 'Portal_20_de_Julio',
    lat: 4.565909478661485,
    lng: -74.0975822358211,
  },
  {
    nombre: 'Parque San Cristobal',
    tipo: 'Parque_San_Cristobal',
    lat: 4.572032843795727,
    lng: -74.08284332011017,
  },
  {
    nombre: 'Monserrate',
    tipo: 'Monserrate',
    lat: 4.602811909904955,
    lng: -74.06111119486064,
  },
  {
    nombre: 'Plaza de Bolivar',
    tipo: 'Plaza_de_Bolivar',
    lat: 4.598079723313495,
    lng: -74.07596456404112,
  },
  {
    nombre: 'Museo Nacional',
    tipo: 'Museo_Nacional',
    lat: 4.615680447409604,
    lng: -74.06888307464394,
  },
  {
    nombre: 'Plaza Paloquemao',
    tipo: 'Plaza_Paloquemao',
    lat: 4.615482209241392,
    lng: -74.08471526032953,
  },
  {
    nombre: 'Alkosto Venecia',
    tipo: 'Alkosto_Venecia',
    lat: 4.595457869087693,
    lng: -74.13951451588147,
  },
  {
    nombre: 'Hospital Mederi',
    tipo: 'Hospital_Mederi',
    lat: 4.6239634819652276,
    lng: -74.08233662765348,
  },
  {
    nombre: 'Mcdonalds',
    tipo: 'Mcdonalds',
    lat: 4.614036123303195,
    lng: -74.13521612113104,
  },
  {
    nombre: 'Cine Colombia',
    tipo: 'Cine_Colombia',
    lat: 4.609388114617385,
    lng: -74.0692550819242,
  },
  {
    nombre: 'Homecenter El Dorado',
    tipo: 'Homecenter_El_Dorado',
    lat: 4.677714723504928,
    lng: -74.11837998386378,
  },
  {
    nombre: 'Tienda D1 Normandia',
    tipo: 'Tienda_D1_Normandia',
    lat: 4.669131417439979,
    lng: -74.10479083088701,
  },
];

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonIcon, CommonModule],
})
export class HomePage implements AfterViewInit, OnInit {
  private map!: L.Map;
  public ubicacionUsuario: { lat: number; lng: number } = {
    lat: 4.60971,
    lng: -74.08175,
  };
  public userMarker?: L.Marker;
  public rutaActual?: L.Polyline;
  public rutaInfo: { distancia: string; tiempo: string } | null = null;
  private savedMarkers: L.Marker[] = [];
  private poiMarkers: L.Marker[] = [];
  private currentLayer!: L.TileLayer;
  private currentLayerType: 'streets' | 'satellite' | 'topo' = 'streets';

  public lugarSeleccionado: any = null;
  public showHint: boolean = true;
  public isLocating: boolean = false;

  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private route = inject(ActivatedRoute);
  private locationsService = inject(LocationsService);
  private notificationsService = inject(NotificationsService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  private iconoUsuario = L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(79, 70, 229, 0.3); animation: userPulse 2s infinite ease-out;"></div>
        <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: #4f46e5; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });

  private iconosPorTipo: Record<string, L.Icon> = {
    Casa: L.icon({
      iconUrl: '../../assets/icon/wilmer.png',
      iconSize: [30, 30],
    }),
    biblioteca: L.icon({
      iconUrl: '../../assets/icon/biblioteca.png',
      iconSize: [30, 30],
    }),
    Estadio: L.icon({
      iconUrl: '../../assets/icon/campin.png',
      iconSize: [30, 30],
    }),
    Parque: L.icon({
      iconUrl: '../../assets/icon/mundo.png',
      iconSize: [40, 40],
    }),
    Universidad: L.icon({
      iconUrl: '../../assets/icon/ETITC.png',
      iconSize: [40, 40],
    }),
    Aeropuerto: L.icon({
      iconUrl: '../../assets/icon/Aeropuerto.png',
      iconSize: [40, 40],
    }),
    Centro_Comercial: L.icon({
      iconUrl: '../../assets/icon/centromayor.png',
      iconSize: [40, 40],
    }),
    Sena: L.icon({ iconUrl: '../../assets/icon/sena.png', iconSize: [40, 40] }),
    Portal_20_de_Julio: L.icon({
      iconUrl: '../../assets/icon/portal20.png',
      iconSize: [40, 40],
    }),
    Parque_San_Cristobal: L.icon({
      iconUrl: '../../assets/icon/parque.png',
      iconSize: [40, 40],
    }),
    Monserrate: L.icon({
      iconUrl: '../../assets/icon/monserrate.png',
      iconSize: [40, 40],
    }),
    Plaza_de_Bolivar: L.icon({
      iconUrl: '../../assets/icon/plazadebolivar.png',
      iconSize: [40, 40],
    }),
    Museo_Nacional: L.icon({
      iconUrl: '../../assets/icon/museonacional.png',
      iconSize: [40, 40],
    }),
    Plaza_Paloquemao: L.icon({
      iconUrl: '../../assets/icon/plazapaloquemao.png',
      iconSize: [40, 40],
    }),
    Alkosto_Venecia: L.icon({
      iconUrl: '../../assets/icon/alkostovenecia.png',
      iconSize: [80, 40],
    }),
    Hospital_Mederi: L.icon({
      iconUrl: '../../assets/icon/hospitalmederi.png',
      iconSize: [40, 40],
    }),
    Mcdonalds: L.icon({
      iconUrl: '../../assets/icon/mcdonalds.png',
      iconSize: [40, 40],
    }),
    Cine_Colombia: L.icon({
      iconUrl: '../../assets/icon/cinecolombia.png',
      iconSize: [40, 40],
    }),
    Homecenter_El_Dorado: L.icon({
      iconUrl: '../../assets/icon/homecentereldorado.png',
      iconSize: [40, 40],
    }),
    Tienda_D1_Normandia: L.icon({
      iconUrl: '../../assets/icon/tiendad1normandia.png',
      iconSize: [40, 40],
    }),
  };

  constructor() {
    addIcons({
      locateOutline,
      navigateOutline,
      closeOutline,
      mapOutline,
      layersOutline,
      eyeOutline,
      bookmarkOutline,
      timeOutline,
      informationCircleOutline,
      sparklesOutline,
      compassOutline,
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const destLat = params['destLat'];
      const destLng = params['destLng'];

      if (destLat && destLng && this.map && this.ubicacionUsuario) {
        this.trazarRuta(parseFloat(destLat), parseFloat(destLng));
      }
    });

    this.locationsService.ubicaciones$.subscribe((ubicaciones) => {
      if (this.map) {
        this.cargarLugaresGuardados(ubicaciones);
      }
    });
  }

  ionViewDidEnter() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 150);
    }
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  async inicializarMapa() {
    if (this.map) return;

    let lat = 4.60971;
    let lng = -74.08175;

    try {
      this.isLocating = true;
      const point = await Geolocation.getCurrentPosition({
        timeout: 6000,
        enableHighAccuracy: true,
      });
      lat = point.coords.latitude;
      lng = point.coords.longitude;
      this.ubicacionUsuario = { lat, lng };
    } catch (e) {
      console.warn('Ubicación GPS por defecto (Bogotá):', e);
      this.ubicacionUsuario = { lat, lng };
    } finally {
      this.isLocating = false;
    }

    // Inicializar Leaflet map
    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([lat, lng], 16);

    // Tile layer: OpenStreetMap Standard (Clean, crisp, no API keys)
    this.currentLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
      },
    ).addTo(this.map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Marcador de usuario
    this.userMarker = L.marker([lat, lng], { icon: this.iconoUsuario }).addTo(
      this.map,
    ).bindPopup(`
        <div style="padding: 6px 10px; font-weight: 700; font-size: 13px; color: #4f46e5; display: flex; align-items: center; gap: 6px;">
          <span>📍 Estás aquí</span>
        </div>
      `);

    // Puntos de Interés
    this.cargarPuntosInteres(lat, lng);

    // Cargar inicial de lugares guardados
    this.locationsService.cargarUbicaciones();

    // Tap en el mapa para guardar nueva ubicación
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        this.lugarSeleccionado = null;
        this.abrirModalUbicacion(e.latlng.lat, e.latlng.lng);
      });
    });

    // Invalidate size after layout completes
    setTimeout(() => this.map.invalidateSize(), 200);

    // Revisar si venimos con parámetros de ruta inicial
    const destLat = this.route.snapshot.queryParams['destLat'];
    const destLng = this.route.snapshot.queryParams['destLng'];
    if (destLat && destLng) {
      this.trazarRuta(parseFloat(destLat), parseFloat(destLng));
    }
  }

  cargarPuntosInteres(userLat: number, userLng: number) {
    this.poiMarkers.forEach((m) => this.map.removeLayer(m));
    this.poiMarkers = [];

    PUNTOS.forEach((p) => {
      const distancia = this.calcularDistancia(userLat, userLng, p.lat, p.lng);
      const distTexto =
        distancia < 1000
          ? `${distancia.toFixed(0)} m`
          : `${(distancia / 1000).toFixed(2)} km`;

      const marker = L.marker([p.lat, p.lng], {
        icon: this.iconosPorTipo[p.tipo] || this.crearIconoPin(false),
      }).addTo(this.map);

      // Subtle popup on hover/click for POIs
      const popupHtml = `
        <div class="subtle-popup-card">
          <div class="popup-img-wrap" style="height: 60px; background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); display:flex; align-items:center; justify-content:center;">
            <span style="color:#fff; font-size:12.5px; font-weight:700;">🏢 ${p.nombre}</span>
          </div>
          <div class="popup-body">
            <div class="popup-header">
              <h4 class="popup-title">${p.nombre}</h4>
            </div>
            <div class="popup-coords">
              <span>🏷️ ${p.tipo.replace(/_/g, ' ')}</span>
              <span>• 📏 ${distTexto}</span>
            </div>
            <div class="popup-actions">
              <button class="btn-route" id="poi-route-${p.lat}-${p.lng}">
                🚀 Trazar ruta
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'subtle-map-popup',
        maxWidth: 260,
        minWidth: 220,
        offset: [0, -10],
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`poi-route-${p.lat}-${p.lng}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            this.trazarRuta(p.lat, p.lng);
          };
        }
      });

      marker.on('click', () => {
        this.ngZone.run(() => {
          this.lugarSeleccionado = {
            title: p.nombre,
            nombre: p.nombre,
            category: p.tipo.replace(/_/g, ' '),
            lat: p.lat,
            lng: p.lng,
            distText: distTexto,
            isPoi: true,
          };
        });
      });

      this.poiMarkers.push(marker);
    });
  }

  async Punto() {
    if (!this.map) {
      await this.inicializarMapa();
      return;
    }

    try {
      this.isLocating = true;
      const point = await Geolocation.getCurrentPosition({
        timeout: 6000,
        enableHighAccuracy: true,
      });
      const { latitude, longitude } = point.coords;
      this.ubicacionUsuario = { lat: latitude, lng: longitude };

      if (this.userMarker) {
        this.userMarker.setLatLng([latitude, longitude]);
      } else {
        this.userMarker = L.marker([latitude, longitude], {
          icon: this.iconoUsuario,
        }).addTo(this.map);
      }

      this.map.flyTo([latitude, longitude], 17, { duration: 1.2 });
      this.mostrarToast('📍 Ubicación actualizada con éxito');
    } catch (e) {
      console.warn('Error al actualizar ubicación:', e);
      if (this.ubicacionUsuario) {
        this.map.flyTo(
          [this.ubicacionUsuario.lat, this.ubicacionUsuario.lng],
          16,
        );
      }
      this.mostrarToast('ℹ️ Centrado en ubicación predeterminada');
    } finally {
      this.isLocating = false;
      this.cdr.detectChanges();
    }
  }

  alternarCapa() {
    if (!this.map) return;
    this.map.removeLayer(this.currentLayer);

    if (this.currentLayerType === 'streets') {
      this.currentLayerType = 'satellite';
      this.currentLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
        },
      ).addTo(this.map);
      this.mostrarToast('🛰️ Vista Satelital');
    } else if (this.currentLayerType === 'satellite') {
      this.currentLayerType = 'topo';
      this.currentLayer = L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 17,
        },
      ).addTo(this.map);
      this.mostrarToast('🏔️ Mapa Topográfico');
    } else {
      this.currentLayerType = 'streets';
      this.currentLayer = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
        },
      ).addTo(this.map);
      this.mostrarToast('🗺️ Mapa Estándar');
    }
  }

  limpiarRuta() {
    if (this.rutaActual && this.map) {
      this.map.removeLayer(this.rutaActual);
      this.rutaActual = undefined;
      this.rutaInfo = null;
      this.mostrarToast('Ruta cancelada');
    }
  }

  calcularDistancia(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private async obtenerRuta(
    origenLat: number,
    origenLng: number,
    destinoLat: number,
    destinoLng: number,
  ): Promise<{ coordinates: L.LatLng[]; distance: number; duration: number }> {
    const url = `https://router.project-osrm.org/route/v1/foot/${origenLng},${origenLat};${destinoLng},${destinoLat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No se encontró ruta');
    }

    const route = data.routes[0];
    const coords = route.geometry.coordinates.map((coord: [number, number]) =>
      L.latLng(coord[1], coord[0]),
    );

    return {
      coordinates: coords,
      distance: route.distance,
      duration: route.duration,
    };
  }

  async trazarRuta(destinoLat: number, destinoLng: number) {
    try {
      const ruta = await this.obtenerRuta(
        this.ubicacionUsuario.lat,
        this.ubicacionUsuario.lng,
        destinoLat,
        destinoLng,
      );

      if (this.rutaActual && this.map) {
        this.map.removeLayer(this.rutaActual);
      }

      this.rutaActual = L.polyline(ruta.coordinates, {
        color: '#4f46e5',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(this.map);

      const distText =
        ruta.distance < 1000
          ? `${ruta.distance.toFixed(0)} m`
          : `${(ruta.distance / 1000).toFixed(1)} km`;

      const minutos = Math.ceil(ruta.duration / 60);
      const timeText =
        minutos < 60
          ? `${minutos} min`
          : `${Math.floor(minutos / 60)}h ${minutos % 60}m`;

      this.rutaInfo = {
        distancia: distText,
        tiempo: timeText,
      };

      this.map.fitBounds(this.rutaActual.getBounds(), { padding: [60, 60] });
      this.mostrarToast(`🚶 Ruta trazada: ${distText} • ~${timeText}`);
      this.cdr.detectChanges();

      // Trigger local notification for route started
      const nombreDestino =
        this.lugarSeleccionado?.title ||
        this.lugarSeleccionado?.nombre ||
        'Destino seleccionado';
      this.notificationsService.notificarRutaIniciada(
        nombreDestino,
        distText,
        timeText,
      );
    } catch (error) {
      console.error('Error trazando ruta:', error);
      this.mostrarToast('No fue posible trazar la ruta a pie.');
    }
  }

  cargarLugaresGuardados(ubicaciones?: any[]) {
    if (!this.map) return;

    // Limpiar marcadores antiguos
    this.savedMarkers.forEach((m) => this.map.removeLayer(m));
    this.savedMarkers = [];

    if (!ubicaciones || ubicaciones.length === 0) return;

    ubicaciones.forEach((ub: any) => {
      this.agregarMarcadorGuardado(ub);
    });
  }

  agregarMarcadorGuardado(ub: any) {
    if (!this.map) return;

    const hasPhoto = !!ub.photo;
    const title =
      ub.title ||
      ub.nombre ||
      (ub.description ? ub.description.slice(0, 24) : 'Lugar Guardado');
    const desc = ub.description || 'Sin notas adicionales';
    const dateFormatted = ub.date
      ? new Date(ub.date).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    const dist = this.calcularDistancia(
      this.ubicacionUsuario.lat,
      this.ubicacionUsuario.lng,
      ub.lat,
      ub.lng,
    );
    const distText =
      dist < 1000 ? `${dist.toFixed(0)} m` : `${(dist / 1000).toFixed(2)} km`;

    // Modern icon for saved place
    const marker = L.marker([ub.lat, ub.lng], {
      icon: this.crearIconoPin(hasPhoto),
    }).addTo(this.map);

    // Subtle HTML popup for hover or click
    const imgHtml = hasPhoto
      ? `<div class="popup-img-wrap"><img src="${ub.photo}" alt="${title}" /><span class="popup-badge">📸 ${ub.category || 'Guardado'}</span></div>`
      : `<div class="popup-img-wrap" style="height: 60px; background: linear-gradient(135deg, #4f46e5 0%, #a855f7 100%); display:flex; align-items:center; justify-content:center;"><span style="color:#fff; font-size:12px; font-weight:700;">📍 ${ub.category || 'Lugar Guardado'}</span></div>`;

    const popupContent = `
      <div class="subtle-popup-card">
        ${imgHtml}
        <div class="popup-body">
          <div class="popup-header">
            <h4 class="popup-title">${title}</h4>
          </div>
          <p class="popup-desc">${desc}</p>
          <div class="popup-coords">
            <span>📍 ${ub.lat.toFixed(4)}, ${ub.lng.toFixed(4)}</span>
            <span>• 📏 ${distText}</span>
          </div>
          <div class="popup-actions">
            <button class="btn-route" id="popup-btn-route-${ub.lat}-${ub.lng}">
              🚀 Trazar ruta
            </button>
            <button class="btn-secondary" id="popup-btn-detail-${ub.lat}-${ub.lng}">
              Detalle
            </button>
          </div>
        </div>
      </div>
    `;

    const popup = L.popup({
      className: 'subtle-map-popup',
      maxWidth: 270,
      minWidth: 230,
      closeButton: true,
      autoClose: false,
      offset: [0, -10],
    }).setContent(popupContent);

    marker.bindPopup(popup);

    // Subtle hover preview on desktop
    marker.on('mouseover', () => {
      this.ngZone.run(() => {
        this.lugarSeleccionado = { ...ub, title, distText };
        marker.openPopup();
      });
    });

    // Select on click
    marker.on('click', () => {
      this.ngZone.run(() => {
        this.lugarSeleccionado = { ...ub, title, distText };
        marker.openPopup();
      });
    });

    // Attach click listeners when popup opens
    marker.on('popupopen', () => {
      const btnRoute = document.getElementById(
        `popup-btn-route-${ub.lat}-${ub.lng}`,
      );
      if (btnRoute) {
        btnRoute.onclick = (e) => {
          e.stopPropagation();
          this.trazarRuta(ub.lat, ub.lng);
        };
      }

      const btnDetail = document.getElementById(
        `popup-btn-detail-${ub.lat}-${ub.lng}`,
      );
      if (btnDetail) {
        btnDetail.onclick = (e) => {
          e.stopPropagation();
          this.verDetalle(ub);
        };
      }
    });

    this.savedMarkers.push(marker);
  }

  crearIconoPin(hasPhoto: boolean): L.DivIcon {
    if (hasPhoto) {
      return L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div class="pin-glow"></div>
          <div style="
            width: 36px; height: 36px;
            border-radius: 50% 50% 50% 4px;
            transform: rotate(-45deg);
            background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 14px rgba(139, 92, 246, 0.45);
            border: 2.5px solid #ffffff;
          ">
            <span style="transform: rotate(45deg); font-size: 15px;">📸</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });
    }

    return L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div class="pin-glow"></div>
        <div style="
          width: 34px; height: 34px;
          border-radius: 50% 50% 50% 4px;
          transform: rotate(-45deg);
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
          border: 2.5px solid #ffffff;
        ">
          <span style="transform: rotate(45deg); font-size: 14px;">⭐</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  }

  async abrirModalUbicacion(lat: number, lng: number) {
    const modal = await this.modalCtrl.create({
      component: LocationModalComponent,
      componentProps: { lat, lng },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.85,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      const ok = this.locationsService.guardarUbicacion(data);
      if (ok) {
        this.mostrarToast(`✨ "${data.title || 'Lugar'}" guardado con éxito!`);

        // Disparar Notificación Local
        this.notificationsService.notificarLugarGuardado(
          data.title || data.nombre || 'Lugar Guardado',
          data.category || 'Favorito',
          !!data.photo,
        );

        // Centrar y abrir su preview
        if (this.map) {
          this.map.flyTo([data.lat, data.lng], 17, { duration: 0.8 });
          setTimeout(() => {
            const dist = this.calcularDistancia(
              this.ubicacionUsuario.lat,
              this.ubicacionUsuario.lng,
              data.lat,
              data.lng,
            );
            const distText =
              dist < 1000
                ? `${dist.toFixed(0)} m`
                : `${(dist / 1000).toFixed(2)} km`;
            this.lugarSeleccionado = { ...data, distText };
            this.cdr.detectChanges();
          }, 800);
        }
      }
    }
  }

  async verDetalle(lugar: any) {
    const modal = await this.modalCtrl.create({
      component: PlaceDetailModalComponent,
      componentProps: { place: lugar },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'route' && data) {
      this.trazarRuta(data.lat, data.lng);
    }
  }

  cerrarPreview() {
    this.lugarSeleccionado = null;
  }

  descartarHint() {
    this.showHint = false;
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      cssClass: 'app-custom-toast',
    });
    await toast.present();
  }
}
