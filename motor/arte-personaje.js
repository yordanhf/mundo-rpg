/* =============================================================================
 * SolRanch — VISUAL "cartoon" / ARTE: o GUARDIÃO do rancho (o mercenário do PvP)
 * -----------------------------------------------------------------------------
 * Ele faz a ronda em volta da fazenda (guardiao.js). No PvP, sem escudo, o Free dorme (ele não luta).
 * Pedido do dono (18/out): um MERCENÁRIO no traço "mais desenhado" da referência que
 * ele mandou (um chibi de capuz): contorno escuro grosso, cabeça grande sob o capuz, sombra em 3 tons chapados (luz em
 * cima-esquerda, sombra embaixo-direita), textura de pintas no tecido, olhos grandes de cara fechada.
 *   A.guardiao(pose)  'anda1' | 'anda2' (a marcha, 3/4 olhando para a direita, a espada no ombro) · 'atento' (de guarda,
 *                     a espada na mão, a ponta no chão) · 'chama' (o horário do PvP: a espada erguida, gritando) ·
 *                     'dorme' (sentado no caixote, a cabeça caída)
 *                     o caseiro (pedido do dono, 18/out): 'machado1' | 'machado2' (corta a árvore: o machado erguido atrás
 *                     e o golpe na frente) · 'agacha' (agachado, a mão no chão: pega a planta ou a pedra) · 'pega' (levanta
 *                     com a mão na frente do peito: a cena desenha a coisa na mão, A.GUARDIAO_MAO). Nessas, a espada fica
 *                     guardada.
 *                     a luta com os monstros (a invasão, 19/out): 'espada1' (a espada erguida do lado de perto, a armada)
 *                     | 'espada2' (o golpe na frente; a ponta em A.GUARDIAO_PONTA). A.guardiaoCorte() = o rastro do golpe.
 *                     a dungeon (19/out): 'caido' (o nocaute: deitado de costas para a esquerda, as botas perto do pé,
 *                     os olhos em X, a espada no chão; o meio da cabeça em A.GUARDIAO_CABECA.caido) · 'vitoria' (a
 *                     espada erguida bem no alto, sorrindo; a ponta em A.GUARDIAO_PONTA.vitoria).
 *                     Âncora (0,0) = o chão entre as botas; ~80 × 125 (escala de painel). A cena usa A.GUARDIAO_ESCALA.
 *   A.guardiao(pose, raridade)  os níveis (pedido do dono, 19/out: "precisa condizer com a raridade"): cada um é
 *                     outro defensor, nas MESMAS poses e âncoras (o pé, a mão, a ponta da espada não mudam):
 *                     free = o mercenário de capuz cinza (o de sempre, o padrão de todo mundo) · comum = o escudeiro
 *                     (capuz marrom, lenço vermelho, broquel) · incomum = o patrulheiro (capuz verde com pena, a
 *                     ombreira de couro, a correia) · rara = o guerreiro (elmo de aço com nasal, cota de malha, a
 *                     sobreveste azul) · epica = o cavaleiro (elmo com penacho roxo, a couraça, a capa longa) ·
 *                     lendaria = o paladino (elmo de ouro com asinhas, a armadura clara com o sol, a capa vermelha, a
 *                     espada brilhando) · mitica = o guardião celeste (capuz claro com tiara, a auréola, as asas de luz,
 *                     a espada de cristal). Sem nível (ou desconhecido) = free.
 *   V.desenhos.guardiao({ pose, px, py, retrato, raridade }) -> SVG (painel; retrato = o busto, para os quadradinhos)
 *   A.guardiao(pose, 'oculto')  o mercenário OCULTO da fazenda visitada no PvP (o dono, 23/out: "ao entrar no PVP o
 *                     mercenario deve ficar oculto [...] sem saber a raridade"): o mesmo desenho para todas (fora de
 *                     A.GUARDIAO_RARIDADES)
 * É o ÚNICO desenho com contorno do jogo (pedido do dono, com a referência): o resto da fazenda segue sem contorno.
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ;
  const V = FZ.visual.cartoon;
  const A = (V.A = V.A || {});
  const { n2, sh } = V;

  const TRACO = '#201719', TW = 3.2;   // o contorno (cor e espessura)
  const BASE = {
    capuz: '#77706b', capuzD: '#3b3433', pele: '#b47a52', olho: '#76b84a', lenco: '#6e6461',
    colete: '#52413d', tunica: '#8c2f30', faixa: '#a3363a', cinto: '#2d2224', calca: '#3b3438', bota: '#2f2626',
    couro: '#8a5a3a', aco: '#c9d1da', ouro: '#f2b632', madeira: '#9c6432', moeda: '#ffd54a',
  };
  // OS TRAJES das raridades. cor: o que troca na paleta (o resto = BASE); cab: a cabeça ('capuz' | 'elmo' | 'penacho' |
  // 'asas' | 'tiara'); ombro: 'remendo' | 'couro' | 'placa'; peito: 'colete' | 'sobreveste' | 'placa'; capa: [cor, o
  // tanto a mais de comprimento, 'rasgada' | 'reta', a barra (null = sem)]; malha: 'capuz' (o capuz é cota de malha) | 'tudo'
  // (o capuz e a manga);
  // espada: as cores da lâmina [cor, sombra, luz, o brilho em volta (null = sem)]; brilho: as estrelinhas em volta.
  const TRAJES = {
    // o Free (pedido do dono, 19/out: "o mercenario que vem por padrao vamos tornar ele free"): o mercenário cinza de
    // sempre, o padrão de todo mundo (a paleta BASE)
    free: { cor: {}, cab: 'capuz', ombro: 'remendo', peito: 'colete', bolsa: true, cicatriz: true, capa: [null, 0, 'rasgada', null] },
    // o Comum, o Escudeiro (pedido do dono, 19/out: "trocar o visual do Comum" e depois "vamos criar outro para o comum"):
    // o capuz marrom quente, o lenço vermelho, a camisa clara sob o colete, a calça azul-ardósia e o broquel de madeira
    // nas costas; o remendo, a bolsa de moedas e a cicatriz continuam
    comum: {
      cor: { capuz: '#9a6b45', capuzD: '#38231a', lenco: '#c8372d', colete: '#5b3c2a', tunica: '#eadcbc', faixa: '#c8372d',
        cinto: '#2f2220', calca: '#45506a', bota: '#3a2a22' },
      cab: 'capuz', ombro: 'remendo', peito: 'colete', bolsa: true, cicatriz: true, broquel: true, poucasPintas: true,
      capa: [null, 0, 'rasgada', null],
    },
    incomum: {
      cor: { capuz: '#5d7f3e', capuzD: '#25321c', lenco: '#8d7b55', colete: '#6d4b2f', tunica: '#33622f', faixa: '#c49a52',
        cinto: '#3a2a20', calca: '#4c4637', bota: '#4b3324', olho: '#b47b34' },
      cab: 'capuz', pena: true, ombro: 'couro', peito: 'colete', correia: true, capa: ['#4c6d33', 4, 'rasgada', null],
    },
    rara: {
      cor: { capuz: '#8d98a7', capuzD: '#262b33', lenco: '#8d98a7', colete: '#2f66c9', tunica: '#8d98a7', faixa: '#d8b356',
        cinto: '#3a2a24', calca: '#383d4a', bota: '#3b312d', olho: '#4f95e8', elmo: '#bcc6d2', manga: '#8d98a7', luva: '#6e4a30' },
      cab: 'elmo', malha: 'tudo', ombro: 'placa', peito: 'sobreveste', cicatriz: true, capa: ['#25519f', 6, 'reta', null],
    },
    epica: {
      cor: { capuz: '#7f8a9a', capuzD: '#221f2c', lenco: '#aab4c1', colete: '#b3bdca', tunica: '#7a3fd4', faixa: '#7a3fd4',
        cinto: '#2c2433', calca: '#3a3350', bota: '#69727f', olho: '#9b5cf0', elmo: '#c3ccd8', manga: '#aab4c1', luva: '#9aa5b3',
        pluma: '#9a50f0', guarda: '#d6dbe3', gema: '#a259ff' },
      cab: 'penacho', malha: 'capuz', ombro: 'placa', peito: 'placa', tabardo: true, capa: ['#6a33c2', 12, 'reta', '#c7a4ff'],
      espada: ['#d4dbe4', '#8e9aa9', '#ffffff', null],
    },
    lendaria: {
      cor: { capuz: '#b9c0ca', capuzD: '#2a2630', lenco: '#f0c75a', colete: '#efe8d6', tunica: '#c3283a', faixa: '#c3283a',
        cinto: '#8a5a1a', calca: '#4a2a30', bota: '#d6cdb3', olho: '#e8a21c', elmo: '#f2b632', manga: '#e3dccb', luva: '#f2b632',
        guarda: '#f2b632', gema: '#e8505b' },
      cab: 'asas', malha: 'capuz', ombro: 'placa', peito: 'placa', emblema: 'sol', capa: ['#b3242e', 14, 'reta', '#f2b632'],
      espada: ['#f4f1e6', '#c9a85a', '#ffffff', '#ffd54a'], brilho: '#ffe27a',
    },
    mitica: {
      cor: { capuz: '#f4ecf6', capuzD: '#3a1d40', lenco: '#ffd1f4', colete: '#f3eaf6', tunica: '#8a5cf0', faixa: '#8a5cf0',
        cinto: '#5a2d7a', calca: '#4a3060', bota: '#efe4f3', olho: '#ff4fd8', manga: '#efe4f3', luva: '#ffc6ee',
        guarda: '#ffd1f4', gema: '#ff4fd8', cristal: '#ff7ce4' },
      cab: 'tiara', ombro: 'placa', peito: 'placa', emblema: 'gema', asas: true, aureola: true,
      capa: ['#c22ea6', 14, 'reta', '#ff9fe9'], espada: ['#ffd9f6', '#e06ac8', '#ffffff', '#ff8be6'], brilho: '#ffc8f2',
    },
  };
  // o OCULTO (o dono, 23/out): o mercenário da fazenda visitada no PvP, sem a raridade. O manto escuro, o rosto na sombra
  // e os olhos acesos; nada das cores, do brilho, da bolsa, da cicatriz ou do enfeite de alguma raridade (o Free também
  // vira ele). Dormindo, o "?" em cima
  const OCULTO = {
    cor: { capuz: '#3a3646', capuzD: '#16141c', pele: '#3b3542', olho: '#e8e4ff', lenco: '#2b2833', colete: '#2d2a36', tunica: '#38343f',
      faixa: '#46414f', cinto: '#1d1b23', calca: '#29262f', bota: '#1c1a21', couro: '#3d3845', aco: '#9aa0ab', ouro: '#77727f',
      madeira: '#3f3841', moeda: '#77727f' },
    cab: 'capuz', ombro: 'couro', peito: 'colete', capa: ['#211f29', 10, 'rasgada', null], espada: ['#a7adb8', '#5f6570', '#dde1e8', null],
    oculto: true,
  };
  let C = BASE, T = TRAJES.free;   // o traje do desenho em andamento (A.guardiao troca e volta)
  A.GUARDIAO_RARIDADES = Object.keys(TRAJES);
  A.GUARDIAO_OCULTO = 'oculto';
  A.GUARDIAO_ESCALA = 0.62;
  const POSES = { anda1: 1, anda2: 1, atento: 1, chama: 1, dorme: 1, machado1: 1, machado2: 1, agacha: 1, pega: 1, espada1: 1, espada2: 1, caido: 1, vitoria: 1 };
  // onde fica a mão de perto em cada pose do caseiro (unidades do desenho; × A.GUARDIAO_ESCALA = px de mundo)
  A.GUARDIAO_MAO = { agacha: [46, -5], pega: [40, -41] };
  // a ponta da espada nas poses da luta (unidades do desenho, o pé em (0,0)): as faíscas do golpe saem dali
  A.GUARDIAO_PONTA = { espada1: [14, -115], espada2: [84, -14], vitoria: [45, -137] };
  // a dungeon (19/out): o meio da cabeça no nocaute (as estrelinhas rodam em cima dela), unidades do desenho
  A.GUARDIAO_CABECA = { caido: [-68, -48] };
  // onde fica a âncora do rastro do golpe (A.guardiaoCorte) em relação ao pé (unidades do desenho)
  A.GUARDIAO_CORTE = [40, -30];

  // a luz de cada peça é um retângulo grande recortado pelo contorno. O getBBox não olha o recorte, e a caixa do sprite
  // ficava ~6x maior que o boneco (o bitmap saía 96% vazio: memória e tempo de rasterizar). Para MEDIR a caixa, o
  // retângulo sai (a peça já desenha o contorno inteiro sem recorte, então a caixa continua cobrindo tudo que aparece)
  const LUZ = '<rect x="-200" y="-300" width="400" height="400"';
  const SEM_LUZ = /<rect x="-200" y="-300" width="400" height="400"[^>]*\/>/g;
  const comMedida = (o) => Object.assign(o, { medida: o.svg.replace(SEM_LUZ, '') });

  /* ---------------- o traço: uma peça com 3 tons e contorno ---------------- */
  // um clipPath do caminho deslocado (dx, dy)
  function clipT(a, d, dx, dy) {
    const id = V.gid('k');
    a.D.push(`<clipPath id="${id}"><path d="${d}" transform="translate(${n2(dx)} ${n2(dy)})"/></clipPath>`);
    return `url(#${id})`;
  }
  // a peça: o tom de sombra (embaixo-direita, largura s), a luz fina (cima-esquerda, h), pintas de textura e o contorno.
  // op: { s, h, sombra, luz, pintas: [n, semente], traco (false = sem contorno), tw }
  function peca(a, d, cor, op) {
    op = op || {};
    const s = op.s == null ? 3.4 : op.s, h = op.h == null ? 1.6 : op.h;
    const sombra = op.sombra || sh(cor, -0.3), luz = op.luz || sh(cor, 0.26);
    const cl = a.clip(d);
    a.add(`<path d="${d}" fill="${sombra}"/>`);
    a.add(`<g clip-path="${cl}"><g clip-path="${clipT(a, d, -s, -s)}">${LUZ} fill="${luz}"/>` +
      `<path d="${d}" fill="${cor}" transform="translate(${n2(h)} ${n2(h)})"/></g>`);
    if (op.pintas) a.add(pintas(op.pintas[0], op.pintas[1], op.caixa, cor));
    if (op.dentro) a.add(op.dentro);
    a.add('</g>');
    if (op.traco !== false) a.add(`<path d="${d}" fill="none" stroke="${TRACO}" stroke-width="${op.tw || TW}" stroke-linejoin="round" stroke-linecap="round"/>`);
  }
  // pintas de textura (tecido gasto): escuras e claras, sorteio fixo dentro da caixa
  function pintas(n, semente, cx, cor) {
    const r = V.rng(semente), [x0, y0, w, h] = cx || [-40, -125, 80, 80];
    let o = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * w, y = y0 + r() * h, k = r();
      o += `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(0.5 + r() * 0.9)}" fill="${k < 0.6 ? sh(cor, -0.42) : sh(cor, 0.4)}" opacity="${n2(0.45 + r() * 0.4)}"/>`;
    }
    return o;
  }
  const linha = (d, cor, w, op) => `<path d="${d}" stroke="${cor || TRACO}" stroke-width="${w || 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op ? ` opacity="${op}"` : ''}/>`;
  // costura tracejada (os remendos)
  const costura = (d, cor) => `<path d="${d}" stroke="${cor}" stroke-width="1.1" fill="none" stroke-dasharray="2 1.6" stroke-linecap="round"/>`;

  /* ---------------- peças ---------------- */
  // a espada: o meio do punho em (x, y), girada `ang` graus (0 = a lâmina para cima); L = a lâmina
  function espada(a, x, y, ang, L) {
    L = L || 46;
    a.add(`<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(ang || 0)})">`);
    const b = -8, w = 4.6, E = T.espada || [C.aco, '#8e9aa9', '#f3f7fb', null];
    const lam = `M${-w},${b}L${w},${b}L${w},${n2(b - L + 9)}L0,${n2(b - L)}L${-w},${n2(b - L + 9)}Z`;
    // a lendária e a mítica: o brilho em volta da lâmina (um traço largo e claro por baixo, sem filtro)
    if (E[3]) a.add(`<path d="${lam}" fill="${E[3]}" fill-opacity=".35" stroke="${E[3]}" stroke-opacity=".35" stroke-width="9" stroke-linejoin="round"/>`);
    peca(a, lam, E[0], { s: 3, h: 1.4, sombra: E[1], luz: E[2], tw: 2.8 });
    a.add(linha(`M0,${b - 3}L0,${n2(b - L + 10)}`, T.espada ? sh(E[1], -0.04) : '#8b97a6', 1.2));
    // a guarda, o punho enrolado e o pomo (a gema no pomo, nas altas)
    const gu = C.guarda || C.ouro;
    peca(a, 'M-11,-11L11,-11Q13,-8 11,-5L-11,-5Q-13,-8 -11,-11Z', gu, { s: 2, h: 1, tw: 2.6 });
    if (C.gema) peca(a, 'M0,-12L2.6,-8L0,-4.4L-2.6,-8Z', C.gema, { s: 1, h: 0.6, tw: 1.8, luz: sh(C.gema, 0.5) });
    peca(a, 'M-2.8,-5L2.8,-5L2.8,7L-2.8,7Z', C.couro, { s: 1.6, h: 0.8, tw: 2.4, dentro: linha('M-2.8,-2L2.8,0M-2.8,1.6L2.8,3.6M-2.8,5L2.8,7', sh(C.couro, -0.45), 1) });
    peca(a, V.ell(0, 9.4, 3.6, 3.4), C.gema || gu, { s: 1.6, h: 0.8, tw: 2.4, luz: sh(C.gema || gu, 0.4) });
    a.add('</g>');
  }

  // o machado: o meio do cabo (a mão de perto) em (x, y), girado `ang` graus (0 = a cabeça para cima, o fio para a
  // direita); L = o cabo do meio até a cabeça
  function machado(a, x, y, ang, L) {
    L = L || 34;
    a.add(`<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(ang || 0)})">`);
    peca(a, `M-2.6,12Q-3.8,${n2(-L / 2)} -2.2,${n2(-L - 2)}L2.4,${n2(-L - 2)}Q1.2,${n2(-L / 2)} 2.6,12Z`, '#a56a3a', { s: 1.8, h: 0.8, tw: 2.6 });
    const y0 = -L + 1;
    peca(a, `M-2,${n2(y0 - 6)}L11,${n2(y0 - 12)}Q17,${n2(y0 - 1)} 11,${n2(y0 + 10)}L-2,${n2(y0 + 4)}Z`, C.aco, { s: 2.4, h: 1.2, sombra: '#8e9aa9', luz: '#f3f7fb', tw: 2.8 });
    a.add(linha(`M11.4,${n2(y0 - 10)}Q15.6,${n2(y0 - 1)} 11.4,${n2(y0 + 8)}`, '#ffffff', 1.6));
    peca(a, `M-4.6,${n2(y0 - 7)}L2,${n2(y0 - 7)}L2,${n2(y0 + 5)}L-4.6,${n2(y0 + 5)}Z`, '#6b717b', { s: 1.2, h: 0.6, tw: 2.4 });
    a.add('</g>');
  }
  // um membro dobrado (a coxa ou a canela): uma cápsula de P a Q com a largura w
  function capsula(P, Q, w) {
    const dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * (w / 2), ny = (dx / l) * (w / 2), r = n2(w / 2);
    return `M${n2(P[0] + nx)},${n2(P[1] + ny)}L${n2(Q[0] + nx)},${n2(Q[1] + ny)}A${r},${r} 0 0 0 ${n2(Q[0] - nx)},${n2(Q[1] - ny)}` +
      `L${n2(P[0] - nx)},${n2(P[1] - ny)}A${r},${r} 0 0 0 ${n2(P[0] + nx)},${n2(P[1] + ny)}Z`;
  }
  // a perna dobrada (agachado): o quadril q, o joelho j, o pé p (no chão); a bota com o bico para a frente
  function pernaDobrada(a, q, j, p, longe) {
    const k = longe ? -0.16 : 0;
    peca(a, capsula(j, p, 10.4), sh(C.calca, k - 0.06), { s: 2.2, h: 1 });
    peca(a, capsula(q, j, 11.6), sh(C.calca, k), { s: 2.6, h: 1.2 });
    const xb = p[0], yb = 0;
    const bota = `M${n2(xb - 7)},${n2(yb - 8)}C${n2(xb - 7)},${n2(yb - 11)} ${n2(xb + 5)},${n2(yb - 11)} ${n2(xb + 6)},${n2(yb - 7.6)}C${n2(xb + 11)},${n2(yb - 7)} ${n2(xb + 12.6)},${n2(yb - 3)} ${n2(xb + 12)},${n2(yb)}L${n2(xb - 7.4)},${n2(yb)}Z`;
    peca(a, bota, sh(C.bota, k), { s: 2.6, h: 1.2, luz: sh(C.bota, 0.38 + k) });
  }

  // uma perna curta (chibi) com a bota: o topo em (x, y0), o pé no chão em (x + dx, 0); `erg` levanta o pé
  function perna(a, x, y0, dx, erg, longe) {
    const k = longe ? -0.16 : 0, xb = x + (dx || 0), yb = -(erg || 0);
    const d = `M${n2(x - 6)},${n2(y0)}L${n2(x + 6)},${n2(y0)}L${n2(xb + 5.6)},${n2(yb - 6)}L${n2(xb - 5.6)},${n2(yb - 6)}Z`;
    peca(a, d, sh(C.calca, k), { s: 2.6, h: 1 });
    const bota = `M${n2(xb - 7)},${n2(yb - 8)}C${n2(xb - 7)},${n2(yb - 11)} ${n2(xb + 5)},${n2(yb - 11)} ${n2(xb + 6)},${n2(yb - 7.6)}C${n2(xb + 11)},${n2(yb - 7)} ${n2(xb + 12.6)},${n2(yb - 3)} ${n2(xb + 12)},${n2(yb)}L${n2(xb - 7.4)},${n2(yb)}Z`;
    peca(a, bota, sh(C.bota, k), { s: 2.6, h: 1.2, luz: sh(C.bota, 0.38 + k) });
  }

  // um braço curto: do ombro o até a mão m (a luva redonda), com a manga dobrada no meio
  function braco(a, o, m, longe, luvaGrande) {
    const k = longe ? -0.16 : 0;
    const mx = (o[0] + m[0]) / 2, my = (o[1] + m[1]) / 2, ang = Math.atan2(m[1] - o[1], m[0] - o[0]);
    const nx = -Math.sin(ang), ny = Math.cos(ang), w1 = 6.4, w2 = 5.4;
    const d = `M${n2(o[0] + nx * w1)},${n2(o[1] + ny * w1)}Q${n2(mx + nx * (w1 + 1))},${n2(my + ny * (w1 + 1))} ${n2(m[0] + nx * w2)},${n2(m[1] + ny * w2)}` +
      `L${n2(m[0] - nx * w2)},${n2(m[1] - ny * w2)}Q${n2(mx - nx * (w1 + 0.4))},${n2(my - ny * (w1 + 0.4))} ${n2(o[0] - nx * w1)},${n2(o[1] - ny * w1)}Z`;
    // a manga (o colete; a cota de malha ou a armadura nas altas) e a luva (de couro; a manopla nas altas)
    peca(a, d, C.manga ? sh(C.manga, k) : sh(C.colete, 0.08 + k), { s: 2.6, h: 1.2,
      dentro: T.malha === 'tudo' ? malha(o[0] - 8, o[1] - 8, m[0] - o[0] + 16, m[1] - o[1] + 16, C.manga) : '' });
    const r = luvaGrande ? 6.4 : 5.8, lv = C.luva ? sh(C.luva, k) : sh(C.couro, -0.2 + k);
    peca(a, V.ell(m[0], m[1], r, r * 0.94), lv, { s: 2.2, h: 1.2, luz: C.luva ? sh(C.luva, 0.36 + k) : sh(C.couro, 0.2 + k) });
  }
  // a cota de malha: fileiras de meias-luas na caixa (x, y, w, h; w/h podem vir negativos), no tom escuro da cor
  function malha(x, y, w, h, cor) {
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    let d = '';
    for (let j = 0, yy = y; yy < y + h; j++, yy += 3.4) {
      for (let xx = x + (j % 2) * 2.2; xx < x + w; xx += 4.4) d += `M${n2(xx)},${n2(yy)}q2.2,2.6 4.4,0`;
    }
    return `<path d="${d}" stroke="${sh(cor, -0.38)}" stroke-width=".9" fill="none" opacity=".75"/>`;
  }

  // a capa curta atrás (sai de baixo do capuz até a cintura), com a barra rasgada
  // (as altas: mais longa, a barra reta e o debrum na cor da raridade)
  const capaCor = () => T.capa[0] || sh(C.capuz, -0.18);
  // as asas de luz do guardião celeste (atrás de tudo, saindo das costas): a de longe menor e mais alta, o brilho rosa
  // em volta, as penas riscadas
  // a asa: a raiz em (0,0), as penas para cima e para a esquerda (escala 1 = ~44 × 46)
  const ASA = 'M0,0C-6,-10 -14,-24 -16,-40C-22,-36 -30,-34 -38,-34C-34,-30 -32,-26 -32,-22C-38,-20 -42,-16 -44,-10C-38,-10 -34,-8 -30,-4C-34,-2 -36,2 -36,6C-24,6 -10,4 0,0Z';
  const PENAS = 'M0,0L-16,-38M0,0L-34,-30M0,0L-40,-11M0,0L-32,4';
  function asas(a, dy) {
    for (const [x, y, e, g] of [[-4, -58, 0.78, 30], [-14, -50, 1, 14]]) {
      a.add(`<g transform="translate(${x} ${n2(y + dy)}) rotate(${g}) scale(${e})">`);
      a.add(`<path d="${ASA}" fill="none" stroke="${T.brilho}" stroke-opacity=".5" stroke-width="9" stroke-linejoin="round"/>`);
      peca(a, ASA, '#fdf4fd', { s: 4, h: 1.6, tw: 2.8, sombra: '#f1b8e6', luz: '#ffffff', dentro: linha(PENAS, '#e79ad6', 1.6) });
      a.add('</g>');
    }
  }
  function capa(a, dy) {
    dy = dy || 0;
    if (T.asas) asas(a, dy);
    const k = T.capa[1] || 0, y = (v) => n2(v + dy), fim = -18 + k, debrum = T.capa[3];
    const reta = T.capa[2] === 'reta';
    const hem = `M-36.4,${y(fim)}Q-25,${y(fim + 3.4)} -13.2,${y(fim - 0.6)}`;
    const d = reta
      ? `M-28,${y(-52)}C-35,${y(-40)} -37.4,${y(-30 + k * 0.4)} -36.4,${y(fim)}Q-25,${y(fim + 3.4)} -13.2,${y(fim - 0.6)}L-16,${y(-50)}Z`
      : `M-28,${y(-52)}C-34,${y(-40)} -35,${y(-28)} -33,${y(-18 + k)}L-28,${y(-21 + k)}L-24,${y(-16 + k)}L-19,${y(-21 + k)}L-14,${y(-18 + k)}L-16,${y(-50)}Z`;
    peca(a, d, capaCor(), { s: 3, h: 1.2, pintas: reta ? null : [10, 3], caixa: [-38, -54 + dy, 26, 38 + k],
      dentro: debrum ? `<path d="${hem}" stroke="${debrum}" stroke-width="5" fill="none" transform="translate(0 -1.4)"/>` : '' });
    if (T.broquel) broquel(a, dy);
  }
  // o broquel de madeira preso nas costas (o Comum): as tábuas, o aro de ferro e o umbo, por cima da capa
  function broquel(a, dy) {
    const cx = -27, cy = -37 + (dy || 0), r = 14;
    peca(a, V.ell(cx, cy, r, r * 1.04), '#5f6a7a', { s: 2.4, h: 1, tw: 2.8, luz: '#c9d1da' });
    peca(a, V.ell(cx, cy, r - 3.2, (r - 3.2) * 1.04), '#b07a45', { s: 2.6, h: 1.2, tw: 1.8, luz: '#d9a46a',
      dentro: linha(`M${cx - 4},${n2(cy - 11)}L${cx - 4},${n2(cy + 11)}M${cx + 4},${n2(cy - 11)}L${cx + 4},${n2(cy + 11)}`, '#7a4f2a', 1.4) });
    peca(a, V.ell(cx, cy, 4.2, 4.2), '#c9d1da', { s: 1.2, h: 0.6, tw: 2, sombra: '#8e9aa9', luz: '#ffffff' });
  }

  // o corpo (o tronco curto do chibi): o colete de couro sobre a túnica vinho, a faixa, o cinto com a bolsa de moedas
  // e o remendo costurado no ombro; `dy` desce tudo (sentado)
  function corpo(a, dy) {
    dy = dy || 0;
    a.add(`<g transform="translate(0 ${dy})">`);
    const tronco = 'M-22,-50C-25,-38 -23,-24 -19,-13L21,-13C25,-24 27,-38 24,-50Z', P = T.peito;
    // a saia da sobreveste ou as placas da cintura (por cima do alto das pernas)
    if (P !== 'colete') {
      peca(a, 'M-20.4,-16L22.8,-16L24.4,-7.6Q1.4,-3.6 -22,-7.6Z', P === 'placa' ? sh(C.colete, -0.1) : C.colete, { s: 2.4, h: 1, tw: 2.8,
        dentro: P === 'placa' ? linha('M-21,-11.4Q1.4,-8 23.6,-11.4', sh(C.colete, -0.42), 1.3) : linha('M1.4,-15L1.4,-5.4', sh(C.colete, -0.4), 1.4) });
    }
    let dentro;
    if (P === 'placa') {
      // a couraça: o vinco do meio, a placa de baixo e a gola na cor da raridade; o tabardo (o cavaleiro)
      dentro = (T.tabardo ? `<path d="M-5,-50L7.6,-50L7,-13L-4.4,-13Z" fill="${C.tunica}"/>` + linha('M-5,-50L-4.4,-13M7.6,-50L7,-13', sh(C.tunica, -0.45), 1.4) : '') +
        linha('M1.4,-48L1.6,-29', '#ffffff', 2, 0.55) + linha('M-23,-34Q1.4,-29.4 25.4,-34', sh(C.colete, -0.4), 1.4) +
        `<path d="M-21,-50Q1.4,-43 24,-50L24,-52L-21,-52Z" fill="${C.guarda || C.faixa}"/>` + linha('M-21,-49.4Q1.4,-42.6 24,-49.4', TRACO, 1.6);
    } else if (P === 'sobreveste') {
      // a sobreveste: o decote em V com a cota de malha aparecendo
      dentro = `<path d="M-8,-50L1.4,-31L11,-50Z" fill="${C.tunica}"/>` + malha(-8, -50, 19, 19, C.tunica) + linha('M-8,-50L1.4,-31L11,-50', TRACO, 1.8);
    } else {
      dentro = `<path d="M-3,-50L1,-26L6,-50Z" fill="${C.tunica}"/>` + linha('M-3,-50L1,-26L6,-50', TRACO, 1.8);
    }
    peca(a, tronco, C.colete, { s: 4, h: 1.6, pintas: P === 'placa' ? null : [12, 7], caixa: [-25, -50, 50, 37], dentro });
    // o emblema no peito: o sol (o paladino) ou a gema (o guardião celeste)
    if (T.emblema === 'sol') {
      a.add(`<path d="${V.estrelaD(1.4, -38, 8.4, 4.6, 8)}" fill="${C.ouro}" stroke="${TRACO}" stroke-width="1.8" stroke-linejoin="round"/>`);
      peca(a, V.ell(1.4, -38, 3.8, 3.8), '#ffe27a', { s: 1, h: 0.6, tw: 1.6 });
    } else if (T.emblema === 'gema') {
      peca(a, 'M1.4,-46L7,-38.6L1.4,-31L-4.2,-38.6Z', C.gema, { s: 2, h: 1, tw: 2.2, luz: '#ffd6f5' });
      a.add(linha('M-1,-41L1.4,-43.4', '#ffffff', 1.4, 0.9));
    }
    // a correia de couro atravessada no peito (o patrulheiro), com a fivela
    if (T.correia) {
      peca(a, 'M18,-50L24,-47L-16,-21L-20,-25Z', C.couro, { s: 1.6, h: 0.8, tw: 2.4 });
      peca(a, 'M2,-39L7,-36L4,-31.6L-1,-34.6Z', C.ouro, { s: 1, h: 0.6, tw: 1.8 });
    }
    // a faixa com o nó pendurado e o cinto escuro com a fivela
    peca(a, 'M-21,-26L24,-26L23.6,-19L-20.6,-19Z', C.faixa, { s: 2.4, h: 1, tw: 2.8 });
    if (P !== 'placa') peca(a, 'M-12,-21L-6,-21L-5,-9L-9,-6L-13,-9Z', sh(C.faixa, -0.06), { s: 2, h: 1, tw: 2.4 });
    peca(a, 'M-20.2,-19.4L23.4,-19.4L22.8,-14.6L-19.6,-14.6Z', C.cinto, { s: 1.6, h: 0.8, tw: 2.6 });
    peca(a, 'M5.4,-20.6L11.4,-20.6L11.4,-13.6L5.4,-13.6Z', C.ouro, { s: 1.4, h: 0.8, tw: 2.2 });
    // a bolsa de moedas no quadril de perto, com as moedas aparecendo (o mercenário)
    if (T.bolsa) {
      peca(a, V.ell(18.6, -11, 4.4, 2.2), C.moeda, { s: 1.2, h: 0.6, tw: 2 });
      peca(a, 'M13,-13C12,-6 15,-2 19,-2C23,-2 25,-6 24,-13Z', C.couro, { s: 2, h: 1, tw: 2.6 });
      a.add(linha('M13.6,-11Q18.6,-9 23.6,-11', TRACO, 1.4));
    }
    a.add('</g>');
  }
  // o remendo de couro costurado no ombro de perto (como o da referência)
  // (as outras raridades: a ombreira de couro costurada, ou a de placa com os rebites e a borda na cor dela)
  function remendo(a, dy, giro) {
    dy = dy || 0;
    a.add(`<g transform="translate(0 ${dy}) rotate(${giro || 0} 22 -46)">`);
    if (T.ombro === 'remendo') {
      peca(a, 'M20,-37C21,-42 29,-43 31,-37C32,-33 30,-30 27,-29.4C23.4,-29 20.6,-31.4 20,-37Z', '#b9a79a', {
        s: 2.2, h: 1, tw: 2.6, dentro: costura('M22.2,-36.6C23.2,-39.6 28,-40 29.2,-36.4C29.6,-34.2 28.6,-32.6 26.8,-32.2', '#5e4f47'),
      });
    } else {
      const placa = T.ombro === 'placa', cor = placa ? (C.elmo || C.colete) : sh(C.couro, -0.08);
      const d = 'M14.6,-42C15,-51 30,-54 35,-43.6C37.6,-37 34.6,-30.6 28.6,-29.4C21.4,-28.4 14.4,-34 14.6,-42Z';
      peca(a, d, cor, { s: 2.6, h: 1.2, tw: 2.8, luz: placa ? sh(cor, 0.45) : undefined,
        dentro: placa
          ? `<path d="M15,-36C19,-30.6 28,-29 35.6,-35.4L36,-29L15,-29Z" fill="${T.capa[3] || C.faixa}"/>` + linha('M15,-36C19,-30.6 28,-29 35.6,-35.4', TRACO, 1.6) +
            `<circle cx="20.4" cy="-43" r="1.3" fill="${sh(cor, -0.45)}"/><circle cx="29" cy="-46" r="1.3" fill="${sh(cor, -0.45)}"/>`
          : costura('M17.4,-41.4C18,-48.4 29.4,-50.6 33,-43C34.6,-38.6 33,-34 28.6,-32.6', '#4a3424') + linha('M24,-52L22,-29', sh(C.couro, -0.4), 1.4) });
      // a gema no meio da ombreira (o guardião celeste): o cristal da raridade
      if (C.cristal) peca(a, 'M25.6,-48L29,-42.4L25.6,-37.6L22.2,-42.4Z', C.cristal, { s: 1, h: 0.6, tw: 1.8, luz: '#ffe0f8' });
    }
    a.add('</g>');
  }

  // A CABEÇA sob o capuz (grande, o chibi), o queixo em (x, y). o: { olhos: 'serio'|'bravo'|'fechados', boca:
  // 'seria'|'grita'|'dorme', giro }
  function cabeca(a, x, y, o) {
    o = o || {};
    a.add(`<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(o.giro || 0)} 4 -24)">`);
    // o lenço no pescoço (embaixo do capuz; a gola de malha ou de placa nas altas)
    const pano = T.cab === 'capuz', mz = T.malha === 'tudo';
    peca(a, 'M-24,-6C-12,4 14,4 28,-6L29,4C14,12 -12,12 -25,4Z', C.lenco, { s: 2.6, h: 1.2, pintas: pano ? [T.poucasPintas ? 3 : 8, 11] : null, caixa: [-25, -6, 54, 18],
      dentro: mz ? malha(-25, -6, 54, 18, C.lenco) : '' });
    // o capuz: a lona com pintas, a ponta e o escuro de dentro (o capuz de cota de malha debaixo do elmo; o claro do
    // guardião celeste, sem as pintas de tecido gasto)
    const capuz = 'M-35,-12C-42,-36 -31,-66 -3,-71C23,-75 41,-56 39,-31C38,-17 35,-7 29,-1L-28,-1C-33,-5 -35,-9 -35,-12Z';
    peca(a, capuz, C.capuz, { s: 5, h: 2, pintas: pano ? [T.poucasPintas ? 16 : 44, 5] : null, caixa: [-42, -75, 82, 74],
      dentro: T.malha ? malha(-42, -75, 82, 74, C.capuz) : '' });
    // a pena presa no capuz (o patrulheiro)
    if (T.pena) {
      a.add('<g transform="translate(-22 -60) rotate(-56)">');
      peca(a, V.folha(28, 10, 0.5), '#efe3c4', { s: 2, h: 1, tw: 2.4,
        dentro: linha('M0,0L0,-26', '#9c7a4a', 1.4) + linha('M-4,-12L4,-14M-4.4,-18L4,-20', '#8a5a3a', 2.2) });
      a.add('</g>');
    }
    const dentro = 'M-17,-13C-19,-34 -7,-50 11,-50C27,-50 35,-38 34,-22C33,-10 27,-4 19,-2L-11,-2C-15,-5 -17,-9 -17,-13Z';
    a.add(`<path d="${dentro}" fill="${C.capuzD}"/>`);
    // a orelha de longe
    peca(a, V.ell(-14.6, -20, 3.6, 5.2), sh(C.pele, -0.12), { s: 1.6, h: 0.8, tw: 2.4 });
    // o rosto (3/4 para a direita) com a sombra do capuz na testa
    const rosto = 'M-13,-20C-13,-36 -3,-46 11,-46C25,-46 32,-36 31,-22C30,-10 23,-3 10,-3C-3,-3 -13,-9 -13,-20Z';
    peca(a, rosto, C.pele, {
      s: 3.4, h: 1.4,
      dentro: `<rect x="-16" y="-50" width="52" height="14" fill="${a.lg([[0, '#2a1f1d', 0.75], [1, '#2a1f1d', 0]])}"/>` +
        `<ellipse cx="0" cy="-13" rx="4.4" ry="2.4" fill="#d9675e" opacity=".22"/><ellipse cx="24" cy="-13" rx="4" ry="2.2" fill="#d9675e" opacity=".2"/>`,
    });
    // os olhos grandes: o branco, a íris verde olhando para a frente, a pálpebra grossa e a sobrancelha baixa
    const olhos = o.olhos || 'serio';
    if (olhos === 'fechados') {
      a.add(linha('M-4,-24Q1,-20.6 6,-24M14,-24Q19.4,-20.4 25,-24', TRACO, 2.4));
      a.add(linha('M-6,-30L6,-28.6M13,-28.6L26,-30', TRACO, 2.8));
    } else if (olhos === 'x') {
      // o nocaute (a dungeon): os olhos em X e a sobrancelha caída
      a.add(linha('M-3,-28L5,-20M5,-28L-3,-20M15.4,-28.4L23.8,-20.2M23.8,-28.4L15.4,-20.2', TRACO, 2.8));
      a.add(linha('M-6,-33L6,-31.6M13,-31.6L26,-33.4', TRACO, 2.4));
    } else if (olhos === 'feliz') {
      // a vitória: os olhos fechados de alegria (os arcos para cima) e a sobrancelha erguida
      a.add(linha('M-4.4,-22.6Q1,-29.4 6.4,-22.6M13.6,-23Q19.6,-29.8 25.4,-23', TRACO, 2.8));
      a.add(linha('M-6,-35Q0,-37.6 6,-35.4M13.6,-35.6Q20,-38 26.4,-35', TRACO, 2.4));
      a.add(`<ellipse cx="-1" cy="-15" rx="4.6" ry="2.6" fill="#e0605a" opacity=".45"/><ellipse cx="25" cy="-15" rx="4.2" ry="2.4" fill="#e0605a" opacity=".42"/>`);
    } else {
      const bravo = olhos === 'bravo', abre = bravo ? 1.6 : 0;
      const olho = (cx, cy, rx, ry, ix) => {
        const e = V.ell(cx, cy, rx, ry + abre);
        const cl = a.clip(e);
        a.add(`<path d="${e}" fill="#f4efe6"/>`);
        a.add(`<g clip-path="${cl}"><circle cx="${n2(ix)}" cy="${n2(cy + 0.4)}" r="${n2(ry * 0.92 + abre * 0.4)}" fill="${C.olho}"/>` +
          `<circle cx="${n2(ix)}" cy="${n2(cy + 0.4)}" r="${n2(ry * 0.92 + abre * 0.4)}" fill="none" stroke="${sh(C.olho, -0.45)}" stroke-width="1"/>` +
          `<circle cx="${n2(ix + 0.4)}" cy="${n2(cy + 0.6)}" r="${n2(ry * 0.42)}" fill="${TRACO}"/>` +
          `<circle cx="${n2(ix - 1.2)}" cy="${n2(cy - 1)}" r="1.1" fill="#fff"/>` +
          `<rect x="${n2(cx - rx - 1)}" y="${n2(cy - ry - abre - 2)}" width="${n2(rx * 2 + 2)}" height="${n2(bravo ? 2.4 : 3.6)}" fill="${sh(C.pele, -0.32)}"/></g>`);
        a.add(`<path d="${e}" fill="none" stroke="${TRACO}" stroke-width="1.6"/>`);
      };
      olho(1, -24, 5.6, 4.4, 3.2);
      olho(19.6, -24.4, 6, 4.6, 22);
      // a pálpebra de cima (grossa) e a sobrancelha descendo para o nariz
      a.add(linha(`M-5,${-26.6 - abre}Q1,${-30 - abre} 7,${-27.6 - abre}M13.4,${-27.8 - abre}Q19.6,${-30.6 - abre} 26,${-26.8 - abre}`, TRACO, 2.6));
      a.add(bravo
        ? `<path d="M-7,-37L7,-31L6,-28.6L-7.6,-33.6Z" fill="${TRACO}"/><path d="M13.6,-31L28,-37.6L28.6,-34.2L14.2,-28.6Z" fill="${TRACO}"/>`
        : `<path d="M-7,-34L7,-31L6.6,-28.6L-7.4,-31Z" fill="${TRACO}"/><path d="M13.6,-31L28,-34.4L28.4,-31.4L14,-28.6Z" fill="${TRACO}"/>`);
    }
    // o nariz e a boca (a cara fechada; gritando; dormindo)
    a.add(linha('M11.6,-21Q13.6,-16.6 11,-15', sh(C.pele, -0.5), 1.8));
    const bocas = {
      seria: linha('M5,-9.4Q10,-12 15.4,-9.6', TRACO, 2.2),
      grita: `<path d="M4.4,-12Q10,-15 16,-12Q15.4,-4.4 10,-4.4Q5,-4.4 4.4,-12Z" fill="#5a1a22" stroke="${TRACO}" stroke-width="2" stroke-linejoin="round"/><path d="M6.6,-7.2Q10,-9 13.6,-7.2Q12.6,-5 10,-5Q7.6,-5 6.6,-7.2Z" fill="#d9675e"/>`,
      dorme: `<ellipse cx="10" cy="-9.6" rx="2" ry="1.6" fill="#5a1a22" stroke="${TRACO}" stroke-width="1.4"/>`,
      // o nocaute: a boca torta aberta com a língua de fora
      ko: `<path d="M4.4,-11.6Q7.2,-13.6 10,-11.6Q12.8,-13.8 15.6,-11.4Q15,-6.4 10,-6.6Q5,-6.4 4.4,-11.6Z" fill="#5a1a22" stroke="${TRACO}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M9,-8.4Q12.4,-9.6 14,-7.4Q14.6,-3.4 11.6,-3Q8.8,-3.2 9,-8.4Z" fill="#e2747a" stroke="${TRACO}" stroke-width="1.6" stroke-linejoin="round"/>`,
      // a vitória: o sorrisão aberto, os dentes de cima
      ri: `<path d="M3.4,-13Q10,-10.4 17,-13.2Q16,-3.8 10,-3.8Q4.4,-3.8 3.4,-13Z" fill="#5a1a22" stroke="${TRACO}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M5,-11.8Q10,-9.8 15.4,-12L15,-9.6Q10,-8 5.6,-9.4Z" fill="#fffaf0"/><path d="M6.8,-6.6Q10,-8.4 13.6,-6.8Q12.6,-4.6 10,-4.6Q7.6,-4.6 6.8,-6.6Z" fill="#d9675e"/>`,
    };
    a.add(bocas[o.boca] || bocas.seria);
    // a cicatriz no olho de perto (o mercenário e o guerreiro)
    if (T.cicatriz) a.add(linha('M24.6,-38L21,-14', '#e2a888', 1.6) + linha('M21.8,-33L25,-32.4M21.2,-27L24.4,-26.4M20.6,-19.6L23.8,-19', '#e2a888', 1.1));
    // a borda do capuz em volta do rosto (mais grossa em cima), por cima de tudo
    const borda = 'M-19,-8C-22,-34 -8,-53 11,-53C29,-53 38,-40 37,-22C36.6,-14 34,-8 31,-3L27,-4C30,-9 32,-15 32,-22C32,-37 25,-47 11,-47C-3,-47 -14,-33 -12.6,-8Z';
    peca(a, borda, sh(C.capuz, -0.06), { s: 2.4, h: 1.2, pintas: pano ? [T.poucasPintas ? 5 : 14, 9] : null, caixa: [-22, -53, 60, 50],
      dentro: T.malha ? malha(-22, -53, 60, 50, sh(C.capuz, -0.06)) : '' });
    if (T.cab === 'elmo' || T.cab === 'penacho' || T.cab === 'asas') elmo(a);
    else if (T.cab === 'tiara') tiara(a);
    // a auréola (o guardião celeste), menos no nocaute
    if (T.aureola && o.olhos !== 'x') {
      a.add(`<ellipse cx="8" cy="-82" rx="17" ry="3.8" fill="none" stroke="${T.brilho}" stroke-opacity=".45" stroke-width="7"/>`);
      a.add(`<ellipse cx="8" cy="-82" rx="17" ry="3.8" fill="none" stroke="${TRACO}" stroke-width="4.6"/>`);
      a.add('<ellipse cx="8" cy="-82" rx="17" ry="3.8" fill="none" stroke="#fff4c2" stroke-width="2.4"/>');
    }
    a.add('</g>');
  }

  // O ELMO por cima do capuz de malha (as altas): o casco, a faixa da testa com os rebites; o guerreiro tem o nasal, o
  // cavaleiro o penacho roxo caindo para trás, o paladino as asinhas e a gema na testa. Na moldura da cabeça (o queixo
  // em (0,0)), o mais alto fica em ~-86 (cabe na caixa do painel)
  function elmo(a) {
    const cor = C.elmo, k = T.cab;
    // a asinha do elmo (o paladino): a asa de penas, pequena, dourada na borda
    const asinha = (x, y, e, g) => {
      a.add(`<g transform="translate(${x} ${y}) rotate(${g}) scale(${e})">`);
      peca(a, ASA, '#fdf9ef', { s: 4, h: 1.6, tw: 4.4, sombra: '#e3cf9c', luz: '#ffffff', dentro: linha(PENAS, '#d9b45a', 2.4) });
      a.add('</g>');
    };
    if (k === 'penacho') {
      // o penacho: nasce na frente do alto do casco, passa por cima e cai pelas costas em mechas
      const pl = 'M16,-74C10,-84 -12,-88 -28,-81C-41,-75 -48,-62 -47,-44Q-44,-52 -40,-49Q-39,-57 -34,-55Q-33,-63 -27,-63Q-23,-70 -16,-69Q-10,-75 -2,-74Q7,-77 16,-74Z';
      peca(a, pl, C.pluma, { s: 3.4, h: 1.6, tw: 2.8, luz: sh(C.pluma, 0.42),
        dentro: linha('M10,-79C-4,-84 -26,-80 -38,-66M-2,-78C-14,-79 -26,-74 -33,-63', sh(C.pluma, -0.4), 1.4) });
    }
    // a asa de longe, atrás do casco
    if (k === 'asas') asinha(-24, -60, 0.5, 4);
    // o casco (até a faixa da testa)
    const casco = 'M-33,-52C-37,-66 -21,-76 4,-77C28,-78 44,-66 41,-51C20,-47 -12,-47 -33,-52Z';
    peca(a, casco, cor, { s: 4, h: 1.8, tw: TW, luz: sh(cor, 0.5), sombra: sh(cor, -0.34),
      dentro: linha('M6,-76Q9,-63 8.6,-49', sh(cor, 0.6), 2.2, 0.8) + linha('M-30,-58Q4,-52 40,-57', sh(cor, -0.3), 1.2) });
    // a faixa da testa
    const fx = 'M-33,-52C-12,-47 20,-47 41,-51L41.4,-44C20,-39.6 -12,-39.6 -33.4,-45Z';
    peca(a, fx, sh(cor, -0.08), { s: 2, h: 1, tw: 2.8, luz: sh(cor, 0.4),
      dentro: [-25, -15, 27, 35].map((x) => `<circle cx="${x}" cy="${n2(x < 10 ? -46.2 + (x + 25) * 0.04 : -45.6)}" r="1.4" fill="${sh(cor, -0.5)}"/>`).join('') });
    if (k === 'elmo') {
      // o nasal descendo entre os olhos
      peca(a, 'M7.6,-44.6L13.4,-45L12.6,-21L10.2,-18.4L8.2,-21Z', sh(cor, -0.04), { s: 1.6, h: 0.8, tw: 2.4, luz: sh(cor, 0.5) });
    }
    if (k === 'asas') {
      // a asa de perto (espelhada, para cima e para trás) e a gema vermelha na testa
      a.add('<g transform="translate(35 -58) scale(-1 1)">'); asinha(0, 0, 0.42, -14); a.add('</g>');
      peca(a, 'M10,-50L14,-45.4L10,-40.8L6,-45.4Z', C.gema, { s: 1.2, h: 0.6, tw: 2, luz: '#ffb3b8' });
    }
  }
  // a tiara de cristal do guardião celeste: o arco na borda do capuz e os 3 cristais rosa
  function tiara(a) {
    a.add(linha('M-13.6,-36C-10,-50 0,-55.6 11,-55.6C23,-55.6 32,-48 35,-36', TRACO, 5.4));
    a.add(linha('M-13.6,-36C-10,-50 0,-55.6 11,-55.6C23,-55.6 32,-48 35,-36', '#ffe7a8', 2.8));
    const cr = (x, y, h, w) => peca(a, `M${x},${y - h}L${n2(x + w)},${n2(y - h * 0.35)}L${x},${y}L${n2(x - w)},${n2(y - h * 0.35)}Z`, C.cristal,
      { s: 1.4, h: 0.8, tw: 2.2, luz: '#ffe0f8' });
    cr(-1, -52, 9, 3.4);
    cr(23, -52, 9, 3.4);
    cr(11, -54, 15, 4.6);
  }

  /* ---------------- poses ---------------- */
  // de guarda: a espada na mão de perto, a ponta no chão; o braço de longe junto do corpo
  function atento(a) {
    a.sombra(4, 0.5, 30, 6, 0.4, 2.4);
    capa(a, 0);
    braco(a, [-20, -46], [-25, -27], true);
    perna(a, -9, -15, -1, 0, true);
    perna(a, 9, -15, 1, 0, false);
    corpo(a, 0);
    espada(a, 31, -30, 172, 30);
    braco(a, [21, -45], [30, -29], false);
    remendo(a, 0);
    cabeca(a, 2, -46, { olhos: 'serio', boca: 'seria' });
  }
  // a marcha (passo 0 ou 1): a espada no ombro, o braço de longe balançando, um pé no ar
  function marcha(a, passo) {
    const s = passo ? 1 : -1;
    a.sombra(4, 0.5, 30, 6, 0.4, 2.4);
    capa(a, 0);
    braco(a, [-20, -46], [-24 - 4 * s, -28], true);
    perna(a, -9, -15, -3 * s, s > 0 ? 3 : 0, true);
    perna(a, 9, -15, 3 * s, s < 0 ? 3 : 0, false);
    corpo(a, 0);
    espada(a, 30, -30, 128, 34);
    braco(a, [21, -45], [30, -29], false);
    remendo(a, 0);
    cabeca(a, 2, -46, { olhos: 'serio', boca: 'seria' });
  }
  // o horário do PvP: a espada erguida no alto, gritando, o punho de longe cerrado
  function chama(a) {
    a.sombra(4, 0.5, 32, 6.4, 0.4, 2.4);
    capa(a, 0);
    braco(a, [-20, -46], [-30, -34], true, true);
    perna(a, -10, -15, -4, 0, true);
    perna(a, 10, -15, 4, 0, false);
    corpo(a, 0);
    espada(a, 33, -70, 12, 46);
    braco(a, [21, -45], [33, -68], false, true);
    remendo(a, 0, -30);
    cabeca(a, 2, -46, { olhos: 'bravo', boca: 'grita', giro: -5 });
  }
  // o caseiro corta a árvore: fase 0 = o machado erguido do lado de perto, fora do capuz (o corpo para trás); 1 = o golpe
  // na frente, na altura do tronco (o corpo para a frente)
  function corta(a, fase) {
    a.sombra(4, 0.5, 32, 6.4, 0.4, 2.4);
    capa(a, 0);
    perna(a, -10, -15, -3, 0, true);
    perna(a, 10, -15, 4, 0, false);
    const giro = fase ? 7 : -5;
    a.add(`<g transform="rotate(${giro} 0 -14)">`);
    if (fase) {
      braco(a, [-20, -46], [22, -38], true, true);
      corpo(a, 0);
      machado(a, 30, -36, 98, 30);
      braco(a, [21, -45], [30, -36], false, true);
      a.add('</g>');
      cabeca(a, 4, -45, { olhos: 'bravo', boca: 'seria', giro: 6 });
    } else {
      braco(a, [-20, -46], [16, -42], true, true);
      corpo(a, 0);
      a.add('</g>');
      cabeca(a, 1, -46, { olhos: 'serio', boca: 'seria', giro: -5 });
      // o machado erguido do lado de perto (fora do capuz, sem tapar o rosto)
      machado(a, 33, -52, 26, 38);
      braco(a, [21, -45], [33, -52], false, true);
    }
  }
  // a luta com os monstros (a invasão): fase 0 = a espada erguida do lado de perto, inclinada para trás, o corpo
  // recuado (a armada); 1 = o golpe na frente, a lâmina descendo até a altura do monstro, o corpo para a frente, gritando
  function golpe(a, fase) {
    a.sombra(4, 0.5, 32, 6.4, 0.4, 2.4);
    capa(a, 0);
    if (fase) {
      perna(a, -11, -15, -5, 0, true);
      perna(a, 10, -15, 7, 0, false);
      a.add('<g transform="rotate(8 0 -14)">');
      braco(a, [-20, -46], [6, -38], true, true);
      corpo(a, 0);
      a.add('</g>');
      cabeca(a, 5, -45, { olhos: 'bravo', boca: 'grita', giro: 7 });
      espada(a, 36, -34, 112, 44);
      braco(a, [23, -43], [36, -34], false, true);
      remendo(a, 2, 14);
    } else {
      perna(a, -10, -15, -4, 0, true);
      perna(a, 10, -15, 3, 0, false);
      a.add('<g transform="rotate(-6 0 -14)">');
      braco(a, [-20, -46], [-29, -32], true, true);
      corpo(a, 0);
      a.add('</g>');
      cabeca(a, 0, -46, { olhos: 'bravo', boca: 'seria', giro: -6 });
      espada(a, 38, -66, -26, 46);
      braco(a, [20, -46], [37, -64], false, true);
      remendo(a, -1, -34);
    }
  }
  // agachado: o corpo baixo e curvado para a frente, os joelhos dobrados, a mão de perto no chão (pega a planta ou a pedra)
  function agacha(a) {
    const T = 'translate(6 13) rotate(22 0 -14)';
    a.sombra(10, 0.5, 34, 6.4, 0.4, 2.4);
    a.add(`<g transform="${T}">`); capa(a, 0); a.add('</g>');
    pernaDobrada(a, [-6, -8], [8, -14], [2, -3], true);
    a.add(`<g transform="${T}">`); corpo(a, 0); a.add('</g>');
    braco(a, [-1, -38], [10, -16], true);
    pernaDobrada(a, [8, -7], [22, -12], [17, -3], false);
    braco(a, [37, -22], A.GUARDIAO_MAO.agacha, false);
    cabeca(a, 20, -30, { olhos: 'serio', boca: 'seria', giro: 26 });
  }
  // levantando com a coisa na mão de perto, para a frente (a cena desenha a coisa na mão)
  function pega(a) {
    const T = 'translate(3 6) rotate(8 0 -14)';
    a.sombra(6, 0.5, 32, 6.2, 0.4, 2.4);
    a.add(`<g transform="${T}">`); capa(a, 0); a.add('</g>');
    pernaDobrada(a, [-7, -12], [4, -16], [0, -3], true);
    a.add(`<g transform="${T}">`); corpo(a, 0); a.add('</g>');
    braco(a, [-12, -42], [2, -20], true);
    pernaDobrada(a, [7, -11], [17, -15], [13, -3], false);
    braco(a, [28, -36], A.GUARDIAO_MAO.pega, false);
    cabeca(a, 9, -40, { olhos: 'serio', boca: 'seria', giro: 10 });
  }

  // o caixote de madeira (onde ele senta para cochilar), de x0 a x1, altura h
  function caixote(a, x0, x1, h) {
    peca(a, `M${x0},${-h}L${x1},${-h}L${x1},0L${x0},0Z`, C.madeira, {
      s: 3.4, h: 1.4, dentro: linha(`M${x0},${n2(-h / 2)}L${x1},${n2(-h / 2)}M${x0 + 3},${-h + 3}L${x1 - 3},-3`, sh(C.madeira, -0.45), 1.8),
    });
  }
  // cochilando sentado no caixote: a cabeça caída, as mãos no colo, a espada encostada
  function dorme(a) {
    const DY = 10;
    a.sombra(4, 0.5, 34, 6.4, 0.38, 2.6);
    espada(a, -34, -22, -14, 34);
    caixote(a, -30, 30, 17);
    capa(a, DY);
    perna(a, -9, -15 + DY - 4, 2, 0, true);
    perna(a, 9, -15 + DY - 4, 4, 0, false);
    corpo(a, DY - 4);
    braco(a, [-20, -46 + DY - 4], [-6, -19], true);
    braco(a, [21, -45 + DY - 4], [8, -19], false);
    remendo(a, DY - 4);
    cabeca(a, 4, -38, { olhos: 'fechados', boca: 'dorme', giro: 14 });
  }

  // a dungeon (19/out): o nocaute. Ele cai para trás (para a esquerda, longe do monstro) e fica deitado de costas: as
  // botas perto do lugar onde estava (o pé em (0,0)), um joelho para cima, a cabeça no chão à esquerda virada para a
  // câmera com os olhos em X e a língua de fora, os braços largados e a espada caída no chão na frente dele
  function caido(a) {
    a.sombra(-34, 0.5, 74, 7.4, 0.4, 2.6);
    // a capa aberta no chão, embaixo dele
    peca(a, 'M-60,-2C-64,-12 -56,-28 -42,-32L-10,-28C-6,-20 -6,-9 -8,-1Z', capaCor(), { s: 3, h: 1.2, pintas: T.capa[2] === 'reta' ? null : [10, 3], caixa: [-62, -32, 56, 32] });
    // a perna de longe esticada, a bota de bico para cima
    peca(a, capsula([-6, -9], [26, -8], 10.6), sh(C.calca, -0.2), { s: 2.4, h: 1 });
    a.add('<g transform="translate(34 -4) rotate(-90)">');
    peca(a, 'M-7,-8C-7,-11 5,-11 6,-7.6C11,-7 12.6,-3 12,0L-7.4,0Z', sh(C.bota, -0.16), { s: 2.6, h: 1.2, luz: sh(C.bota, 0.22) });
    a.add('</g>');
    // o braço de longe largado no chão
    braco(a, [-38, -14], [-52, -3], true, true);
    // o tronco deitado (o peito para cima): o colete, a túnica no pescoço, a faixa e o cinto perto do quadril
    peca(a, 'M-44,-30C-47,-21 -46,-10 -42,-4L-2,-4C1,-11 1,-23 -3,-31Z', C.colete, {
      s: 3.4, h: 1.4, pintas: [10, 7], caixa: [-47, -31, 48, 27],
      dentro: `<path d="M-44,-24L-28,-19L-44,-13Z" fill="${C.tunica}"/>` + linha('M-44,-24L-28,-19L-44,-13', TRACO, 1.8),
    });
    peca(a, 'M-16,-31.6L-9,-31.6L-9,-3.6L-16,-3.6Z', C.faixa, { s: 2, h: 1, tw: 2.6 });
    peca(a, 'M-9,-31.6L-4.6,-31.6L-4.6,-3.6L-9,-3.6Z', C.cinto, { s: 1.4, h: 0.8, tw: 2.4 });
    peca(a, 'M-10,-21L-3.6,-21L-3.6,-15L-10,-15Z', C.ouro, { s: 1.2, h: 0.6, tw: 2 });
    // a perna de perto com o joelho para cima, o pé no chão
    pernaDobrada(a, [-4, -14], [12, -31], [22, -3], false);
    // o braço de perto caído na frente
    braco(a, [-34, -24], [-22, -2], false, true);
    // a cabeça no chão, virada para a câmera: os olhos em X e a língua de fora
    cabeca(a, -60, -12, { olhos: 'x', boca: 'ko', giro: -45 });
    // a espada caída no chão, na frente dele
    espada(a, 12, 6, 100, 38);
  }
  // a dungeon (19/out): a vitória (chegou ao fim). De pernas abertas, a espada erguida bem no alto com a mão de perto, o
  // punho de longe na cintura, sorrindo de olhos fechados
  function vitoria(a) {
    a.sombra(4, 0.5, 32, 6.4, 0.4, 2.4);
    capa(a, 0);
    braco(a, [-20, -46], [-27, -27], true, true);
    perna(a, -12, -15, -6, 0, true);
    perna(a, 12, -15, 7, 0, false);
    corpo(a, 0);
    remendo(a, 0);
    cabeca(a, 1, -47, { olhos: 'feliz', boca: 'ri', giro: -5 });
    espada(a, 38, -84, 8, 46);
    braco(a, [21, -45], [37, -82], false, true);
  }

  // as estrelinhas em volta (a lendária e a mítica), fora do corpo; não no cochilo nem no nocaute
  // o "?" do oculto dormindo: o balão branco com o traço, em cima da cabeça
  function interrogacao(a) {
    const x = 22, y = -86;
    a.add(`<circle cx="${x}" cy="${y}" r="12.5" fill="#ffffff" stroke="${TRACO}" stroke-width="${TW}"/>`);
    a.add(`<path d="M${x - 4.2},${y - 3.4}C${x - 4.2},${y - 9.6} ${x + 4.6},${y - 9.6} ${x + 4.6},${y - 3.6}C${x + 4.6},${y + 0.2} ${x},${y} ${x},${y + 3.6}" fill="none" stroke="${TRACO}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`);
    a.add(`<circle cx="${x}" cy="${y + 8}" r="2" fill="${TRACO}"/>`);
  }
  function brilhos(a) {
    for (const [x, y, r] of [[-38, -98, 5], [46, -88, 3.6], [-44, -34, 3]]) {
      a.add(`<path d="${V.cruzD(x, y, r + 1.6)}" fill="${TRACO}" opacity=".55"/><path d="${V.cruzD(x, y, r)}" fill="${T.brilho}"/>`);
    }
  }

  A.guardiao = function (pose, raridade) {
    const P = POSES[pose] ? pose : 'atento';
    const tr = raridade === A.GUARDIAO_OCULTO ? OCULTO : Object.prototype.hasOwnProperty.call(TRAJES, raridade) ? TRAJES[raridade] : TRAJES.free;
    const a = V.arte(), antes = [C, T];
    C = Object.assign({}, BASE, tr.cor); T = tr;
    try {
      if (P === 'anda1' || P === 'anda2') marcha(a, P === 'anda1' ? 0 : 1);
      else if (P === 'chama') chama(a);
      else if (P === 'dorme') dorme(a);
      else if (P === 'machado1' || P === 'machado2') corta(a, P === 'machado2' ? 1 : 0);
      else if (P === 'agacha') agacha(a);
      else if (P === 'pega') pega(a);
      else if (P === 'espada1' || P === 'espada2') golpe(a, P === 'espada2' ? 1 : 0);
      else if (P === 'caido') caido(a);
      else if (P === 'vitoria') vitoria(a);
      else atento(a);
      if (T.brilho && P !== 'dorme' && P !== 'caido') brilhos(a);
      if (T.oculto && P === 'dorme') interrogacao(a);
    } finally { C = antes[0]; T = antes[1]; }
    return a.out(4);
  };
  // na cena: a mesma arte em escala de mundo (o pé continua em (0,0))
  A.guardiaoCena = function (pose, raridade) {
    const o = A.guardiao(pose, raridade);
    // pad: a sombra borrada do pé passa da caixa medida (o getBBox não conta o filtro)
    return comMedida({ svg: `<g transform="scale(${A.GUARDIAO_ESCALA})">${o.svg}</g>`, defs: o.defs, pad: 6 });
  };
  // o rastro do golpe (espada1 -> espada2): a meia-lua branco-azulada que a ponta da espada risca por cima, do alto até
  // a frente. É efeito: SEM o traço. Escala de mundo; a âncora fica em A.GUARDIAO_CORTE (do pé, unidades do desenho):
  // a cena desenha em pé + (lado × GUARDIAO_CORTE[0], GUARDIAO_CORTE[1]) × GUARDIAO_ESCALA, espelhado com ele, 'lighter'
  A.guardiaoCorte = function () {
    const a = V.arte(), E = A.GUARDIAO_ESCALA, O = A.GUARDIAO_CORTE, piv = [22, -45], R = 73;
    const a0 = -96 * Math.PI / 180, a1 = 30 * Math.PI / 180, N = 24;
    const p = (t, r) => [piv[0] + Math.cos(t) * r - O[0], piv[1] + Math.sin(t) * r - O[1]];
    const fora = [], dentro = [];
    for (let i = 0; i <= N; i++) {
      const k = i / N, t = a0 + (a1 - a0) * k;
      // a grossura: nasce fina no alto, engrossa até perto da ponta e fecha redonda
      const g = 18 * Math.pow(k, 1.4) * (k > 0.86 ? Math.sqrt(Math.max(0, 1 - ((k - 0.86) / 0.14) ** 2)) : 1);
      fora.push(p(t, R + 2)); dentro.push(p(t, R + 2 - Math.max(0.6, g)));
    }
    const d = 'M' + fora.concat(dentro.reverse()).map((q) => n2(q[0]) + ',' + n2(q[1])).join('L') + 'Z';
    const ini = p(a0, R), fim = p(a1, R);
    const gr = a.lg([[0, '#dff4ff', 0], [0.55, '#dff4ff', 0.55], [1, '#ffffff', 0.95]], n2(ini[0]), n2(ini[1]), n2(fim[0]), n2(fim[1]), true);
    a.add(`<g transform="scale(${E})">`);
    a.add(`<path d="${d}" fill="${gr}"/>`);
    // o fio brilhante por fora e duas faíscas na ponta
    const fio = 'M' + fora.slice(Math.floor(N * 0.35)).map((q) => n2(q[0]) + ',' + n2(q[1])).join('L');
    a.add(`<path d="${fio}" stroke="#ffffff" stroke-opacity=".9" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    const f = p(a1, R + 2);
    a.add(`<path d="${V.cruzD(f[0] + 2, f[1] - 4, 6)}" fill="#ffffff"/><path d="${V.cruzD(f[0] - 10, f[1] - 12, 3.6)}" fill="#e8f6ff"/>`);
    a.add('</g>');
    return a.out(2);
  };
  // o "!" do horário (balão branco com a exclamação vermelha) e o arco do grito
  A.guardiaoBalao = function () {
    const a = V.arte();
    peca(a, 'M-11,-30C-11,-38 -6,-42 0,-42C6,-42 11,-38 11,-30C11,-22 6,-19 3,-18L0,-12L-3,-18C-6,-19 -11,-22 -11,-30Z', '#ffffff', { s: 2.4, h: 0, sombra: '#d9dde6', tw: 2.6 });
    a.add('<path d="M0,-37.4L0,-28.6" stroke="#e8505b" stroke-width="4.4" stroke-linecap="round"/><circle cx="0" cy="-23.4" r="2.5" fill="#e8505b"/>');
    return comMedida(a.out(3));
  };
  A.guardiaoLatido = function () {
    const a = V.arte();
    a.add(`<path d="M0,-10Q6,-5 0,0M5,-14Q13,-5 5,4" stroke="${TRACO}" stroke-width="4.6" fill="none" stroke-linecap="round"/>`);
    a.add('<path d="M0,-10Q6,-5 0,0M5,-14Q13,-5 5,4" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round"/>');
    return a.out(3);
  };

  if (V.desenhos) {
    // op: { pose, px, py, retrato }: o tamanho do bitmap; o desenho ocupa a caixa: o corpo inteiro ou o busto (quadrado)
    const VB = { cheio: [-48, -132, 104, 138], busto: [-42, -126, 84, 84], chama: [-42, -132, 90, 90], dorme: [-46, -118, 92, 92],
      caido: [-122, -100, 184, 116], caidoBusto: [-112, -92, 92, 92], vitoria: [-48, -146, 104, 152], vitoriaBusto: [-42, -128, 86, 86] };
    // o busto das altas sobe um pouco (o elmo, o penacho, as asinhas e a auréola passam do capuz), no mesmo tamanho
    const SOBE = { rara: 4, epica: 8, lendaria: 8, mitica: 10 };
    V.desenhos.guardiao = (op) => {
      op = op || {};
      const p = op.pose === 'caido' || op.pose === 'vitoria' ? op.pose : null;
      let vb = op.retrato ? (op.pose === 'dorme' ? VB.dorme : op.pose === 'chama' ? VB.chama : p ? VB[p + 'Busto'] : VB.busto) : p ? VB[p] : VB.cheio;
      const sobe = Object.prototype.hasOwnProperty.call(SOBE, op.raridade) ? SOBE[op.raridade] : 0;
      if (op.retrato && sobe && op.pose !== 'caido') vb = [vb[0], vb[1] - sobe, vb[2], vb[3]];
      // o corpo inteiro do guardião celeste abre 10 à esquerda (as asas passam do capuz)
      else if (!op.retrato && op.raridade === 'mitica' && op.pose !== 'caido') vb = [vb[0] - 10, vb[1], vb[2] + 10, vb[3]];
      return V.svgDoc(A.guardiao(op.pose, op.raridade), vb.join(' '), ` width="${op.px || vb[2]}" height="${op.py || vb[3]}"`);
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
