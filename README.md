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

**Comandos útiles (bun)**

- Iniciar mobile (desde raíz):

```bash
cd apps/mobile && bunx expo start
```

- Iniciar backend:

```bash
cd apps/api && bun run dev
```