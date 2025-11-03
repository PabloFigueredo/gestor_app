## Instrucciones rápidas para agentes AI (Copilot)

Estas notas están diseñadas para que un agente AI sea productivo inmediatamente en este repo Ionic/Angular.

- Contexto general: proyecto Ionic + Angular (v20) con Capacitor. UI en `src/app/pages/*`, navegación en `src/app/app.routes.ts` y estilos globales en `src/theme`.
- Backend/Integraciones: se usa `@supabase/supabase-js` en `src/app/services/api.service.ts` y hay un servicio de tiempo real en `src/app/core/realtime.service.ts`.

Patrones y límites de responsabilidad
- Páginas (src/app/pages): contienen la UI y la interacción del usuario. Ejemplo: la modal de crear tarea está en `src/app/pages/create-task/*`.
- Servicios (src/app/services): encapsulan llamadas a backend (ver `api.service.ts`). Preferir inyectar y reutilizar estos servicios en páginas y otros servicios.
- Core (src/app/core): responsabilidad por infraestructuras transversales (ej. `realtime.service.ts`). No mezclar lógica de UI aquí.

Flujo de datos típico
1. UI (página/modal) recoge entrada y llama a un método del `ApiService`.
2. `ApiService` usa Supabase (o fetch) y devuelve Promises/Observables.
3. Para eventos en tiempo real usar `RealtimeService` para suscribirse y propagar cambios a componentes.

Comandos importantes (detectados en `package.json`)
- `npm start` → arranca `ng serve` (desarrollo local).
- `npm run build` → `ng build` (producción).
- `npm test` → corre `ng test` (Karma/Jasmine).
- Capacitor/cordova: usar comandos de Capacitor/CLI según sea necesario (no incluidos directamente en scripts).

Convenciones del código
- TypeScript + Angular Style: componentes en `src/app/*`, pruebas `.spec.ts` junto a los componentes.
- Rutas centralizadas en `src/app/app.routes.ts` — modificar aquí si añade una página nueva.
- Variables de entorno en `src/environments/*`.

Ejemplos concretos
- Para implementar una nueva llamada al backend: agregar método a `src/app/services/api.service.ts`, inyectar `ApiService` en la página y usar `await this.apiService.miMetodo(...)`.
- Para suscribir eventos de tiempo real: revisar `src/app/core/realtime.service.ts` y seguir el patrón de suscripción/limpieza en `ngOnInit`/`ngOnDestroy`.

Errores y patrones a evitar
- No poner lógica de negocio en templates o componentes; moverla a servicios reutilizables.
- Evitar duplicar llamadas a Supabase: centralizar en `ApiService`.

Dónde buscar más contexto
- Rutas y estructura: `src/app/app.routes.ts`.
- Servicios API: `src/app/services/api.service.ts`.
- Time/Realtime: `src/app/core/realtime.service.ts`.
- Páginas de ejemplo: `src/app/pages/tasks`, `src/app/pages/create-task`.

Si falta algo útil en este documento, dime qué parte te parece ambigua y la amplío con ejemplos de código o comandos adicionales.
