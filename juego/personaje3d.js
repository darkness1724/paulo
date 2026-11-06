// Personaje 3D de DarkHat. Modelo GLB real (assets/darkhat.glb), basado en el paquete CC0
// "Casual" de Quaternius (ver assets/LICENSE-quaternius.txt). Las prendas de cada etapa son
// capas de malla separadas dentro del mismo archivo; esta función solo muestra u oculta las
// que corresponden a cada etapa. Sombreado tipo cómic con MeshToonMaterial.
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const RUTA_MODELO = './assets/darkhat.glb';
// El modelo mide ~1.87 m; se escala para tener una altura parecida al prototipo anterior (~3.3).
const ESCALA = 1.75;

// Qué capas se ven en cada etapa. Las piernas, pies, cabeza y cuerpo siempre se ven.
// Un nombre que termina en "_" o un prefijo como "Invasor_" coincide con todas las mallas de ese grupo.
const CAPAS_POR_ETAPA = {
  1: ['Buso_Rojo', 'Mangas_Rojas', 'Chaqueta_Negra', 'Mochila', 'Correa', 'Invasor_'],
  2: ['Chaqueta_Azul', 'Chaqueta_Azul_Mangas', 'Mochila', 'Correa'],
  3: ['Negro_Torso', 'Negro_Mangas'],
  4: ['Gaban'],
  5: ['Gaban'],
};
// Todas las prendas del modelo: las que no estén en la lista de la etapa se ocultan.
const PRENDAS = ['Buso_Rojo', 'Mangas_Rojas', 'Chaqueta_Negra', 'Mochila', 'Correa', 'Invasor_',
  'Chaqueta_Azul', 'Chaqueta_Azul_Mangas', 'Negro_Torso', 'Negro_Mangas', 'Gaban'];

// Un solo GLB para todas las instancias: se carga una vez y se reutiliza.
let modeloPromesa = null;
function cargarModelo() {
  if (!modeloPromesa) {
    modeloPromesa = new Promise((resolver, rechazar) => {
      new GLTFLoader().load(RUTA_MODELO, (gltf) => resolver(gltf.scene), undefined, rechazar);
    });
  }
  return modeloPromesa;
}

// Muestra solo las mallas de la etapa indicada.
function coincide(nombre, patron) {
  const base = nombre.replace(/\.\d+$/, ''); // Blender añade .001 a los duplicados
  return base === patron || (patron.endsWith('_') && base.startsWith(patron));
}
function aplicarEtapa(escenaModelo, etapa) {
  const e = Math.min(5, Math.max(1, etapa));
  const visibles = CAPAS_POR_ETAPA[e];
  escenaModelo.traverse((o) => {
    if (!o.isMesh) return;
    const nombre = o.name;
    if (!PRENDAS.some((p) => coincide(nombre, p))) return;
    o.visible = visibles.some((p) => coincide(nombre, p));
  });
}

export function crearPersonaje(etapa = 1) {
  const root = new THREE.Group();
  let modelo = null;

  cargarModelo().then((escena) => {
    modelo = escena;
    modelo.scale.setScalar(ESCALA);
    // Material de cómic una sola vez, conservando el color original de cada malla.
    if (!escena.userData.estilizado) {
      escena.userData.estilizado = true;
      escena.traverse((o) => {
        if (!o.isMesh) return;
        const color = o.material && o.material.color ? o.material.color.clone() : new THREE.Color(0xffffff);
        o.material = new THREE.MeshToonMaterial({ color, gradientMap: rampa() });
        o.castShadow = true;
        o.receiveShadow = true;
      });
    }
    aplicarEtapa(modelo, etapa);
    root.add(modelo);
  }).catch((err) => {
    console.error('No se pudo cargar el modelo DarkHat:', err);
  });

  // Animación: respiración y un leve balanceo, sobre el modelo ya cargado.
  const update = (t) => {
    root.position.y = Math.sin(t * 2.2) * 0.012;
  };

  return { root, update };
}

// Rampa de 3 tonos para el sombreado de cómic.
let _rampa = null;
function rampa() {
  if (!_rampa) {
    const datos = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
    const t = new THREE.DataTexture(datos, 3, 1);
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    _rampa = t;
  }
  return _rampa;
}
