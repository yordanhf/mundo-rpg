/* =============================================================================
 * Fazendinha — VISUAL "cartoon" / núcleo del arte (estilo 3 "Cartoon mobile 2024")
 * -----------------------------------------------------------------------------
 * Proyección isométrica (la misma de la maqueta estilos/cartoon-mobile/: cámara
 * girada 30°, K = 0,56), colores (sombra que oscurece hacia ÍNDIGO, nunca gris),
 * helpers de SVG y el constructor de arte `arte()` con el "volume mobile 2024":
 * gradiente radial con foco arriba-izquierda, luz de borde fría abajo-derecha y
 * brillo especular — SIN contorno oscuro. Todo arte devuelve { svg, defs, pad, meta? }
 * con el ancla (0,0) en el pie (contrato del raster de la plataforma, src/nucleo/raster.js).
 * Sin DOM al cargar (los tests corren estos archivos en una vm).
 * Todo queda en FZ.visual.cartoon (V): V.P, V.unP, V.sh, V.arte()...
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ = raiz.FZ || {};
  const V = (FZ.visual = FZ.visual || {}).cartoon = FZ.visual.cartoon || {};

  /* ---------- proyección ---------- */
  const S = 64, PHI = Math.PI / 6, K = 0.56, KZ = Math.sqrt(1 - K * K);
  const CO = Math.cos(PHI), SI = Math.sin(PHI);
  V.ISO = { S, K, KZ, CO, SI };
  // baldosas (x, y, z) -> px de mundo (zoom 1)
  V.P = (x, y, z) => [(x * CO - y * SI) * S, (x * SI + y * CO) * S * K - (z || 0) * S * KZ];
  // px de mundo en el suelo (z = 0) -> baldosas
  V.unP = (sx, sy) => { const u = sx / S, v = sy / (S * K); return [u * CO + v * SI, -u * SI + v * CO]; };
  // profundidad (mayor = más cerca de la cámara)
  V.depth = (x, y) => x * SI + y * CO;
  V.depthPx = (sx, sy) => { const t = V.unP(sx, sy); return V.depth(t[0], t[1]); };

  /* ---------- RNG determinista ---------- */
  V.rng = function (seed) {
    let a = (seed >>> 0) || 1;
    const r = function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.r = (lo, hi) => lo + (hi - lo) * r();
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    return r;
  };

  /* ---------- colores ---------- */
  function hex2rgb(h) {
    h = String(h || '#000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h.slice(0, 6), 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb2hex(r, g, b) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
  }
  V.hex2rgb = hex2rgb;
  V.mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  // f > 0 aclara hacia un blanco cálido; f < 0 oscurece hacia un índigo saturado (la sombra de color del estilo)
  V.sh = (c, f) => (f >= 0 ? V.mix(c, '#fffbe8', f) : V.mix(c, '#22164a', -f));
  V.rgba = (h, a) => { const c = hex2rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  // satura/desatura levemente (planta "en pausa")
  V.gris = (h, k) => { const c = hex2rgb(h); const l = c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15; return rgb2hex(c[0] + (l - c[0]) * k, c[1] + (l - c[1]) * k, c[2] + (l - c[2]) * k + 10 * k); };

  /* ---------- helpers de SVG ---------- */
  const n2 = (v) => Math.round(v * 100) / 100;
  V.n2 = n2;
  const pt = (p) => n2(p[0]) + ',' + n2(p[1]);
  V.pt = pt;
  V.pts = (arr) => arr.map(pt).join(' ');
  let seq = 0;
  V.gid = (p) => 'ct' + (p || 'g') + (++seq).toString(36);

  // polígono con esquinas redondeadas
  V.rpoly = function (Pp, r) {
    const n = Pp.length;
    let d = '';
    for (let i = 0; i < n; i++) {
      const p0 = Pp[(i - 1 + n) % n], p1 = Pp[i], p2 = Pp[(i + 1) % n];
      const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
      const l1 = Math.hypot(v1[0], v1[1]) || 1, l2 = Math.hypot(v2[0], v2[1]) || 1;
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const a = [p1[0] + (v1[0] / l1) * rr, p1[1] + (v1[1] / l1) * rr];
      const b = [p1[0] + (v2[0] / l2) * rr, p1[1] + (v2[1] / l2) * rr];
      d += (i ? 'L' : 'M') + pt(a) + 'Q' + pt(p1) + ' ' + pt(b);
    }
    return d + 'Z';
  };
  // spline Catmull-Rom -> Bézier (cerrada o abierta)
  V.smooth = function (Pp, cerrada, ten) {
    if (cerrada === undefined) cerrada = true;
    ten = ten == null ? 1 : ten;
    const n = Pp.length;
    let d = 'M' + pt(Pp[0]);
    const N = cerrada ? n : n - 1;
    for (let i = 0; i < N; i++) {
      const p0 = Pp[cerrada ? (i - 1 + n) % n : Math.max(i - 1, 0)];
      const p1 = Pp[i], p2 = Pp[(i + 1) % n];
      const p3 = Pp[cerrada ? (i + 2) % n : Math.min(i + 2, n - 1)];
      const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * ten, p1[1] + ((p2[1] - p0[1]) / 6) * ten];
      const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * ten, p2[1] - ((p3[1] - p1[1]) / 6) * ten];
      d += 'C' + pt(c1) + ' ' + pt(c2) + ' ' + pt(p2);
    }
    return d + (cerrada ? 'Z' : '');
  };
  V.ell = (cx, cy, rx, ry) => `M${n2(cx - rx)},${n2(cy)}A${n2(rx)},${n2(ry)} 0 1 0 ${n2(cx + rx)},${n2(cy)}A${n2(rx)},${n2(ry)} 0 1 0 ${n2(cx - rx)},${n2(cy)}Z`;
  // gota/hoja: base en (0,0), punta en (0,-L), anchura W
  V.hoja = (L, W, bojo) => {
    const b = bojo == null ? 0.55 : bojo;
    return `M0,0C${n2(W * 0.62)},${n2(-L * 0.12)} ${n2(W * 0.55)},${n2(-L * b - L * 0.25)} 0,${n2(-L)}C${n2(-W * 0.55)},${n2(-L * b - L * 0.25)} ${n2(-W * 0.62)},${n2(-L * 0.12)} 0,0Z`;
  };
  // estrella de n puntas
  V.estrellaD = (cx, cy, r1, r2, n) => {
    n = n || 5;
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI) / n - Math.PI / 2, r = i % 2 ? r2 : r1;
      d += (i ? 'L' : 'M') + n2(cx + Math.cos(a) * r) + ',' + n2(cy + Math.sin(a) * r);
    }
    return d + 'Z';
  };
  // brillo en cruz (4 puntas curvas)
  V.cruzD = (cx, cy, r) => `M${n2(cx)},${n2(cy - r)}C${n2(cx + r * 0.1)},${n2(cy - r * 0.27)} ${n2(cx + r * 0.27)},${n2(cy - r * 0.1)} ${n2(cx + r)},${n2(cy)}C${n2(cx + r * 0.27)},${n2(cy + r * 0.1)} ${n2(cx + r * 0.1)},${n2(cy + r * 0.27)} ${n2(cx)},${n2(cy + r)}C${n2(cx - r * 0.1)},${n2(cy + r * 0.27)} ${n2(cx - r * 0.27)},${n2(cy + r * 0.1)} ${n2(cx - r)},${n2(cy)}C${n2(cx - r * 0.27)},${n2(cy - r * 0.1)} ${n2(cx - r * 0.1)},${n2(cy - r * 0.27)} ${n2(cx)},${n2(cy - r)}Z`;

  const stops = (st) => st.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('');
  V.stops = stops;

  /* Constructor de arte: acumula <defs> y cuerpo; out(pad) -> { svg, defs, pad }. */
  V.arte = function () {
    const D = [], B = [];
    const a = {
      D, B,
      add(...s) { B.push(...s); return a; },
      // gradiente lineal (unidades de la caja del objeto por defecto)
      lg(st, x1, y1, x2, y2, user) {
        const id = V.gid('l');
        D.push(`<linearGradient id="${id}" x1="${x1 == null ? 0 : x1}" y1="${y1 == null ? 0 : y1}" x2="${x2 == null ? 0 : x2}" y2="${y2 == null ? 1 : y2}"${user ? ' gradientUnits="userSpaceOnUse"' : ''}>${stops(st)}</linearGradient>`);
        return `url(#${id})`;
      },
      rg(st, cx, cy, r, fx, fy, user) {
        const id = V.gid('r');
        D.push(`<radialGradient id="${id}" cx="${cx == null ? 0.5 : cx}" cy="${cy == null ? 0.5 : cy}" r="${r == null ? 0.5 : r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}${user ? ' gradientUnits="userSpaceOnUse"' : ''}>${stops(st)}</radialGradient>`);
        return `url(#${id})`;
      },
      blur(sd) {
        const id = V.gid('b');
        D.push(`<filter id="${id}" x="-80%" y="-80%" width="260%" height="260%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
        return `url(#${id})`;
      },
      clip(d) {
        const id = V.gid('c');
        D.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
        return `url(#${id})`;
      },
      // volume "mobile 2024": radial con foco arriba-izquierda + luz de borde + brillo especular
      volume(d, c, op) {
        op = op || {};
        const box = op.box;
        const fill = a.rg([[0, V.sh(c, op.claro == null ? 0.42 : op.claro)], [0.55, c], [1, V.sh(c, op.oscuro == null ? -0.38 : op.oscuro)]],
          op.cx == null ? 0.38 : op.cx, op.cy == null ? 0.3 : op.cy, op.r == null ? 0.78 : op.r);
        a.add(`<path d="${d}" fill="${fill}"${op.opac != null ? ` opacity="${op.opac}"` : ''}/>`);
        if (op.rim !== false) {
          const cl = a.clip(d);
          const rc = op.rimColor || V.sh(c, 0.7);
          const rim = a.lg([[0, '#ffffff', 0], [0.55, '#ffffff', 0], [1, rc, op.rimA == null ? 0.85 : op.rimA]], 0.2, 0.1, 0.85, 1);
          a.add(`<path d="${d}" fill="none" stroke="${rim}" stroke-width="${op.rimW || 3}" clip-path="${cl}"/>`);
        }
        if (box && op.brillo !== false) {
          const [x, y, w, h] = box;
          const gl = a.rg([[0, '#ffffff', op.brilloA == null ? 0.85 : op.brilloA], [1, '#ffffff', 0]]);
          a.add(`<ellipse cx="${n2(x + w * 0.32)}" cy="${n2(y + h * 0.24)}" rx="${n2(w * 0.2)}" ry="${n2(h * 0.13)}" fill="${gl}" transform="rotate(-28 ${n2(x + w * 0.32)} ${n2(y + h * 0.24)})"/>`);
          a.add(`<ellipse cx="${n2(x + w * 0.24)}" cy="${n2(y + h * 0.2)}" rx="${n2(Math.max(1, w * 0.045))}" ry="${n2(Math.max(0.8, h * 0.035))}" fill="#fff" opacity=".9"/>`);
        }
        return a;
      },
      // sombra de contacto (elipse desenfocada, verde-índigo)
      sombra(cx, cy, rx, ry, alfa, sd) {
        a.add(`<ellipse cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(rx)}" ry="${n2(ry)}" fill="#1b3a2c" opacity="${alfa == null ? 0.35 : alfa}" filter="${a.blur(sd == null ? Math.max(1.5, ry * 0.45) : sd)}"/>`);
        return a;
      },
      out(pad, meta) { const o = { svg: B.join(''), defs: D.join(''), pad: pad == null ? 10 : pad }; if (meta) o.meta = meta; return o; },
    };
    return a;
  };

  /* ---------- easing ---------- */
  V.ease = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    elastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    bounce(k) {
      const n = 7.5625, d = 2.75;
      if (k < 1 / d) return n * k * k;
      if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75;
      if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375;
      return n * (k -= 2.625 / d) * k + 0.984375;
    },
  };
  V.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  V.lerp = (a, b, t) => a + (b - a) * t;
  V.suave = (a, b, x) => { const t = V.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // documento SVG suelto (paneles, carta): viewBox x y w h
  V.svgDoc = (art, vb, extra) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true" focusable="false"${extra || ''}><defs>${art.defs}</defs>${art.svg}</svg>`;
})(typeof window !== 'undefined' ? window : globalThis);
