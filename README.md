# Ley 32069 – App de consulta (Android)

App para consultar sin conexión la Ley N.º 32069, Ley General de Contrataciones Públicas, y su Reglamento (D.S. 009-2025-EF), con índice, buscador, favoritos, notas y enlaces entre la Ley y el Reglamento.

App no oficial. El texto oficial es el publicado en el diario El Peruano.

- **Actualizar los textos**: sube el PDF nuevo a `fuentes/` (`ley.pdf` o `reglamento.pdf`) y ejecuta **Actions > 1. Actualizar textos**.
- **Nueva versión para Google Play**: **Actions > 2. Compilar nueva versión Android**.
- Guía completa: [GUIA.md](GUIA.md)

## Estructura
- `www/`: la app (HTML, CSS, JS) y `data.js` con los textos.
- `android/`: proyecto Android (Capacitor 8).
- `ios/`: proyecto iOS (en pausa).
- `fuentes/`: PDF de origen. `datos/`: textos extraídos en JSON.
- `herramientas/`: scripts de extracción y publicación.

## Compilar en local
```
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
```
