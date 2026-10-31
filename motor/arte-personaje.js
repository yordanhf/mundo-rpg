/* =============================================================================
 * SolRanch — VISUAL "cartoon" / ARTE: el Guardián del rancho (el mercenario del PvP)
 * -----------------------------------------------------------------------------
 * Hace la ronda alrededor de la granja (guardian.js). En el PvP, sin escudo, el Free duerme (no lucha).
 * Encargo del dueño (18/oct): un MERCENARIO con el trazo "más dibujado" de la referencia que
 * envió (un chibi con capucha): contorno oscuro grueso, cabeza grande bajo la capucha, sombra en 3 tonos planos (luz
 * arriba-izquierda, sombra abajo-derecha), textura de pintas en la tela, ojos grandes de cara cerrada.
 *   A.guardian(pose)  'anda1' | 'anda2' (la marcha, 3/4 mirando a la derecha, la espada al hombro) · 'atento' (en guardia,
                     la espada en la mano, la punta en el suelo) · 'llama' (la hora del PvP: la espada en alto, gritando) ·
                     'duerme' (sentado en el cajón, la cabeza caída)
                     el casero (encargo del dueño, 18/oct): 'machado1' | 'machado2' (corta el árbol: el hacha en alto detrás
                     y el golpe delante) · 'agacha' (agachado, la mano en el suelo: coge la planta o la piedra) · 'pega' (se levanta
                     con la mano frente al pecho: la escena dibuja la cosa en la mano, A.GUARDIAN_MANO). En esas, la espada queda
                     guardada.
                     la lucha con los monstruos (la invasión, 19/oct): 'espada1' (la espada en alto del lado cercano, lista)
                     | 'espada2' (el golpe delante; la punta en A.GUARDIAN_PUNTA). A.guardianCorte() = el rastro del golpe.
                     la mazmorra (19/oct): 'caido' (el K.O.: tumbado de espaldas hacia la izquierda, las botas cerca del pie,
                     los ojos en X, la espada en el suelo; el centro de la cabeza en A.GUARDIAN_CABEZA.caido) · 'victoria' (la
                     espada en alto del todo, sonriendo; la punta en A.GUARDIAN_PUNTA.victoria).
                     Ancla (0,0) = el suelo entre las botas; ~80 × 125 (escala de panel). La escena usa A.GUARDIAN_ESCALA.
 *   A.guardian(pose, rareza)  los niveles (encargo del dueño, 19/oct: "tiene que encajar con la rareza"): cada uno es
                     otro defensor, en las mismas poses y anclas (el pie, la mano, la punta de la espada no cambian):
                     free = el mercenario de capucha gris (el de siempre, el estándar de todos) · comun = el escudero
                     (capucha marrón, pañuelo rojo, broquel) · incomun = el patrullero (capucha verde con pluma, la
                     hombrera de cuero, la correa) · rara = el guerrero (yelmo de acero con nasal, cota de malla, la
                     sobreveste azul) · epica = el caballero (yelmo con penacho morado, la coraza, la capa larga) ·
                     legendaria = el paladín (yelmo de oro con alitas, la armadura clara con el sol, la capa roja, la
                     espada brillando) · mitica = el guardián celeste (capucha clara con tiara, la aureola, las alas de luz,
                     la espada de cristal). Sin nivel (o desconocido) = free.
 *   V.dibujos.guardian({ pose, px, py, retrato, rareza }) -> SVG (panel; retrato = el busto, para los cuadraditos)
 *   A.guardian(pose, 'oculto')  el mercenario OCULTO de la granja visitada en el PvP (el dueño, 23/oct: "al entrar en el PvP el
                     mercenario debe quedar oculto [...] sin saber la rareza"): el mismo dibujo para todos (fuera de
 *                     A.GUARDIAN_RAREZAS)
 * Es el ÚNICO dibujo con contorno del juego (encargo del dueño, con la referencia): el resto de la granja sigue sin contorno.
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ;
  const V = FZ.visual.cartoon;
  const A = (V.A = V.A || {});
  const { n2, sh } = V;

  const TRAZO = '#201719', TW = 3.2;   // el contorno (color y grosor)
  const BASE = {
    capucha: '#77706b', capuchaD: '#3b3433', piel: '#b47a52', ojo: '#76b84a', panuelo: '#6e6461',
    chaleco: '#52413d', tunica: '#8c2f30', faja: '#a3363a', cinto: '#2d2224', pantalon: '#3b3438', bota: '#2f2626',
    cuero: '#8a5a3a', acero: '#c9d1da', oro: '#f2b632', madera: '#9c6432', moneda: '#ffd54a',
  };
  // Los TRAJES de las rarezas. color: lo que cambia en la paleta (el resto = BASE); cab: la cabeza ('capucha' | 'yelmo' | 'penacho' |
  // 'alas' | 'tiara'); hombro: 'remiendo' | 'cuero' | 'placa'; pecho: 'chaleco' | 'sobreveste' | 'placa'; capa: [color, el
  // sobrante de longitud, 'rasgada' | 'recta', la barra (null = sin)]; malla: 'capucha' (la capucha es cota de malla) | 'todo'
  // (la capucha y la manga);
  // espada: los colores de la hoja [color, sombra, luz, el brillo alrededor (null = sin)]; brillo: las estrellitas alrededor.
  const TRAJES = {
    // el Free (encargo del dueño, 19/oct: "el mercenario que viene por defecto lo hacemos free"): el mercenario gris de
    // siempre, el estándar de todos (la paleta BASE)
    free: { color: {}, cab: 'capucha', hombro: 'remiendo', pecho: 'chaleco', bolsa: true, capa: [null, 0, 'rasgada', null] },
    // el Común, el Escudero (encargo del dueño, 19/oct: "cambiar el aspecto del Común" y luego "vamos a crear otro para el común"):
    // la capucha marrón cálida, el pañuelo rojo, la camisa clara bajo el chaleco, el pantalón azul pizarra y el broquel de madera
    // a la espalda; el remiendo, la bolsa de monedas y la cicatriz siguen
    comun: {
      color: { capucha: '#9a6b45', capuchaD: '#38231a', panuelo: '#c8372d', chaleco: '#5b3c2a', tunica: '#eadcbc', faja: '#c8372d',
        cinto: '#2f2220', pantalon: '#45506a', bota: '#3a2a22' },
      cab: 'capucha', hombro: 'remiendo', pecho: 'chaleco', bolsa: true, cicatriz: true, broquel: true, pocasPintas: true,
      capa: [null, 0, 'rasgada', null],
    },
    incomun: {
      color: { capucha: '#5d7f3e', capuchaD: '#25321c', panuelo: '#8d7b55', chaleco: '#6d4b2f', tunica: '#33622f', faja: '#c49a52',
        cinto: '#3a2a20', pantalon: '#4c4637', bota: '#4b3324', ojo: '#b47b34' },
      cab: 'capucha', pluma: true, hombro: 'cuero', pecho: 'chaleco', correa: true, capa: ['#4c6d33', 4, 'rasgada', null],
    },
    rara: {
      color: { capucha: '#8d98a7', capuchaD: '#262b33', panuelo: '#8d98a7', chaleco: '#2f66c9', tunica: '#8d98a7', faja: '#d8b356',
        cinto: '#3a2a24', pantalon: '#383d4a', bota: '#3b312d', ojo: '#4f95e8', yelmo: '#bcc6d2', manga: '#8d98a7', guante: '#6e4a30' },
      cab: 'yelmo', malla: 'todo', hombro: 'placa', pecho: 'sobreveste', cicatriz: true, capa: ['#25519f', 6, 'recta', null],
    },
    epica: {
      color: { capucha: '#7f8a9a', capuchaD: '#221f2c', panuelo: '#aab4c1', chaleco: '#b3bdca', tunica: '#7a3fd4', faja: '#7a3fd4',
        cinto: '#2c2433', pantalon: '#3a3350', bota: '#69727f', ojo: '#9b5cf0', yelmo: '#c3ccd8', manga: '#aab4c1', guante: '#9aa5b3',
        pluma: '#9a50f0', guarda: '#d6dbe3', gema: '#a259ff' },
      cab: 'penacho', malla: 'capucha', hombro: 'placa', pecho: 'placa', tabardo: true, capa: ['#6a33c2', 12, 'recta', '#c7a4ff'],
      espada: ['#d4dbe4', '#8e9aa9', '#ffffff', null],
    },
    legendaria: {
      color: { capucha: '#b9c0ca', capuchaD: '#2a2630', panuelo: '#f0c75a', chaleco: '#efe8d6', tunica: '#c3283a', faja: '#c3283a',
        cinto: '#8a5a1a', pantalon: '#4a2a30', bota: '#d6cdb3', ojo: '#e8a21c', yelmo: '#f2b632', manga: '#e3dccb', guante: '#f2b632',
        guarda: '#f2b632', gema: '#e8505b' },
      cab: 'alas', malla: 'capucha', hombro: 'placa', pecho: 'placa', emblema: 'sol', capa: ['#b3242e', 14, 'recta', '#f2b632'],
      espada: ['#f4f1e6', '#c9a85a', '#ffffff', '#ffd54a'], brillo: '#ffe27a',
    },
    mitica: {
      color: { capucha: '#f4ecf6', capuchaD: '#3a1d40', panuelo: '#ffd1f4', chaleco: '#f3eaf6', tunica: '#8a5cf0', faja: '#8a5cf0',
        cinto: '#5a2d7a', pantalon: '#4a3060', bota: '#efe4f3', ojo: '#ff4fd8', manga: '#efe4f3', guante: '#ffc6ee',
        guarda: '#ffd1f4', gema: '#ff4fd8', cristal: '#ff7ce4' },
      cab: 'tiara', hombro: 'placa', pecho: 'placa', emblema: 'gema', alas: true, aureola: true,
      capa: ['#c22ea6', 14, 'recta', '#ff9fe9'], espada: ['#ffd9f6', '#e06ac8', '#ffffff', '#ff8be6'], brillo: '#ffc8f2',
    },
  };
  // el OCULTO (el dueño, 23/oct): el mercenario de la granja visitada en el PvP, sin la rareza. El manto oscuro, la cara en la sombra
  // y los ojos encendidos; nada de los colores, del brillo, de la bolsa, de la cicatriz o del adorno de alguna rareza (el Free también
  // se vuelve él). Durmiendo, el "?" arriba
  const OCULTO = {
    color: { capucha: '#3a3646', capuchaD: '#16141c', piel: '#3b3542', ojo: '#e8e4ff', panuelo: '#2b2833', chaleco: '#2d2a36', tunica: '#38343f',
      faja: '#46414f', cinto: '#1d1b23', pantalon: '#29262f', bota: '#1c1a21', cuero: '#3d3845', acero: '#9aa0ab', oro: '#77727f',
      madera: '#3f3841', moneda: '#77727f' },
    cab: 'capucha', hombro: 'cuero', pecho: 'chaleco', capa: ['#211f29', 10, 'rasgada', null], espada: ['#a7adb8', '#5f6570', '#dde1e8', null],
    oculto: true,
  };

  /* ---------------- CATÁLOGO DE PIEZAS (Fase 1: el aspecto, desacoplado de la rareza) ----------------
   * Cada ranura ofrece varias piezas; una pieza aporta su ESTRUCTURA (el tipo que leen las funciones de
   * dibujo: cab/pecho/hombro/malla/capa/espada/broquel/emblema/pluma/alas/aureola/tabardo) y, opcional,
   * un `color` (el trozo de paleta que controla). `componerEquipo` mezcla las piezas elegidas en un
   * EQUIPO completo (paleta + estructura), que es lo que ahora recibe A.guardian. Las rarezas pasan a ser
   * meros PRESETS (combinaciones con nombre) sobre este catálogo; mezclar piezas de distintas rarezas es
   * libre. Más adelante (Fase 2) cada pieza será un ítem con sus atributos (defensa/ataque/durabilidad…). */
  const CAT = {
    cab: {
      capucha_gris:   { cab: 'capucha' },
      capucha_marron: { cab: 'capucha', color: { capucha: '#9a6b45', capuchaD: '#38231a' } },
      capucha_verde:  { cab: 'capucha', pluma: true, color: { capucha: '#5d7f3e', capuchaD: '#25321c', ojo: '#b47b34' } },
      yelmo_acero:    { cab: 'yelmo', malla: 'todo', color: { capucha: '#8d98a7', capuchaD: '#262b33', ojo: '#4f95e8', yelmo: '#bcc6d2', manga: '#8d98a7' } },
      yelmo_penacho:  { cab: 'penacho', malla: 'capucha', color: { capucha: '#7f8a9a', capuchaD: '#221f2c', ojo: '#9b5cf0', yelmo: '#c3ccd8', manga: '#aab4c1', pluma: '#9a50f0' } },
      yelmo_alado:    { cab: 'alas', malla: 'capucha', color: { capucha: '#b9c0ca', capuchaD: '#2a2630', ojo: '#e8a21c', yelmo: '#f2b632', manga: '#e3dccb' } },
      tiara:          { cab: 'tiara', aureola: true, color: { capucha: '#f4ecf6', capuchaD: '#3a1d40', ojo: '#ff4fd8', manga: '#efe4f3', cristal: '#ff7ce4' } },
    },
    pecho: {
      chaleco_gris:    { pecho: 'chaleco' },
      chaleco_marron:  { pecho: 'chaleco', color: { panuelo: '#c8372d', chaleco: '#5b3c2a', tunica: '#eadcbc', faja: '#c8372d', cinto: '#2f2220' } },
      chaleco_verde:   { pecho: 'chaleco', color: { panuelo: '#8d7b55', chaleco: '#6d4b2f', tunica: '#33622f', faja: '#c49a52', cinto: '#3a2a20' } },
      sobreveste_azul: { pecho: 'sobreveste', color: { panuelo: '#8d98a7', chaleco: '#2f66c9', tunica: '#8d98a7', faja: '#d8b356', cinto: '#3a2a24' } },
      placa_tabardo:   { pecho: 'placa', tabardo: true, color: { panuelo: '#aab4c1', chaleco: '#b3bdca', tunica: '#7a3fd4', faja: '#7a3fd4', cinto: '#2c2433' } },
      placa_sol:       { pecho: 'placa', emblema: 'sol', color: { panuelo: '#f0c75a', chaleco: '#efe8d6', tunica: '#c3283a', faja: '#c3283a', cinto: '#8a5a1a' } },
      placa_gema:      { pecho: 'placa', emblema: 'gema', color: { panuelo: '#ffd1f4', chaleco: '#f3eaf6', tunica: '#8a5cf0', faja: '#8a5cf0', cinto: '#5a2d7a' } },
    },
    hombro: {
      remiendo:       { hombro: 'remiendo' },
      cuero:          { hombro: 'cuero' },
      placa_acero:    { hombro: 'placa', color: { guante: '#6e4a30' } },
      placa_epica:    { hombro: 'placa', color: { guante: '#9aa5b3' } },
      placa_oro:      { hombro: 'placa', color: { guante: '#f2b632' } },
      placa_celeste:  { hombro: 'placa', color: { guante: '#ffc6ee' } },
    },
    legs: {
      pantalon_gris:    {},
      pantalon_azul:    { color: { pantalon: '#45506a' } },
      pantalon_verde:   { color: { pantalon: '#4c4637' } },
      pantalon_rara:    { color: { pantalon: '#383d4a' } },
      pantalon_epica:   { color: { pantalon: '#3a3350' } },
      pantalon_leg:     { color: { pantalon: '#4a2a30' } },
      pantalon_mitica:  { color: { pantalon: '#4a3060' } },
    },
    feet: {
      bota_gris:    {},
      bota_comun:   { color: { bota: '#3a2a22' } },
      bota_incomun: { color: { bota: '#4b3324' } },
      bota_rara:    { color: { bota: '#3b312d' } },
      bota_epica:   { color: { bota: '#69727f' } },
      bota_leg:     { color: { bota: '#d6cdb3' } },
      bota_mitica:  { color: { bota: '#efe4f3' } },
    },
    capa: {
      ninguna_rasgada: { capa: [null, 0, 'rasgada', null] },
      verde_rasgada:   { capa: ['#4c6d33', 4, 'rasgada', null] },
      azul_recta:      { capa: ['#25519f', 6, 'recta', null] },
      morada_recta:    { capa: ['#6a33c2', 12, 'recta', '#c7a4ff'] },
      roja_recta:      { capa: ['#b3242e', 14, 'recta', '#f2b632'] },
      celeste_recta:   { capa: ['#c22ea6', 14, 'recta', '#ff9fe9'], alas: true },
    },
    arma: {
      espada_base:   {},
      espada_epica:  { espada: ['#d4dbe4', '#8e9aa9', '#ffffff', null], color: { guarda: '#d6dbe3', gema: '#a259ff' } },
      espada_leg:    { espada: ['#f4f1e6', '#c9a85a', '#ffffff', '#ffd54a'], brillo: '#ffe27a', color: { guarda: '#f2b632', gema: '#e8505b' } },
      espada_mitica: { espada: ['#ffd9f6', '#e06ac8', '#ffffff', '#ff8be6'], brillo: '#ffc8f2', color: { guarda: '#ffd1f4', gema: '#ff4fd8' } },
    },
    escudo: {
      ninguno: {},
      broquel: { broquel: true },
    },
  };
  A.GUARDIAN_RANURAS = ['cab', 'pecho', 'hombro', 'legs', 'feet', 'capa', 'arma', 'escudo'];
  A.GUARDIAN_CAT = CAT;

  // Mezcla las piezas elegidas (`sel = { cab, pecho, hombro, legs, feet, capa, arma, escudo, extras }`,
  // cada una un id del catálogo) en un EQUIPO: la paleta (colores) + la estructura que lee el dibujo.
  // `extras` son adornos del personaje (bolsa, cicatriz, pocasPintas, correa), no piezas de armadura.
  function componerEquipo(sel) {
    sel = sel || {};
    const eq = { paleta: {} };
    for (const ranura of A.GUARDIAN_RANURAS) {
      const pieza = CAT[ranura] && CAT[ranura][sel[ranura]];
      if (!pieza) continue;
      for (const k in pieza) {
        if (k === 'color') Object.assign(eq.paleta, pieza.color);
        else eq[k] = pieza[k];
      }
    }
    if (sel.extras) Object.assign(eq, sel.extras);
    // seguridad: el aura (alas/aureola de luz) necesita un color de brillo aunque no haya arma que lo traiga
    if ((eq.alas || eq.aureola) && !eq.brillo) eq.brillo = '#ffe9c0';
    return eq;
  }
  A.componerEquipo = componerEquipo;

  // Las rarezas, ahora como PRESETS (combinaciones con nombre) sobre el catálogo. Mezclar es libre.
  const PRESETS = {
    free:       { cab: 'capucha_gris',   pecho: 'chaleco_gris',    hombro: 'remiendo', legs: 'pantalon_gris',   feet: 'bota_gris',    capa: 'ninguna_rasgada', arma: 'espada_base',   escudo: 'ninguno', extras: { bolsa: true } },
    comun:      { cab: 'capucha_marron', pecho: 'chaleco_marron',  hombro: 'remiendo', legs: 'pantalon_azul',   feet: 'bota_comun',   capa: 'ninguna_rasgada', arma: 'espada_base',   escudo: 'broquel', extras: { bolsa: true, cicatriz: true, pocasPintas: true } },
    incomun:    { cab: 'capucha_verde',  pecho: 'chaleco_verde',   hombro: 'cuero',    legs: 'pantalon_verde',  feet: 'bota_incomun', capa: 'verde_rasgada',   arma: 'espada_base',   escudo: 'ninguno', extras: { correa: true } },
    rara:       { cab: 'yelmo_acero',    pecho: 'sobreveste_azul', hombro: 'placa_acero',   legs: 'pantalon_rara',   feet: 'bota_rara',  capa: 'azul_recta',   arma: 'espada_base',   escudo: 'ninguno', extras: { cicatriz: true } },
    epica:      { cab: 'yelmo_penacho',  pecho: 'placa_tabardo',   hombro: 'placa_epica',   legs: 'pantalon_epica',  feet: 'bota_epica', capa: 'morada_recta', arma: 'espada_epica',  escudo: 'ninguno', extras: {} },
    legendaria: { cab: 'yelmo_alado',    pecho: 'placa_sol',       hombro: 'placa_oro',     legs: 'pantalon_leg',    feet: 'bota_leg',   capa: 'roja_recta',   arma: 'espada_leg',    escudo: 'ninguno', extras: {} },
    mitica:     { cab: 'tiara',          pecho: 'placa_gema',      hombro: 'placa_celeste', legs: 'pantalon_mitica', feet: 'bota_mitica',capa: 'celeste_recta',arma: 'espada_mitica', escudo: 'ninguno', extras: {} },
  };
  A.GUARDIAN_PRESETS = PRESETS;

  let C = BASE, T = TRAJES.free;   // la paleta y el equipo del dibujo en curso (A.guardian los cambia y los restaura)
  A.GUARDIAN_RAREZAS = Object.keys(TRAJES);
  A.GUARDIAN_OCULTO = 'oculto';
  A.GUARDIAN_ESCALA = 0.62;
  const POSES = { anda1: 1, anda2: 1, atento: 1, llama: 1, duerme: 1, machado1: 1, machado2: 1, agacha: 1, pega: 1, espada1: 1, espada2: 1, caido: 1, victoria: 1 };
  // donde queda la mano de cerca en cada pose del casero (unidades del dibujo; × A.GUARDIAN_ESCALA = px de mundo)
  A.GUARDIAN_MANO = { agacha: [46, -5], pega: [40, -41] };
  // la punta de la espada en las poses de la lucha (unidades del dibujo, el pie en (0,0)): las chispas del golpe salen de ahí
  A.GUARDIAN_PUNTA = { espada1: [14, -115], espada2: [84, -14], victoria: [45, -137] };
  // la mazmorra (19/oct): el medio de la cabeza en el K.O. (las estrellitas giran encima de ella), unidades del dibujo
  A.GUARDIAN_CABEZA = { caido: [-68, -48] };
  // donde queda el ancla del rastro del golpe (A.guardianCorte) en relación al pie (unidades del dibujo)
  A.GUARDIAN_CORTE = [40, -30];

  // la luz de cada pieza es un rectángulo grande recortado por el contorno. El getBBox no mira el recorte, y la caja del sprite
  // quedaba ~6x mayor que el muñeco (el bitmap salía 96% vacío: memoria y tiempo de rasterizar). Para MEDIR la caja, el
  // rectángulo sale (la pieza ya dibuja el contorno entero sin recorte, entonces la caja sigue cubriendo todo lo que aparece)
  const LUZ = '<rect x="-200" y="-300" width="400" height="400"';
  const SIN_LUZ = /<rect x="-200" y="-300" width="400" height="400"[^>]*\/>/g;
  const conMedida = (o) => Object.assign(o, { medida: o.svg.replace(SIN_LUZ, '') });

  /* ---------------- el trazo: una pieza con 3 tonos y contorno ---------------- */
  // un clipPath del camino desplazado (dx, dy)
  function clipT(a, d, dx, dy) {
    const id = V.gid('k');
    a.D.push(`<clipPath id="${id}"><path d="${d}" transform="translate(${n2(dx)} ${n2(dy)})"/></clipPath>`);
    return `url(#${id})`;
  }
  // la pieza: el tono de sombra (debajo-derecha, anchura s), la luz fina (arriba-izquierda, h), pintas de textura y el contorno.
  // op: { s, h, sombra, luz, pintas: [n, semilla], trazo (false = sin contorno), tw }
  function pieza(a, d, color, op) {
    op = op || {};
    const s = op.s == null ? 3.4 : op.s, h = op.h == null ? 1.6 : op.h;
    const sombra = op.sombra || sh(color, -0.3), luz = op.luz || sh(color, 0.26);
    const cl = a.clip(d);
    a.add(`<path d="${d}" fill="${sombra}"/>`);
    a.add(`<g clip-path="${cl}"><g clip-path="${clipT(a, d, -s, -s)}">${LUZ} fill="${luz}"/>` +
      `<path d="${d}" fill="${color}" transform="translate(${n2(h)} ${n2(h)})"/></g>`);
    if (op.pintas) a.add(pintas(op.pintas[0], op.pintas[1], op.caja, color));
    if (op.dentro) a.add(op.dentro);
    a.add('</g>');
    if (op.trazo !== false) a.add(`<path d="${d}" fill="none" stroke="${TRAZO}" stroke-width="${op.tw || TW}" stroke-linejoin="round" stroke-linecap="round"/>`);
  }
  // pintas de textura (tela gastada): oscuras y claras, sorteo fijo dentro de la caja
  function pintas(n, semilla, cx, color) {
    const r = V.rng(semilla), [x0, y0, w, h] = cx || [-40, -125, 80, 80];
    let o = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * w, y = y0 + r() * h, k = r();
      o += `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(0.5 + r() * 0.9)}" fill="${k < 0.6 ? sh(color, -0.42) : sh(color, 0.4)}" opacity="${n2(0.45 + r() * 0.4)}"/>`;
    }
    return o;
  }
  const linea = (d, color, w, op) => `<path d="${d}" stroke="${color || TRAZO}" stroke-width="${w || 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op ? ` opacity="${op}"` : ''}/>`;
  // costura a trazos (los remiendos)
  const costura = (d, color) => `<path d="${d}" stroke="${color}" stroke-width="1.1" fill="none" stroke-dasharray="2 1.6" stroke-linecap="round"/>`;

  /* ---------------- piezas ---------------- */
  // la espada: el medio del puño en (x, y), girada `ang` grados (0 = la hoja hacia arriba); L = la hoja
  function espada(a, x, y, ang, L) {
    L = L || 46;
    a.add(`<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(ang || 0)})">`);
    const b = -8, w = 4.6, E = T.espada || [C.acero, '#8e9aa9', '#f3f7fb', null];
    const lam = `M${-w},${b}L${w},${b}L${w},${n2(b - L + 9)}L0,${n2(b - L)}L${-w},${n2(b - L + 9)}Z`;
    // la legendaria y la mítica: el brillo alrededor de la hoja (un trazo largo y claro por abajo, sin filtro)
    if (E[3]) a.add(`<path d="${lam}" fill="${E[3]}" fill-opacity=".35" stroke="${E[3]}" stroke-opacity=".35" stroke-width="9" stroke-linejoin="round"/>`);
    pieza(a, lam, E[0], { s: 3, h: 1.4, sombra: E[1], luz: E[2], tw: 2.8 });
    a.add(linea(`M0,${b - 3}L0,${n2(b - L + 10)}`, T.espada ? sh(E[1], -0.04) : '#8b97a6', 1.2));
    // la guarda, el puño enrollado y el pomo (la gema en el pomo, en las altas)
    const gu = C.guarda || C.oro;
    pieza(a, 'M-11,-11L11,-11Q13,-8 11,-5L-11,-5Q-13,-8 -11,-11Z', gu, { s: 2, h: 1, tw: 2.6 });
    if (C.gema) pieza(a, 'M0,-12L2.6,-8L0,-4.4L-2.6,-8Z', C.gema, { s: 1, h: 0.6, tw: 1.8, luz: sh(C.gema, 0.5) });
    pieza(a, 'M-2.8,-5L2.8,-5L2.8,7L-2.8,7Z', C.cuero, { s: 1.6, h: 0.8, tw: 2.4, dentro: linea('M-2.8,-2L2.8,0M-2.8,1.6L2.8,3.6M-2.8,5L2.8,7', sh(C.cuero, -0.45), 1) });
    pieza(a, V.ell(0, 9.4, 3.6, 3.4), C.gema || gu, { s: 1.6, h: 0.8, tw: 2.4, luz: sh(C.gema || gu, 0.4) });
    a.add('</g>');
  }

  // el hacha: el medio del mango (la mano de cerca) en (x, y), girado `ang` grados (0 = la cabeza hacia arriba, el filo para la
  // derecha); L = el mango del medio hasta la cabeza
  function hacha(a, x, y, ang, L) {
    L = L || 34;
    a.add(`<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(ang || 0)})">`);
    pieza(a, `M-2.6,12Q-3.8,${n2(-L / 2)} -2.2,${n2(-L - 2)}L2.4,${n2(-L - 2)}Q1.2,${n2(-L / 2)} 2.6,12Z`, '#a56a3a', { s: 1.8, h: 0.8, tw: 2.6 });
    const y0 = -L + 1;
    pieza(a, `M-2,${n2(y0 - 6)}L11,${n2(y0 - 12)}Q17,${n2(y0 - 1)} 11,${n2(y0 + 10)}L-2,${n2(y0 + 4)}Z`, C.acero, { s: 2.4, h: 1.2, sombra: '#8e9aa9', luz: '#f3f7fb', tw: 2.8 });
    a.add(linea(`M11.4,${n2(y0 - 10)}Q15.6,${n2(y0 - 1)} 11.4,${n2(y0 + 8)}`, '#ffffff', 1.6));
    pieza(a, `M-4.6,${n2(y0 - 7)}L2,${n2(y0 - 7)}L2,${n2(y0 + 5)}L-4.6,${n2(y0 + 5)}Z`, '#6b717b', { s: 1.2, h: 0.6, tw: 2.4 });
    a.add('</g>');
  }
  // un miembro doblado (el muslo o la espinilla): una cápsula de P a Q con la anchura w
  function capsula(P, Q, w) {
    const dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * (w / 2), ny = (dx / l) * (w / 2), r = n2(w / 2);
    return `M${n2(P[0] + nx)},${n2(P[1] + ny)}L${n2(Q[0] + nx)},${n2(Q[1] + ny)}A${r},${r} 0 0 0 ${n2(Q[0] - nx)},${n2(Q[1] - ny)}` +
      `L${n2(P[0] - nx)},${n2(P[1] - ny)}A${r},${r} 0 0 0 ${n2(P[0] + nx)},${n2(P[1] + ny)}Z`;
  }
  // la pierna doblada (agachado): la cadera q, la rodilla j, el pie p (en el suelo); la bota con la punta hacia delante
  function piernaDoblada(a, q, j, p, lejos) {
    const k = lejos ? -0.16 : 0;
    pieza(a, capsula(j, p, 10.4), sh(C.pantalon, k - 0.06), { s: 2.2, h: 1 });
    pieza(a, capsula(q, j, 11.6), sh(C.pantalon, k), { s: 2.6, h: 1.2 });
    const xb = p[0], yb = 0;
    const bota = `M${n2(xb - 7)},${n2(yb - 8)}C${n2(xb - 7)},${n2(yb - 11)} ${n2(xb + 5)},${n2(yb - 11)} ${n2(xb + 6)},${n2(yb - 7.6)}C${n2(xb + 11)},${n2(yb - 7)} ${n2(xb + 12.6)},${n2(yb - 3)} ${n2(xb + 12)},${n2(yb)}L${n2(xb - 7.4)},${n2(yb)}Z`;
    pieza(a, bota, sh(C.bota, k), { s: 2.6, h: 1.2, luz: sh(C.bota, 0.38 + k) });
  }

  // una pierna corta (chibi) con la bota: la parte alta en (x, y0), el pie en el suelo en (x + dx, 0); `erg` levanta el pie
  function pierna(a, x, y0, dx, erg, lejos) {
    const k = lejos ? -0.16 : 0, xb = x + (dx || 0), yb = -(erg || 0);
    const d = `M${n2(x - 6)},${n2(y0)}L${n2(x + 6)},${n2(y0)}L${n2(xb + 5.6)},${n2(yb - 6)}L${n2(xb - 5.6)},${n2(yb - 6)}Z`;
    pieza(a, d, sh(C.pantalon, k), { s: 2.6, h: 1 });
    const bota = `M${n2(xb - 7)},${n2(yb - 8)}C${n2(xb - 7)},${n2(yb - 11)} ${n2(xb + 5)},${n2(yb - 11)} ${n2(xb + 6)},${n2(yb - 7.6)}C${n2(xb + 11)},${n2(yb - 7)} ${n2(xb + 12.6)},${n2(yb - 3)} ${n2(xb + 12)},${n2(yb)}L${n2(xb - 7.4)},${n2(yb)}Z`;
    pieza(a, bota, sh(C.bota, k), { s: 2.6, h: 1.2, luz: sh(C.bota, 0.38 + k) });
  }

  // un brazo corto: del hombro hasta la mano m (el guante redondo), con la manga doblada en el medio
  function brazo(a, o, m, lejos, guanteGrande) {
    const k = lejos ? -0.16 : 0;
    const mx = (o[0] + m[0]) / 2, my = (o[1] + m[1]) / 2, ang = Math.atan2(m[1] - o[1], m[0] - o[0]);
    const nx = -Math.sin(ang), ny = Math.cos(ang), w1 = 6.4, w2 = 5.4;
    const d = `M${n2(o[0] + nx * w1)},${n2(o[1] + ny * w1)}Q${n2(mx + nx * (w1 + 1))},${n2(my + ny * (w1 + 1))} ${n2(m[0] + nx * w2)},${n2(m[1] + ny * w2)}` +
      `L${n2(m[0] - nx * w2)},${n2(m[1] - ny * w2)}Q${n2(mx - nx * (w1 + 0.4))},${n2(my - ny * (w1 + 0.4))} ${n2(o[0] - nx * w1)},${n2(o[1] - ny * w1)}Z`;
    // la manga (el chaleco; la cota de malla o la armadura en las altas) y el guante (de cuero; la manopla en las altas)
    pieza(a, d, C.manga ? sh(C.manga, k) : sh(C.chaleco, 0.08 + k), { s: 2.6, h: 1.2,
      dentro: T.malla === 'todo' ? malla(o[0] - 8, o[1] - 8, m[0] - o[0] + 16, m[1] - o[1] + 16, C.manga) : '' });
    const r = guanteGrande ? 6.4 : 5.8, lv = C.guante ? sh(C.guante, k) : sh(C.cuero, -0.2 + k);
    pieza(a, V.ell(m[0], m[1], r, r * 0.94), lv, { s: 2.2, h: 1.2, luz: C.guante ? sh(C.guante, 0.36 + k) : sh(C.cuero, 0.2 + k) });
  }
  // la cota de malla: filas de medialunas en la caja (x, y, w, h; w/h pueden venir negativos), en el tono oscuro del color
  function malla(x, y, w, h, color) {
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    let d = '';
    for (let j = 0, yy = y; yy < y + h; j++, yy += 3.4) {
      for (let xx = x + (j % 2) * 2.2; xx < x + w; xx += 4.4) d += `M${n2(xx)},${n2(yy)}q2.2,2.6 4.4,0`;
    }
    return `<path d="${d}" stroke="${sh(color, -0.38)}" stroke-width=".9" fill="none" opacity=".75"/>`;
  }

  // la capa corta atrás (sale de abajo de la capucha hasta la cintura), con la barra rasgada
  // (las altas: más larga, la barra recta y el ribete en el color de la rareza)
  const capaColor = () => T.capa[0] || sh(C.capucha, -0.18);
  // las alas de luz del guardián celeste (atrás de todo, saliendo de la espalda): la de lejos menor y más alta, el brillo rosa
  // alrededor, las plumas rayadas
  // el ala: la raíz en (0,0), las plumas hacia arriba y hacia la izquierda (escala 1 = ~44 × 46)
  const ALA = 'M0,0C-6,-10 -14,-24 -16,-40C-22,-36 -30,-34 -38,-34C-34,-30 -32,-26 -32,-22C-38,-20 -42,-16 -44,-10C-38,-10 -34,-8 -30,-4C-34,-2 -36,2 -36,6C-24,6 -10,4 0,0Z';
  const PLUMAS = 'M0,0L-16,-38M0,0L-34,-30M0,0L-40,-11M0,0L-32,4';
  function alas(a, dy) {
    for (const [x, y, e, g] of [[-4, -58, 0.78, 30], [-14, -50, 1, 14]]) {
      a.add(`<g transform="translate(${x} ${n2(y + dy)}) rotate(${g}) scale(${e})">`);
      a.add(`<path d="${ALA}" fill="none" stroke="${T.brillo}" stroke-opacity=".5" stroke-width="9" stroke-linejoin="round"/>`);
      pieza(a, ALA, '#fdf4fd', { s: 4, h: 1.6, tw: 2.8, sombra: '#f1b8e6', luz: '#ffffff', dentro: linea(PLUMAS, '#e79ad6', 1.6) });
      a.add('</g>');
    }
  }
  function capa(a, dy) {
    dy = dy || 0;
    if (T.alas) alas(a, dy);
    const k = T.capa[1] || 0, y = (v) => n2(v + dy), fin = -18 + k, ribete = T.capa[3];
    const recta = T.capa[2] === 'recta';
    const hem = `M-36.4,${y(fin)}Q-25,${y(fin + 3.4)} -13.2,${y(fin - 0.6)}`;
    const d = recta
      ? `M-28,${y(-52)}C-35,${y(-40)} -37.4,${y(-30 + k * 0.4)} -36.4,${y(fin)}Q-25,${y(fin + 3.4)} -13.2,${y(fin - 0.6)}L-16,${y(-50)}Z`
      : `M-28,${y(-52)}C-34,${y(-40)} -35,${y(-28)} -33,${y(-18 + k)}L-28,${y(-21 + k)}L-24,${y(-16 + k)}L-19,${y(-21 + k)}L-14,${y(-18 + k)}L-16,${y(-50)}Z`;
    pieza(a, d, capaColor(), { s: 3, h: 1.2, pintas: recta ? null : [10, 3], caja: [-38, -54 + dy, 26, 38 + k],
      dentro: ribete ? `<path d="${hem}" stroke="${ribete}" stroke-width="5" fill="none" transform="translate(0 -1.4)"/>` : '' });
    if (T.broquel) broquel(a, dy);
  }
  // el broquel de madera sujeto a la espalda (el Común): las tablas, el aro de hierro y el umbo, por arriba de la capa
  function broquel(a, dy) {
    const cx = -27, cy = -37 + (dy || 0), r = 14;
    pieza(a, V.ell(cx, cy, r, r * 1.04), '#5f6a7a', { s: 2.4, h: 1, tw: 2.8, luz: '#c9d1da' });
    pieza(a, V.ell(cx, cy, r - 3.2, (r - 3.2) * 1.04), '#b07a45', { s: 2.6, h: 1.2, tw: 1.8, luz: '#d9a46a',
      dentro: linea(`M${cx - 4},${n2(cy - 11)}L${cx - 4},${n2(cy + 11)}M${cx + 4},${n2(cy - 11)}L${cx + 4},${n2(cy + 11)}`, '#7a4f2a', 1.4) });
    pieza(a, V.ell(cx, cy, 4.2, 4.2), '#c9d1da', { s: 1.2, h: 0.6, tw: 2, sombra: '#8e9aa9', luz: '#ffffff' });
  }

  // el cuerpo (el tronco corto del chibi): el chaleco de cuero sobre la túnica vino, la faja, el cinto con la bolsa de monedas
  // y el remiendo cosido en el hombro; `dy` baja todo (sentado)
  function cuerpo(a, dy) {
    dy = dy || 0;
    a.add(`<g transform="translate(0 ${dy})">`);
    const tronco = 'M-22,-50C-25,-38 -23,-24 -19,-13L21,-13C25,-24 27,-38 24,-50Z', P = T.pecho;
    // la falda de la sobreveste o las placas de la cintura (por arriba del alto de las piernas)
    if (P !== 'chaleco') {
      pieza(a, 'M-20.4,-16L22.8,-16L24.4,-7.6Q1.4,-3.6 -22,-7.6Z', P === 'placa' ? sh(C.chaleco, -0.1) : C.chaleco, { s: 2.4, h: 1, tw: 2.8,
        dentro: P === 'placa' ? linea('M-21,-11.4Q1.4,-8 23.6,-11.4', sh(C.chaleco, -0.42), 1.3) : linea('M1.4,-15L1.4,-5.4', sh(C.chaleco, -0.4), 1.4) });
    }
    let dentro;
    if (P === 'placa') {
      // la coraza: el pliegue del medio, la placa de abajo y el cuello en el color de la rareza; el tabardo (el caballero)
      dentro = (T.tabardo ? `<path d="M-5,-50L7.6,-50L7,-13L-4.4,-13Z" fill="${C.tunica}"/>` + linea('M-5,-50L-4.4,-13M7.6,-50L7,-13', sh(C.tunica, -0.45), 1.4) : '') +
        linea('M1.4,-48L1.6,-29', '#ffffff', 2, 0.55) + linea('M-23,-34Q1.4,-29.4 25.4,-34', sh(C.chaleco, -0.4), 1.4) +
        `<path d="M-21,-50Q1.4,-43 24,-50L24,-52L-21,-52Z" fill="${C.guarda || C.faja}"/>` + linea('M-21,-49.4Q1.4,-42.6 24,-49.4', TRAZO, 1.6);
    } else if (P === 'sobreveste') {
      // la sobreveste: el escote en V con la cota de malla apareciendo
      dentro = `<path d="M-8,-50L1.4,-31L11,-50Z" fill="${C.tunica}"/>` + malla(-8, -50, 19, 19, C.tunica) + linea('M-8,-50L1.4,-31L11,-50', TRAZO, 1.8);
    } else {
      dentro = `<path d="M-3,-50L1,-26L6,-50Z" fill="${C.tunica}"/>` + linea('M-3,-50L1,-26L6,-50', TRAZO, 1.8);
    }
    pieza(a, tronco, C.chaleco, { s: 4, h: 1.6, pintas: P === 'placa' ? null : [12, 7], caja: [-25, -50, 50, 37], dentro });
    // el emblema en el pecho: el sol (el paladín) o la gema (el guardián celeste)
    if (T.emblema === 'sol') {
      a.add(`<path d="${V.estrellaD(1.4, -38, 8.4, 4.6, 8)}" fill="${C.oro}" stroke="${TRAZO}" stroke-width="1.8" stroke-linejoin="round"/>`);
      pieza(a, V.ell(1.4, -38, 3.8, 3.8), '#ffe27a', { s: 1, h: 0.6, tw: 1.6 });
    } else if (T.emblema === 'gema') {
      pieza(a, 'M1.4,-46L7,-38.6L1.4,-31L-4.2,-38.6Z', C.gema, { s: 2, h: 1, tw: 2.2, luz: '#ffd6f5' });
      a.add(linea('M-1,-41L1.4,-43.4', '#ffffff', 1.4, 0.9));
    }
    // la correa de cuero atravesada en el pecho (el patrullero), con la hebilla
    if (T.correa) {
      pieza(a, 'M18,-50L24,-47L-16,-21L-20,-25Z', C.cuero, { s: 1.6, h: 0.8, tw: 2.4 });
      pieza(a, 'M2,-39L7,-36L4,-31.6L-1,-34.6Z', C.oro, { s: 1, h: 0.6, tw: 1.8 });
    }
    // la faja con el nudo colgando y el cinto oscuro con la hebilla
    pieza(a, 'M-21,-26L24,-26L23.6,-19L-20.6,-19Z', C.faja, { s: 2.4, h: 1, tw: 2.8 });
    if (P !== 'placa') pieza(a, 'M-12,-21L-6,-21L-5,-9L-9,-6L-13,-9Z', sh(C.faja, -0.06), { s: 2, h: 1, tw: 2.4 });
    pieza(a, 'M-20.2,-19.4L23.4,-19.4L22.8,-14.6L-19.6,-14.6Z', C.cinto, { s: 1.6, h: 0.8, tw: 2.6 });
    pieza(a, 'M5.4,-20.6L11.4,-20.6L11.4,-13.6L5.4,-13.6Z', C.oro, { s: 1.4, h: 0.8, tw: 2.2 });
    // la bolsa de monedas en la cadera de cerca, con las monedas apareciendo (el mercenario)
    if (T.bolsa) {
      pieza(a, V.ell(18.6, -11, 4.4, 2.2), C.moneda, { s: 1.2, h: 0.6, tw: 2 });
      pieza(a, 'M13,-13C12,-6 15,-2 19,-2C23,-2 25,-6 24,-13Z', C.cuero, { s: 2, h: 1, tw: 2.6 });
      a.add(linea('M13.6,-11Q18.6,-9 23.6,-11', TRAZO, 1.4));
    }
    a.add('</g>');
  }
  // el remiendo de cuero cosido en el hombro de cerca (como el de la referencia)
  // (las otras rarezas: la hombrera de cuero cosida, o la de placa con los remaches y el borde en el color de ella)
  function remiendo(a, dy, giro) {
    dy = dy || 0;
    a.add(`<g transform="translate(0 ${dy}) rotate(${giro || 0} 22 -46)">`);
    if (T.hombro === 'remiendo') {
      pieza(a, 'M20,-37C21,-42 29,-43 31,-37C32,-33 30,-30 27,-29.4C23.4,-29 20.6,-31.4 20,-37Z', '#b9a79a', {
        s: 2.2, h: 1, tw: 2.6, dentro: costura('M22.2,-36.6C23.2,-39.6 28,-40 29.2,-36.4C29.6,-34.2 28.6,-32.6 26.8,-32.2', '#5e4f47'),
      });
    } else {
      const placa = T.hombro === 'placa', color = placa ? (C.yelmo || C.chaleco) : sh(C.cuero, -0.08);
      const d = 'M14.6,-42C15,-51 30,-54 35,-43.6C37.6,-37 34.6,-30.6 28.6,-29.4C21.4,-28.4 14.4,-34 14.6,-42Z';
      pieza(a, d, color, { s: 2.6, h: 1.2, tw: 2.8, luz: placa ? sh(color, 0.45) : undefined,
        dentro: placa
          ? `<path d="M15,-36C19,-30.6 28,-29 35.6,-35.4L36,-29L15,-29Z" fill="${T.capa[3] || C.faja}"/>` + linea('M15,-36C19,-30.6 28,-29 35.6,-35.4', TRAZO, 1.6) +
            `<circle cx="20.4" cy="-43" r="1.3" fill="${sh(color, -0.45)}"/><circle cx="29" cy="-46" r="1.3" fill="${sh(color, -0.45)}"/>`
          : costura('M17.4,-41.4C18,-48.4 29.4,-50.6 33,-43C34.6,-38.6 33,-34 28.6,-32.6', '#4a3424') + linea('M24,-52L22,-29', sh(C.cuero, -0.4), 1.4) });
      // la gema en el medio de la hombrera (el guardián celeste): el cristal de la rareza
      if (C.cristal) pieza(a, 'M25.6,-48L29,-42.4L25.6,-37.6L22.2,-42.4Z', C.cristal, { s: 1, h: 0.6, tw: 1.8, luz: '#ffe0f8' });
    }
    a.add('</g>');
  }

  // La Cabeza bajo la capucha (grande, el chibi), el mentón en (x, y). o: { ojos: 'serio'|'bravo'|'cerrados', boca:
  // 'seria'|'grita'|'duerme', giro }
  function cabeza(a, x, y, o) {
    o = o || {};
    a.add(`<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(o.giro || 0)} 4 -24)">`);
    // el pañuelo en el cuello (debajo de la capucha; el cuello de malla o de placa en las altas)
    const tela = T.cab === 'capucha', mz = T.malla === 'todo';
    pieza(a, 'M-24,-6C-12,4 14,4 28,-6L29,4C14,12 -12,12 -25,4Z', C.panuelo, { s: 2.6, h: 1.2, pintas: tela ? [T.pocasPintas ? 3 : 8, 11] : null, caja: [-25, -6, 54, 18],
      dentro: mz ? malla(-25, -6, 54, 18, C.panuelo) : '' });
    // la capucha: la lona con pintas, la punta y el oscuro de dentro (la capucha de cota de malla debajo del yelmo; el claro del
    // guardián celeste, sin las pintas de tela gastada)
    const capucha = 'M-35,-12C-42,-36 -31,-66 -3,-71C23,-75 41,-56 39,-31C38,-17 35,-7 29,-1L-28,-1C-33,-5 -35,-9 -35,-12Z';
    pieza(a, capucha, C.capucha, { s: 5, h: 2, pintas: tela ? [T.pocasPintas ? 16 : 44, 5] : null, caja: [-42, -75, 82, 74],
      dentro: T.malla ? malla(-42, -75, 82, 74, C.capucha) : '' });
    // la pluma presa en la capucha (el patrullero)
    if (T.pluma) {
      a.add('<g transform="translate(-22 -60) rotate(-56)">');
      pieza(a, V.hoja(28, 10, 0.5), '#efe3c4', { s: 2, h: 1, tw: 2.4,
        dentro: linea('M0,0L0,-26', '#9c7a4a', 1.4) + linea('M-4,-12L4,-14M-4.4,-18L4,-20', '#8a5a3a', 2.2) });
      a.add('</g>');
    }
    const dentro = 'M-17,-13C-19,-34 -7,-50 11,-50C27,-50 35,-38 34,-22C33,-10 27,-4 19,-2L-11,-2C-15,-5 -17,-9 -17,-13Z';
    a.add(`<path d="${dentro}" fill="${C.capuchaD}"/>`);
    // la oreja de lejos
    pieza(a, V.ell(-14.6, -20, 3.6, 5.2), sh(C.piel, -0.12), { s: 1.6, h: 0.8, tw: 2.4 });
    // la cara (3/4 hacia la derecha) con la sombra de la capucha por delante
    const cara = 'M-13,-20C-13,-36 -3,-46 11,-46C25,-46 32,-36 31,-22C30,-10 23,-3 10,-3C-3,-3 -13,-9 -13,-20Z';
    pieza(a, cara, C.piel, {
      s: 3.4, h: 1.4,
      dentro: `<rect x="-16" y="-50" width="52" height="14" fill="${a.lg([[0, '#2a1f1d', 0.75], [1, '#2a1f1d', 0]])}"/>` +
        `<ellipse cx="0" cy="-13" rx="4.4" ry="2.4" fill="#d9675e" opacity=".22"/><ellipse cx="24" cy="-13" rx="4" ry="2.2" fill="#d9675e" opacity=".2"/>`,
    });
    // los ojos grandes: el blanco, el iris verde mirando hacia delante, el párpado grueso y la ceja baja
    const ojos = o.ojos || 'serio';
    if (ojos === 'cerrados') {
      a.add(linea('M-4,-24Q1,-20.6 6,-24M14,-24Q19.4,-20.4 25,-24', TRAZO, 2.4));
      a.add(linea('M-6,-30L6,-28.6M13,-28.6L26,-30', TRAZO, 2.8));
    } else if (ojos === 'x') {
      // el K.O. (la mazmorra): los ojos en X y la ceja caída
      a.add(linea('M-3,-28L5,-20M5,-28L-3,-20M15.4,-28.4L23.8,-20.2M23.8,-28.4L15.4,-20.2', TRAZO, 2.8));
      a.add(linea('M-6,-33L6,-31.6M13,-31.6L26,-33.4', TRAZO, 2.4));
    } else if (ojos === 'feliz') {
      // la victoria: los ojos cerrados de alegría (los arcos hacia arriba) y la ceja alzada
      a.add(linea('M-4.4,-22.6Q1,-29.4 6.4,-22.6M13.6,-23Q19.6,-29.8 25.4,-23', TRAZO, 2.8));
      a.add(linea('M-6,-35Q0,-37.6 6,-35.4M13.6,-35.6Q20,-38 26.4,-35', TRAZO, 2.4));
      a.add(`<ellipse cx="-1" cy="-15" rx="4.6" ry="2.6" fill="#e0605a" opacity=".45"/><ellipse cx="25" cy="-15" rx="4.2" ry="2.4" fill="#e0605a" opacity=".42"/>`);
    } else {
      const bravo = ojos === 'bravo', abre = bravo ? 1.6 : 0;
      const ojo = (cx, cy, rx, ry, ix) => {
        const e = V.ell(cx, cy, rx, ry + abre);
        const cl = a.clip(e);
        a.add(`<path d="${e}" fill="#f4efe6"/>`);
        a.add(`<g clip-path="${cl}"><circle cx="${n2(ix)}" cy="${n2(cy + 0.4)}" r="${n2(ry * 0.92 + abre * 0.4)}" fill="${C.ojo}"/>` +
          `<circle cx="${n2(ix)}" cy="${n2(cy + 0.4)}" r="${n2(ry * 0.92 + abre * 0.4)}" fill="none" stroke="${sh(C.ojo, -0.45)}" stroke-width="1"/>` +
          `<circle cx="${n2(ix + 0.4)}" cy="${n2(cy + 0.6)}" r="${n2(ry * 0.42)}" fill="${TRAZO}"/>` +
          `<circle cx="${n2(ix - 1.2)}" cy="${n2(cy - 1)}" r="1.1" fill="#fff"/>` +
          `<rect x="${n2(cx - rx - 1)}" y="${n2(cy - ry - abre - 2)}" width="${n2(rx * 2 + 2)}" height="${n2(bravo ? 2.4 : 3.6)}" fill="${sh(C.piel, -0.32)}"/></g>`);
        a.add(`<path d="${e}" fill="none" stroke="${TRAZO}" stroke-width="1.6"/>`);
      };
      ojo(1, -24, 5.6, 4.4, 3.2);
      ojo(19.6, -24.4, 6, 4.6, 22);
      // el párpado de arriba (grueso) y la ceja bajando hacia la nariz
      a.add(linea(`M-5,${-26.6 - abre}Q1,${-30 - abre} 7,${-27.6 - abre}M13.4,${-27.8 - abre}Q19.6,${-30.6 - abre} 26,${-26.8 - abre}`, TRAZO, 2.6));
      a.add(bravo
        ? `<path d="M-7,-37L7,-31L6,-28.6L-7.6,-33.6Z" fill="${TRAZO}"/><path d="M13.6,-31L28,-37.6L28.6,-34.2L14.2,-28.6Z" fill="${TRAZO}"/>`
        : `<path d="M-7,-34L7,-31L6.6,-28.6L-7.4,-31Z" fill="${TRAZO}"/><path d="M13.6,-31L28,-34.4L28.4,-31.4L14,-28.6Z" fill="${TRAZO}"/>`);
    }
    // la nariz y la boca (la cara cerrada; gritando; durmiendo)
    a.add(linea('M11.6,-21Q13.6,-16.6 11,-15', sh(C.piel, -0.5), 1.8));
    const bocas = {
      seria: linea('M5,-9.4Q10,-12 15.4,-9.6', TRAZO, 2.2),
      grita: `<path d="M4.4,-12Q10,-15 16,-12Q15.4,-4.4 10,-4.4Q5,-4.4 4.4,-12Z" fill="#5a1a22" stroke="${TRAZO}" stroke-width="2" stroke-linejoin="round"/><path d="M6.6,-7.2Q10,-9 13.6,-7.2Q12.6,-5 10,-5Q7.6,-5 6.6,-7.2Z" fill="#d9675e"/>`,
      duerme: `<ellipse cx="10" cy="-9.6" rx="2" ry="1.6" fill="#5a1a22" stroke="${TRAZO}" stroke-width="1.4"/>`,
      // el K.O.: la boca torcida abierta con la lengua de fuera
      ko: `<path d="M4.4,-11.6Q7.2,-13.6 10,-11.6Q12.8,-13.8 15.6,-11.4Q15,-6.4 10,-6.6Q5,-6.4 4.4,-11.6Z" fill="#5a1a22" stroke="${TRAZO}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M9,-8.4Q12.4,-9.6 14,-7.4Q14.6,-3.4 11.6,-3Q8.8,-3.2 9,-8.4Z" fill="#e2747a" stroke="${TRAZO}" stroke-width="1.6" stroke-linejoin="round"/>`,
      // la victoria: la gran sonrisa abierta, los dientes de arriba
      rie: `<path d="M3.4,-13Q10,-10.4 17,-13.2Q16,-3.8 10,-3.8Q4.4,-3.8 3.4,-13Z" fill="#5a1a22" stroke="${TRAZO}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M5,-11.8Q10,-9.8 15.4,-12L15,-9.6Q10,-8 5.6,-9.4Z" fill="#fffaf0"/><path d="M6.8,-6.6Q10,-8.4 13.6,-6.8Q12.6,-4.6 10,-4.6Q7.6,-4.6 6.8,-6.6Z" fill="#d9675e"/>`,
    };
    a.add(bocas[o.boca] || bocas.seria);
    // la cicatriz en el ojo de cerca (el mercenario y el guerrero)
    if (T.cicatriz) a.add(linea('M24.6,-38L21,-14', '#e2a888', 1.6) + linea('M21.8,-33L25,-32.4M21.2,-27L24.4,-26.4M20.6,-19.6L23.8,-19', '#e2a888', 1.1));
    // el borde de la capucha alrededor de la cara (más grueso arriba), por arriba de todo
    const borde = 'M-19,-8C-22,-34 -8,-53 11,-53C29,-53 38,-40 37,-22C36.6,-14 34,-8 31,-3L27,-4C30,-9 32,-15 32,-22C32,-37 25,-47 11,-47C-3,-47 -14,-33 -12.6,-8Z';
    pieza(a, borde, sh(C.capucha, -0.06), { s: 2.4, h: 1.2, pintas: tela ? [T.pocasPintas ? 5 : 14, 9] : null, caja: [-22, -53, 60, 50],
      dentro: T.malla ? malla(-22, -53, 60, 50, sh(C.capucha, -0.06)) : '' });
    if (T.cab === 'yelmo' || T.cab === 'penacho' || T.cab === 'alas') yelmo(a);
    else if (T.cab === 'tiara') tiara(a);
    // la aureola (el guardián celeste), menos en el K.O.
    if (T.aureola && o.ojos !== 'x') {
      a.add(`<ellipse cx="8" cy="-82" rx="17" ry="3.8" fill="none" stroke="${T.brillo}" stroke-opacity=".45" stroke-width="7"/>`);
      a.add(`<ellipse cx="8" cy="-82" rx="17" ry="3.8" fill="none" stroke="${TRAZO}" stroke-width="4.6"/>`);
      a.add('<ellipse cx="8" cy="-82" rx="17" ry="3.8" fill="none" stroke="#fff4c2" stroke-width="2.4"/>');
    }
    a.add('</g>');
  }

  // El YELMO por arriba de la capucha de malla (las altas): el casco, la faja delantera con los remaches; el guerrero tiene el nasal, el
  // caballero el penacho morado cayendo hacia atrás, el paladín las alitas y la gema en la frente. En el marco de la cabeza (el mentón
  // en (0,0)), el más alto queda en ~-86 (cabe en la caja del panel)
  function yelmo(a) {
    const color = C.yelmo, k = T.cab;
    // la alita del yelmo (el paladín): el ala de plumas, pequeña, dorada en el borde
    const alita = (x, y, e, g) => {
      a.add(`<g transform="translate(${x} ${y}) rotate(${g}) scale(${e})">`);
      pieza(a, ALA, '#fdf9ef', { s: 4, h: 1.6, tw: 4.4, sombra: '#e3cf9c', luz: '#ffffff', dentro: linea(PLUMAS, '#d9b45a', 2.4) });
      a.add('</g>');
    };
    if (k === 'penacho') {
      // el penacho: nace delante del alto del casco, pasa por arriba y cae por la espalda en mechones
      const pl = 'M16,-74C10,-84 -12,-88 -28,-81C-41,-75 -48,-62 -47,-44Q-44,-52 -40,-49Q-39,-57 -34,-55Q-33,-63 -27,-63Q-23,-70 -16,-69Q-10,-75 -2,-74Q7,-77 16,-74Z';
      pieza(a, pl, C.pluma, { s: 3.4, h: 1.6, tw: 2.8, luz: sh(C.pluma, 0.42),
        dentro: linea('M10,-79C-4,-84 -26,-80 -38,-66M-2,-78C-14,-79 -26,-74 -33,-63', sh(C.pluma, -0.4), 1.4) });
    }
    // el ala de lejos, atrás del casco
    if (k === 'alas') alita(-24, -60, 0.5, 4);
    // el casco (hasta la faja delantera)
    const casco = 'M-33,-52C-37,-66 -21,-76 4,-77C28,-78 44,-66 41,-51C20,-47 -12,-47 -33,-52Z';
    pieza(a, casco, color, { s: 4, h: 1.8, tw: TW, luz: sh(color, 0.5), sombra: sh(color, -0.34),
      dentro: linea('M6,-76Q9,-63 8.6,-49', sh(color, 0.6), 2.2, 0.8) + linea('M-30,-58Q4,-52 40,-57', sh(color, -0.3), 1.2) });
    // la faja delantera
    const fx = 'M-33,-52C-12,-47 20,-47 41,-51L41.4,-44C20,-39.6 -12,-39.6 -33.4,-45Z';
    pieza(a, fx, sh(color, -0.08), { s: 2, h: 1, tw: 2.8, luz: sh(color, 0.4),
      dentro: [-25, -15, 27, 35].map((x) => `<circle cx="${x}" cy="${n2(x < 10 ? -46.2 + (x + 25) * 0.04 : -45.6)}" r="1.4" fill="${sh(color, -0.5)}"/>`).join('') });
    if (k === 'yelmo') {
      // el nasal bajando entre los ojos
      pieza(a, 'M7.6,-44.6L13.4,-45L12.6,-21L10.2,-18.4L8.2,-21Z', sh(color, -0.04), { s: 1.6, h: 0.8, tw: 2.4, luz: sh(color, 0.5) });
    }
    if (k === 'alas') {
      // el ala de cerca (reflejada, hacia arriba y hacia atrás) y la gema roja por delante
      a.add('<g transform="translate(35 -58) scale(-1 1)">'); alita(0, 0, 0.42, -14); a.add('</g>');
      pieza(a, 'M10,-50L14,-45.4L10,-40.8L6,-45.4Z', C.gema, { s: 1.2, h: 0.6, tw: 2, luz: '#ffb3b8' });
    }
  }
  // la tiara de cristal del guardián celeste: el arco en el borde de la capucha y los 3 cristais rosa
  function tiara(a) {
    a.add(linea('M-13.6,-36C-10,-50 0,-55.6 11,-55.6C23,-55.6 32,-48 35,-36', TRAZO, 5.4));
    a.add(linea('M-13.6,-36C-10,-50 0,-55.6 11,-55.6C23,-55.6 32,-48 35,-36', '#ffe7a8', 2.8));
    const cr = (x, y, h, w) => pieza(a, `M${x},${y - h}L${n2(x + w)},${n2(y - h * 0.35)}L${x},${y}L${n2(x - w)},${n2(y - h * 0.35)}Z`, C.cristal,
      { s: 1.4, h: 0.8, tw: 2.2, luz: '#ffe0f8' });
    cr(-1, -52, 9, 3.4);
    cr(23, -52, 9, 3.4);
    cr(11, -54, 15, 4.6);
  }

  /* ---------------- poses ---------------- */
  // de guarda: la espada en la mano de cerca, la punta en el suelo; el brazo de lejos junto al cuerpo
  function atento(a) {
    a.sombra(4, 0.5, 30, 6, 0.4, 2.4);
    capa(a, 0);
    brazo(a, [-20, -46], [-25, -27], true);
    pierna(a, -9, -15, -1, 0, true);
    pierna(a, 9, -15, 1, 0, false);
    cuerpo(a, 0);
    espada(a, 31, -30, 172, 30);
    brazo(a, [21, -45], [30, -29], false);
    remiendo(a, 0);
    cabeza(a, 2, -46, { ojos: 'serio', boca: 'seria' });
  }
  // la marcha (paso 0 o 1): la espada en el hombro, el brazo de lejos balanceándose, un pie en el aire
  function marcha(a, paso) {
    const s = paso ? 1 : -1;
    a.sombra(4, 0.5, 30, 6, 0.4, 2.4);
    capa(a, 0);
    brazo(a, [-20, -46], [-24 - 4 * s, -28], true);
    pierna(a, -9, -15, -3 * s, s > 0 ? 3 : 0, true);
    pierna(a, 9, -15, 3 * s, s < 0 ? 3 : 0, false);
    cuerpo(a, 0);
    espada(a, 30, -30, 128, 34);
    brazo(a, [21, -45], [30, -29], false);
    remiendo(a, 0);
    cabeza(a, 2, -46, { ojos: 'serio', boca: 'seria' });
  }
  // el horario del PvP: la espada alzada en lo alto, gritando, el puño de lejos cerrado
  function llama(a) {
    a.sombra(4, 0.5, 32, 6.4, 0.4, 2.4);
    capa(a, 0);
    brazo(a, [-20, -46], [-30, -34], true, true);
    pierna(a, -10, -15, -4, 0, true);
    pierna(a, 10, -15, 4, 0, false);
    cuerpo(a, 0);
    espada(a, 33, -70, 12, 46);
    brazo(a, [21, -45], [33, -68], false, true);
    remiendo(a, 0, -30);
    cabeza(a, 2, -46, { ojos: 'bravo', boca: 'grita', giro: -5 });
  }
  // el casero corta el árbol: fase 0 = el hacha alzada del lado de cerca, fuera de la capucha (el cuerpo hacia atrás); 1 = el golpe
  // delante, a la altura del tronco (el cuerpo hacia delante)
  function corta(a, fase) {
    a.sombra(4, 0.5, 32, 6.4, 0.4, 2.4);
    capa(a, 0);
    pierna(a, -10, -15, -3, 0, true);
    pierna(a, 10, -15, 4, 0, false);
    const giro = fase ? 7 : -5;
    a.add(`<g transform="rotate(${giro} 0 -14)">`);
    if (fase) {
      brazo(a, [-20, -46], [22, -38], true, true);
      cuerpo(a, 0);
      hacha(a, 30, -36, 98, 30);
      brazo(a, [21, -45], [30, -36], false, true);
      a.add('</g>');
      cabeza(a, 4, -45, { ojos: 'bravo', boca: 'seria', giro: 6 });
    } else {
      brazo(a, [-20, -46], [16, -42], true, true);
      cuerpo(a, 0);
      a.add('</g>');
      cabeza(a, 1, -46, { ojos: 'serio', boca: 'seria', giro: -5 });
      // el hacha alzada del lado de cerca (fuera de la capucha, sin tapar la cara)
      hacha(a, 33, -52, 26, 38);
      brazo(a, [21, -45], [33, -52], false, true);
    }
  }
  // la lucha con los monstruos (la invasión): fase 0 = la espada alzada del lado de cerca, inclinada hacia atrás, el cuerpo
  // echado atrás (en guardia); 1 = el golpe delante, la hoja bajando hasta la altura del monstruo, el cuerpo hacia delante, gritando
  function golpe(a, fase) {
    a.sombra(4, 0.5, 32, 6.4, 0.4, 2.4);
    capa(a, 0);
    if (fase) {
      pierna(a, -11, -15, -5, 0, true);
      pierna(a, 10, -15, 7, 0, false);
      a.add('<g transform="rotate(8 0 -14)">');
      brazo(a, [-20, -46], [6, -38], true, true);
      cuerpo(a, 0);
      a.add('</g>');
      cabeza(a, 5, -45, { ojos: 'bravo', boca: 'grita', giro: 7 });
      espada(a, 36, -34, 112, 44);
      brazo(a, [23, -43], [36, -34], false, true);
      remiendo(a, 2, 14);
    } else {
      pierna(a, -10, -15, -4, 0, true);
      pierna(a, 10, -15, 3, 0, false);
      a.add('<g transform="rotate(-6 0 -14)">');
      brazo(a, [-20, -46], [-29, -32], true, true);
      cuerpo(a, 0);
      a.add('</g>');
      cabeza(a, 0, -46, { ojos: 'bravo', boca: 'seria', giro: -6 });
      espada(a, 38, -66, -26, 46);
      brazo(a, [20, -46], [37, -64], false, true);
      remiendo(a, -1, -34);
    }
  }
  // agachado: el cuerpo abajo y curvado hacia delante, las rodillas dobladas, la mano de cerca en el suelo (coge la planta o la piedra)
  function agacha(a) {
    const T = 'translate(6 13) rotate(22 0 -14)';
    a.sombra(10, 0.5, 34, 6.4, 0.4, 2.4);
    a.add(`<g transform="${T}">`); capa(a, 0); a.add('</g>');
    piernaDoblada(a, [-6, -8], [8, -14], [2, -3], true);
    a.add(`<g transform="${T}">`); cuerpo(a, 0); a.add('</g>');
    brazo(a, [-1, -38], [10, -16], true);
    piernaDoblada(a, [8, -7], [22, -12], [17, -3], false);
    brazo(a, [37, -22], A.GUARDIAN_MANO.agacha, false);
    cabeza(a, 20, -30, { ojos: 'serio', boca: 'seria', giro: 26 });
  }
  // levantando con la cosa en la mano de cerca, hacia delante (la escena dibuja la cosa en la mano)
  function pega(a) {
    const T = 'translate(3 6) rotate(8 0 -14)';
    a.sombra(6, 0.5, 32, 6.2, 0.4, 2.4);
    a.add(`<g transform="${T}">`); capa(a, 0); a.add('</g>');
    piernaDoblada(a, [-7, -12], [4, -16], [0, -3], true);
    a.add(`<g transform="${T}">`); cuerpo(a, 0); a.add('</g>');
    brazo(a, [-12, -42], [2, -20], true);
    piernaDoblada(a, [7, -11], [17, -15], [13, -3], false);
    brazo(a, [28, -36], A.GUARDIAN_MANO.pega, false);
    cabeza(a, 9, -40, { ojos: 'serio', boca: 'seria', giro: 10 });
  }

  // el cajón de madera (donde él se sienta para dormitar), de x0 a x1, altura h
  function cajon(a, x0, x1, h) {
    pieza(a, `M${x0},${-h}L${x1},${-h}L${x1},0L${x0},0Z`, C.madera, {
      s: 3.4, h: 1.4, dentro: linea(`M${x0},${n2(-h / 2)}L${x1},${n2(-h / 2)}M${x0 + 3},${-h + 3}L${x1 - 3},-3`, sh(C.madera, -0.45), 1.8),
    });
  }
  // dormitando sentado en el cajón: la cabeza caída, las manos en el regazo, la espada apoyada
  function duerme(a) {
    const DY = 10;
    a.sombra(4, 0.5, 34, 6.4, 0.38, 2.6);
    espada(a, -34, -22, -14, 34);
    cajon(a, -30, 30, 17);
    capa(a, DY);
    pierna(a, -9, -15 + DY - 4, 2, 0, true);
    pierna(a, 9, -15 + DY - 4, 4, 0, false);
    cuerpo(a, DY - 4);
    brazo(a, [-20, -46 + DY - 4], [-6, -19], true);
    brazo(a, [21, -45 + DY - 4], [8, -19], false);
    remiendo(a, DY - 4);
    cabeza(a, 4, -38, { ojos: 'cerrados', boca: 'duerme', giro: 14 });
  }

  // la mazmorra (19/oct): el K.O.. Él cae hacia atrás (hacia la izquierda, lejos del monstruo) y queda tumbado de espalda: las
  // botas cerca del lugar donde estaba (el pie en (0,0)), una rodilla hacia arriba, la cabeza en el suelo a la izquierda girada hacia la
  // cámara con los ojos en X y la lengua de fuera, los brazos sueltos y la espada caída en el suelo delante de él
  function caido(a) {
    a.sombra(-34, 0.5, 74, 7.4, 0.4, 2.6);
    // la capa abierta en el suelo, debajo de él
    pieza(a, 'M-60,-2C-64,-12 -56,-28 -42,-32L-10,-28C-6,-20 -6,-9 -8,-1Z', capaColor(), { s: 3, h: 1.2, pintas: T.capa[2] === 'recta' ? null : [10, 3], caja: [-62, -32, 56, 32] });
    // la pierna de lejos estirada, la bota de punta hacia arriba
    pieza(a, capsula([-6, -9], [26, -8], 10.6), sh(C.pantalon, -0.2), { s: 2.4, h: 1 });
    a.add('<g transform="translate(34 -4) rotate(-90)">');
    pieza(a, 'M-7,-8C-7,-11 5,-11 6,-7.6C11,-7 12.6,-3 12,0L-7.4,0Z', sh(C.bota, -0.16), { s: 2.6, h: 1.2, luz: sh(C.bota, 0.22) });
    a.add('</g>');
    // el brazo de lejos suelto en el suelo
    brazo(a, [-38, -14], [-52, -3], true, true);
    // el tronco tumbado (el pecho hacia arriba): el chaleco, la túnica en el cuello, la faja y el cinto cerca dla cadera
    pieza(a, 'M-44,-30C-47,-21 -46,-10 -42,-4L-2,-4C1,-11 1,-23 -3,-31Z', C.chaleco, {
      s: 3.4, h: 1.4, pintas: [10, 7], caja: [-47, -31, 48, 27],
      dentro: `<path d="M-44,-24L-28,-19L-44,-13Z" fill="${C.tunica}"/>` + linea('M-44,-24L-28,-19L-44,-13', TRAZO, 1.8),
    });
    pieza(a, 'M-16,-31.6L-9,-31.6L-9,-3.6L-16,-3.6Z', C.faja, { s: 2, h: 1, tw: 2.6 });
    pieza(a, 'M-9,-31.6L-4.6,-31.6L-4.6,-3.6L-9,-3.6Z', C.cinto, { s: 1.4, h: 0.8, tw: 2.4 });
    pieza(a, 'M-10,-21L-3.6,-21L-3.6,-15L-10,-15Z', C.oro, { s: 1.2, h: 0.6, tw: 2 });
    // la pierna de cerca con la rodilla hacia arriba, el pie en el suelo
    piernaDoblada(a, [-4, -14], [12, -31], [22, -3], false);
    // el brazo de cerca caído delante
    brazo(a, [-34, -24], [-22, -2], false, true);
    // la cabeza en el suelo, girada hacia la cámara: los ojos en X y la lengua de fuera
    cabeza(a, -60, -12, { ojos: 'x', boca: 'ko', giro: -45 });
    // la espada caída en el suelo, delante de él
    espada(a, 12, 6, 100, 38);
  }
  // la mazmorra (19/oct): la victoria (llegó al fin). De piernas abiertas, la espada alzada bien en lo alto con la mano de cerca, el
  // puño de lejos en la cintura, sonriendo de ojos cerrados
  function victoria(a) {
    a.sombra(4, 0.5, 32, 6.4, 0.4, 2.4);
    capa(a, 0);
    brazo(a, [-20, -46], [-27, -27], true, true);
    pierna(a, -12, -15, -6, 0, true);
    pierna(a, 12, -15, 7, 0, false);
    cuerpo(a, 0);
    remiendo(a, 0);
    cabeza(a, 1, -47, { ojos: 'feliz', boca: 'rie', giro: -5 });
    espada(a, 38, -84, 8, 46);
    brazo(a, [21, -45], [37, -82], false, true);
  }

  // las estrellitas alrededor (la legendaria y la mítica), fuera del cuerpo; no en la siesta ni en el K.O.
  // el "?" del oculto durmiendo: el bocadillo blanco con el trazo, encima de la cabeza
  function interrogacion(a) {
    const x = 22, y = -86;
    a.add(`<circle cx="${x}" cy="${y}" r="12.5" fill="#ffffff" stroke="${TRAZO}" stroke-width="${TW}"/>`);
    a.add(`<path d="M${x - 4.2},${y - 3.4}C${x - 4.2},${y - 9.6} ${x + 4.6},${y - 9.6} ${x + 4.6},${y - 3.6}C${x + 4.6},${y + 0.2} ${x},${y} ${x},${y + 3.6}" fill="none" stroke="${TRAZO}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`);
    a.add(`<circle cx="${x}" cy="${y + 8}" r="2" fill="${TRAZO}"/>`);
  }
  function brillos(a) {
    for (const [x, y, r] of [[-38, -98, 5], [46, -88, 3.6], [-44, -34, 3]]) {
      a.add(`<path d="${V.cruzD(x, y, r + 1.6)}" fill="${TRAZO}" opacity=".55"/><path d="${V.cruzD(x, y, r)}" fill="${T.brillo}"/>`);
    }
  }

  // `equipo` puede ser: un EQUIPO ya compuesto (objeto con paleta + estructura, ver componerEquipo),
  // una rareza/preset por nombre ('free'…'mitica'), A.GUARDIAN_OCULTO, o nada (= free).
  A.guardian = function (pose, equipo) {
    const P = POSES[pose] ? pose : 'atento';
    const tr = (equipo && typeof equipo === 'object') ? equipo
      : equipo === A.GUARDIAN_OCULTO ? OCULTO
      : Object.prototype.hasOwnProperty.call(TRAJES, equipo) ? TRAJES[equipo]
      : TRAJES.free;
    const a = V.arte(), antes = [C, T];
    C = Object.assign({}, BASE, tr.color || tr.paleta); T = tr;
    try {
      if (P === 'anda1' || P === 'anda2') marcha(a, P === 'anda1' ? 0 : 1);
      else if (P === 'llama') llama(a);
      else if (P === 'duerme') duerme(a);
      else if (P === 'machado1' || P === 'machado2') corta(a, P === 'machado2' ? 1 : 0);
      else if (P === 'agacha') agacha(a);
      else if (P === 'pega') pega(a);
      else if (P === 'espada1' || P === 'espada2') golpe(a, P === 'espada2' ? 1 : 0);
      else if (P === 'caido') caido(a);
      else if (P === 'victoria') victoria(a);
      else atento(a);
      if (T.brillo && P !== 'duerme' && P !== 'caido') brillos(a);
      if (T.oculto && P === 'duerme') interrogacion(a);
    } finally { C = antes[0]; T = antes[1]; }
    return a.out(4);
  };
  // en la escena: la misma arte en escala de mundo (el pie sigue en (0,0))
  A.guardianCena = function (pose, rareza) {
    const o = A.guardian(pose, rareza);
    // pad: la sombra borrada del pie pasa de la caja medida (el getBBox no cuenta el filtro)
    return conMedida({ svg: `<g transform="scale(${A.GUARDIAN_ESCALA})">${o.svg}</g>`, defs: o.defs, pad: 6 });
  };
  // el rastro del golpe (espada1 -> espada2): la medialuna blanco-azulada que la punta de la espada traza por arriba, del alto hasta
  // la frente. Es un efecto: sin contorno. Escala de mundo; el ancla queda en A.GUARDIAN_CORTE (del pie, unidades del dibujo):
  // la escena dibuja en pie + (lado × GUARDIAN_CORTE[0], GUARDIAN_CORTE[1]) × GUARDIAN_ESCALA, reflejado con él, 'lighter'
  A.guardianCorte = function () {
    const a = V.arte(), E = A.GUARDIAN_ESCALA, O = A.GUARDIAN_CORTE, piv = [22, -45], R = 73;
    const a0 = -96 * Math.PI / 180, a1 = 30 * Math.PI / 180, N = 24;
    const p = (t, r) => [piv[0] + Math.cos(t) * r - O[0], piv[1] + Math.sin(t) * r - O[1]];
    const fuera = [], dentro = [];
    for (let i = 0; i <= N; i++) {
      const k = i / N, t = a0 + (a1 - a0) * k;
      // el grosor: nace fina en lo alto, engrosa hasta cerca de la punta y cierra redonda
      const g = 18 * Math.pow(k, 1.4) * (k > 0.86 ? Math.sqrt(Math.max(0, 1 - ((k - 0.86) / 0.14) ** 2)) : 1);
      fuera.push(p(t, R + 2)); dentro.push(p(t, R + 2 - Math.max(0.6, g)));
    }
    const d = 'M' + fuera.concat(dentro.reverse()).map((q) => n2(q[0]) + ',' + n2(q[1])).join('L') + 'Z';
    const ini = p(a0, R), fin = p(a1, R);
    const gr = a.lg([[0, '#dff4ff', 0], [0.55, '#dff4ff', 0.55], [1, '#ffffff', 0.95]], n2(ini[0]), n2(ini[1]), n2(fin[0]), n2(fin[1]), true);
    a.add(`<g transform="scale(${E})">`);
    a.add(`<path d="${d}" fill="${gr}"/>`);
    // el filo brillante por fuera y dos chispas en la punta
    const filo = 'M' + fuera.slice(Math.floor(N * 0.35)).map((q) => n2(q[0]) + ',' + n2(q[1])).join('L');
    a.add(`<path d="${filo}" stroke="#ffffff" stroke-opacity=".9" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    const f = p(a1, R + 2);
    a.add(`<path d="${V.cruzD(f[0] + 2, f[1] - 4, 6)}" fill="#ffffff"/><path d="${V.cruzD(f[0] - 10, f[1] - 12, 3.6)}" fill="#e8f6ff"/>`);
    a.add('</g>');
    return a.out(2);
  };
  // el "!" del horario (bocadillo blanco con la exclamación roja) y el arco del grito
  A.guardianBalao = function () {
    const a = V.arte();
    pieza(a, 'M-11,-30C-11,-38 -6,-42 0,-42C6,-42 11,-38 11,-30C11,-22 6,-19 3,-18L0,-12L-3,-18C-6,-19 -11,-22 -11,-30Z', '#ffffff', { s: 2.4, h: 0, sombra: '#d9dde6', tw: 2.6 });
    a.add('<path d="M0,-37.4L0,-28.6" stroke="#e8505b" stroke-width="4.4" stroke-linecap="round"/><circle cx="0" cy="-23.4" r="2.5" fill="#e8505b"/>');
    return conMedida(a.out(3));
  };
  A.guardianLatido = function () {
    const a = V.arte();
    a.add(`<path d="M0,-10Q6,-5 0,0M5,-14Q13,-5 5,4" stroke="${TRAZO}" stroke-width="4.6" fill="none" stroke-linecap="round"/>`);
    a.add('<path d="M0,-10Q6,-5 0,0M5,-14Q13,-5 5,4" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round"/>');
    return a.out(3);
  };

  if (V.dibujos) {
    // op: { pose, px, py, retrato }: el tamaño del bitmap; el dibujo ocupa la caja: el cuerpo entero o el busto (cuadrado)
    const VB = { lleno: [-48, -132, 104, 138], busto: [-42, -126, 84, 84], llama: [-42, -132, 90, 90], duerme: [-46, -118, 92, 92],
      caido: [-122, -100, 184, 116], caidoBusto: [-112, -92, 92, 92], victoria: [-48, -146, 104, 152], victoriaBusto: [-42, -128, 86, 86] };
    // el busto de las altas sube un poco (el yelmo, el penacho, las alitas y la aureola pasan de la capucha), en el mismo tamaño
    const SUBE = { rara: 4, epica: 8, legendaria: 8, mitica: 10 };
    V.dibujos.guardian = (op) => {
      op = op || {};
      const p = op.pose === 'caido' || op.pose === 'victoria' ? op.pose : null;
      let vb = op.retrato ? (op.pose === 'duerme' ? VB.duerme : op.pose === 'llama' ? VB.llama : p ? VB[p + 'Busto'] : VB.busto) : p ? VB[p] : VB.lleno;
      const sube = Object.prototype.hasOwnProperty.call(SUBE, op.rareza) ? SUBE[op.rareza] : 0;
      if (op.retrato && sube && op.pose !== 'caido') vb = [vb[0], vb[1] - sube, vb[2], vb[3]];
      // el cuerpo entero del guardián celeste abre 10 a la izquierda (las alas pasan de la capucha)
      else if (!op.retrato && op.rareza === 'mitica' && op.pose !== 'caido') vb = [vb[0] - 10, vb[1], vb[2] + 10, vb[3]];
      return V.svgDoc(A.guardian(op.pose, op.rareza), vb.join(' '), ` width="${op.px || vb[2]}" height="${op.py || vb[3]}"`);
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
