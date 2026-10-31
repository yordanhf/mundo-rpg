/* =============================================================================
 * Mundo — COMBATE (Fase 7): puerto fiel del motor del MUD (C:\Repos\rpg-gr, AttackResolver.cs +
 * CombatConstants.cs). JS puro, sin DOM: resuelve un ataque (acierto → crítico → daño con jitter),
 * clasifica el golpe en 6 niveles + crítico, y un motor por rondas/pasos para que la UI lo anime
 * (turnos de ~1 s). Combate por rondas automáticas, iniciativa de quien ataca, sangrado al caer.
 *   Autoritativo: cuando exista el servidor (Fase 0), esta lógica vive allí. De momento, en cliente.
 * Requiere datos/personaje.js (statEfectivo/totales). RNG inyectable para simular/equilibrar.
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ = raiz.FZ || {};
  const V = FZ.visual && FZ.visual.cartoon;

  const C = {
    critBase: 0.005, danioMin: 1, danioMax: 30, critMin: 31, critMax: 50,
    refOfensa: 300, probFlojo: 0.15, probFuerte: 0.05,
    hpMuerteInstantanea: 15, rondasSangrado: 10, fraccionVendaje: 0.10,
  };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function clasificarNivel(d) {
    return d <= 3 ? 'rozar' : d <= 7 ? 'golpe' : d <= 10 ? 'golpeFuerte'
      : d <= 14 ? 'golpeMuyFuerte' : d <= 19 ? 'danioMasivo' : 'masacre';
  }

  // Resuelve UN ataque. `r` = función RNG en [0,1). Devuelve { acierto, critico, danio, nivel }.
  function resolverAtaque(atacante, defensor, r, bonusAcc, bonusDmg) {
    r = r || Math.random; bonusAcc = bonusAcc || 0; bonusDmg = bonusDmg || 0;
    const arma = atacante.totales().arma;
    const totD = defensor.totales();

    const ofensaAcc = atacante.statEfectivo('coordination') + atacante.statEfectivo('aim') + (arma.hit || 0) + bonusAcc;
    const defensaAcc = defensor.statEfectivo('agility') + defensor.statEfectivo('dodge') + totD.deflect;
    const probAcierto = ofensaAcc / (ofensaAcc + defensaAcc);
    if (r() > probAcierto) return { acierto: false, critico: false, danio: 0, nivel: 'fallo' };

    const critChance = clamp(C.critBase + (arma.critChanceBonus || 0), 0, 1);
    const critico = r() < critChance;
    const danio = critico ? danioCritico(arma, r) : danioNormal(atacante, defensor, arma, totD, bonusDmg, r);
    return { acierto: true, critico, danio, nivel: critico ? 'critico' : clasificarNivel(danio) };
  }

  function danioNormal(atacante, defensor, arma, totD, bonusDmg, r) {
    const ofensa = atacante.statEfectivo('strength') + atacante.statEfectivo('attack') + (arma.damage || 0) + bonusDmg;
    const defensa = defensor.statEfectivo('constitution') + defensor.statEfectivo('defense') + totD.absorb;
    const potencial = clamp(ofensa / C.refOfensa * C.danioMax, C.danioMin, C.danioMax); // el techo del atacante
    const mitigacion = defensa / (defensa + C.refOfensa);                                // el rival recorta una parte
    const bruto = potencial * (1 - mitigacion);
    // jitter: 15% flojo [0,0.8) · 5% fuerte [1.2,1.6) · 80% normal [0.8,1.2)
    const tirada = r();
    const jitter = tirada < C.probFlojo ? r() * 0.8
      : tirada < C.probFlojo + C.probFuerte ? 1.2 + r() * 0.4
        : 0.8 + r() * 0.4;
    return clamp(Math.round(bruto * jitter), C.danioMin, C.danioMax);
  }

  function danioCritico(arma, r) {
    const critPos = clamp((arma.critPower || 0) / 100, 0, 1);
    // ~90% se agrupa en torno al CritPower del arma; ~10% ignora el arma (hasta un 31 suelto)
    const pos = r() < 0.10 ? r() : clamp(critPos + (r() - 0.5) * 0.3, 0, 1);
    return C.critMin + Math.round(pos * (C.critMax - C.critMin));
  }

  // Aplica daño y devuelve el estado del que lo recibe: 'vivo' | 'sangrando' | 'muerto'.
  function aplicarDanio(p, danio) {
    p.hp -= danio;
    if (p.hp <= -C.hpMuerteInstantanea) { p.muerto = true; p.sangrando = false; return 'muerto'; }
    if (p.hp <= 0 && !p.sangrando) { p.sangrando = true; p.rondasSangrado = C.rondasSangrado; return 'sangrando'; }
    return p.sangrando ? 'sangrando' : 'vivo';
  }

  // Emotes en español (2ª persona cuando ataca el jugador, 3ª cuando ataca el otro).
  const TU = { fallo: 'Fallas el golpe', rozar: 'Rozas', golpe: 'Golpeas', golpeFuerte: 'Golpeas fuerte',
    golpeMuyFuerte: 'Golpeas muy fuerte', danioMasivo: 'Infliges daño masivo', masacre: '¡Masacras', critico: '¡Golpe crítico' };
  const OTRO = { fallo: 'falla el golpe', rozar: 'te roza', golpe: 'te golpea', golpeFuerte: 'te golpea fuerte',
    golpeMuyFuerte: 'te golpea muy fuerte', danioMasivo: 'te inflige daño masivo', masacre: '¡te masacra', critico: '¡te asesta un golpe crítico' };
  function narrar(res, atacante, defensor) {
    const fuerte = res.nivel === 'masacre' || res.nivel === 'critico';
    if (!res.acierto) return atacante.esJugador ? `Fallas el golpe a ${defensor.nombre}.` : `${cap(atacante.nombre)} falla el golpe.`;
    const suf = ` (-${res.danio})` + (fuerte ? '!' : '.');
    return atacante.esJugador ? `${TU[res.nivel]} a ${defensor.nombre}${suf}` : `${cap(atacante.nombre)} ${OTRO[res.nivel]}${suf}`;
  }

  // Motor por pasos: cada `paso()` = la acción de un combatiente (o un tic de sangrado / el fin).
  // La UI llama a paso() con un temporizador (~1 s) y anima el evento devuelto.
  class MotorCombate {
    constructor(iniciador, objetivo, r) {
      this.r = r || Math.random;
      this.orden = [iniciador, objetivo];   // el iniciador tiene la iniciativa (ataca primero cada ronda)
      this.idx = 0; this.ronda = 1;
      this.terminado = false; this.razon = null; this.ganador = null;
      for (const p of this.orden) { p.sangrando = false; p.muerto = false; }
    }
    otro(p) { return p === this.orden[0] ? this.orden[1] : this.orden[0]; }
    _terminar(razon, ganador) { this.terminado = true; this.razon = razon; this.ganador = ganador; return { tipo: 'fin', razon, ganador }; }

    paso() {
      if (this.terminado) return { tipo: 'fin', razon: this.razon, ganador: this.ganador };
      // si alguien está caído, el combate se pausa y corre el contador de sangrado
      const caido = this.orden.find((p) => p.sangrando);
      if (caido) {
        caido.rondasSangrado--;
        if (caido.rondasSangrado <= 0) { caido.muerto = true; caido.sangrando = false; return this._terminar('desangrado', this.otro(caido)); }
        return { tipo: 'sangra', quien: caido, restan: caido.rondasSangrado };
      }
      const atacante = this.orden[this.idx], defensor = this.otro(atacante);
      const res = resolverAtaque(atacante, defensor, this.r);
      let efecto = 'vivo';
      if (res.acierto) efecto = aplicarDanio(defensor, res.danio);
      const ev = { tipo: 'ataque', atacante, defensor, res, efecto, texto: narrar(res, atacante, defensor) };
      // avanzar el turno / la ronda
      this.idx++;
      if (this.idx >= this.orden.length) { this.idx = 0; this.ronda++; }
      if (efecto === 'muerto') this._terminar('muerte', atacante);
      return ev;
    }
    // Huida sin penalización: termina al acabar la ronda en curso (aquí, de inmediato).
    huir(quien) { if (!this.terminado) return this._terminar('huida', null); }
  }

  // Simulación (como el `simulate` del MUD): corre `n` combates a muerte y cuenta victorias del
  // iniciador. Las fábricas crean instancias nuevas cada combate. RNG con semilla si se da.
  function simular(fabIniciador, fabObjetivo, n, semilla) {
    const r = (V && V.rng && semilla != null) ? V.rng(semilla) : Math.random;
    let ganaIni = 0, rondas = 0;
    for (let i = 0; i < n; i++) {
      const m = new MotorCombate(fabIniciador(), fabObjetivo(), r);
      let guard = 0;
      while (!m.terminado && guard++ < 100000) m.paso();
      if (m.ganador === m.orden[0]) ganaIni++;
      rondas += m.ronda;
    }
    return { combates: n, ganaIniciador: ganaIni, tasaIniciador: ganaIni / n, rondasMedia: rondas / n };
  }

  FZ.combate = { C, clasificarNivel, resolverAtaque, aplicarDanio, narrar, MotorCombate, simular };
})(typeof window !== 'undefined' ? window : globalThis);
