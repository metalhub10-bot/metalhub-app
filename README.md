# MetalHub (mobil)

App móvil B2B/C2C para el sector metalúrgico. Marketplace de ofertas y demandas con diseño tipo Binance.

## Estructura

- **app/** – Pantallas y navegación (expo-router)
  - **_layout.tsx** – Stack raíz + SafeAreaProvider (tabs, login, register)
  - **(tabs)/** – 3 tabs: Mercado (index), Publicar, Perfil
  - **login.tsx**, **register.tsx** – Auth
- **components/** – ListingCard, FilterTabs, SearchBar
- **config/** – theme, constants, paywall (principal activa; abandono comentada)
- **assets/** – Imágenes e iconos

## Cómo correr

```bash
cd mobil
npm install
npm run start
```

- **Simulador iOS:** `npm run ios` (compila e instala; luego usa `npm run start` para recargar).
- **Web:** `npm run web`.

## Navegación

- 3 tabs: **Mercado** | **Publicar** | **Perfil**
- Mercado: filtros (Todos / Compran / Venden), orden, cards con botón Contactar → modal "Iniciar negociación" → WhatsApp
- Publicar: VENDO/COMPRO, metal, cantidad (kg/tn), precio o "A convenir", entrega, ubicación
- Perfil: datos de usuario, estadísticas, Configuración, Suscripción
