# PLAN — Mundo (RPG isométrico con gráficos)

Hoja de ruta para convertir `mundo` en un RPG completo, **copiando el diseño del MUD del autor**
(`C:\Repos\rpg-gr`, C#/.NET) y poniéndole encima el motor visual isométrico de `motor/`. Meta:
que el juego sea *prácticamente igual que ese MUD, pero con gráficos*.

> Estado: **documento de diseño**. No se implementa nada hasta que el autor lo pida, fase a fase.

---

## El MUD de referencia (`C:\Repos\rpg-gr`)

Prototipo de consola en **C# / .NET 9**, remake de un MUD web de El Señor de los Anillos
(ASP.NET Core + SignalR), pensado para llevarse a Unity. Tres proyectos:
- **`src/Combat`** — motor de combate en C# puro, sin dependencias de UI: `CombatEngine`,
  `Combatant`, `AttackResolver`, `Weapon`, `Armor`, `Backpack`, `BodySlot`, `Skill`, `StatType`,
  `Leveling`, `Training`, `Profession`, `Race`, `CombatConstants`, RNG inyectable con semilla.
- **`src/World`** — mundo como **grafo de habitaciones agrupadas en áreas**, estado del mundo
  (NPCs por sala, respawn), cadáveres, guardado de personaje. **Es casi idéntico al modelo
  "áreas + salas" que ya tiene `mundo` en `index.html`.**
- **`src/ConsoleProto`** — UI de consola (comandos `kill`, `look`, movimiento, `buy`/`sell`,
  `train`, `repair`…), carga de datos JSON, guardado en `%APPDATA%\RpgGr\saves`.

Su propio `CLAUDE.md` (52 KB) documenta cada decisión. Lo relevante está condensado abajo.

### Filosofía del port (MUD C# → `mundo` JS)
- **Se reimplementa el diseño en JS, no se comparte código** (son lenguajes distintos). Las fórmulas
  son matemáticas puras → se copian literalmente.
- **Motor de combate = JS puro, autoritativo en el servidor** (Node, Fase 0), igual que el MUD lo
  tiene aislado de la UI y que `ranchegame` pone la lógica en el servidor. Testeable y simulable con
  RNG de semilla, como el `simulate` del MUD.
- **La capa gráfica reemplaza a la consola**: en vez de teclear `kill rata` y leer emotes, te
  acercas/haces clic y ves la animación (las poses `espada1/2`, `caido`, `victoria` ya están
  dibujadas) + texto flotante de daño/emote. El combate por **rondas** se mantiene; solo se visualiza.
- **Idioma:** el MUD tiene el contenido en inglés; `mundo` va **todo en español** (ver `CLAUDE.md`).
  Al portar, los nombres de ítems/comandos/emotes se traducen (Knife→Cuchillo, etc.). ← *decisión a
  confirmar; ver "Decisiones abiertas".*
- **Mejora posible sobre el MUD:** el MUD **no persiste el equipo** (porque `quit` mata el proceso y
  todo el mundo en memoria). `mundo`, con servidor + SQLite persistente, **sí puede** persistir el
  equipo e incluso los ítems tirados en el suelo. ← *decisión a confirmar.*

---

## Correspondencia de sistemas (MUD → juego gráfico)

| Sistema del MUD | En `mundo` |
|---|---|
| `src/Combat` (motor C# puro) | `servidor/combate.js` (JS puro, autoritativo, RNG con semilla) |
| `AttackResolver` (fórmulas) | se copian tal cual (ver "Fórmulas") |
| `src/World` grafo áreas/salas | **ya existe** el modelo áreas+salas en `index.html`; se extiende |
| NPCs por sala + respawn tick | estado de NPCs en el servidor; tick de reaparición |
| `ConsoleProto` comandos/emotes | cliente gráfico: acercarse/clic + animaciones + texto flotante |
| `BodySlot` (Head/Torso/Arms/Legs/Feet/Shield) | ranuras visuales del guardián (ver tabla abajo) |
| `Weapon`/`Armor` (stats + durabilidad) | ítems con `apariencia`→id del catálogo visual + atributos |
| `JsonCharacterStore` → (futuro EF Core/SQL) | **Node + SQLite** (Fase 0) |
| Shop/Healer/Trainer/Blacksmith/TrashCan | NPCs-estación del **pueblo** (Fase 4-5) |
| Millford (el pueblo del MUD) | el pueblo nuevo de `mundo` (mismas estaciones y salas) |

### Ranuras: slots del MUD ↔ aspecto del guardián
El MUD tiene **6 slots de armadura**; el dibujo del guardián ya se compone por ranuras. Mapa:

| Slot MUD (`BodySlot`) | Ranura visual (`arte-personaje.js`) |
|---|---|
| Head | `cab` (capucha / yelmo / penacho / alas / tiara) |
| Torso | `pecho` (chaleco / sobreveste / placa) |
| Arms | `hombro` (+ manga/guante) |
| Legs | pierna/pantalón *(hoy solo color → convertir en ranura)* |
| Feet | bota *(hoy solo color → convertir en ranura)* |
| Shield | `escudo` (broquel) |
| (arma) `Weapon` | `arma` (espada) |
| — sin slot MUD — | `capa`, `malla` → **cosméticos** (sin stats), o ranuras extra opcionales |

Una pieza puede cubrir **varios slots** (ej. "pantalón con botas" = Legs+Feet). El **escudo cuesta
una mano** aunque esté equipado.

---

## Datos del MUD (DECIDIDOS, confirmados en el código)

### Stats, skills y atributos
- **5 stats** (base 0-100, hasta 125 con buffs): `Strength`, `Coordination` (ofensivos),
  `Constitution`, `Agility` (defensivos), e `Intelligence` (NO interviene en combate; para
  habilidades de profesión).
- **4 skills** (0-100/125), arrancan en 0 y se entrenan: `Aim`, `Attack` (of.), `Defense`, `Dodge` (def.).
- **Arma:** `Hit` (0-100, acierto), `Damage` (0-100, daño no crítico), `CritChanceBonus` (fracción
  pequeña 0.1-0.5%), `CritPower` (0-100, dónde cae dentro del rango crítico 31-50).
- **Armadura (por pieza):** `Absorb` (lado daño, se suma a Constitution+Defense) y `Deflect` (lado
  acierto, se suma a Agility+Dodge). Sumando todas las piezas: cada bolsa tope **100** (125 duro).
- **Razas** (bonos % solo a stats, nunca a skills; cada una suma 0): human +5 Coord/−5 Int ·
  dwarf +10 Con +10 Str/−10 Int −5 Coord −5 Agi · elf +5 Agi +10 Int/−10 Con −5 Str ·
  orc +10 Str +5 Con/−10 Int −5 Coord · creature — (NPCs).

### Fórmulas (copiar literalmente — `AttackResolver.cs` / `CombatConstants.cs`)
```
// ACIERTO
offenseAcc = Coordination + Aim + weapon.Hit            (atacante)
defenseAcc = Agility + Dodge + armor.TotalDeflect       (defensor)
hitChance  = offenseAcc / (offenseAcc + defenseAcc)     // 0.5 si empatan; miss si falla

// CRÍTICO (si acertó)
critChance = clamp(0.005 + weapon.CritChanceBonus, 0, 1)   // 0.5% base

// DAÑO NO CRÍTICO → siempre 1..30
REF        = 300                                        // 100 Str + 100 Attack + 100 weapon.Damage
offenseDmg = Strength + Attack + weapon.Damage
defenseDmg = Constitution + Defense + armor.TotalAbsorb
potential  = clamp(offenseDmg / REF * 30, 1, 30)        // techo del atacante, sin mirar al rival
mitigation = defenseDmg / (defenseDmg + REF)            // el rival recorta una fracción del techo
raw        = potential * (1 - mitigation)
// jitter: 15% "flojo" U*0.8 · 5% "fuerte" 1.2+U*0.4 · 80% normal 0.8+U*0.4
damage     = clamp(round(raw * jitter), 1, 30)

// DAÑO CRÍTICO → siempre 31..50
critPos      = clamp(weapon.CritPower / 100, 0, 1)
effectivePos = (U < 0.10) ? U : clamp(critPos + (U-0.5)*0.3, 0, 1)   // 10% ignora el arma
damage       = 31 + round(effectivePos * 19)

// NIVELES (por rango fijo de daño)
Graze 1-3 · Hit 4-7 · Hit Hard 8-10 · Hit Very Hard 11-14 · Massive 15-19 · Massacre 20-30 · Crítico 31-50
```

### Combate (reglas)
- Rondas **automáticas**; cada turno 1 s, ronda (ambos actúan) 2 s. Empieza con atacar; **iniciativa
  fija** de quien inicia. El motor expone `turno1/turno2/ronda`; el tiempo lo marca el que llama.
- **Caído/sangrado:** HP ≤ 0 pero > −15 → sangra (no muere); 10 rondas para desangrarse; vendar
  (`bandage`) cura 10% del HP máx y detiene el combate. HP ≤ −15 → muerte instantánea.
- **Huida** sin penalización: completa la ronda en curso y sale.
- **Durabilidad:** cada golpe que conecta gasta −1 al arma del atacante y −1 a **cada** pieza de
  armadura del defensor. Máx **1000** (configurable por ítem). A 0 el ítem funciona pero sus stats
  leen 0. **Reparación una sola vez** en el herrero: coste = `Value × 0.5 × (faltante/máx)`, mín 1.

### Economía y progresión
- **Moneda única: oro.** Comprar = 100% del `Value`; vender a tienda = **25%** (mín 1, tope 50).
- **Sanador:** 10 oro → +20 HP **y** +20 MP (dosis fija); capacidad 200/tick (10 min).
- **Regeneración pasiva:** +1 HP y +1 MP cada 30 s (solo jugador; se pausa si está caído).
- **Experiencia:** cada golpe que conecta da XP = daño; matar da bono = HP máx del objetivo (≈2× HP
  en total). Nivel 2 = 500 XP, cada siguiente ×1.33.
- **Subir de nivel** exige XP **y** promedio de los 5 stats base ≥ `15 + 5×nivel` (nivel 2 = 25);
  es manual, en el **entrenador**, 1 nivel por vez. **Muros** en niveles 5/10/15/20 (tarea especial,
  sin implementar aún).
- **Entrenamiento** de stats/skills: oro por punto, brackets de 10 (10, 13, 18, 24, 31, 42, 55, 74,
  98, 130 oro/punto). Tope por nivel = `30 + 5×nivel`.
- **Profesión:** por ahora solo da el **título** por nivel; todos `civilian`.

### Inventario
- **Bulk fraccionario** (2 = a dos manos/pieza grande, 1 = normal, ½/¼ = cosas pequeñas). En la mano
  todo ocupa **mínimo 1 bulk**; el apilado fraccionario solo pasa dentro de la mochila.
- **Manos:** pool de 2 bulk; un arma empuñada a la vez. **Funda** gratis para armas reales.
- **Mochila:** se compra (no se nace con ella); una sola; capacidad propia (inicial 2).
- Armadura sin equipar se lleva en la mano (≥1 bulk) hasta ponerla o guardarla.

### Catálogo inicial (nombres a traducir al español; stats tal cual del MUD)
**Armas** (`Hit / Damage / CritChanceBonus / CritPower`, bulk, valor oro, durabilidad):
| Ítem (ES / MUD) | Hit | Dmg | CritCh | CritPow | Bulk | Oro | Dur |
|---|---|---|---|---|---|---|---|
| Cuchillo / Knife | 8 | 6 | 0.001 | 10 | 1 | 8 | 400 |
| Daga / Dagger | 7 | 7 | 0.002 | 15 | 1 | 10 | 500 |
| Espada corta / Short Sword | 10 | 10 | 0.001 | 12 | 1 | 15 | 750 |

**Armadura** (`Absorb / Deflect`, slot, bulk, valor, durabilidad) — set "cuero rústico":
| Ítem (ES / MUD) | Abs | Def | Slot | Bulk | Oro | Dur |
|---|---|---|---|---|---|---|
| Gorro de cuero rústico / Rustic Leather Cap | 3 | 2 | Head | 0.5 | 4 | 200 |
| Chaleco de cuero rústico / Vest | 6 | 3 | Torso | 1 | 8 | 400 |
| Brazales de cuero rústico / Bracers | 3 | 2 | Arms | 0.5 | 4 | 200 |
| Grebas de cuero rústico / Leggings | 4 | 2 | Legs | 0.5 | 5 | 250 |
| Botas de cuero rústico / Boots | 2 | 2 | Feet | 0.5 | 3 | 150 |
| Escudo de madera / Wooden Shield | 3 | 4 | Shield | 1 | 6 | 300 |

Set de 5 piezas (sin escudo): 18 Absorb / 11 Deflect (bajo a propósito). Mochila inicial:
**Petate del viajero** (capacidad 2, 10 oro).

**Jugador nivel 1 (human):** 20 en los 5 stats, 0 en las 4 skills, 50 HP, 50 MP, **Puños** (Fists),
sin armadura. **NPCs:** rata (stats 5, 25 HP, suelta "piel de rata" bulk 0.25 / 8 oro),
ciervo (15, 45 HP), bestia (25, 60 HP). Skills de NPC en 0 (como el jugador).

### Mundo del MUD (Millford) → el pueblo de `mundo`
Grafo: entrada (mapa mundo) → sur → **plaza** (hub) → oeste **tienda** → oeste **forja** (herrero);
plaza → arriba **sanador**, abajo **entrenador**, sur **callejón** (rata), este **pradera** (ciervo)
→ este **matorral** (bestia). Estaciones: `Shop`, `Blacksmith`, `Healer`, `Trainer`, `TrashCan`.
El mapa solo se ve como objeto mirable en ciertas salas (nunca con un comando).

---

## Fases (incrementales)

### Fase 0 — Persistencia: Node + SQLite local
Servidor local que sirve el juego estático **y** la API; BD en `mundo.db` (al `.gitignore`).
Rol equivalente a `JsonCharacterStore`/`ICharacterStore` del MUD (que apuntaba a EF Core/SQL).
Estado del jugador: stats, HP/MP, oro, XP, nivel, posición, **y equipo/inventario** (mejora sobre el MUD).

### Fase 1 — Desacoplar el aspecto de las ranuras  ✅ HECHA (31/oct)
Refactor **solo visual** en `motor/arte-personaje.js`, verificado byte a byte (los 91 renders
13 poses × 7 rarezas salen idénticos; mezcla libre de piezas sin fallos). API nueva:
- **`A.GUARDIAN_CAT`** — catálogo de piezas por ranura (`cab`, `pecho`, `hombro`, `legs`, `feet`,
  `capa`, `arma`, `escudo`), cada pieza con su estructura (+ `color` propio opcional).
- **`A.GUARDIAN_RANURAS`** — la lista de ranuras.
- **`A.componerEquipo(sel)`** — `sel = { cab:id, pecho:id, …, escudo:id, extras:{…} }` → un EQUIPO
  (paleta + estructura). `extras` = adornos del personaje (bolsa, cicatriz, pocasPintas, correa).
- **`A.guardian(pose, equipo)`** acepta ahora un EQUIPO (objeto), además de la rareza por nombre
  (compatibilidad) y `A.GUARDIAN_OCULTO`. Mezclar piezas de distintas rarezas es libre.
- **`A.GUARDIAN_PRESETS`** — las 7 rarezas reexpresadas como selecciones sobre el catálogo.
- `legs`/`feet` ya son ranuras seleccionables (de momento solo cambian el color de pierna/bota;
  en Fase 2 podrán traer formas de pieza propias).
- Pendiente para Fase 2: que cada pieza-ítem traiga sus propios colores (hoy algunos colores
  compartidos —guarda/gema/brillo— los aporta la pieza "dueña", coordinado dentro de un preset).

### Fase 2 — Modelo de ítems y atributos (según el MUD)  🔨 EN CURSO
Hecho (primer ladrillo, `datos/items.js`, verificado en Node):
- Esquema de ítem `{ id, nombre, tipo (arma/armadura/mochila/material), apariencia→id de pieza
  visual en `A.GUARDIAN_CAT`, ranura, slots[] (BodySlot del MUD), hit/damage/critChanceBonus/
  critPower (armas), absorb/deflect (armadura), bulk, valor, durabilidadMax, natural }`.
- **Catálogo inicial en español** = el set de Millford (Puños, Cuchillo, Daga, Espada corta, set de
  cuero rústico de 6 piezas, Petate del viajero, Piel de rata) con los stats exactos del MUD.
- Puente **ítems → aspecto** (`D.equipoVisual`): parte del aspecto base del humano (free sin cicatriz,
  `D.ASPECTO_BASE`) y sustituye cada ranura equipada por la `apariencia` del ítem.
- **Totales de combate** (`D.totalesCombate`): suma Absorb/Deflect (tope 100 cada una) + stats del arma.
- La cicatriz se quitó del humano base (sigue en los presets legados `comun`/`rara`).

Pendiente en Fase 2:
- `Personaje` en JS: stats/skills, HP/MP, equipo por ranura, manos, mochila, oro, XP, nivel.
- Inventario con bulk (manos pool 2, mochila con capacidad), funda, armadura en mano; durabilidad en runtime.
- **Decisión de arte (abierta):** el set de cuero y las 3 armas reutilizan piezas visuales de la Fase 1
  como placeholder (un gorro usa la capucha marrón, las armas comparten la espada base). ¿Diseñamos
  arte propia para los ítems mundanos, o sirve el placeholder de momento?

### Fase 3 — Economía: el oro
Oro del jugador + HUD. Comprar 100% / vender 25% (mín 1, tope 50). Botín de NPCs al cadáver.

### Fase 4 — Pueblo + más pantallas
Área "pueblo" (como Millford) con sus salas y portal desde el campo, reutilizando áreas+salas de
`index.html`. Colocar las estaciones (tendero, herrero, sanador, entrenador, basura) como NPCs.

### Fase 5 — La tienda (+ herrero, sanador, entrenador)
UI de compra/venta; equipar desde inventario → aplica aspecto (Fase 1) + atributos (Fase 2).
Reparación (herrero), curación (sanador), subir de nivel/entrenar (entrenador).

### Fase 6 — Stats del personaje: vida, maná, experiencia/nivel
HP/MP/XP/nivel + HUD. Regeneración pasiva (+1/+1 cada 30 s). Niveles (XP + promedio de stats, muros
5/10/15/20). Entrenamiento con oro. Títulos por profesión.

### Fase 7 — Combate (motor portado del MUD)
`servidor/combate.js` con las fórmulas de arriba; rondas automáticas, iniciativa, acierto/crítico,
6 niveles + crítico, durabilidad, sangrado/vendaje, huida. Visualizado con las poses existentes
(`espada1/2` ataque, `caido` sangrando/KO, `victoria` al ganar) + texto flotante de daño/emote.
Recompensas: oro, XP, botín al cadáver (30 s, derechos de botín de quien peleó).

### Fase 8 — NPCs
Enemigos con IA simple + tick de respawn (10 min), diálogos, tenderos; las estaciones del pueblo.

### Fase 9 — Hechizos y habilidades (maná)
Habilidades por **profesión** (unas de combate, otras no). Se encolan y **consumen 1 turno**;
cooldown en **rondas**, no en tiempo. Coste de maná. (En el MUD, diseñado pero aún sin implementar.)

---

## Decisiones (CONFIRMADAS, 31/oct)
1. **Idioma del contenido:** **español.** Nombres de ítems/comandos/emotes traducidos (es la norma
   de `mundo`); se adaptan los nombres propios en vez de conservar el inglés del MUD.
2. **Combate:** se mantiene el **modelo por rondas** del MUD, solo que **visualizado** (no tiempo real).
3. **Persistir el equipo:** **sí**, equipo + inventario en SQLite (mejora sobre el MUD, que lo perdía).
4. **Ambientación:** se **adapta al estilo cartoon** de `mundo` — se heredan las mecánicas del MUD,
   pero el aspecto y el tono son los de `mundo` (no el tono LOTR del original).

## Qué está decidido en el MUD pero aún sin implementar allí (lo heredamos a medias)
- Leveling completo (qué "hace" subir de nivel más allá de desbloquear entrenar), tareas de los muros.
- Lista de profesiones y sus habilidades/hechizos (maná ya reservado).
- Balance final de stats/armas/armaduras (en simulación el jugador gana ~93%, pendiente de ajustar).
