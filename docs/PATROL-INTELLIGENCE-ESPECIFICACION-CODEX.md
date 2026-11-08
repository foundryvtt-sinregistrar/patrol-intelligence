# Patrol Intelligence — Especificación técnica para Codex

**Estado:** propuesta de arquitectura y contrato funcional, pendiente de validación técnica.  
**Fecha:** 2026-11-08  
**Identificador provisional:** `patrol-intelligence`  
**Objetivo de compatibilidad inicial:** Foundry VTT **14**, sistema **D&D5e 6.0.6** (versión confirmada por el usuario) y **Patrol 5.x** (versión exacta pendiente de validar). El informe del 26-10-2026 verificó un mundo con Foundry 14.368 + D&D5e 6.0.6; su referencia a un checkout 6.0.5 es histórica, no el objetivo actual.  
**Idioma:** interfaz en español e inglés.  
**Tipo:** módulo independiente que extiende Patrol; no modificar el código de Patrol ni del sistema D&D5e.

## 1. Objetivo

Añadir comportamientos reactivos a los PNJ controlados por Patrol. Cuando un PNJ detecta un token perteneciente a un jugador, el módulo debe evaluar contexto, características y habilidades D&D5e, actitud y perfil de comportamiento. Debe permitir tanto la actuación autónoma del PNJ como la intervención manual inmediata del Director de Juego (DM).

**Principio central:** el DM siempre prevalece sobre las decisiones automáticas. El término «IA» significa en el MVP un motor local y determinista de reglas; no implica LLM, servicio en la nube ni generación automática de textos.

## 2. Alcance del MVP

### Incluido

- Integración con eventos de sospecha, alerta y detección de Patrol.
- Modos **AUTOMÁTICO** y **DM** configurables por token.
- Toma de control y devolución de control sin cambiar de escena.
- Evaluación de objetivos desde D&D5e y el contexto de la escena.
- Perfiles iniciales: **guardián**, **civil**, **animal** y **hostil**.
- Reacciones iniciales: **observar**, **investigar**, **advertir**, **notificar al DM**, **perseguir** y **huir**, cuando el mecanismo sea compatible con las API públicas existentes.
- Notificaciones privadas y decisiones accionables para el DM.
- Política de autorización para acciones de riesgo, separada del modo de control.
- Estado y configuración por token; registro de decisiones opcional para diagnóstico.
- Pruebas automatizables de la lógica de decisión e integración manual en Foundry.

### Fuera del MVP

- Diálogos generados por IA, voz, integraciones externas o LLM.
- Combate totalmente automatizado (tiradas de ataque, daño, uso de conjuros o recursos).
- Audio, audición física, olores, rastros complejos o sensores personalizados.
- Comunicación coordinada entre múltiples PNJ (prevista para v0.2).
- Modificación automática de tokens de jugadores o sus fichas.
- Reimplementación de pathfinding, regiones, puertas y patrullas de Patrol.
- Compatibilidad con otros sistemas distintos de `dnd5e` en esta primera versión.

## 3. Modos de control y autorizaciones

### `AUTO`

Patrol sigue gestionando los desplazamientos ordinarios. El motor de decisiones procesa los eventos y ejecuta reacciones permitidas. Las acciones de riesgo necesitan aprobación del DM según la política configurada.

### `DM`

El DM toma control **exclusivo** del PNJ: se suspenden nuevas decisiones automáticas, tareas programadas, persecuciones propias y, de manera segura, la patrulla automática de ese token. Los eventos de detección pueden seguir notificándose al DM, pero nunca desencadenan acciones autónomas. El estado y el último objetivo se conservan para consulta.

### Políticas de autorización, independientes del modo

- `ALWAYS`: todas las reacciones requieren autorización previa.
- `RISKY_ONLY` (por defecto): observar e investigar pueden ser automáticos; iniciar combate, aplicar efectos a terceros, modificar puertas u otros documentos y cualquier acción irreversible requieren autorización.
- `NONE`: solo para acciones de bajo riesgo; **no** elimina la exigencia de confirmación del DM para combate o consecuencias irreversibles en el MVP.

Al pulsar **Tomar control**, aplicar la transición atómicamente: incrementar generación de tareas, invalidar acciones pendientes, suspender la actividad externa compatible, confirmar el estado `DM` y actualizar la UI. Ninguna devolución posterior de un callback anterior puede ordenar otro movimiento. **Devolver a IA** reevalúa el estado actual y permite volver a patrullar según la situación actual, sin teletransporte.

**Reglas de prioridad:** DM > pausa global / combate > autorización pendiente > decisión autónoma > patrulla. Las detenciones por pausa o combate no se pueden eludir con un cambio de modo.

## 4. Modelo de estados

Separar **modo de control** (`AUTO`/`DM`) del **estado conductual**. Mantener por token:

| Estado | Significado | Transiciones principales |
|---|---|---|
| `PATROLLING` | Desplazamiento ordinario con Patrol | a `SUSPICIOUS` al recibir detección inicial |
| `SUSPICIOUS` | Ha visto indicios, sin identificar la intención | a `INVESTIGATING`, `ALERTED` o `PATROLLING` |
| `INVESTIGATING` | Examina último punto conocido | a `ALERTED` si confirma, a `PATROLLING` al agotarse |
| `ALERTED` | Reconoce una presencia que requiere respuesta | a `INTERACTING`, `PURSUING`, `FLEEING` o `PATROLLING` |
| `INTERACTING` | Advertencia o interacción guiada | a `PATROLLING`, `PURSUING` o `ALERTED` |
| `PURSUING` | Persigue a un objetivo mientras sea válido | a `INVESTIGATING`, `INTERACTING` o `PATROLLING` |
| `FLEEING` | Se retira de una amenaza | a `PATROLLING` o espera al DM |
| `COMBAT` | Participa en combate; control automático suspendido | a revisión del DM o reanudación segura al terminar |

`DM` **no** es un estado conductual: es un modo que interrumpe los efectos autónomos sin destruir el estado. Los nombres de Patrol `Suspicious`, `Alerted` y `Spotted` son eventos/etapas del módulo externo; normalizarlos, no tratarlos como idénticos a los estados propios. `Spotted` no significa ataque, combate ni hostilidad.

**Máquina de estados:** validar transiciones permitidas, registrar el motivo, limitar reentradas y descartar eventos obsoletos. Si el objetivo desaparece, pierde visibilidad o cambia de escena, cancelar la reacción correspondiente y pasar a un estado seguro.

## 5. Detección y habilidades de D&D5e

1. Patrol es la fuente de eventos de visión y de sus etapas de sospecha/alerta. No realizar un segundo sistema de visibilidad incompatible.
2. Un personaje **claramente visible** no debe quedar oculto por una simple comparación de Percepción y Sigilo.
3. Cuando las reglas de Sigilo sean aplicables, comparar las puntuaciones de manera configurada (por ejemplo, Percepción pasiva frente al resultado de Sigilo conocido), sin generar tiradas repetitivas ni revelar información oculta a los jugadores.
4. Considerar condiciones, ocultación, distancia, región, línea de visión, facción, relaciones y actitud; los primeros cuatro solo si la API pública proporciona información fiable.
5. Adaptador `dnd5e-adapter`: lectura segura de Inteligencia (`int`), Sabiduría (`wis`), Percepción (`prc`), Perspicacia (`ins`), Investigación (`inv`) y Sigilo (`ste`). **Codex debe inspeccionar el modelo real de D&D5e 6.0.6 instalado antes de fijar las rutas de datos de valores pasivos, bonificadores y tiradas. Si el checkout local sigue en 6.0.5, no tomarlo como prueba suficiente de la API 6.0.6.**
6. La Inteligencia influye en estrategias y capacidad para elegir alternativas según un perfil configurable; evitar umbrales universales inventados presentados como reglas oficiales. Inteligencia y comportamiento son reglas del módulo, no del SRD.
7. Si una característica no existe o es inválida, registrar advertencia de desarrollo, recurrir a un comportamiento seguro (`notifyDM`) y no romper Patrol.

## 6. Motor de decisiones

La entrada del motor debe ser una instantánea normalizada (`DetectionContext`) que contenga referencias de escena, PNJ y objetivo, evento externo, visibilidad confirmada, relación/facción, estado actual, datos D&D5e, perfil, tiempo y generación del control. La salida es **una propuesta** (`Decision`) y no modifica directamente documentos.

Ejemplo conceptual de contrato (no es una API verificada):

```js
/**
 * mode: 'AUTO' | 'DM'
 * behaviorState: 'PATROLLING' | 'SUSPICIOUS' | 'INVESTIGATING' |
 *                'ALERTED' | 'INTERACTING' | 'PURSUING' | 'FLEEING' | 'COMBAT'
 * decision: { action, targetUuid, reason, requiresApproval, generation }
 */
```

Proceso:

1. Deducir si el evento es válido y el objetivo es un token de personaje jugador que Patrol puede detectar.
2. Comprobar bloqueo de control `DM`, pausa, combate, objetivo obsoleto y cooldown.
3. Clasificar relación: `ALLY`, `NEUTRAL`, `UNKNOWN`, `HOSTILE`; valor por defecto `UNKNOWN`, nunca `HOSTILE` por defecto.
4. Aplicar perfil del PNJ y habilidades relevantes; proponer una reacción con una razón trazable.
5. Verificar permisos, restricciones de movimiento y política de autorización.
6. Ejecutar mediante `ActionExecutor` solo si la generación sigue vigente y el DM no ha intervenido.
7. Si no puede ejecutarse de forma segura, enviar una propuesta al DM; nunca forzar una acción ni desbloquear Patrol con métodos privados.

### Perfiles predeterminados

| Perfil | Encuentro neutral | Sospecha | Amenaza confirmada |
|---|---|---|---|
| `GUARD` | observar / advertir | investigar | alertar al DM / perseguir autorizado |
| `CIVILIAN` | observar / saludar | observar / pedir ayuda | huir / informar al DM |
| `ANIMAL` | observar / ignorar | acercarse o retirarse | huir / defensa propuesta al DM |
| `HOSTILE` | observar | investigar | perseguir / proponer combate al DM |

Las preferencias son **valores por defecto editables**, no órdenes absolutas. Los perfiles no sustituyen las reglas de visibilidad ni los permisos de Foundry.

### Cooldowns

- Deduplicar sucesos repetidos por clave `(sceneUuid, spotterUuid, spottedUuid, stage)`.
- Enfriamiento por interacción; no inundar notificaciones si el objetivo permanece visible.
- Solo una acción activa de la IA por token.
- Cancelación por `generation`/`AbortController` o mecanismo equivalente seguro ante cambio de modo/escena.

## 7. Integración con Patrol

**API de extensión publicada en su wiki:**

```js
Hooks.on('prePatrolSuspicious', (spotter, spotted) => { /* boolean */ });
Hooks.on('patrolSuspicious', (spotter, spotted) => {});
Hooks.on('prePatrolAlerted', (spotter, spotted) => { /* boolean */ });
Hooks.on('patrolAlerted', (spotter, spotted) => {});
Hooks.on('prePatrolSpotted', (spotter, spotted) => { /* boolean */ });
Hooks.on('patrolSpotted', (spotter, spotted) => {});
```

En los `pre...`, devolver `false` cancela una transición de Patrol. **No hacerlo de forma indiscriminada:** puede desactivar sospecha o detección de otros módulos. Los seis hooks solo prueban que se puede observar o bloquear determinadas transiciones; **no prueban que exista una API pública para suspender por token todas las rutas de Patrol**.

**Prueba de concepto obligatoria (bloqueo técnico antes de implementar el MVP):**

- Identificar la versión efectiva de Patrol instalada y su identificador (`patrol`). No deducir la API de la rama `main` del repositorio si no corresponde al paquete instalado; se ha observado una versión distinta en el manifiesto público de esa rama.
- Inspeccionar el tipo real de `spotter` y `spotted`, y los hooks emitidos en la ejecución real.
- Verificar si existe una API pública documentada para detener/reanudar **un** token conservando las patrullas de otros tokens.
- Verificar que se puede tomar control incluso mientras Patrol está sospechando, persiguiendo, animando un movimiento o a punto de pausar el juego.
- Comprobar la interacción con `Patrol - Undetectable`, pausa global, selección de token, combate y cambio de escena.
- Documentar el resultado en `docs/INTEGRATION-RESEARCH.md`. Si falta una API de suspensión por token, **no usar propiedades privadas ni parches frágiles**: registrar el bloqueo y proponer un mecanismo verificable de compatibilidad o una aportación upstream antes de prometer control manual completo.

La documentación de Patrol afirma que los tokens seleccionados no patrullan, y que autopatrulla no funciona con combate activo ni partida pausada. **La selección del token no constituye un mecanismo aceptable de suspensión persistente.**

Para desplazamientos iniciados por nuestro módulo (solo si son necesarios), estudiar `TokenDocument.move()` y los mecanismos de movimiento/pausa de Foundry VTT 14; validar restricciones, paredes, propiedad y efectos sobre Patrol. No duplicar pathfinding de Patrol.

## 8. Interfaz del DM

### Configuración por token

- Habilitar/deshabilitar Patrol Intelligence.
- Modo `AUTO`/`DM`.
- Perfil y actitud/facción.
- Detección: `PATROL_DEFAULT` / `STEALTH_WHEN_APPLICABLE` (por defecto); no redefinir arbitrariamente la visión.
- Política de autorización (`RISKY_ONLY` por defecto).
- Acciones automáticas permitidas (casillas individuales).
- Cooldown y opción de depuración.

### Acceso rápido

- Control en HUD del token o en una ventana compatible con Foundry 14: **Tomar control / Devolver a IA**.
- Panel del DM: nombre del PNJ, objetivo, motivo de detección, estado, acción sugerida, botones **Aprobar**, **Rechazar**, **Tomar control**.
- La notificación no debe mostrar datos secretos a clientes jugadores.
- Si no existe DM autorizado conectado, no iniciar acciones que requieran aprobación ni ceder control a un usuario jugador.

La integración exacta con el HUD debe verificarse en v14 y evitar modificar directamente plantillas internas de Foundry.

## 9. Datos y persistencia

Persistir solo configuración y modo por `TokenDocument` mediante flags con ámbito `patrol-intelligence`; para unlinked tokens, no confundir cambios por token con datos de Actor. Valores sugeridos:

```json
{
  "enabled": false,
  "mode": "DM",
  "profile": "GUARD",
  "approvalPolicy": "RISKY_ONLY",
  "detectionPolicy": "STEALTH_WHEN_APPLICABLE",
  "faction": "",
  "attitude": "UNKNOWN",
  "cooldownMs": 5000,
  "actions": ["OBSERVE", "INVESTIGATE", "WARN", "NOTIFY_DM"]
}
```

Los valores son un **esquema propuesto**, no una estructura nativa de Foundry. Configuración inicial segura: **deshabilitado** y `DM`; requiere activación explícita de cada PNJ. Guardar estados temporales/colas/último avistamiento preferentemente en memoria; al recargar escena, inicializar sin acciones pendientes obsoletas.

## 10. Autoridad, permisos y concurrencia

- Exactamente **un** cliente DM autorizado como ejecutor por mundo/escena; definir elección y relevo en caso de desconexión.
- Las solicitudes de clientes no son órdenes confiables: validar identidad, permisos, escena, token, versión/generación y autorización en el ejecutor.
- No ejecutar reacciones en todos los clientes ante el mismo hook.
- Cambiar de modo debe invalidar tareas anteriores **antes** de mostrar éxito al DM.
- Evitar carreras entre Patrol, ejecución propia, cambios manuales del DM y cierre de escena.
- Ningún resultado del motor debe iniciar combate, alterar recursos, descubrir secretos, tocar tokens jugadores o aplicar daños automáticamente en el MVP.
- Si no es posible obtener un único ejecutor fiable, degradar a modo `DM` de solo notificación.

## 11. Estructura sugerida

```text
patrol-intelligence/
├── module.json
├── scripts/
│   ├── main.mjs
│   ├── integrations/patrol-adapter.mjs
│   ├── integrations/dnd5e-adapter.mjs
│   ├── engine/state-machine.mjs
│   ├── engine/decision-engine.mjs
│   ├── engine/behavior-profiles.mjs
│   ├── engine/action-executor.mjs
│   ├── control/control-manager.mjs
│   ├── control/authority-manager.mjs
│   ├── ui/token-controls.mjs
│   └── ui/gm-panel.mjs
├── styles/
├── templates/
├── lang/en.json
├── lang/es.json
├── docs/INTEGRATION-RESEARCH.md
├── docs/ARCHITECTURE.md
├── docs/TEST-PLAN.md
└── tests/
```

ES modules, separación estricta entre adaptadores, lógica pura y efectos. Dependencia declarada de `patrol` y requisito de sistema `dnd5e` según sintaxis confirmada del manifiesto v14. Versionar las flags si evoluciona su esquema.

## 12. Plan incremental para Codex (optimizar consumo de contexto)

**Fase 0 — Investigación, SIN modificar código:** analizar el entorno local real de Foundry 14, Patrol y **D&D5e 6.0.6 (versión declarada por el usuario; verificar en ejecución)**; documentar tipos de hooks, estructura de datos, pausa/reanudación por token, autoridad y riesgos. Entregar tabla de compatibilidad `confirmado / no confirmado / bloqueado`, pruebas reproducibles y decisión `GO / NO-GO` sobre el control manual completo. No inventar APIs ni dar por supuesto el funcionamiento.

**Fase 1 — Esqueleto:** manifiesto, registro de hooks, settings, adaptadores y logging sin cambios de comportamiento.

**Fase 2 — Motor puro:** estados, perfiles, contexto, decisión, cooldown, cancelación y pruebas unitarias.

**Fase 3 — Control DM:** flags, bloqueo de tareas, parada y devolución a Patrol **solo tras superar Fase 0**, HUD y panel GM.

**Fase 4 — Integración funcional:** detección y reacciones de bajo riesgo con notificaciones privadas; pruebas con varios clientes.

**Fase 5 — Consolidación:** idioma `en/es`, instrucciones de instalación, pruebas y criterios de aceptación. No ampliar alcance hasta cerrar los bloqueos.

Al acabar cada fase, entregar: archivos modificados, resultado de pruebas, riesgos abiertos y una ficha de reanudación de **máximo 10 líneas** para la siguiente sesión de Codex.

## 13. Criterios de aceptación del MVP

1. En escena con guardia activo y personaje jugador visible, la transición documentada de Patrol llega al adaptador sin errores ni duplicados.
2. El guardia `AUTO` puede ejecutar al menos una reacción segura (observar/notificar) basada en perfil y contexto.
3. Cambiar a `DM` cancela una decisión pendiente y evita cualquier reacción posterior de la IA, incluso con retrasos y notificaciones duplicadas.
4. El DM puede mover manualmente al PNJ; Patrol no reasume su control hasta que el DM lo indique **explícitamente**.
5. Al devolver el control, se reevalúan el objetivo y las condiciones actuales sin reutilizar órdenes caducadas.
6. Un jugador sin permisos no puede cambiar el modo, aprobar acciones ni recibir notificaciones privadas.
7. Dos DM conectados no provocan acciones duplicadas, y la desconexión del ejecutor se resuelve de forma segura.
8. Un token sin el módulo activado mantiene el comportamiento normal de Patrol.
9. El motor no inicia combate, no tira ataques, no revela tokens ocultos ni modifica personajes jugadores.
10. El módulo no rompe regiones, paredes, pausa global, combate ni la navegación normal de Patrol.
11. Las pruebas de máquina de estados y decisiones pasan localmente; se documentan verificaciones manuales en Foundry 14.
12. Si el control manual completo no puede hacerse con mecanismos estables, el MVP **no se declara terminado**; se explica el bloqueo y se conserva la funcionalidad segura ya implementada.

## 14. Fuentes y referencias para inspección

- Patrol, wiki e integración: https://wiki.theripper93.com/free/patrol
- Patrol, versiones publicadas: https://foundryvtt.com/packages/patrol
- Repositorio público de Patrol: https://github.com/theripper93/Patrol
- Foundry 14 `TokenDocument`: https://foundryvtt.com/api/v14/classes/foundry.documents.TokenDocument.html
- Foundry 14 `TokenHUD`: https://foundryvtt.com/api/v14/classes/foundry.applications.hud.TokenHUD.html
- Desarrollo de módulos y manifiesto: https://foundryvtt.com/article/module-development/
- Sistema `dnd5e`: https://github.com/foundryvtt/dnd5e

**Precaución de versiones:** la wiki de Patrol documenta hooks públicos, pero no garantiza que todos los comportamientos necesarios para suspender/reanudar su bucle estén expuestos. Verificar siempre la versión **instalada**, no implementar contra ejemplos antiguos del proyecto.

---

## Prompt inicial para pegar en Codex

Estoy desarrollando un módulo `patrol-intelligence` para Foundry VTT 14, Patrol 5.x y **D&D5e 6.0.6 (versión actual confirmada por el usuario; verificar instalación efectiva)**. Lee esta especificación completa. **Por ahora realiza exclusivamente la Fase 0; no modifiques archivos.** Inspecciona el código y las versiones realmente instaladas, confirma el contrato de los seis hooks de Patrol y la posibilidad real de suspender/reanudar la patrulla por token con un control manual prioritario del DM; inspecciona asimismo los datos de Percepción, Inteligencia y Sigilo de D&D5e. Entrega un informe breve `GO/NO-GO`, matriz de APIs públicas verificadas, bloqueos técnicos, pruebas reproducibles y el plan mínimo de archivos para Fase 1. No inventes métodos ni modifiques módulos de terceros. Prioriza precisión, cambios pequeños y consumo reducido de contexto.
