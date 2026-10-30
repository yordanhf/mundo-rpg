/* =============================================================================
 * Mundo — MOTOR / arte del escenario (césped, flores, rocas, arbustos, árboles)
 * -----------------------------------------------------------------------------
 * Vendorizado de un proyecto isométrico previo: solo las funciones que usa este
 * juego (arvore, arbusto, flores, tufo, pedra). Depende únicamente de nucleo.js.
 * Cada función devuelve { svg, defs, pad } con la ancla (0,0) en el pie.
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ;
  const V = FZ.visual.cartoon;
  const A = (V.A = V.A || {});
  const { sh, n2, smooth } = V;

  /* ============================== ÁRVORES ============================== */
  const PALETAS = {
    verde: { c: '#5cc443', fruto: null }, lima: { c: '#8fd645', fruto: null }, escura: { c: '#3ea85a', fruto: null },
    rosa: { c: '#ff9ac4', fruto: '#ffffff' }, laranja: { c: '#ffb238', fruto: null }, maca: { c: '#4fbf4a', fruto: '#ff4b4b' },
  };
  A.arvore = function (tipo, semente, tam) {
    const a = V.arte();
    const r = V.rng(semente || 1);
    const s = tam || 1;
    const Pt = PALETAS[tipo] || PALETAS.verde;
    a.sombra(4 * s, 2, 30 * s, 11 * s, 0.38, 4);
    const tr = `M${-8 * s},2C${-7 * s},${-14 * s} ${-6 * s},${-30 * s} ${-9 * s},${-44 * s}L${9 * s},${-44 * s}C${6 * s},${-30 * s} ${7 * s},${-14 * s} ${8 * s},2Q0,${5 * s} ${-8 * s},2Z`;
    a.add(`<path d="${tr}" fill="${a.lg([[0, '#c08a62'], [0.4, '#9a6440'], [1, '#5e3826']], 0, 0, 1, 0)}"/>`);
    const cy = -72 * s;
    const B = [[0, cy - 14 * s, 30 * s], [-24 * s, cy + 2 * s, 24 * s], [24 * s, cy + 4 * s, 25 * s], [-10 * s, cy + 16 * s, 24 * s], [14 * s, cy + 18 * s, 23 * s], [-2 * s, cy - 32 * s, 20 * s]];
    for (const b of B) { b[0] += (r() - 0.5) * 6 * s; b[1] += (r() - 0.5) * 6 * s; }
    const c = Pt.c;
    a.add(`<g fill="${sh(c, -0.38)}">${B.map(([x, y, rr]) => `<circle cx="${n2(x)}" cy="${n2(y + 3)}" r="${n2(rr)}"/>`).join('')}</g>`);
    for (const [x, y, rr] of B) a.add(`<circle cx="${n2(x)}" cy="${n2(y - 1)}" r="${n2(rr * 0.95)}" fill="${a.rg([[0, sh(c, 0.6)], [0.5, sh(c, 0.12)], [1, c, 0]], 0.38, 0.3, 0.72)}"/>`);
    const clC = a.clip(B.map(([x, y, rr]) => V.ell(x, y + 3, rr, rr)).join(''));
    // a sombra da copa é um retângulo recortado pela copa, mais largo que ela (±70 contra ~±52): fora da MEDIDA da caixa
    const sombraCopa = `<rect x="${-70 * s}" y="${cy - 10 * s}" width="${140 * s}" height="${60 * s}" fill="${a.lg([[0, '#1a3f40', 0], [1, '#1a3f40', 0.42]])}"/>`;
    a.add(`<g clip-path="${clC}">${sombraCopa}`);
    a.add(`<g fill="none" stroke="${sh(c, 0.75)}" stroke-opacity=".5" stroke-width="${n2(3 * s)}">${B.filter((b) => b[1] > cy).map(([x, y, rr]) => `<path d="M${n2(x - rr * 0.75)},${n2(y + rr * 0.55)}A${n2(rr)},${n2(rr)} 0 0 0 ${n2(x + rr * 0.75)},${n2(y + rr * 0.55)}"/>`).join('')}</g></g>`);
    a.add(`<ellipse cx="${n2(-12 * s)}" cy="${n2(cy - 26 * s)}" rx="${n2(9 * s)}" ry="${n2(5 * s)}" fill="#fff" opacity=".4" transform="rotate(-30 ${n2(-12 * s)} ${n2(cy - 26 * s)})"/>`);
    if (Pt.fruto) {
      for (let i = 0; i < 9; i++) {
        const b = r.pick(B), ang = r() * Math.PI * 2, rr = r() * b[2] * 0.75;
        const x = b[0] + Math.cos(ang) * rr, y = b[1] + Math.sin(ang) * rr;
        a.add(`<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(3.2 * s)}" fill="${Pt.fruto}"/><circle cx="${n2(x - 1)}" cy="${n2(y - 1)}" r="${n2(1 * s)}" fill="#fff" opacity=".8"/>`);
      }
    }
    const o = a.out(10);
    o.medida = o.svg.replace(sombraCopa, '');
    return o;
  };
  A.arbusto = function (cor, flor, semente, tam) {
    const a = V.arte();
    const r = V.rng(semente || 3);
    const s = tam || 1;
    a.sombra(3 * s, 1, 24 * s, 8 * s, 0.34, 3);
    const B = [[-12 * s, -12 * s, 13 * s], [10 * s, -12 * s, 14 * s], [0, -22 * s, 14 * s], [-2 * s, -8 * s, 13 * s]];
    a.add(`<g fill="${sh(cor, -0.38)}">${B.map(([x, y, rr]) => `<circle cx="${n2(x)}" cy="${n2(y + 2)}" r="${n2(rr)}"/>`).join('')}</g>`);
    for (const [x, y, rr] of B) a.add(`<circle cx="${n2(x)}" cy="${n2(y - 1)}" r="${n2(rr * 0.94)}" fill="${a.rg([[0, sh(cor, 0.6)], [0.55, sh(cor, 0.1)], [1, cor, 0]], 0.38, 0.3, 0.72)}"/>`);
    if (flor) for (let i = 0; i < 7; i++) {
      const b = r.pick(B), ang = r() * Math.PI * 2, rr = r() * b[2] * 0.7;
      const x = b[0] + Math.cos(ang) * rr, y = b[1] + Math.sin(ang) * rr - 2;
      a.add(`<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(3.2 * s)}" fill="${flor}"/><circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(1.2 * s)}" fill="#ffe66a"/>`);
    }
    return a.out(8);
  };
  A.flores = function (semente) {
    const a = V.arte();
    const r = V.rng(semente || 9);
    const cor = r.pick(['#ff6fa8', '#ffd23f', '#ffffff', '#b98cff', '#ff8a5c', '#6fd3ff']);
    a.sombra(1, 1, 12, 4, 0.25, 2);
    for (let i = 0; i < 5; i++) {
      const x = (r() - 0.5) * 18, h = 10 + r() * 9;
      a.add(`<path d="M${n2(x * 0.4)},0Q${n2(x * 0.7)},${n2(-h * 0.5)} ${n2(x)},${n2(-h)}" stroke="#3fa83a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
      for (let k = 0; k < 5; k++) { const t = (k / 5) * Math.PI * 2; a.add(`<circle cx="${n2(x + Math.cos(t) * 2.6)}" cy="${n2(-h + Math.sin(t) * 2.6)}" r="2.2" fill="${cor}"/>`); }
      a.add(`<circle cx="${n2(x)}" cy="${n2(-h)}" r="1.6" fill="${cor === '#ffd23f' ? '#ff8a1a' : '#ffd23f'}"/>`);
    }
    a.add(`<path d="${V.folha(9, 5)}" fill="#4cb847" transform="rotate(-50)"/><path d="${V.folha(9, 5)}" fill="#45ad42" transform="rotate(50)"/>`);
    return a.out(4);
  };
  A.tufo = function (semente) {
    const a = V.arte();
    const r = V.rng(semente || 4);
    let d = '';
    for (let i = 0; i < 7; i++) { const x = (i - 3) * 2.4, h = 9 + r() * 8, b = (i - 3) * 1.6; d += `M${n2(x)},0Q${n2(x + b * 0.4)},${n2(-h * 0.6)} ${n2(x + b)},${n2(-h)}`; }
    a.add(`<path d="${d}" stroke="#3e9a34" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
    a.add(`<path d="${d}" stroke="#8fdc55" stroke-width="1.8" fill="none" stroke-linecap="round" transform="translate(-.5 -.5)"/>`);
    return a.out(3);
  };
  A.pedra = function (semente, tam) {
    const a = V.arte();
    const r = V.rng(semente || 2);
    const s = tam || 1;
    a.sombra(3, 2, 16 * s, 6 * s, 0.35, 2.5);
    const d = smooth([[-15 * s, 0], [-13 * s, -9 * s], [-4 * s, -15 * s], [8 * s, -14 * s], [15 * s, -6 * s], [14 * s, 1 * s], [0, 4 * s]].map(([x, y]) => [x + (r() - 0.5) * 3, y + (r() - 0.5) * 2]));
    a.volume(d, '#b8c2d0', { box: [-15 * s, -15 * s, 30 * s, 19 * s], claro: 0.6, escuro: -0.42, rimCor: '#e8f4ff' });
    return a.out(5);
  };
})(typeof window !== 'undefined' ? window : globalThis);
