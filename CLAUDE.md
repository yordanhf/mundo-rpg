# CLAUDE.md — Mundo

Juego isométrico **independiente** (separado de `ranchegame`). Mapa de pantallas con modelo
"áreas + salas": dentro de un área te desplazas entre pantallas; a otras áreas (mazmorras,
pueblos) se entra por un portal. Ver `README.md` para la estructura y cómo crecerlo.

## Convenciones

- **Idioma: español de España (castellano peninsular).** Hablar SIEMPRE así con el usuario:
  "tú" (y "vosotros" en plural), "quieres", "puedes", "tienes que", "vale", "¿quieres que…?".
  **Evitar el voseo latinoamericano** ("vos", "tenés", "querés", "probá", "decime") y "acá/allá";
  usar "aquí/ahí/allí", "ahora", "prueba", "dime".
- **Todo en español, nada de portugués.** El motor viene de un proyecto en portugués (SolRanch),
  pero aquí TODO queda traducido: comentarios, cadenas y también los nombres de código (funciones,
  parámetros, claves). Al traer código nuevo de `ranchegame`, traducirlo entero antes de usarlo.
- **Git:** hacer `commit`/`push` SOLO cuando el usuario lo pida. Dejar los cambios sin commitear
  y ofrecer hacerlo; esperar su confirmación.

## Estructura

- `index.html` — la escena: cámara de pantallas, personaje (camina al ratón), controles.
- `motor/` — motor vendorizado (solo depende de sí mismo): `nucleo.js`, `arte-escenario.js`, `arte-personaje.js`.

## Para crecer

- Mapa más grande: subir `cols/rows` de un área en `AREAS` (en `index.html`).
- Lugar nuevo (pueblo, cueva…): añadir otra área con `crearArea({…})` y una `salida` que apunte a ella.
