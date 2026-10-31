/* =============================================================================
 * Mundo — DATOS / NPCs (Fase 2-7): enemigos iniciales, con los stats del MUD (C:\Repos\rpg-gr).
 * Son `Personaje` (raza 'criatura', sin bonos) con un arma natural (stats 0, solo da nombre).
 * Requiere datos/personaje.js. `D.crearNPC(id)` devuelve una instancia NUEVA cada vez.
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ = raiz.FZ || {};
  const D = FZ.datos = FZ.datos || {};

  // Arma natural: como los Puños, no ocupa mano ni tiene stats; solo el nombre para los emotes.
  const natural = (nombre) => ({ nombre, tipo: 'arma', hit: 0, damage: 0, critChanceBonus: 0, critPower: 0, natural: true, bulk: 0 });

  // id -> plantilla. maxHp/stats del MUD (rata 5/25, ciervo 15/45, bestia 25/60). Las 4 skills en 0,
  // igual que el jugador sin entrenar (nota del MUD: si no, el ciervo le ganaba al jugador).
  const PLANTILLAS = {
    rata:       { nombre: 'una rata',       arma: 'Mordisco',          stats: 5,  maxHp: 25, loot: 'piel_rata' },
    ciervo:     { nombre: 'un ciervo',      arma: 'Cornada',           stats: 15, maxHp: 45, loot: 'piel_ciervo' },
    bestia:     { nombre: 'una bestia',     arma: 'Zarpazo',           stats: 25, maxHp: 60, loot: 'piel_bestia' },
    serpiente:  { nombre: 'una serpiente',  arma: 'Mordisco venenoso', stats: 12, maxHp: 30, loot: 'piel_serpiente' },
    murcielago: { nombre: 'un murciélago',  arma: 'Mordisco',          stats: 8,  maxHp: 22, loot: 'ala_murcielago' },
  };
  D.NPCS = PLANTILLAS;

  D.crearNPC = function (id) {
    const t = PLANTILLAS[id];
    if (!t) return null;
    const p = D.crearPersonaje({
      nombre: t.nombre, raza: 'criatura', esJugador: false,
      base: {
        maxHp: t.maxHp, maxMp: 0,
        strength: t.stats, constitution: t.stats, agility: t.stats, coordination: t.stats, intelligence: t.stats,
        aim: 0, attack: 0, defense: 0, dodge: 0,
      },
    });
    p.id = id;
    p.arma = natural(t.arma);
    p.loot = t.loot && D.ITEMS ? D.ITEMS[t.loot] : null;   // el botín que suelta al morir
    return p;
  };
})(typeof window !== 'undefined' ? window : globalThis);
