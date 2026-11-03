# Nodo — App móvil

App móvil de viajes grupales. Familias y amigos que se desplazan en varios vehículos
(carro o moto) ven en un mismo mapa la ubicación en vivo de cada integrante, el rastro
de su recorrido, reportes rápidos del grupo (tráfico, accidentes, paradas, retenes)
y fotos geolocalizadas de los lugares por donde pasan.

El backend es una API en NestJS + MongoDB: **<enlace al repositorio nodo-api>**

> **Estado actual:** la autenticación todavía es simulada y los lugares se guardan en el
> dispositivo. La conexión con el backend está en desarrollo (ver `docs/decisiones.md`).

## Tecnologías

- **Angular 22** con componentes standalone
- **Ionic 9** para la interfaz móvil
- **Capacitor 8** para compilar a Android y usar funciones nativas
  (geolocalización, cámara, notificaciones locales)
- **Leaflet** + OpenStreetMap para el mapa
- **RxJS** para el manejo de datos asíncronos

## Requisitos

- Node.js 20 o superior
- npm
- Ionic CLI: `npm install -g @ionic/cli`
- Para Android: Android Studio

## Instalación y ejecución

```bash
npm install
ionic serve          # abre la app en el navegador (http://localhost:8100)
npm run build        # compila a www/
```

### En Android

```bash
npm run build
npx cap sync android
npx cap open android # abre el proyecto en Android Studio
```

## Estructura

```
src/app/
  core/                         → una sola instancia en toda la app
    services/                   → autenticación, lugares, notificaciones
    guards/                     → protección de rutas (sesión requerida)
    models/                     → interfaces de datos (UserProfile…)
  shared/
    components/                 → componentes usados por varias pantallas
      location-modal/           → registrar un lugar con foto
      place-detail-modal/       → ver el detalle de un lugar
  features/                     → una carpeta por funcionalidad
    auth/pages/login/           → bienvenida, inicio de sesión y registro
    tabs/                       → barra de navegación inferior
    map/pages/map/              → mapa principal
    places/
      pages/my-places/          → lugares guardados por el usuario
      pages/points-of-interest/ → puntos de interés de Bogotá
      data/                     → datos fijos (lista de puntos de interés)
    profile/pages/profile/      → perfil, estadísticas y cierre de sesión
```

**Regla de organización:**

- ¿Debe haber una sola instancia y guarda estado de la app? → `core/`
- ¿Se usa en varias pantallas y cada uso es independiente? → `shared/`
- ¿Es una pantalla o algo de una sola funcionalidad? → `features/`

## Convenciones

- Nombres de código en inglés; comentarios y textos de la interfaz en español.
- Archivos en _kebab-case_ con sufijo de tipo (`auth.service.ts`, `map.page.ts`).
- Clases en _PascalCase_ (`AuthService`, `MapPage`).
- Commits con [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:` · `fix:` · `refactor:` · `docs:` · `chore:`

## Documentación

- Cómo trabajar en equipo (ramas, Pull Requests): [CONTRIBUTING.md](CONTRIBUTING.md)
- Decisiones técnicas: [docs/decisiones.md](docs/decisiones.md)

## Autores

- Andrés Santiago Jiménez Guzmán
- Juan Sebastian Gómez Forero
