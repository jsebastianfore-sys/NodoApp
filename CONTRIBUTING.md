# Cómo trabajamos en este proyecto

Acuerdos del equipo para trabajar en el mismo repositorio sin pisarnos los cambios.

## Ramas

- **Nadie trabaja directo en `main`.** `main` siempre debe compilar y funcionar.
- Cada tarea va en su propia rama, creada desde `main` actualizado:
  ```bash
  git switch main
  git pull origin main
  git switch -c tipo/descripcion-corta
  ```
- Nombres de rama según el tipo de cambio:
  | Prefijo | Para qué | Ejemplo |
  |---|---|---|
  | `feat/` | Funcionalidad nueva | `feat/viajes` |
  | `fix/` | Corrección de un error | `fix/marcador-mapa` |
  | `refactor/` | Reorganizar código sin cambiar lo que hace | `refactor/estructura` |
  | `docs/` | Documentación | `docs/fase-2` |
  | `chore/` | Configuración, dependencias | `chore/actualizar-capacitor` |

## Pull Requests

- Todo cambio entra a `main` con un **Pull Request** que revisa el otro integrante.
- La descripción del PR explica **qué cambia**, **por qué** y **cómo probarlo**.
- Antes de abrir el PR:
  1. Actualizar la rama con lo último de `main`: `git pull origin main`
  2. `npm run build` compila sin errores.
  3. Probar en `ionic serve` lo que se cambió.
- Se fusiona con **"Create a merge commit"** y luego se borra la rama.

## Reparto del trabajo

- **Santiago:** backend (NestJS + MongoDB) e integración con la app
  (servicios, autenticación, tiempo real).
- **<Compañero>:** interfaz, pantallas y mapa.

Si alguien necesita tocar archivos del área del otro, avisa antes para no trabajar
en lo mismo al tiempo.

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar pantalla de viajes
fix: corregir el centrado del mapa
refactor: mover servicios a core
docs: actualizar README
chore: actualizar dependencias
```

- Un commit por cambio lógico; nunca mezclar "mover archivos" con "cambiar lógica".
- Mensajes en español, en infinitivo o presente.

## Convenciones de código

- **Gestor de paquetes:** npm (el archivo de bloqueo oficial es `package-lock.json`).
- Nombres de código en inglés; comentarios y textos de la interfaz en español.
- Archivos en _kebab-case_ con sufijo de tipo: `auth.service.ts`, `map.page.ts`.
- Clases en _PascalCase_: `AuthService`, `MapPage`.
- Organización de carpetas: ver la sección **Estructura** del [README](README.md).
- Comentarios que expliquen el **porqué**, no el qué.
- Las decisiones técnicas importantes se registran en [docs/decisiones.md](docs/decisiones.md).
