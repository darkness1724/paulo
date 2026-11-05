// Personaje 3D de DarkHat. Modelado con primitivas de Three.js (MIT), sombreado tipo cómic
// (MeshToonMaterial + contorno por casco invertido). Cada etapa cambia la ropa y los accesorios.
import * as THREE from './vendor/three.module.js';

const PALETA = {
  piel: 0xf2c6a0,
  pelo: 0x2b1d14,
  pelo_largo: 0x1f150e,
  contorno: 0x0b0a0a,
  buso: 0x1f2129,
  buso_claro: 0x2a2d36,
  pantalon: 0x2d3e5c,
  zapato: 0xf5f5f5,
  rojo: 0xb83227,
  verde: 0x7cffb2,
  chaqueta: 0x1f3a5f,
  negro: 0x15151b,
  gabán: 0x1c1c22,
  forro: 0x2f2f38,
  naranja: 0xe67e22,
  mochila: 0x2a2d36,
  audifonos: 0x111111,
  lente: 0x050505,
  cierre: 0x9ca3af,
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

// Esfera con vértices desplazados para que se vea como cabello despeinado.
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

  // Piernas y zapatos. Los oculta el gabán en las etapas 4 y 5.
  if (e < 4) {
    [-0.2, 0.2].forEach((x) => {
      root.add(capsula(0.13, 0.85, PALETA.pantalon, { pos: [x, 0.72, 0] }));
      root.add(esfera(0.16, e === 1 ? PALETA.rojo : PALETA.zapato, { pos: [x, 0.14, 0.08], esc: [1, 0.6, 1.5] }));
    });
  }
  root.add(esfera(0.32, PALETA.pantalon, { pos: [0, 1.2, 0], esc: [1.1, 0.7, 0.9] }));

  // Mochila (etapas 1 y 2), detrás del cuerpo.
  if (e <= 2) {
    root.add(esfera(0.42, PALETA.mochila, { pos: [0, 1.95, -0.38], esc: [0.9, 1.1, 0.45] }));
  }

  // Torso: buso (1), chaqueta (2), chaqueta negra (3) o gabán (4 y 5).
  const colorTorso = e === 1 ? PALETA.buso : e === 2 ? PALETA.chaqueta : PALETA.negro;
  if (e <= 3) {
    root.add(capsula(0.36, 0.55, colorTorso, { pos: [0, 1.9, 0], esc: [1.12, 1, 0.78] }));
    if (e === 1) {
      root.add(esfera(0.25, PALETA.buso_claro, { pos: [0, 1.5, 0.25], esc: [0.9, 0.3, 0.25] }));
      // Invasor verde en el pecho.
      const celda = 0.055;
      const x0 = -5.5 * celda;
      const yTop = 2.2;
      FILAS_INVASOR.forEach((fila, fy) => {
        [...fila].forEach((c, fx) => {
          if (c !== '#') return;
          root.add(malla(new THREE.BoxGeometry(celda, celda, 0.04),
            new THREE.MeshToonMaterial({ color: PALETA.verde, emissive: PALETA.verde, emissiveIntensity: 0.5, gradientMap: rampa }),
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
  const colorManga = e === 1 ? PALETA.buso : e === 2 ? PALETA.chaqueta : e === 3 ? PALETA.negro : PALETA.gabán;
  const crearBrazo = (lado) => {
    const g = new THREE.Group();
    g.position.set(lado * 0.48, 2.2, 0);
    g.rotation.z = lado * 0.12;
    g.add(capsula(0.13, 0.6, colorManga, { pos: [0, -0.44, 0] }));
    g.add(esfera(0.12, PALETA.piel, { pos: [0, -0.9, 0.05] }));
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

  // Cabello.
  if (e >= 4) {
    cabezaG.add(esfera(0.44, e === 5 ? PALETA.pelo_largo : PALETA.pelo, { pos: [0, 2.6, -0.12], esc: [1, 1.4, 0.8] }));
  }
  const mechones = e <= 2
    ? [[-0.3, 3.05, 0.05, 0.22], [-0.1, 3.2, 0.0, 0.25], [0.12, 3.18, 0.02, 0.24], [0.3, 3.0, 0.05, 0.2],
       [0.0, 3.05, -0.12, 0.25], [-0.36, 2.85, -0.05, 0.16], [0.36, 2.82, -0.05, 0.16], [0.2, 3.25, 0.1, 0.16]]
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

  // Gafas: transparentes (1 y 2), oscuras (3 a 5).
  if (e <= 2) {
    [-0.15, 0.15].forEach((x) => {
      cabezaG.add(malla(new THREE.TorusGeometry(0.1, 0.014, 8, 24), mat(PALETA.contorno), { pos: [x, 2.8, 0.42], borde: false }));
    });
    cabezaG.add(caja(0.1, 0.015, 0.015, PALETA.contorno, { pos: [0, 2.8, 0.43], borde: false }));
  } else {
    [-0.15, 0.15].forEach((x) => {
      cabezaG.add(esfera(0.1, PALETA.lente, { pos: [x, 2.8, 0.4], esc: [1.2, 0.85, 0.25], borde: false }));
    });
    cabezaG.add(caja(0.1, 0.015, 0.015, PALETA.contorno, { pos: [0, 2.8, 0.42], borde: false }));
  }

  // Audífonos: en el cuello (1) o en la cabeza (2).
  if (e === 1) {
    root.add(malla(new THREE.TorusGeometry(0.38, 0.05, 8, 32, Math.PI), mat(PALETA.audifonos),
      { pos: [0, 2.35, 0], rot: [0, 0, Math.PI] }));
    [-0.38, 0.38].forEach((x) => root.add(esfera(0.1, PALETA.audifonos, { pos: [x, 2.35, 0] })));
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
