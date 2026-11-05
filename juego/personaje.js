// Personaje modular del juego. Cada etapa es un conjunto de capas SVG.
// Uso: PersonajeHacker.crear(etapa) devuelve un string SVG (etapa 1..5).

const PersonajeHacker = (() => {
  const C = {
    piel: '#f2c6a0',
    contorno: '#14110f',
    pelo: '#2b1d14',
    cabello_largo: '#1f150e',
    pantalon: '#2d3748',
    zapato: '#f5f5f5',
    sudadera: '#1f2129',
    mochila: '#2a2d36',
    naranja: '#e67e22',
    rojo: '#b83227',
    verde: '#7cffb2',
    chaqueta: '#1f3a5f',
    cierre: '#9ca3af',
    audifonos: '#111111',
    negro: '#15151b',
    gabán: '#1c1c22',
    gabán_forro: '#2f2f38',
    lente: '#050505',
    brillo: '#7cffb2',
  };

  const contorno = `stroke="${C.contorno}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

  // Invasor pixelado (estilo arcade) como estampado del buso.
  const FILAS_INVASOR = [
    '..#.....#..',
    '...#...#...',
    '..#######..',
    '.##.###.##.',
    '###########',
    '#.#######.#',
    '#.#.....#.#',
    '...##.##...',
  ];
  const invasor = (x0, y0, celda, color) => {
    let out = '';
    FILAS_INVASOR.forEach((fila, y) => {
      [...fila].forEach((c, x) => {
        if (c === '#') out += `<rect x="${x0 + x * celda}" y="${y0 + y * celda}" width="${celda}" height="${celda}" fill="${color}"/>`;
      });
    });
    return out;
  };

  // Cabello trasero (largo) para etapas 4 y 5.
  const peloTrasero = (etapa) => {
    if (etapa < 4) return '';
    const color = etapa === 5 ? C.cabello_largo : C.pelo;
    return `<path d="M98 118 Q88 200 106 214 L194 214 Q212 200 202 118 Z" fill="${color}" ${contorno}/>`;
  };

  // Mochila (solo etapa 1 y 2, detrás del cuerpo).
  const mochila = (etapa) => {
    if (etapa > 2) return '';
    return `
      <rect x="198" y="186" width="44" height="104" rx="14" fill="${C.mochila}" ${contorno}/>
      <rect x="206" y="200" width="28" height="14" rx="4" fill="#ff8a4c" stroke="${C.contorno}" stroke-width="3"/>`;
  };

  // Cuerpo: sudadera (1), chaqueta (2, 3), gabán (4, 5).
  const cuerpo = (etapa) => {
    if (etapa === 1) {
      return `
        <path d="M104 172 Q150 158 196 172 L206 302 L94 302 Z" fill="${C.sudadera}" ${contorno}/>
        <path d="M128 262 L172 262 L168 292 L132 292 Z" fill="#525a68" stroke="${C.contorno}" stroke-width="3"/>
        ${invasor(122, 206, 5, C.verde)}`;
    }
    if (etapa === 2 || etapa === 3) {
      const cuello = etapa === 3
        ? `<path d="M118 164 L150 196 L182 164 L182 178 L150 206 L118 178 Z" fill="${C.negro}" ${contorno}/>`
        : `<path d="M120 170 L150 200 L180 170" fill="none" stroke="${C.contorno}" stroke-width="4"/>`;
      return `
        <path d="M104 172 Q150 158 196 172 L206 302 L94 302 Z" fill="${etapa === 3 ? C.negro : C.chaqueta}" ${contorno}/>
        <line x1="150" y1="176" x2="150" y2="300" stroke="${C.cierre}" stroke-width="4" stroke-dasharray="6 6"/>
        ${cuello}`;
    }
    // Gabán largo (4 y 5). Etapa 5 con cuello alto.
    const cuello = etapa === 5
      ? `<path d="M116 160 L150 196 L184 160 L186 186 L150 214 L114 186 Z" fill="${C.gabán_forro}" ${contorno}/>`
      : `<path d="M116 164 L150 194 L184 164" fill="none" stroke="${C.gabán_forro}" stroke-width="6"/>`;
    const largo = etapa === 5 ? 'L236 440 L64 440' : 'L232 430 L68 430';
    return `
      <path d="M104 172 Q150 158 196 172 L214 300 ${largo} L78 300 Z" fill="${C.gabán}" ${contorno}/>
      <path d="M150 178 L150 436" stroke="${C.gabán_forro}" stroke-width="4"/>
      <path d="M124 300 L146 300 L146 436 L124 436 Z" fill="${C.gabán_forro}" opacity="0.5"/>
      ${cuello}`;
  };

  // Cabeza (cara, orejas, cuello).
  const cabeza = () => `
    <rect x="140" y="158" width="20" height="18" fill="${C.piel}" ${contorno}/>
    <circle cx="100" cy="124" r="9" fill="${C.piel}" ${contorno}/>
    <circle cx="200" cy="124" r="9" fill="${C.piel}" ${contorno}/>
    <ellipse cx="150" cy="120" rx="50" ry="52" fill="${C.piel}" ${contorno}/>`;

  // Cabello delantero: despeinado (1), chaqueta/nuevo corte (2–3), largo (4–5).
  const pelo = (etapa) => {
    if (etapa <= 2) {
      return `<path d="M100 116 Q92 60 140 62 Q158 38 190 56 Q212 70 200 116 Q190 92 178 100 Q160 82 140 98 Q120 88 100 116 Z" fill="${C.pelo}" ${contorno}/>`;
    }
    if (etapa === 3) {
      return `<path d="M100 114 Q98 62 150 64 Q202 62 200 114 Q186 88 166 92 Q140 96 100 114 Z" fill="${C.pelo}" ${contorno}/>`;
    }
    return `<path d="M100 112 Q98 60 150 60 Q204 60 200 112 Q186 86 160 90 Q124 96 100 112 Z" fill="${C.pelo}" ${contorno}/>`;
  };

  // Accesorios de cara: audífonos (2), gafas oscuras (3–5).
  const accesorios = (etapa) => {
    let out = '';
    if (etapa === 1) {
      // Audífonos alrededor del cuello.
      out += `
        <path d="M104 178 Q150 202 196 178" fill="none" stroke="${C.audifonos}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="100" cy="180" r="9" fill="${C.audifonos}" stroke="${C.contorno}" stroke-width="3"/>
        <circle cx="200" cy="180" r="9" fill="${C.audifonos}" stroke="${C.contorno}" stroke-width="3"/>`;
    }
    if (etapa <= 2) {
      // Gafas redondas transparentes.
      out += `
        <circle cx="134" cy="122" r="13" fill="none" stroke="${C.contorno}" stroke-width="3"/>
        <circle cx="166" cy="122" r="13" fill="none" stroke="${C.contorno}" stroke-width="3"/>
        <line x1="147" y1="122" x2="153" y2="122" stroke="${C.contorno}" stroke-width="3"/>`;
    }
    if (etapa === 2) {
      out += `
        <path d="M96 118 Q150 26 204 118" fill="none" stroke="${C.audifonos}" stroke-width="7"/>
        <rect x="88" y="112" width="18" height="30" rx="7" fill="${C.audifonos}"/>
        <rect x="194" y="112" width="18" height="30" rx="7" fill="${C.audifonos}"/>`;
    }
    if (etapa >= 3) {
      out += `
        <rect x="122" y="112" width="24" height="18" rx="6" fill="${C.lente}" stroke="${C.contorno}" stroke-width="3"/>
        <rect x="154" y="112" width="24" height="18" rx="6" fill="${C.lente}" stroke="${C.contorno}" stroke-width="3"/>
        <line x1="146" y1="118" x2="154" y2="118" stroke="${C.contorno}" stroke-width="3"/>
        <line x1="122" y1="118" x2="112" y2="114" stroke="${C.contorno}" stroke-width="3"/>
        <line x1="178" y1="118" x2="188" y2="114" stroke="${C.contorno}" stroke-width="3"/>`;
    }
    return out;
  };

  // Ojos y boca. Los ojos son grupos que parpadean (clase .ojo).
  const rostro = (etapa) => {
    const ojosVisibles = etapa <= 2 ? `
      <g class="ojo">
        <ellipse cx="134" cy="124" rx="5" ry="6" fill="${C.contorno}"/>
        <ellipse cx="166" cy="124" rx="5" ry="6" fill="${C.contorno}"/>
        <circle cx="136" cy="122" r="1.8" fill="#fff"/>
        <circle cx="168" cy="122" r="1.8" fill="#fff"/>
      </g>` : `
      <g class="ojo">
        <circle cx="134" cy="124" r="2" fill="${C.contorno}"/>
        <circle cx="166" cy="124" r="2" fill="${C.contorno}"/>
      </g>`;
    const cejas = `
      <path d="M124 104 L142 110" stroke="${C.pelo}" stroke-width="4" stroke-linecap="round"/>
      <path d="M176 104 L158 110" stroke="${C.pelo}" stroke-width="4" stroke-linecap="round"/>`;
    const boca = etapa <= 2
      ? `<path d="M138 150 Q150 158 162 150" fill="none" stroke="${C.contorno}" stroke-width="3" stroke-linecap="round"/>`
      : `<path d="M140 152 L160 152" fill="none" stroke="${C.contorno}" stroke-width="3" stroke-linecap="round"/>`;
    return ojosVisibles + cejas + boca;
  };

  // Brazos (escritura) y manos. Color del brazo según la prenda.
  const brazos = (etapa) => {
    const color = etapa === 1 ? C.sudadera : etapa === 2 ? C.chaqueta : C.gabán;
    return `
      <g class="brazos">
        <path d="M108 186 Q80 236 96 300" fill="none" stroke="${C.contorno}" stroke-width="32" stroke-linecap="round"/>
        <path d="M108 186 Q80 236 96 300" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round"/>
        <path d="M192 186 Q220 236 204 300" fill="none" stroke="${C.contorno}" stroke-width="32" stroke-linecap="round"/>
        <path d="M192 186 Q220 236 204 300" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round"/>
        <circle class="mano mano-i" cx="96" cy="306" r="12" fill="${C.piel}" ${contorno}/>
        <circle class="mano mano-d" cx="204" cy="306" r="12" fill="${C.piel}" ${contorno}/>
      </g>`;
  };

  // Piernas y zapatos. Ocultos por el gabán en etapas 4 y 5.
  const piernas = (etapa) => {
    if (etapa >= 4) return '';
    return `
      <rect x="118" y="300" width="28" height="120" rx="8" fill="${C.pantalon}" ${contorno}/>
      <rect x="154" y="300" width="28" height="120" rx="8" fill="${C.pantalon}" ${contorno}/>
      <rect x="108" y="412" width="42" height="20" rx="9" fill="${etapa === 1 ? C.rojo : C.zapato}" ${contorno}/>
      <rect x="150" y="412" width="42" height="20" rx="9" fill="${etapa === 1 ? C.rojo : C.zapato}" ${contorno}/>`;
  };

  // Ensambla el personaje completo en el orden correcto de capas.
  const crear = (etapa = 1) => {
    const e = Math.min(5, Math.max(1, etapa));
    return `
<svg class="personaje" viewBox="0 0 300 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Personaje hacker, etapa ${e}">
  <g class="cuerpo">
    ${peloTrasero(e)}
    ${piernas(e)}
    ${mochila(e)}
    ${cuerpo(e)}
    ${brazos(e)}
    ${cabeza()}
    ${pelo(e)}
    ${rostro(e)}
    ${accesorios(e)}
  </g>
</svg>`;
  };

  return { crear, ETAPAS: 5 };
})();

if (typeof module !== 'undefined') module.exports = PersonajeHacker;
