# DarkHat en Unity

Versión de Unity para el personaje y la escena. El visor web (`juego/3d.html`) sigue siendo la referencia de los atuendos.

## Contenido

- `Assets/Models/darkhat.fbx`: personaje exportado desde Blender. Sin esqueleto, con las prendas como mallas separadas por nombre (`Buso_Rojo`, `Chaqueta_Azul`, `Traje_Suit`, `Chaqueta_Punk`, etc.).
- `Assets/Scripts/OutfitStages.cs`: muestra solo las prendas de la etapa elegida (1 a 5).
- `Assets/Scripts/PlayerMovement.cs`: movimiento con WASD o flechas, con cámara que sigue al personaje.

Las prendas vienen del paquete CC0 de Quaternius (ver `juego/assets/LICENSE-quaternius.txt`).

## Pasos en tu PC

1. Instala **Unity Hub** desde https://unity.com/download.
2. Desde Unity Hub, instala **Unity 6 LTS** (o la versión LTS más reciente) con el módulo de Windows.
3. Crea un proyecto nuevo: plantilla **3D (URP)**, nombre `DarkHat`.
4. Copia la carpeta `Assets` de este repositorio dentro de la carpeta `Assets` del proyecto, o copia solo `Models` y `Scripts`.
5. En Unity, abre `Assets/Models/darkhat.fbx` y arrástralo a la escena. En el inspector, pestaña **Rig**, deja **Animation Type: None** (no tiene huesos).
6. Agrega los componentes:
   - Al objeto raíz del personaje, añade **Character Controller** y **Player Movement**. Arrastra la cámara principal al campo `Camera` de Player Movement.
   - Al mismo objeto, añade **Outfit Stages**. En `Etapa` elige de 1 a 5, y las prendas cambian en la vista de escena.
7. Pulsa **Play** y mueve el personaje con WASD. Clic derecho y arrastrar gira la cámara; Q y E también.

## Qué esperar

- La cara y el pelo son los del modelo base. Ahí se nota el estilo de bajo polígono; el suavizado y la textura del rostro se resuelven después.
- Las etapas 4 y 5 usan las chaquetas de los archivos `Suit` y `Punk`.
- El material de todas las prendas es URP Lit, sin el sombreado de cómic. Eso se puede agregar luego con un shader.

## Si algo falla

Pega el error de la consola de Unity y la ruta del archivo que aparece en él. Con eso puedo corregir el script.
