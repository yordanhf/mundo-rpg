/* =============================================================================
 * Mundo — DATOS / PERSONAJE (Fase 2): el modelo del personaje (JS puro, sin DOM, listo para el
 * servidor), calcado del `Combatant` del MUD (C:\Repos\rpg-gr) en lo que NO es combate: identidad,
 * stats/skills con bono de raza, equipo por ranura, inventario con bulk (manos + mochila), economía
 * y XP/nivel. El combate en sí (fórmulas de ataque) es Fase 7.
 * -----------------------------------------------------------------------------
 * Requiere `datos/items.js` cargado antes (FZ.datos.ITEMS). El aspecto visual se compone con
 * FZ.datos.equipoVisual + A.componerEquipo (Fase 1).
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ = raiz.FZ || {};
  const D = FZ.datos = FZ.datos || {};
  const ITEMS = D.ITEMS;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // --- Constantes del MUD ---
  const TOPE_STAT = 125;        // tope del stat efectivo con buffs (MaxEffectiveStat)
  const CAP_MANOS = 2;          // bulk de las manos (HandCapacity)
  const MANO_MIN = 1;           // en la mano, cualquier cosa ocupa mínimo 1 bulk
  D.STATS = ['strength', 'constitution', 'agility', 'coordination', 'intelligence'];
  D.SKILLS = ['aim', 'attack', 'defense', 'dodge'];
  D.RANURAS_ARMADURA = ['cab', 'pecho', 'hombro', 'legs', 'feet', 'escudo'];

  // --- Razas (bonos en % SOLO a los stats, nunca a las skills; cada una suma 0). Del MUD. ---
  // De momento el juego solo usa `humano`; el resto queda listo para cuando se añadan.
  D.RAZAS = {
    humano:   { nombre: 'Humano',   jugable: true,  bonos: { coordination: 5, intelligence: -5 } },
    enano:    { nombre: 'Enano',    jugable: true,  bonos: { constitution: 10, strength: 10, intelligence: -10, coordination: -5, agility: -5 } },
    elfo:     { nombre: 'Elfo',     jugable: true,  bonos: { agility: 5, intelligence: 10, constitution: -10, strength: -5 } },
    orco:     { nombre: 'Orco',     jugable: true,  bonos: { strength: 10, constitution: 5, intelligence: -10, coordination: -5 } },
    criatura: { nombre: 'Criatura', jugable: false, bonos: {} }, // NPCs (rata/ciervo/bestia)
  };

  // --- Stats base de un personaje nivel 1 (del MUD, data/player.json) ---
  D.BASE_JUGADOR = {
    maxHp: 50, maxMp: 50,
    strength: 20, constitution: 20, agility: 20, coordination: 20, intelligence: 20,
    aim: 0, attack: 0, defense: 0, dodge: 0,
  };

  // --- Progresión (del MUD; se usa manualmente, no auto-nivela) ---
  D.xpRequerida = (nivel) => Math.round(500 * Math.pow(1.33, nivel - 2)); // para pasar al `nivel` (≥2)
  D.promedioStatRequerido = (nivel) => 15 + 5 * nivel;                     // nivel 2 = 25
  D.topeEntrenamiento = (nivel) => 30 + 5 * nivel;                         // tope por stat/skill

  const resolver = (x) => (typeof x === 'string' ? ITEMS[x] : x);

  class Personaje {
    constructor(cfg) {
      cfg = cfg || {};
      this.nombre = cfg.nombre || 'Guardián';
      this.raza = D.RAZAS[cfg.raza] ? cfg.raza : 'humano';
      this.esJugador = cfg.esJugador !== false;
      const base = Object.assign({}, D.BASE_JUGADOR, cfg.base);
      // stats y skills base (mutables: se entrenan)
      for (const s of D.STATS.concat(D.SKILLS)) this[s] = base[s] || 0;
      this.maxHp = base.maxHp; this.maxMp = base.maxMp;
      this.hp = cfg.hp != null ? cfg.hp : this.maxHp;
      this.mp = cfg.mp != null ? cfg.mp : this.maxMp;
      this.oro = cfg.oro || 0;
      this.experiencia = cfg.experiencia || 0;
      this.nivel = cfg.nivel || 1;
      // equipo e inventario
      this.equipo = { cab: null, pecho: null, hombro: null, legs: null, feet: null, escudo: null };
      this.arma = ITEMS.punos;        // empuñada
      this.armasEnvainadas = [];
      this.armaduraEnMano = [];
      this.itemsEnMano = [];
      this.mochila = null;
      this.itemsMochila = [];
    }

    // ---- stats ----
    // El stat efectivo aplica el bono de raza (solo a stats, no a skills) y el tope de 125.
    // (Los buffs temporales llegarán con el combate, Fase 7.)
    statEfectivo(tipo) {
      let v = this[tipo] || 0;
      if (D.STATS.indexOf(tipo) >= 0) {
        const b = D.RAZAS[this.raza].bonos[tipo] || 0;
        v = v * (1 + b / 100);
      }
      return clamp(v, 0, TOPE_STAT);
    }

    // ---- manos (pool de bulk) ----
    bulkManoUsado() {
      let u = 0;
      if (!this.arma.natural) u += this.arma.bulk || 0;              // el arma empuñada (los Puños no ocupan)
      if (this.equipo.escudo) u += this.equipo.escudo.bulk || 0;    // el escudo cuesta mano aunque esté puesto
      for (const p of this.armaduraEnMano) u += Math.max(MANO_MIN, p.bulk || 0);
      for (const it of this.itemsEnMano) u += Math.max(MANO_MIN, it.bulk || 0);
      return u;
    }
    bulkManoLibre() { return CAP_MANOS - this.bulkManoUsado(); }

    // ---- armadura ----
    equiparArmadura(x) {
      const item = resolver(x);
      if (!item || item.tipo !== 'armadura') return { ok: false, error: 'Eso no es una armadura.' };
      const r = item.ranura;
      if (this.equipo[r]) return { ok: false, error: 'Ya llevas algo en esa ranura (' + r + ').' };
      if (r === 'escudo' && this.bulkManoLibre() < (item.bulk || 0))
        return { ok: false, error: 'No te quedan manos libres para el escudo.' };
      const i = this.armaduraEnMano.indexOf(item);
      if (i >= 0) this.armaduraEnMano.splice(i, 1);
      this.equipo[r] = item;
      return { ok: true };
    }
    quitarArmadura(r) {
      const item = this.equipo[r];
      if (!item) return { ok: false, error: 'No llevas nada en esa ranura.' };
      // al quitarla queda en la mano (mínimo 1 bulk); el escudo ya ocupaba mano, así que no suma
      const coste = r === 'escudo' ? 0 : MANO_MIN;
      if (this.bulkManoLibre() < coste) return { ok: false, error: 'No tienes mano libre para sostenerla.' };
      this.equipo[r] = null;
      this.armaduraEnMano.push(item);
      return { ok: true };
    }

    // ---- armas ----
    empunarArma(x) {
      const item = resolver(x);
      if (!item || item.tipo !== 'arma') return { ok: false, error: 'Eso no es un arma.' };
      // envainar la actual (si es real) libera su bulk; comprobamos que la nueva quepa
      const libreTrasEnvainar = this.bulkManoLibre() + (this.arma.natural ? 0 : (this.arma.bulk || 0));
      if (libreTrasEnvainar < (item.bulk || 0)) return { ok: false, error: 'No te caben ambas manos para esa arma.' };
      if (!this.arma.natural) this.armasEnvainadas.push(this.arma);
      this.arma = item;
      return { ok: true };
    }
    envainarArma() {
      if (this.arma.natural) return { ok: false, error: 'No llevas ningún arma empuñada.' };
      this.armasEnvainadas.push(this.arma);
      this.arma = ITEMS.punos;
      return { ok: true };
    }

    // ---- mochila ----
    bulkMochilaUsado() { return this.itemsMochila.reduce((s, it) => s + (it.bulk || 0), 0); }
    bulkMochilaLibre() { return this.mochila ? this.mochila.capacidad - this.bulkMochilaUsado() : 0; }
    guardarEnMochila(x) {
      const item = resolver(x);
      if (!item) return { ok: false, error: 'No existe ese objeto.' };
      if (!this.mochila) return { ok: false, error: 'No llevas mochila.' };
      if (this.bulkMochilaLibre() < (item.bulk || 0)) return { ok: false, error: 'No cabe en la mochila.' };
      this.itemsMochila.push(item);
      return { ok: true };
    }

    // ---- economía y progresión ----
    ganarOro(n) { this.oro += n; return this.oro; }
    gastarOro(n) { if (n > this.oro) return { ok: false, error: 'No tienes suficiente oro.' }; this.oro -= n; return { ok: true }; }
    ganarXP(n) { this.experiencia += n; return this.experiencia; }

    // ---- totales de combate (defensa del equipo + arma) ----
    totales() { return D.totalesCombate(Object.assign({ arma: this.arma }, this.equipo)); }

    // ---- aspecto visual: compone el equipo para A.guardian(pose, equipo) ----
    aspecto() {
      const sel = D.equipoVisual(Object.assign({ arma: this.arma }, this.equipo));
      const A = FZ.visual && FZ.visual.cartoon && FZ.visual.cartoon.A;
      return A ? A.componerEquipo(sel) : sel;
    }
  }

  D.Personaje = Personaje;
  D.crearPersonaje = (cfg) => new Personaje(cfg);
})(typeof window !== 'undefined' ? window : globalThis);
