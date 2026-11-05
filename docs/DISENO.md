# Documento de diseño — Proyecto "HACK" (nombre provisional)

Juego de hackers de puzzles, estilo cómic dinámico, con un protagonista que evoluciona
visualmente a medida que supera retos. Desarrollo 100% con herramientas libres y gratuitas.

## 1. Principios

- **Sin conocimientos previos:** cada mecánica se enseña en el propio juego.
- **Ficticio y educativo:** los retos son puzzles lógicos (cifrados, rutas, deducción), no ataques reales.
- **Accesible:** ratón, teclado y táctil. Español e inglés desde el inicio.
- **Sin dependencias pesadas:** HTML + CSS + JavaScript, SVG para el arte y Web Audio para el sonido.
  Así no hay licencias de assets que vigilar y el proyecto corre en cualquier navegador.

## 2. Protagonista original

Chico/a joven de sudadera y mochila que entra al sistema por curiosidad. Su evolución es parte
de la historia, no solo un cambio de ropa. Cada etapa se gana con un hito narrativo.

| Etapa | Capítulos | Aspecto | Significado |
|---|---|---|---|
| 1. Novato | 1–2 | Sudadera gris, mochila naranja, tenis | Entra sin saber nada |
| 2. Aprendiz | 3–4 | Chaqueta azul marino, audífonos | Gana su primera alianza |
| 3. Iniciado | 5–6 | Chaqueta negra, cuello alto, gafas oscuras | Deja de dudar |
| 4. Operador | 7–8 | Gabán largo negro | Dirige a otros |
| 5. Elegido/a | 9–10 | Gabán completo, cabello largo, gafas | Enfrenta a la máquina |

El personaje se dibuja como capas SVG independientes (fondo, cabello, cuerpo, ropa, accesorios),
así que cambiar de etapa es intercambiar capas.

## 3. Cómic dinámico

- Viñetas con capas separadas que se mueven con parallax.
- Respiración, parpadeo y movimiento de manos (animación CSS/SVG).
- Globos de diálogo con texto que se escribe letra por letra.
- Transiciones de glitch entre viñetas y al subir de etapa.
- Efectos de neón y scanlines para la estética de hacker.

## 4. Estructura del juego

- **Capítulos:** 10 en total. Cada uno introduce una mecánica nueva.
- **Retos:** cada capítulo tiene 3 a 5 puzzles. La dificultad sube por tiempo, pasos y capas.
- **Progresión:** las etapas del personaje, el mapa de la red y las herramientas se desbloquean
  al completar retos.
- **Guardado:** `localStorage` (por navegador). Solo como comodidad, no para datos críticos.

### Mecánicas previstas (se introducen por capítulo)

1. Cifrado César: mover el anillo de letras.
2. Ruta de paquetes: conectar nodos antes de que se agote el tiempo.
3. Mastermind: deducir una clave con pistas.
4. Sigilo: esquivar sensores en una cuadrícula.
5. Rompecabezas de cifrado de dos capas.
6. Descifrado con tiempo límite y presión.
7. Mapa de red: elegir qué nodo atacar primero (estrategia).
8. Combinación de todo lo anterior.
9. Jefe de capítulo con varias fases.
10. Final.

## 5. Fases de desarrollo

- **Fase 0 (prototipo):** personaje etapa 1 animado + una viñeta con diálogo. (en curso)
- **Fase 1 (vertical slice):** capítulo 1 completo con 3 retos y etapas 1–3.
- **Fase 2:** capítulos 2 a 10, uno a la vez, cada uno publicable por separado.

## 6. Stack técnico

| Parte | Herramienta | Licencia |
|---|---|---|
| Motor/lógica | JavaScript vanilla (Phaser más adelante si hace falta) | MIT / libre |
| Arte del personaje | SVG generado por código (`juego/personaje.js`) | Propio |
| Animación | CSS keyframes + SVG | Propio |
| Sonido | Web Audio API (efectos y música procedural) | Estándar del navegador |
| Publicación | GitHub Pages | Gratis |

## 7. Pendientes

- Confirmar el nombre definitivo del juego.
- Ampliar el personaje a las etapas 2–5 (en curso después del prototipo).
- Definir el texto de los capítulos 1–3.
