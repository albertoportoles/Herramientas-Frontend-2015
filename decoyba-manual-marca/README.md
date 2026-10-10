# Manual de marca (protegido por contraseña)

Proyecto HTML estático con el manual de marca de DECOYBA. Todo el contenido —página, estilos, scripts, imágenes, vídeos y fuentes— está cifrado con AES-256-GCM. Sin la contraseña solo se ve la pantalla de acceso; los archivos de `vault/` tienen nombres aleatorios y no se pueden abrir directamente.

## Estructura

```
decoyba-manual-marca/
├── index.html        # Pantalla de acceso: pide la contraseña, descifra y muestra el manual
├── login/            # Recursos públicos del login (Design System de Numéricco): fuentes, logo y fondos
├── vault/
│   ├── config.json   # Sal y parámetros de derivación de la clave (no secretos)
│   ├── manifest.bin  # Índice cifrado: ruta original → archivo cifrado
│   └── f/*.bin       # Cada archivo del manual, cifrado
├── tools/
│   ├── encrypt.mjs   # src/  → vault/
│   ├── decrypt.mjs   # vault/ → src/
│   └── vault-crypto.mjs
└── src/              # Originales sin cifrar (ignorado por git, nunca se sube)
```

## Ver el manual

Hay que servirlo por `https://` (p. ej. GitHub Pages) o `http://localhost`; el navegador solo permite descifrar en un contexto seguro y no funciona abriendo el archivo con `file://`.

```bash
cd decoyba-manual-marca
python3 -m http.server 8000
# abrir http://localhost:8000
```

Al entrar se descarga y descifra el manual completo (~27 MB). En la misma pestaña, recargar no vuelve a pedir la contraseña; al cerrar la pestaña sí.

## Editar el manual o cambiar la contraseña

Requiere Node.js 18 o superior.

```bash
cd decoyba-manual-marca
MANUAL_PASSWORD="contraseña-actual" node tools/decrypt.mjs   # recupera los originales en src/
# …editar los archivos de src/…
MANUAL_PASSWORD="contraseña-nueva" node tools/encrypt.mjs    # regenera vault/
```

`encrypt.mjs` regenera `vault/` entero con una sal nueva, así que sirve también para cambiar la contraseña. La contraseña no se guarda en el repositorio: compártela por un canal aparte.

## Pantalla de acceso

El login sigue el Design System de Numéricco: fondo papel `#F0EEE9` con textura oficial `bg-light-01` (en modo oscuro, `#121212` con `bg-dark-01`), logotipo positivo/negativo, PP Neue Montreal para texto y controles, Space Mono para metadatos y el sustituto oficial de PP Editorial New (Cormorant Garamond, Google Fonts) para el titular. Botón primario sólido, radio de 5px, hover al 72% de opacidad y foco con contorno de 1px.

Estos recursos de `login/` son públicos por necesidad (se muestran antes de introducir la contraseña) y no contienen nada del manual.

## Licencias

Las fuentes PP Neue Montreal del login proceden del Design System de Numéricco, donde figuran como versión *trial*. Antes de publicar el login, confirma que Numéricco tiene licencia web para PP Neue Montreal o sustituye los `.otf` de `login/fonts/` por los definitivos. Space Mono es libre (SIL Open Font License).


TRT Nerivo y Madellin son fuentes de pago (Envato Elements) licenciadas para DECOYBA y sus partners de producción: no redistribuir los archivos fuera de ese ámbito. Instrument Sans es libre (SIL Open Font License).
