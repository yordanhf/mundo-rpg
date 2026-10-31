/* =============================================================================
 * Mundo — MOTOR / arte de los bichos (enemigos). Mismo estilo que el escenario: silueta + volumen
 * (3 tonos con luz arriba-izquierda) + detalles. Ancla (0,0) en el pie; miran a la DERECHA (como el
 * guardián), así el volteo (flip) de la escena los pone de cara al héroe. Solo depende de nucleo.js.
 *   Ejemplo de referencia para hacer el ciervo y la bestia copiando el patrón.
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ;
  const V = FZ.visual.cartoon;
  const A = (V.A = V.A || {});
  const { sh, n2 } = V;

  // La rata: cuerpo bajo y alargado, hocico puntiagudo a la derecha, oreja redonda, cola larga curvada.
  A.rata = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(2 * s, 2, 22 * s, 7 * s, 0.34, 3);   // sombra de contacto
    // cola (detrás, sale del trasero y se curva hacia arriba) — primero, para que quede por detrás
    a.add(`<path d="M${n2(-19 * s)},${n2(-7 * s)}C${n2(-34 * s)},${n2(-8 * s)} ${n2(-37 * s)},${n2(-20 * s)} ${n2(-27 * s)},${n2(-24 * s)}" stroke="#c79f9f" stroke-width="${n2(2.4 * s)}" fill="none" stroke-linecap="round"/>`);
    // oreja (detrás de la cabeza): parte oscura + interior rosado
    a.add(`<ellipse cx="${n2(7 * s)}" cy="${n2(-20 * s)}" rx="${n2(5.5 * s)}" ry="${n2(6 * s)}" fill="${sh('#9a8f82', -0.14)}"/>`);
    a.add(`<ellipse cx="${n2(8 * s)}" cy="${n2(-20 * s)}" rx="${n2(3 * s)}" ry="${n2(3.4 * s)}" fill="#d98c8c"/>`);
    // patitas al ras del suelo
    for (const px of [-12 * s, 10 * s]) a.add(`<ellipse cx="${n2(px)}" cy="0" rx="${n2(3 * s)}" ry="${n2(2 * s)}" fill="#6f655b"/>`);
    // el cuerpo: silueta suave cerrada, el volumen de 3 tonos (como la piedra)
    const cuerpo = V.smooth([
      [-20 * s, -5 * s], [-23 * s, -12 * s], [-17 * s, -19 * s], [-2 * s, -21 * s],
      [11 * s, -19 * s], [19 * s, -13 * s], [22 * s, -8 * s], [15 * s, -4 * s], [-4 * s, -3.5 * s],
    ], true, 1);
    a.volume(cuerpo, '#9a8f82', { box: [-24 * s, -22 * s, 48 * s, 20 * s], claro: 0.5, oscuro: -0.4, rimColor: '#f3ece4' });
    // ojo (con brillo) y nariz rosada en la punta del hocico
    a.add(`<circle cx="${n2(15 * s)}" cy="${n2(-13 * s)}" r="${n2(1.9 * s)}" fill="#201a1a"/><circle cx="${n2(15.6 * s)}" cy="${n2(-13.7 * s)}" r="${n2(0.7 * s)}" fill="#fff"/>`);
    a.add(`<circle cx="${n2(22 * s)}" cy="${n2(-8 * s)}" r="${n2(1.8 * s)}" fill="#e38ea0"/>`);
    // bigotes
    a.add(`<g stroke="#5a5048" stroke-width="${n2(0.7 * s)}" fill="none" stroke-linecap="round">` +
      `<path d="M${n2(20 * s)},${n2(-8 * s)}L${n2(31 * s)},${n2(-10 * s)}"/>` +
      `<path d="M${n2(20 * s)},${n2(-7 * s)}L${n2(31 * s)},${n2(-6 * s)}"/></g>`);
    return a.out(6);
  };

  // El ciervo: alto, 4 patas finas, cuello y cabeza con astas (bocetos, se afinarán).
  A.ciervo = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(2 * s, 2, 30 * s, 8 * s, 0.34, 3);
    const pata = (x) => a.add(`<path d="M${n2(x)},0L${n2(x)},${n2(-18 * s)}" stroke="${sh('#8a6038', -0.08)}" stroke-width="${n2(3.2 * s)}" stroke-linecap="round"/>`);
    pata(-14 * s); pata(-9 * s); pata(9 * s); pata(13 * s);
    a.add(`<path d="M${n2(13 * s)},${n2(-26 * s)}L${n2(24 * s)},${n2(-50 * s)}" stroke="#b98a5a" stroke-width="${n2(9 * s)}" stroke-linecap="round"/>`);
    a.volume(V.ell(-2 * s, -30 * s, 18 * s, 11 * s), '#b98a5a', { box: [-20 * s, -41 * s, 36 * s, 22 * s], claro: 0.48, oscuro: -0.38, rimColor: '#f0e2cc' });
    a.volume(V.ell(26 * s, -52 * s, 7 * s, 5.5 * s), '#c09260', { box: [18 * s, -58 * s, 16 * s, 13 * s], claro: 0.48, oscuro: -0.38 });
    // orejas
    a.add(`<path d="M${n2(22 * s)},${n2(-57 * s)}L${n2(20 * s)},${n2(-63 * s)}M${n2(29 * s)},${n2(-57 * s)}L${n2(31 * s)},${n2(-63 * s)}" stroke="#8a6038" stroke-width="${n2(2 * s)}" fill="none" stroke-linecap="round"/>`);
    // astas
    a.add(`<path d="M${n2(23 * s)},${n2(-58 * s)}L${n2(20 * s)},${n2(-70 * s)}M${n2(20 * s)},${n2(-70 * s)}L${n2(16 * s)},${n2(-74 * s)}M${n2(20 * s)},${n2(-70 * s)}L${n2(23 * s)},${n2(-75 * s)}M${n2(28 * s)},${n2(-57 * s)}L${n2(31 * s)},${n2(-69 * s)}" stroke="#d8c08a" stroke-width="${n2(1.8 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<circle cx="${n2(29 * s)}" cy="${n2(-53 * s)}" r="${n2(1.4 * s)}" fill="#201a1a"/><circle cx="${n2(32.5 * s)}" cy="${n2(-50 * s)}" r="${n2(1.7 * s)}" fill="#3a2a2a"/>`);
    return a.out(6);
  };

  // La bestia: voluminosa, encorvada, oscura, ojos encendidos y colmillos.
  A.bestia = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(3 * s, 2, 34 * s, 10 * s, 0.4, 4);
    const pata = (x, w) => a.add(`<path d="M${n2(x)},0L${n2(x)},${n2(-14 * s)}" stroke="#473c44" stroke-width="${n2(w)}" stroke-linecap="round"/>`);
    pata(-16 * s, 6 * s); pata(-8 * s, 5 * s); pata(8 * s, 5 * s); pata(16 * s, 6 * s);
    const cuerpo = V.smooth([[-24 * s, -6 * s], [-26 * s, -24 * s], [-14 * s, -34 * s], [4 * s, -33 * s], [18 * s, -26 * s], [24 * s, -18 * s], [20 * s, -8 * s], [-6 * s, -5 * s]], true, 1);
    a.volume(cuerpo, '#5a4e57', { box: [-27 * s, -35 * s, 52 * s, 31 * s], claro: 0.4, oscuro: -0.4, rimColor: '#b9a9c0' });
    a.volume(V.ell(22 * s, -14 * s, 9 * s, 8 * s), '#4e434c', { box: [13 * s, -22 * s, 20 * s, 18 * s], claro: 0.4, oscuro: -0.42 });
    a.add(`<circle cx="${n2(24 * s)}" cy="${n2(-17 * s)}" r="${n2(1.8 * s)}" fill="#ffd23f"/><circle cx="${n2(29 * s)}" cy="${n2(-16 * s)}" r="${n2(1.6 * s)}" fill="#ffd23f"/>`);
    a.add(`<path d="M${n2(24 * s)},${n2(-8 * s)}L${n2(26 * s)},${n2(-4 * s)}L${n2(28 * s)},${n2(-8 * s)}Z" fill="#fff"/><path d="M${n2(28 * s)},${n2(-8 * s)}L${n2(30 * s)},${n2(-4 * s)}L${n2(31 * s)},${n2(-8 * s)}Z" fill="#fff"/>`);
    a.add(`<path d="M${n2(-14 * s)},${n2(-34 * s)}l${n2(-3 * s)},${n2(-6 * s)}M${n2(-4 * s)},${n2(-34 * s)}l${n2(-2 * s)},${n2(-7 * s)}M${n2(6 * s)},${n2(-32 * s)}l${n2(1 * s)},${n2(-6 * s)}" stroke="#3a3340" stroke-width="${n2(2.4 * s)}" fill="none" stroke-linecap="round"/>`);
    return a.out(6);
  };

  // La serpiente: cuerpo en S por el suelo, cabeza alzada a la derecha, lengua bífida.
  A.serpiente = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(0, 2, 28 * s, 6 * s, 0.3, 3);
    const d = `M${n2(-26 * s)},${n2(-2 * s)}C${n2(-14 * s)},${n2(-10 * s)} ${n2(-14 * s)},${n2(2 * s)} ${n2(-2 * s)},${n2(-4 * s)}C${n2(10 * s)},${n2(-10 * s)} ${n2(8 * s)},${n2(-22 * s)} ${n2(18 * s)},${n2(-28 * s)}`;
    a.add(`<path d="${d}" stroke="#3b7a3a" stroke-width="${n2(8 * s)}" fill="none" stroke-linecap="round"/>`);
    a.add(`<path d="${d}" stroke="#6fc24e" stroke-width="${n2(4 * s)}" fill="none" stroke-linecap="round" transform="translate(${n2(-0.6 * s)} ${n2(-0.8 * s)})"/>`);
    a.volume(V.ell(20 * s, -30 * s, 6 * s, 4.5 * s), '#4e9a3f', { box: [14 * s, -35 * s, 14 * s, 11 * s], claro: 0.5, oscuro: -0.36 });
    a.add(`<circle cx="${n2(23 * s)}" cy="${n2(-31 * s)}" r="${n2(1.3 * s)}" fill="#201a1a"/>`);
    a.add(`<path d="M${n2(26 * s)},${n2(-30 * s)}l${n2(6 * s)},${n2(-1 * s)}m${n2(-6 * s)},${n2(1 * s)}l${n2(6 * s)},${n2(2 * s)}" stroke="#e23b5a" stroke-width="${n2(1 * s)}" fill="none" stroke-linecap="round"/>`);
    return a.out(6);
  };

  // El murciélago: cuerpo peludo con dos alas de membrana; vuela un poco sobre el suelo.
  A.murcielago = function (tam) {
    const a = V.arte();
    const s = tam || 1;
    a.sombra(0, 3, 20 * s, 6 * s, 0.28, 3);
    const cy = -26 * s;
    const ala = (dir) => `M0,${n2(cy)}C${n2(dir * 10 * s)},${n2(cy - 8 * s)} ${n2(dir * 24 * s)},${n2(cy - 6 * s)} ${n2(dir * 30 * s)},${n2(cy + 2 * s)}C${n2(dir * 24 * s)},${n2(cy + 1 * s)} ${n2(dir * 22 * s)},${n2(cy + 6 * s)} ${n2(dir * 16 * s)},${n2(cy + 5 * s)}C${n2(dir * 14 * s)},${n2(cy + 8 * s)} ${n2(dir * 10 * s)},${n2(cy + 7 * s)} ${n2(dir * 6 * s)},${n2(cy + 9 * s)}C${n2(dir * 5 * s)},${n2(cy + 5 * s)} ${n2(dir * 3 * s)},${n2(cy + 3 * s)} 0,${n2(cy + 2 * s)}Z`;
    a.add(`<path d="${ala(-1)}" fill="#4a3f52"/><path d="${ala(1)}" fill="#564a5f"/>`);
    a.volume(V.ell(0, cy, 6 * s, 7 * s), '#5e5368', { box: [-7 * s, cy - 8 * s, 14 * s, 15 * s], claro: 0.45, oscuro: -0.4, rimColor: '#cfc2dc' });
    a.add(`<path d="M${n2(-3 * s)},${n2(cy - 6 * s)}L${n2(-5 * s)},${n2(cy - 12 * s)}L${n2(-1 * s)},${n2(cy - 7 * s)}ZM${n2(3 * s)},${n2(cy - 6 * s)}L${n2(5 * s)},${n2(cy - 12 * s)}L${n2(1 * s)},${n2(cy - 7 * s)}Z" fill="#4a3f52"/>`);
    a.add(`<circle cx="${n2(-2.4 * s)}" cy="${n2(cy - 1 * s)}" r="${n2(1.3 * s)}" fill="#ffd23f"/><circle cx="${n2(2.4 * s)}" cy="${n2(cy - 1 * s)}" r="${n2(1.3 * s)}" fill="#ffd23f"/>`);
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
    a.add(`<circle cx="0" cy="${n2(-6 * s)}" r="${n2(1.6 * s)}" fill="#ffd23f"/>`);   // destello
    return a.out(4);
  };
})(typeof window !== 'undefined' ? window : globalThis);
