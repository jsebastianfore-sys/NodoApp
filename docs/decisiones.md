# Registro de decisiones técnicas — App móvil

Cada entrada explica qué se decidió, por qué y qué queda pendiente.
Las decisiones del backend están en su propio repositorio.

---

## 001 — Organización en `core`, `shared` y `features`

- **Decisión:** el código de `src/app/` se divide en tres carpetas:
  - `core/`: piezas de las que existe **una sola instancia** en toda la app y que guardan
    estado (servicios, guard de rutas, modelos de datos).
  - `shared/`: componentes reutilizables que usan **varias funcionalidades**
    (los modales de lugares los usan el mapa y "Mis lugares").
  - `features/`: una carpeta por funcionalidad, con sus pantallas y datos propios.
- **Por qué:** antes todas las carpetas estaban al mismo nivel y no se distinguía una
  pantalla de un servicio. Con esta división se sabe dónde va cada archivo nuevo y las
  funcionalidades no dependen entre sí.
- **Cómo se hizo:** en una rama aparte (`refactor/estructura`), moviendo archivos sin
  cambiar lógica y verificando con `npm run build` e `ionic serve` después de cada paso.

## 002 — Pantallas renombradas según lo que hacen

- **Decisión:**
  | Antes | Ahora |
  |---|---|
  | `home/` (`HomePage`) | `features/map/pages/map/` (`MapPage`) |
  | `locations/` (`LocationsPage`) | `features/places/pages/my-places/` (`MyPlacesPage`) |
  | `places/` (`PlacesPage`) | `features/places/pages/points-of-interest/` (`PointsOfInterestPage`) |
- **Por qué:** `home` era el nombre por defecto de la plantilla de Ionic, y `locations`
  y `places` no dejaban claro cuál era cuál. El nombre debe decir qué hace cada pantalla.

## 003 — Lista de puntos de interés en `features/places/data`

- **Decisión:** la constante `PUNTOS` pasó de `home.page.ts` a
  `features/places/data/points-of-interest.ts`.
- **Por qué:** el perfil importaba la lista desde la pantalla del mapa, así que una
  pantalla dependía de otra. Al ser información fija (no cambia mientras la app corre),
  va en una carpeta de datos y no en un servicio.

## 004 — Modelo de usuario en `core/models`

- **Decisión:** la interface `UserProfile` pasó de `auth.service.ts` a
  `core/models/user.model.ts`.
- **Por qué:** el modelo describe los datos y no debe depender del servicio. Así se puede
  reescribir el `AuthService` (Fase 3) sin afectar a las pantallas que usan el modelo.
- **Regla:** cada cosa se importa desde el archivo donde se declara.

## 005 — Convenciones de nombres

- Archivos en _kebab-case_ con sufijo de tipo: `auth.service.ts`, `map.page.ts`, `auth.guard.ts`.
- Clases en _PascalCase_: `AuthService`, `MapPage`.
- Selectores con prefijo `app-`: `app-map`, `app-my-places`.
- **Por qué los sufijos:** las versiones recientes de Angular los omiten (`auth.ts`, `Auth`),
  pero se mantienen para que el nombre diga qué tipo de pieza es y para que coincida con
  la convención del backend en NestJS.

## 006 — Flujo de trabajo con ramas y Pull Requests

- **Decisión:** nadie trabaja directo en `main`; todo entra con un Pull Request revisado.
- **Por qué:** el proyecto lo desarrollan dos personas. Revisar antes de fusionar evita
  romper `main` y que cada uno conozca los cambios del otro.
- **Detalle:** ver [CONTRIBUTING.md](../CONTRIBUTING.md).

## 007 — Nombre del proyecto y de la app

- **Decisión:** `package.json` → `nodo-app`; `appName` en Capacitor → `Nodo`.
- **Pendiente:** el `appId` sigue siendo `io.ionic.starter` (el de la plantilla). Se cambiará
  (por ejemplo, `co.edu.etitc.nodo`) al generar el APK, porque como ya existe la carpeta
  `android/`, también hay que ajustar archivos nativos.

---

## Pendientes conocidos

Problemas identificados que se resolverán en las siguientes fases.

### P1 — Autenticación simulada

- **Problema:** el `AuthService` acepta cualquier correo y contraseña y crea un usuario falso
  en el dispositivo. No hay verificación real.
- **Plan:** Fase 3, conectar con el backend (`/auth/register`, `/auth/login`, token JWT).
  Se mantendrá lo que las pantallas usan del servicio (`currentUser$`, `isAuthenticated()`,
  `logout()`) para no tener que reescribirlas.
- **Diferencias a resolver con el backend:** contraseña mínima de 6 (el backend exige 8)
  y el campo `nombre` (el backend usa `name`).

### P2 — Acceso con Google sin verificación

- **Problema:** sin Client ID configurado, el "selector de cuenta de Google" permite entrar
  escribiendo cualquier correo, sin comprobar que la persona sea su dueña. Además, el login
  con Google real solo crea la sesión en el dispositivo: el backend no se entera.
- **Plan:** eliminar el acceso simulado en la Fase 3. El login con Google real (verificando
  el `idToken` en el backend) queda como funcionalidad extra si hay tiempo.

### P3 — Lugares y fotos guardados en `localStorage`

- **Problema:** las fotos se guardan en base64 en el navegador, que tiene un límite de
  almacenamiento (el código ya maneja el error `QuotaExceededError`). Además, los lugares
  solo existen en ese dispositivo y no se comparten con el grupo.
- **Plan:** pasarlos al backend con un módulo de fotos geolocalizadas.

### P4 — Funcionalidades centrales pendientes

- Viajes con código de invitación, grupos mixtos carro/moto, ubicación en vivo con rastro
  y reportes rápidos del grupo. Se construirán después de conectar la autenticación.
