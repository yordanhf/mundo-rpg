# Mundo

Prototipo de juego isométrico **independiente**. Mapa de 4 pantallas (2×2): te desplazas
por la pantalla actual con el mouse y cambias de habitación con los botones de los bordes;
al cambiar, el personaje viaja con el mapa y queda en el centro de la nueva pantalla.

Es un proyecto autónomo: todo lo que necesita está aquí. El motor se **vendorizó**
(se copió) de un proyecto isométrico previo y, de aquí en adelante, evoluciona por su cuenta.

## Cómo correrlo

Con cualquier servidor estático (el `file://` directo puede bloquear los `<script src>` de `motor/`):

```
npx serve .
```

y abrí `index.html`.

## Estructura

```
mundo/
├─ index.html          la escena: cámara de 4 pantallas, personaje y controles (lo "nuevo")
├─ motor/              el motor vendorizado (solo depende de sí mismo; nada externo)
│  ├─ nucleo.js        proyección isométrica, rng, colores, helpers SVG y constructor de arte
│  ├─ arte-escenario.js  césped/flores/rocas/arbustos/árboles (A.tufo, A.flores, A.pedra, A.arbusto, A.arvore)
│  └─ arte-personaje.js  el personaje y sus poses (A.guardiao: 'anda1' | 'anda2' | 'atento' | ...)
└─ README.md
```

Orden de carga (en `index.html`): `nucleo.js` → `arte-escenario.js` → `arte-personaje.js` → el script de la escena.

## Cómo funciona el "look"

- **Isométrico:** `nucleo.js` define `V.P(x,y,z)` (ladrillos → px de pantalla) y `V.unP` (la inversa).
- **Sprites:** el arte se genera como SVG y la escena (en `index.html`) lo rasteriza a bitmap
  por escala (caché), y los pinta en Canvas 2D ordenados por profundidad (`V.depthPx`).
- **Cámara:** zoom fijo; cada cuadrante desplaza la cámara exactamente una pantalla, así los
  4 cuadrantes son regiones distintas y solo se ve la pantalla actual.

## Qué tocar

En `index.html`:
- `SPANX`/`SPANY`, `centro()` → tamaño del mundo y los 4 cuadrantes.
- bloque "sprites" y "mundo cuadrado" → qué objetos hay y dónde (semilla fija = mundo reproducible).
- `Z` → zoom; `VEL` → velocidad al caminar.

En `motor/` está el arte; podés agregar más funciones (p. ej. más poses del personaje o
más elementos de escenario) siguiendo el mismo patrón.
