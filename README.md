# Commercium


Commercium es un monorepo que contiene el backend y la app móvil de un pequeño proyecto de comercio/gestión. El objetivo es mantener la lógica compartida (modelos, configuraciones y utilidades) en `packages/core`, mientras que el servidor y la app móvil viven en `apps/api` y `apps/mobile` respectivamente.

**Estructura principal**
- `apps/api` – servidor backend (TypeScript)
- `apps/mobile` – app móvil (Expo / React Native / expo-router)
- `packages/core` – utilidades y código compartido

**Quick Start (local, usando bun)**

1) Instalar dependencias desde la raíz:

```bash
bun install
```

2) Ejecutar la app móvil (Expo)

```bash
cd apps/mobile
bun install

# iniciar Expo
bunx expo start
```

3) Ejecutar el backend

```bash
cd apps/api
bun install
bun run dev
```

**Notas rápidas**
- La app móvil usa `expo-router` para rutas (revisa `apps/mobile/app/_layout.tsx` y `apps/mobile/app/screens/`).
- No se incluyen instrucciones de base de datos en este README; la configuración y migraciones están en `packages/core` por si las necesitas, pero no es obligatorio para arrancar la parte cliente/servidor en modo de desarrollo simple.
- Evita anidar `NavigationContainer`; con `expo-router` usa `Stack` en `_layout.tsx`.

**Comandos útiles (bun)**

- Iniciar mobile (desde raíz):

```bash
cd apps/mobile && bunx expo start
```

- Iniciar backend:

```bash
cd apps/api && bun run dev
```