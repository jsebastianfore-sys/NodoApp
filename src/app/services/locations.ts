import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private ubicacionesSubject = new BehaviorSubject<any[]>([]);
  public ubicaciones$ = this.ubicacionesSubject.asObservable();

  constructor() {
    this.cargarUbicaciones();
  }

  cargarUbicaciones() {
    const saved = localStorage.getItem('misUbicaciones');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.ubicacionesSubject.next(parsed);
      } catch (e) {
        console.error('Error parseando localStorage:', e);
      }
    }
  }

  guardarUbicacion(data: any): boolean {
    const actuales = [...this.ubicacionesSubject.getValue()];
    actuales.unshift(data);
    
    try {
      localStorage.setItem('misUbicaciones', JSON.stringify(actuales));
      this.ubicacionesSubject.next(actuales);
      return true;
    } catch (e: any) {
      console.error('Error guardando en localStorage:', e);
      if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
        alert('Error: La foto es demasiado grande o el almacenamiento está lleno. Borra ubicaciones antiguas para guardar nuevas.');
      } else {
        alert('Ocurrió un error inesperado al guardar el lugar.');
      }
      return false;
    }
  }

  eliminarUbicacion(index: number) {
    const actuales = [...this.ubicacionesSubject.getValue()];
    actuales.splice(index, 1);
    
    localStorage.setItem('misUbicaciones', JSON.stringify(actuales));
    this.ubicacionesSubject.next(actuales);
  }
}
