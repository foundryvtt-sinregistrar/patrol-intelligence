# Patrol Intelligence

Complemento experimental verificado en Foundry VTT 14.370, Patrol 5.0.12 y D&D5e 6.1.1. Convierte las etapas de detección de Patrol en propuestas deterministas para el DJ. No utiliza servicios externos ni modelos de lenguaje. [Detección real y dos clientes GM](docs/DND5E-6.1.1-VALIDATION.md)

## Estado actual

- Observa los seis hooks públicos de Patrol.
- Lee estadísticas preparadas de D&D5e sin realizar tiradas.
- Propone reacciones según perfiles configurables y solo notifica al GM activo.
- Guarda una configuración opt-in por TokenDocument; por defecto está desactivado.
- Conserva en memoria las propuestas que requieren aprobación.

No controla movimientos de Patrol, no inicia combate, no altera personajes jugadores y no ejecuta propuestas aprobadas. El control manual persistente del PNJ no está implementado. La verificación con Patrol 5.0.12 cubre la integración pasiva; no certifica un contrato de suspensión y reanudación individual. [Investigación](docs/INTEGRATION-RESEARCH.md)

## Activación de prueba

Activa Patrol y Patrol Intelligence en un mundo de prueba D&D5e 6.1.1 con Patrol 5.0.12. Desde la consola del GM activo, habilita un token de Patrol concreto:

```js
const pi = game.modules.get("patrol-intelligence").api;
await pi.setTokenConfig(token.document, { enabled: true, mode: "AUTO" });
```

Cuando Patrol detecte un personaje controlado por un jugador, el GM activo recibirá una propuesta. Las que exijan aprobación pueden revisarse con `pi.proposals.list()` y marcarse mediante `pi.proposals.approve(id)` o `pi.proposals.reject(id)`. Estas operaciones no ejecutan la propuesta.

## Verificación

Ejecuta `node --test tests/engine.test.mjs` desde la carpeta del módulo. Las comprobaciones manuales de Foundry están en `docs/TEST-PLAN.md`.
