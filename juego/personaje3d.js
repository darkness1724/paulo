// Personaje 3D de DarkHat. Modelado con primitivas de Three.js (MIT), sombreado tipo cómic
// (MeshToonMaterial + contorno por casco invertido). Cada etapa cambia la ropa y los accesorios.
// La etapa 1 sigue la ilustración de referencia: pelo rizado, gafas oscuras, buso rojo con invasor,
// chaqueta negra abierta, mochila con correas naranjas, audífonos, jeans, zapatillas y dispositivo.
import * as THREE from './vendor/three.module.js';

const PALETA = {
  piel: 0xeab08a,
  pelo: 0x1a1210,
  pelo_largo: 0x120d0b,
  contorno: 0x0b0a0a,
  buso: 0xb3212b,        // buso rojo (etapa 1)
  invasor: 0xf4f4f4,     // invasor blanco en el pecho
  chaqueta_negra: 0x17181d,
  buso_claro: 0x2a2d36,
  pantalon: 0x2b4a7a,    // jeans azules
  zapato: 0xf2f2f2,
  rojo: 0xb3212b,
  verde: 0x7cffb2,
  chaqueta: 0x1f3a5f,
  negro: 0x15151b,
  gabán: 0x1c1c22,
  forro: 0x2f2f38,
  naranja: 0xe67e22,
  mochila: 0x23262d,
  audifonos: 0x1d1f26,
  cian: 0x3fd0ff,
  lente: 0x050505,
  cierre: 0x9ca3af,
  cadena: 0xb8bec8,
  dispositivo: 0x3a3f4a,
};

// Rampa de 3 tonos para el sombreado de cómic.
const rampa = (() => {
  const datos = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(datos, 3, 1);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const matContorno = new THREE.MeshBasicMaterial({ color: PALETA.contorno, side: THREE.BackSide });
const mat = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: rampa, ...extra });

// Malla con sombra y contorno. El contorno es un hijo ligeramente más grande, con caras invertidas.
function malla(geo, material, { pos = [0, 0, 0], rot = [0, 0, 0], esc = [1, 1, 1], borde = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.scale.set(...esc);
  m.castShadow = true;
  m.receiveShadow = true;
  if (borde) {
    const contorno = new THREE.Mesh(geo, matContorno);
    contorno.scale.setScalar(1.05);
    m.add(contorno);
  }
  return m;
}

const esfera = (r, color, opts) => malla(new THREE.SphereGeometry(r, 24, 16), mat(color), opts);
const capsula = (r, largo, color, opts) => malla(new THREE.CapsuleGeometry(r, largo, 6, 14), mat(color), opts);
const caja = (w, h, d, color, opts) => malla(new THREE.BoxGeometry(w, h, d), mat(color), opts);

// Esfera con vértices desplazados para que se vea como cabello rizado.
function mechon(r, semilla, color, opts) {
  const geo = new THREE.IcosahedronGeometry(r, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const ruido = 1 + Math.sin(semilla * 12.9 + x * 17.1 + y * 9.7 + z * 5.3) * 0.12;
    pos.setXYZ(i, x * ruido, y * ruido, z * ruido);
  }
  geo.computeVertexNormals();
  return malla(geo, mat(color), opts);
}

// Invasor pixelado (11x8) para el estampado del buso.
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

export function crearPersonaje(etapa = 1) {
  const e = Math.min(5, Math.max(1, etapa));
  const root = new THREE.Group();
  const cabezaG = new THREE.Group();
  root.add(cabezaG);

  // Piernas y zapatillas. Los oculta el gabán en las etapas 4 y 5.
  if (e < 4) {
    [-0.2, 0.2].forEach((x) => {
      root.add(capsula(0.13, 0.85, PALETA.pantalon, { pos: [x, 0.72, 0] }));
      // Zapatilla blanca con cuello rojo en la etapa 1 (como en la referencia).
      root.add(esfera(0.16, PALETA.zapato, { pos: [x, 0.14, 0.08], esc: [1, 0.6, 1.5] }));
      if (e === 1) root.add(esfera(0.1, PALETA.rojo, { pos: [x, 0.24, 0.04], esc: [1, 0.5, 1.1] }));
    });
  }
  root.add(esfera(0.32, PALETA.pantalon, { pos: [0, 1.2, 0], esc: [1.1, 0.7, 0.9] }));

  // Cadena colgando de la cadera (etapas 1 y 2).
  if (e <= 2) {
    [[0.3, 1.35, 0.2], [0.34, 1.2, 0.3], [0.3, 1.05, 0.34], [0.22, 0.92, 0.36]].forEach(([x, y, z]) => {
      root.add(malla(new THREE.TorusGeometry(0.05, 0.015, 6, 12), mat(PALETA.cadena), { pos: [x, y, z], rot: [0.5, 0.3, 0], borde: false }));
    });
  }

  // Mochila (etapas 1 y 2), detrás del cuerpo, con correas naranjas.
  if (e <= 2) {
    root.add(esfera(0.42, PALETA.mochila, { pos: [0, 1.95, -0.38], esc: [0.9, 1.1, 0.45] }));
    [-0.28, 0.28].forEach((x) => {
      root.add(caja(0.05, 0.8, 0.06, PALETA.naranja, { pos: [x, 1.9, -0.04], borde: false }));
    });
  }

  // Torso: buso rojo con chaqueta abierta (1), chaqueta (2), chaqueta negra (3) o gabán (4 y 5).
  const colorTorso = e === 1 ? PALETA.buso : e === 2 ? PALETA.chaqueta : PALETA.negro;
  if (e <= 3) {
    root.add(capsula(0.36, 0.55, colorTorso, { pos: [0, 1.9, 0], esc: [1.12, 1, 0.78] }));
    if (e === 1) {
      // Chaqueta negra abierta: capa trasera y dos paneles a los lados, con el buso visible al centro.
      root.add(capsula(0.38, 0.6, PALETA.chaqueta_negra, { pos: [0, 1.9, -0.06], esc: [1.2, 1, 0.7] }));
      [-0.26, 0.26].forEach((x) => {
        root.add(caja(0.14, 0.95, 0.07, PALETA.chaqueta_negra, { pos: [x, 1.85, 0.3] }));
      });
      root.add(esfera(0.22, PALETA.buso_claro, { pos: [0, 1.52, 0.25], esc: [0.9, 0.3, 0.25] }));
      // Invasor blanco en el pecho.
      const celda = 0.055;
      const x0 = -5.5 * celda;
      const yTop = 2.2;
      FILAS_INVASOR.forEach((fila, fy) => {
        [...fila].forEach((c, fx) => {
          if (c !== '#') return;
          root.add(malla(new THREE.BoxGeometry(celda, celda, 0.04),
            new THREE.MeshToonMaterial({ color: PALETA.invasor, gradientMap: rampa }),
            { pos: [x0 + fx * celda, yTop - fy * celda, 0.3], borde: false }));
        });
      });
    }
    if (e === 2) {
      root.add(caja(0.03, 0.9, 0.03, PALETA.cierre, { pos: [0, 1.9, 0.3], borde: false }));
    }
  } else {
    const puntos = [
      new THREE.Vector2(0.2, 2.3), new THREE.Vector2(0.46, 2.2), new THREE.Vector2(0.5, 2.0),
      new THREE.Vector2(0.46, 1.5), new THREE.Vector2(0.52, 1.0), new THREE.Vector2(0.6, 0.5),
      new THREE.Vector2(0.66, 0.05),
    ];
    const gabán = malla(new THREE.LatheGeometry(puntos, 28),
      mat(PALETA.gabán, { side: THREE.DoubleSide }), { esc: [1, 1, 0.72] });
    if (e === 5) gabán.scale.set(1.05, 1.08, 0.75);
    root.add(gabán);
    root.add(caja(0.03, 1.6, 0.03, PALETA.forro, { pos: [0, 1.4, 0.35], borde: false }));
    if (e === 5) {
      root.add(malla(new THREE.TorusGeometry(0.3, 0.06, 10, 28), mat(PALETA.forro), { pos: [0, 2.26, 0.02], rot: [Math.PI / 2, 0, 0] }));
    }
  }

  // Cuello.
  root.add(malla(new THREE.CylinderGeometry(0.14, 0.15, 0.22, 16), mat(PALETA.piel), { pos: [0, 2.36, 0] }));

  // Brazos: se pivotan en el hombro para animar la escritura.
  // En la etapa 1 la mano derecha sostiene el dispositivo (como en la referencia).
  const colorManga = e === 1 ? PALETA.chaqueta_negra : e === 2 ? PALETA.chaqueta : e === 3 ? PALETA.negro : PALETA.gabán;
  const crearBrazo = (lado) => {
    const g = new THREE.Group();
    g.position.set(lado * 0.48, 2.2, 0);
    g.rotation.z = lado * 0.12;
    g.add(capsula(0.13, 0.6, colorManga, { pos: [0, -0.44, 0] }));
    g.add(esfera(0.12, PALETA.piel, { pos: [0, -0.9, 0.05] }));
    if (e === 1 && lado === 1) {
      g.add(caja(0.12, 0.2, 0.05, PALETA.dispositivo, { pos: [0, -0.98, 0.17], rot: [-0.4, 0, 0] }));
      g.add(caja(0.08, 0.1, 0.01, PALETA.verde, { pos: [0, -0.96, 0.2], rot: [-0.4, 0, 0], borde: false }));
    }
    return g;
  };
  const brazoI = crearBrazo(-1);
  const brazoD = crearBrazo(1);
  root.add(brazoI, brazoD);

  // Cabeza.
  cabezaG.add(esfera(0.42, PALETA.piel, { pos: [0, 2.75, 0], esc: [0.95, 1.08, 0.98] }));
  cabezaG.add(esfera(0.09, PALETA.piel, { pos: [-0.4, 2.75, 0] }));
  cabezaG.add(esfera(0.09, PALETA.piel, { pos: [0.4, 2.75, 0] }));
  cabezaG.add(capsula(0.035, 0.07, PALETA.piel, { pos: [0, 2.7, 0.42], rot: [Math.PI / 2, 0, 0], borde: false }));

  // Cabello: rizado y voluminoso. En las etapas 4 y 5 se suma una capa larga detrás.
  if (e >= 4) {
    cabezaG.add(esfera(0.44, e === 5 ? PALETA.pelo_largo : PALETA.pelo, { pos: [0, 2.6, -0.12], esc: [1, 1.4, 0.8] }));
  }
  const mechones = e <= 2
    ? [[-0.34, 3.02, 0.05, 0.22], [-0.16, 3.22, 0.02, 0.24], [0.04, 3.26, 0.0, 0.25], [0.22, 3.2, 0.04, 0.23],
       [0.37, 3.0, 0.02, 0.2], [-0.4, 2.85, -0.04, 0.19], [0.4, 2.85, -0.04, 0.18], [0.0, 3.08, -0.14, 0.24],
       [-0.22, 2.98, -0.16, 0.2], [0.2, 2.98, -0.16, 0.2], [0.34, 3.12, 0.1, 0.16], [-0.1, 3.36, 0.06, 0.16]]
    : [[-0.28, 3.1, 0.02, 0.24], [0.0, 3.2, 0.0, 0.26], [0.26, 3.1, 0.02, 0.24], [-0.36, 2.9, 0.0, 0.18], [0.36, 2.9, 0.0, 0.18]];
  mechones.forEach(([x, y, z, r], i) => {
    cabezaG.add(mechon(r, i + 1, PALETA.pelo, { pos: [x, y, z], esc: [1, e === 3 ? 0.8 : 1, 1] }));
  });

  // Cejas.
  cabezaG.add(caja(0.14, 0.03, 0.04, PALETA.pelo, { pos: [-0.15, 2.92, 0.4], rot: [0, 0, 0.2], borde: false }));
  cabezaG.add(caja(0.14, 0.03, 0.04, PALETA.pelo, { pos: [0.15, 2.92, 0.4], rot: [0, 0, -0.2], borde: false }));

  // Ojos: cada uno es un grupo que parpadea.
  const ojos = [-0.15, 0.15].map((x) => {
    const g = new THREE.Group();
    g.position.set(x, 2.8, 0.36);
    g.add(esfera(0.06, 0xffffff, { borde: false }));
    const pupila = esfera(0.034, 0x111111, { pos: [0, 0, 0.055], borde: false });
    g.add(pupila);
    cabezaG.add(g);
    return g;
  });

  // Boca: sonrisa pequeña.
  cabezaG.add(malla(new THREE.TorusGeometry(0.07, 0.012, 6, 12, Math.PI), mat(PALETA.contorno),
    { pos: [0, 2.6, 0.4], rot: [0, 0, Math.PI], borde: false }));

  // Gafas de montura oscura y gruesa, como en la referencia. Lentes claras en 1 y 2, tintadas en 3 a 5.
  [-0.15, 0.15].forEach((x) => {
    cabezaG.add(malla(new THREE.TorusGeometry(0.11, 0.022, 8, 24), mat(PALETA.contorno), { pos: [x, 2.8, 0.42], esc: [1, 0.9, 1], borde: false }));
    if (e >= 3) cabezaG.add(esfera(0.1, PALETA.lente, { pos: [x, 2.8, 0.4], esc: [1.2, 0.85, 0.25], borde: false }));
  });
  cabezaG.add(caja(0.1, 0.015, 0.015, PALETA.contorno, { pos: [0, 2.8, 0.43], borde: false }));

  // Audífonos: alrededor del cuello con detalles cian (1) o en la cabeza (2).
  if (e === 1) {
    root.add(malla(new THREE.TorusGeometry(0.38, 0.05, 8, 32, Math.PI), mat(PALETA.audifonos),
      { pos: [0, 2.35, 0], rot: [0, 0, Math.PI] }));
    [-0.38, 0.38].forEach((x) => {
      root.add(esfera(0.1, PALETA.audifonos, { pos: [x, 2.35, 0] }));
      root.add(esfera(0.04, PALETA.cian, { pos: [x, 2.35, 0.09], borde: false }));
    });
  }
  if (e === 2) {
    cabezaG.add(malla(new THREE.TorusGeometry(0.5, 0.04, 8, 32, Math.PI), mat(PALETA.audifonos), { pos: [0, 2.75, 0] }));
    [-0.5, 0.5].forEach((x) => cabezaG.add(esfera(0.13, PALETA.audifonos, { pos: [x, 2.65, 0], esc: [0.6, 1, 1] })));
  }

  // Animación: respiración, parpadeo, manos escribiendo y un leve balanceo de cabeza.
  const update = (t) => {
    root.position.y = Math.sin(t * 2.2) * 0.012;
    cabezaG.rotation.z = Math.sin(t * 0.9) * 0.04;
    const parpadeo = (t % 4.5) > 4.25 ? 0.1 : 1;
    ojos.forEach((o) => { o.scale.y = parpadeo; });
    brazoI.rotation.x = -0.55 + Math.sin(t * 13) * 0.12;
    brazoD.rotation.x = -0.55 + Math.sin(t * 13 + Math.PI) * 0.12;
  };

  return { root, update };
}
