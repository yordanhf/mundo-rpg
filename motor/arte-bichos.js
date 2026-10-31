/* =============================================================================
 * Mundo — MOTOR / arte de los bichos (enemigos). Mismo estilo que el escenario: silueta + volumen
 * (3 tonos con luz arriba-izquierda) + detalles. Ancla (0,0) en el pie; miran a la DERECHA (como el
 * guardián), así el volteo (flip) de la escena los pone de cara al héroe. Solo depende de nucleo.js.
 *   Bocetos "monos" (cabeza/ojos grandes, formas redondas); se seguirán afinando.
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ;
  const V = FZ.visual.cartoon;
  const A = (V.A = V.A || {});
  const { sh, n2 } = V;

  // ojo grande con brillo (lo comparten varios bichos)
  function ojo(x, y, r) {
    return `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(r)}" fill="#2a2320"/>` +
      `<circle cx="${n2(x + r * 0.35)}" cy="${n2(y - r * 0.4)}" r="${n2(r * 0.38)}" fill="#fff"/>`;
  }

  // La rata: cuerpo redondo, cabeza integrada con oreja grande, ojo grande, mejilla sonrojada, cola rosada.
  A.rata = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(2 * s, 2, 20 * s, 6 * s, 0.32, 3);
    a.add(`<path d="M${n2(-16 * s)},${n2(-5 * s)}C${n2(-30 * s)},${n2(-6 * s)} ${n2(-32 * s)},${n2(-18 * s)} ${n2(-24 * s)},${n2(-22 * s)}" stroke="#e8a9b0" stroke-width="${n2(2.6 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<ellipse cx="${n2(-8 * s)}" cy="0" rx="${n2(3.2 * s)}" ry="${n2(2 * s)}" fill="#d98c8c"/>`);
    const cuerpo = V.smooth([[-17 * s, -4 * s], [-19 * s, -14 * s], [-12 * s, -21 * s], [0, -23 * s], [11 * s, -21 * s], [18 * s, -15 * s], [20 * s, -9 * s], [16 * s, -3 * s], [-2 * s, -2 * s]], true, 1);
    a.volume(cuerpo, '#b0a89c', { box: [-20 * s, -23 * s, 40 * s, 21 * s], claro: 0.5, oscuro: -0.36, rimColor: '#f2ede4' });
    a.add(`<ellipse cx="${n2(5 * s)}" cy="${n2(-7 * s)}" rx="${n2(9 * s)}" ry="${n2(6 * s)}" fill="#e7e0d4" opacity=".7"/>`);
    a.add(`<circle cx="${n2(6 * s)}" cy="${n2(-20 * s)}" r="${n2(6 * s)}" fill="${sh('#b0a89c', -0.08)}"/>`);
    a.add(`<circle cx="${n2(7 * s)}" cy="${n2(-20 * s)}" r="${n2(3.4 * s)}" fill="#e3a0a6"/>`);
    a.add(`<ellipse cx="${n2(10 * s)}" cy="0" rx="${n2(3 * s)}" ry="${n2(2 * s)}" fill="#d98c8c"/>`);
    a.add(ojo(13 * s, -12 * s, 3 * s));
    a.add(`<circle cx="${n2(16.5 * s)}" cy="${n2(-8 * s)}" r="${n2(2.2 * s)}" fill="#f0b0b0" opacity=".5"/>`);
    a.add(`<circle cx="${n2(20 * s)}" cy="${n2(-8 * s)}" r="${n2(1.6 * s)}" fill="#e38ea0"/>`);
    a.add(`<g stroke="#8a8077" stroke-width="${n2(0.7 * s)}" fill="none" stroke-linecap="round"><path d="M${n2(19 * s)},${n2(-8 * s)}L${n2(29 * s)},${n2(-10 * s)}"/><path d="M${n2(19 * s)},${n2(-7 * s)}L${n2(29 * s)},${n2(-6 * s)}"/></g>`);
    return a.out(6);
  };

  // El ciervo: cuerpo redondeado, patas finas, cuello y cabeza con ojo grande, astas pequeñas, barriga y motas claras.
  A.ciervo = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(2 * s, 2, 28 * s, 7 * s, 0.33, 3);
    const pata = (x, x2) => a.add(`<path d="M${n2(x)},${n2(-16 * s)}L${n2(x2)},0" stroke="#9c6f42" stroke-width="${n2(2.6 * s)}" fill="none" stroke-linecap="round"/>`);
    pata(-11 * s, -13 * s); pata(-6 * s, -7 * s); pata(8 * s, 9 * s); pata(12 * s, 14 * s);
    a.add(`<circle cx="${n2(-15 * s)}" cy="${n2(-28 * s)}" r="${n2(3 * s)}" fill="#efe2cf"/>`);
    a.volume(V.ell(0, -26 * s, 16 * s, 10 * s), '#c08a52', { box: [-16 * s, -36 * s, 32 * s, 20 * s], claro: 0.48, oscuro: -0.36, rimColor: '#f0e2cc' });
    a.add(`<ellipse cx="${n2(2 * s)}" cy="${n2(-22 * s)}" rx="${n2(10 * s)}" ry="${n2(6 * s)}" fill="#efe2cf" opacity=".6"/>`);
    a.add(`<g fill="#efe2cf" opacity=".85"><circle cx="${n2(-4 * s)}" cy="${n2(-30 * s)}" r="${n2(1.6 * s)}"/><circle cx="${n2(4 * s)}" cy="${n2(-27 * s)}" r="${n2(1.5 * s)}"/><circle cx="${n2(-9 * s)}" cy="${n2(-25 * s)}" r="${n2(1.3 * s)}"/></g>`);
    a.add(`<path d="M${n2(11 * s)},${n2(-30 * s)}L${n2(20 * s)},${n2(-48 * s)}" stroke="#c08a52" stroke-width="${n2(7 * s)}" stroke-linecap="round"/>`);
    a.volume(V.ell(23 * s, -50 * s, 7 * s, 5.5 * s), '#c99a62', { box: [16 * s, -56 * s, 16 * s, 13 * s], claro: 0.5, oscuro: -0.34 });
    a.add(`<ellipse cx="${n2(29 * s)}" cy="${n2(-48 * s)}" rx="${n2(2.4 * s)}" ry="${n2(2 * s)}" fill="#5a4230"/>`);
    a.add(`<ellipse cx="${n2(18 * s)}" cy="${n2(-55 * s)}" rx="${n2(2.2 * s)}" ry="${n2(4 * s)}" fill="#b07a44" transform="rotate(-20 ${n2(18 * s)} ${n2(-55 * s)})"/>`);
    a.add(`<path d="M${n2(22 * s)},${n2(-55 * s)}l${n2(-2 * s)},${n2(-7 * s)}m${n2(2 * s)},${n2(7 * s)}l${n2(1 * s)},${n2(-4 * s)}M${n2(26 * s)},${n2(-55 * s)}l${n2(2 * s)},${n2(-7 * s)}m${n2(-2 * s)},${n2(7 * s)}l${n2(-1 * s)},${n2(-4 * s)}" stroke="#e8d3a0" stroke-width="${n2(1.6 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(ojo(25 * s, -51 * s, 2.4 * s));
    return a.out(6);
  };

  // La bestia: cuerpo redondo, barriga clara, cuernos, dos ojos encendidos con ceño y colmillos.
  A.bestia = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(3 * s, 2, 32 * s, 9 * s, 0.4, 4);
    const pata = (x) => a.add(`<path d="M${n2(x)},0L${n2(x)},${n2(-10 * s)}" stroke="#3f3647" stroke-width="${n2(6 * s)}" stroke-linecap="round"/>`);
    pata(-13 * s); pata(-5 * s); pata(6 * s); pata(14 * s);
    a.volume(V.ell(0, -20 * s, 19 * s, 14 * s), '#5f5366', { box: [-19 * s, -34 * s, 38 * s, 28 * s], claro: 0.42, oscuro: -0.4, rimColor: '#c3b4d2' });
    a.add(`<ellipse cx="0" cy="${n2(-13 * s)}" rx="${n2(11 * s)}" ry="${n2(7 * s)}" fill="#7a6d84" opacity=".55"/>`);
    a.add(`<path d="M${n2(-9 * s)},${n2(-31 * s)}l${n2(-3 * s)},${n2(-8 * s)}M${n2(9 * s)},${n2(-31 * s)}l${n2(3 * s)},${n2(-8 * s)}" stroke="#d9cfe0" stroke-width="${n2(3 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<circle cx="${n2(-6 * s)}" cy="${n2(-22 * s)}" r="${n2(3.4 * s)}" fill="#fff6c0"/><circle cx="${n2(6 * s)}" cy="${n2(-22 * s)}" r="${n2(3.4 * s)}" fill="#fff6c0"/>`);
    a.add(`<circle cx="${n2(-5.2 * s)}" cy="${n2(-21.5 * s)}" r="${n2(1.6 * s)}" fill="#d14b2a"/><circle cx="${n2(6.8 * s)}" cy="${n2(-21.5 * s)}" r="${n2(1.6 * s)}" fill="#d14b2a"/>`);
    a.add(`<path d="M${n2(-11 * s)},${n2(-27 * s)}l${n2(7 * s)},${n2(2 * s)}M${n2(11 * s)},${n2(-27 * s)}l${n2(-7 * s)},${n2(2 * s)}" stroke="#2c2533" stroke-width="${n2(2 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<path d="M${n2(-6 * s)},${n2(-12 * s)}Q0,${n2(-8 * s)} ${n2(6 * s)},${n2(-12 * s)}" stroke="#2c2533" stroke-width="${n2(1.8 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<path d="M${n2(-4 * s)},${n2(-11 * s)}l${n2(1.5 * s)},${n2(4 * s)}l${n2(1.5 * s)},${n2(-4 * s)}ZM${n2(3 * s)},${n2(-11 * s)}l${n2(1.5 * s)},${n2(4 * s)}l${n2(1.5 * s)},${n2(-4 * s)}Z" fill="#fff"/>`);
    return a.out(6);
  };

  // La serpiente: bucle en el suelo, se alza a la derecha, cabeza redonda con ojo grande y lengua bífida.
  A.serpiente = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(0, 2, 26 * s, 6 * s, 0.3, 3);
    const d = `M${n2(-24 * s)},${n2(-3 * s)}C${n2(-30 * s)},${n2(-10 * s)} ${n2(-20 * s)},${n2(-16 * s)} ${n2(-12 * s)},${n2(-11 * s)}C${n2(-4 * s)},${n2(-7 * s)} ${n2(-6 * s)},0 ${n2(2 * s)},${n2(-3 * s)}C${n2(12 * s)},${n2(-7 * s)} ${n2(10 * s)},${n2(-24 * s)} ${n2(20 * s)},${n2(-30 * s)}`;
    a.add(`<path d="${d}" stroke="#2f6e36" stroke-width="${n2(9 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<path d="${d}" stroke="#5bbf4e" stroke-width="${n2(5 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<g fill="#bfe8a0"><circle cx="${n2(-18 * s)}" cy="${n2(-12 * s)}" r="${n2(1.2 * s)}"/><circle cx="${n2(-6 * s)}" cy="${n2(-6 * s)}" r="${n2(1.2 * s)}"/><circle cx="${n2(6 * s)}" cy="${n2(-12 * s)}" r="${n2(1.2 * s)}"/></g>`);
    a.volume(V.ell(21 * s, -32 * s, 6.5 * s, 5.5 * s), '#49933e', { box: [14 * s, -38 * s, 15 * s, 13 * s], claro: 0.5, oscuro: -0.34, rimColor: '#dff3cf' });
    a.add(ojo(23 * s, -33 * s, 2.2 * s));
    a.add(`<path d="M${n2(27 * s)},${n2(-31 * s)}l${n2(7 * s)},${n2(-1 * s)}m${n2(-7 * s)},${n2(1 * s)}l${n2(7 * s)},${n2(2 * s)}" stroke="#e23b5a" stroke-width="${n2(1 * s)}" fill="none" stroke-linecap="round"/>`);
    return a.out(6);
  };

  // El murciélago: cuerpo redondo peludo, orejas grandes, ojos grandes, alas festoneadas; vuela un poco.
  A.murcielago = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(0, 3, 18 * s, 5 * s, 0.28, 3);
    const cy = -24 * s;
    const ala = (dir) => `M0,${n2(cy + s)}C${n2(dir * 8 * s)},${n2(cy - 7 * s)} ${n2(dir * 20 * s)},${n2(cy - 7 * s)} ${n2(dir * 27 * s)},${n2(cy + s)}C${n2(dir * 22 * s)},${n2(cy)} ${n2(dir * 21 * s)},${n2(cy + 5 * s)} ${n2(dir * 16 * s)},${n2(cy + 4 * s)}C${n2(dir * 15 * s)},${n2(cy + 7 * s)} ${n2(dir * 12 * s)},${n2(cy + 6 * s)} ${n2(dir * 9 * s)},${n2(cy + 8 * s)}C${n2(dir * 8 * s)},${n2(cy + 4 * s)} ${n2(dir * 5 * s)},${n2(cy + 3 * s)} ${n2(dir * 2 * s)},${n2(cy + 3 * s)}Z`;
    a.add(`<path d="${ala(-1)}" fill="#50456b"/><path d="${ala(1)}" fill="#5d5178"/>`);
    a.volume(V.ell(0, cy, 7 * s, 7.5 * s), '#6a5d82', { box: [-8 * s, cy - 9 * s, 16 * s, 17 * s], claro: 0.46, oscuro: -0.38, rimColor: '#d6cae8' });
    a.add(`<path d="M${n2(-4 * s)},${n2(cy - 5 * s)}Q${n2(-8 * s)},${n2(cy - 15 * s)} ${n2(-2 * s)},${n2(cy - 9 * s)}ZM${n2(4 * s)},${n2(cy - 5 * s)}Q${n2(8 * s)},${n2(cy - 15 * s)} ${n2(2 * s)},${n2(cy - 9 * s)}Z" fill="#50456b"/>`);
    a.add(`<circle cx="${n2(-2.6 * s)}" cy="${n2(cy - s)}" r="${n2(2 * s)}" fill="#fff"/><circle cx="${n2(2.6 * s)}" cy="${n2(cy - s)}" r="${n2(2 * s)}" fill="#fff"/>`);
    a.add(`<circle cx="${n2(-2.3 * s)}" cy="${n2(cy - 0.6 * s)}" r="${n2(s)}" fill="#2a2320"/><circle cx="${n2(2.9 * s)}" cy="${n2(cy - 0.6 * s)}" r="${n2(s)}" fill="#2a2320"/>`);
    a.add(`<path d="M${n2(-1.5 * s)},${n2(cy + 5 * s)}l${n2(0.8 * s)},${n2(2 * s)}l${n2(0.8 * s)},${n2(-2 * s)}ZM${n2(0.8 * s)},${n2(cy + 5 * s)}l${n2(0.8 * s)},${n2(2 * s)}l${n2(0.8 * s)},${n2(-2 * s)}Z" fill="#fff"/>`);
    return a.out(6);
  };

  // El botín en el suelo: un saquito de cuero atado (marcador de loot recogible).
  A.botin = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(1 * s, 1, 11 * s, 4 * s, 0.32, 2);
    a.volume(V.smooth([[-7 * s, 0], [-8 * s, -7 * s], [-4 * s, -12 * s], [4 * s, -12 * s], [8 * s, -7 * s], [7 * s, 0]], true, 1), '#9c6b3f',
      { box: [-9 * s, -13 * s, 18 * s, 13 * s], claro: 0.5, oscuro: -0.4, rimColor: '#ffe0b0' });
    a.add(`<path d="M${n2(-4 * s)},${n2(-11 * s)}Q0,${n2(-14 * s)} ${n2(4 * s)},${n2(-11 * s)}" stroke="#5f4124" stroke-width="${n2(2 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<circle cx="0" cy="${n2(-6 * s)}" r="${n2(1.6 * s)}" fill="#ffd23f"/>`);
    return a.out(4);
  };
})(typeof window !== 'undefined' ? window : globalThis);
