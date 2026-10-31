/* =============================================================================
 * Mundo — DATOS / ÍTEMS (Fase 2): el catálogo de armas, armaduras y demás, con sus
 * atributos de combate tomados del MUD (C:\Repos\rpg-gr). Cada ítem referencia una
 * PIEZA VISUAL del catálogo de la Fase 1 (A.GUARDIAN_CAT) a través de `apariencia`.
 * -----------------------------------------------------------------------------
 * Esquema de ítem:
 *   { id, nombre, tipo: 'arma'|'armadura'|'mochila'|'material',
 *     apariencia: 'id de pieza visual en A.GUARDIAN_CAT[ranura]' | null,
 *     bulk, valor (oro), durabilidadMax,
 *     // armadura:
 *     ranura: 'cab'|'pecho'|'hombro'|'legs'|'feet'|'escudo', slots: [BodySlot…], absorb, deflect,
 *     // arma:
 *     ranura: 'arma', hit, damage, critChanceBonus, critPower, natural?, dosManos? }
 *
 * slots = los BodySlot del MUD (Head/Torso/Arms/Legs/Feet/Shield); una pieza puede cubrir varios.
 * Valores de combate = MUD tal cual (placeholders bajos del autor, se afinarán).
 * NOTA (placeholders visuales): el set de cuero reutiliza las piezas "marrón/cuero" de la Fase 1 y
 * las tres armas comparten la espada base; falta arte propia de cada ítem (pendiente de decidir).
 * ========================================================================== */
(function (raiz) {
  'use strict';
  const FZ = raiz.FZ = raiz.FZ || {};
  const D = FZ.datos = FZ.datos || {};

  // Tope de cada "bolsa" de armadura sumando todas las piezas (MUD: MaxArmorPoolTotal, normal ~100).
  D.TOPE_ARMADURA = 100;

  const ITEMS = {
    // ---- Armas (Hit / Damage / CritChanceBonus / CritPower) ----
    punos:        { id: 'punos', nombre: 'Puños', tipo: 'arma', ranura: 'arma', apariencia: null,
                    hit: 0, damage: 0, critChanceBonus: 0, critPower: 0, natural: true, bulk: 0, valor: 0, durabilidadMax: 0 },
    cuchillo:     { id: 'cuchillo', nombre: 'Cuchillo', tipo: 'arma', ranura: 'arma', apariencia: 'espada_base',
                    hit: 8, damage: 6, critChanceBonus: 0.001, critPower: 10, bulk: 1, valor: 8, durabilidadMax: 400 },
    daga:         { id: 'daga', nombre: 'Daga', tipo: 'arma', ranura: 'arma', apariencia: 'espada_base',
                    hit: 7, damage: 7, critChanceBonus: 0.002, critPower: 15, bulk: 1, valor: 10, durabilidadMax: 500 },
    espada_corta: { id: 'espada_corta', nombre: 'Espada corta', tipo: 'arma', ranura: 'arma', apariencia: 'espada_base',
                    hit: 10, damage: 10, critChanceBonus: 0.001, critPower: 12, bulk: 1, valor: 15, durabilidadMax: 750 },

    // ---- Armadura: set "cuero rústico" (Absorb / Deflect) ----
    gorro_cuero:    { id: 'gorro_cuero', nombre: 'Gorro de cuero rústico', tipo: 'armadura', ranura: 'cab',
                      slots: ['Head'], absorb: 3, deflect: 2, apariencia: 'capucha_marron', bulk: 0.5, valor: 4, durabilidadMax: 200 },
    chaleco_cuero:  { id: 'chaleco_cuero', nombre: 'Chaleco de cuero rústico', tipo: 'armadura', ranura: 'pecho',
                      slots: ['Torso'], absorb: 6, deflect: 3, apariencia: 'chaleco_marron', bulk: 1, valor: 8, durabilidadMax: 400 },
    brazales_cuero: { id: 'brazales_cuero', nombre: 'Brazales de cuero rústico', tipo: 'armadura', ranura: 'hombro',
                      slots: ['Arms'], absorb: 3, deflect: 2, apariencia: 'cuero', bulk: 0.5, valor: 4, durabilidadMax: 200 },
    grebas_cuero:   { id: 'grebas_cuero', nombre: 'Grebas de cuero rústico', tipo: 'armadura', ranura: 'legs',
                      slots: ['Legs'], absorb: 4, deflect: 2, apariencia: 'pantalon_azul', bulk: 0.5, valor: 5, durabilidadMax: 250 },
    botas_cuero:    { id: 'botas_cuero', nombre: 'Botas de cuero rústico', tipo: 'armadura', ranura: 'feet',
                      slots: ['Feet'], absorb: 2, deflect: 2, apariencia: 'bota_comun', bulk: 0.5, valor: 3, durabilidadMax: 150 },
    escudo_madera:  { id: 'escudo_madera', nombre: 'Escudo de madera', tipo: 'armadura', ranura: 'escudo',
                      slots: ['Shield'], absorb: 3, deflect: 4, apariencia: 'broquel', bulk: 1, valor: 6, durabilidadMax: 300 },

    // ---- Mochila y materiales ----
    petate:    { id: 'petate', nombre: 'Petate del viajero', tipo: 'mochila', apariencia: null, capacidad: 2, bulk: 0, valor: 10, durabilidadMax: 0 },
    piel_rata:       { id: 'piel_rata', nombre: 'Piel de rata', tipo: 'material', apariencia: null, bulk: 0.25, valor: 8, durabilidadMax: 0 },
    piel_ciervo:     { id: 'piel_ciervo', nombre: 'Piel de ciervo', tipo: 'material', apariencia: null, bulk: 0.5, valor: 15, durabilidadMax: 0 },
    piel_bestia:     { id: 'piel_bestia', nombre: 'Piel de bestia', tipo: 'material', apariencia: null, bulk: 0.75, valor: 25, durabilidadMax: 0 },
    piel_serpiente:  { id: 'piel_serpiente', nombre: 'Piel de serpiente', tipo: 'material', apariencia: null, bulk: 0.25, valor: 12, durabilidadMax: 0 },
    ala_murcielago:  { id: 'ala_murcielago', nombre: 'Ala de murciélago', tipo: 'material', apariencia: null, bulk: 0.25, valor: 6, durabilidadMax: 0 },
  };
  D.ITEMS = ITEMS;

  // El aspecto base del humano sin equipar (las "ropas" de debajo): las piezas que un ítem no cubra
  // se quedan con esto. Es el guardián free (sin cicatriz).
  D.ASPECTO_BASE = { cab: 'capucha_gris', pecho: 'chaleco_gris', hombro: 'remiendo', legs: 'pantalon_gris',
    feet: 'bota_gris', capa: 'ninguna_rasgada', arma: 'espada_base', escudo: 'ninguno', extras: { bolsa: true } };

  // ---- Puente ítems → aspecto: a partir del equipo (mapa ranura→id de ítem o el ítem), construye la
  // selección para A.componerEquipo, partiendo del aspecto base y sustituyendo cada ranura equipada.
  const resolver = (x) => (typeof x === 'string' ? ITEMS[x] : x);
  D.equipoVisual = function (equipo) {
    equipo = equipo || {};
    const sel = Object.assign({}, D.ASPECTO_BASE);
    sel.extras = Object.assign({}, D.ASPECTO_BASE.extras);
    for (const ranura in equipo) {
      const item = resolver(equipo[ranura]);
      if (item && item.apariencia) sel[ranura] = item.apariencia;
    }
    return sel;
  };

  // ---- Totales de combate del equipo (como en el MUD): Absorb/Deflect sumados (cada bolsa con su
  // tope) y los stats del arma (o Puños si no hay). Lo usará el motor de combate (Fase 7).
  D.totalesCombate = function (equipo) {
    equipo = equipo || {};
    let absorb = 0, deflect = 0;
    let arma = ITEMS.punos;
    for (const ranura in equipo) {
      const item = resolver(equipo[ranura]);
      if (!item) continue;
      if (item.tipo === 'armadura') { absorb += item.absorb || 0; deflect += item.deflect || 0; }
      else if (item.tipo === 'arma') arma = item;
    }
    return {
      absorb: Math.min(absorb, D.TOPE_ARMADURA),
      deflect: Math.min(deflect, D.TOPE_ARMADURA),
      arma: { hit: arma.hit, damage: arma.damage, critChanceBonus: arma.critChanceBonus, critPower: arma.critPower, natural: !!arma.natural, nombre: arma.nombre },
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
