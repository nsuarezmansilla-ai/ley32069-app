# Ley 32069: publicar en Google Play y generar actualizaciones

## Parte 1. Publicar la app en Google Play (una sola vez)
1. **Crea tu cuenta de desarrollador**: https://play.google.com/console/signup. Pago único de 25 USD y verificación de identidad con DNI (tarda unos días).
   Si es una cuenta **personal nueva**, Google exige una prueba cerrada antes de publicar: 12 testers durante 14 días (pueden ser colegas con Android).
2. En Play Console: **Crear app**. Nombre: "Ley 32069 – Contrataciones Públicas", idioma español (Perú), tipo App, gratuita.
3. **Ficha de Play Store**:
   - Ícono: `icono-play-512.png`
   - Gráfico de funciones (1024x500) y 2 a 8 capturas del celular: te los preparo si quieres.
   - Descripción corta: "Ley 32069 y su Reglamento, sin internet, con buscador y notas."
   - Categoría: Libros y obras de consulta.
4. **Contenido de la app**: política de privacidad (la app no recoge datos; te puedo redactar una página), clasificación de contenido (cuestionario: todo "No"), público objetivo (18+), seguridad de datos ("No se recopilan datos").
5. **Aviso legal recomendado**: en la descripción indica que la app **no es oficial** ni está vinculada al MEF ni al OECE, y que el texto oficial está en El Peruano. Google rechaza apps que parecen del Gobierno sin serlo.
6. **Pruebas > Prueba cerrada > Crear versión**: sube `Ley32069-v1.1-googleplay.aab`. Acepta "Firma de apps de Google Play".
7. Cuando termine la prueba (o si tu cuenta no la exige), **Producción > Crear versión** con el mismo AAB y envíala a revisión.

## Parte 2. Cómo generas tú las actualizaciones

### A) Actualizar el texto de la Ley o el Reglamento (sin publicar nueva versión)
La app revisa sola al abrirse si hay textos nuevos y los descarga. Los usuarios no tienen que reinstalar nada.
1. Descarga del SPIJ el PDF actualizado.
2. En tu repositorio de GitHub, entra a la carpeta `fuentes/` > **Add file > Upload files**. Sube el PDF con el nombre exacto `ley.pdf` o `reglamento.pdf` (reemplaza al anterior) y pulsa **Commit changes**.
3. Ve a **Actions > "1. Actualizar textos de la Ley y el Reglamento" > Run workflow**. Escribe la fecha (por ejemplo 15/12/2026) y qué cambió. Pulsa **Run**.
4. En unos 2 minutos queda publicado. Si sale en rojo, el PDF cambió de formato: avísame y lo reviso. No se publica nada si los conteos de artículos no cuadran.

### B) Publicar una nueva versión de la app (cambios de diseño o funciones)
1. **Actions > "2. Compilar nueva versión Android" > Run workflow**, escribe el número de versión (1.2, 1.3, etc.).
2. Al terminar, descarga el archivo de la sección **Artifacts**. Trae el APK y el AAB.
3. En Play Console > Producción > Crear versión, sube el `.aab`.

## Configuración del repositorio (una sola vez, te guío)
- Crea el repositorio público `ley32069-app` en https://github.com/new y avísame: subo el código.
- **Settings > Pages > Source: GitHub Actions**.
- **Settings > Secrets and variables > Actions**, agrega:
  - `ANDROID_KEYSTORE_BASE64`: el contenido de `firma/ley32069-release.jks` en base64 (PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("ley32069-release.jks"))`)
  - `ANDROID_KEYSTORE_PASSWORD`: la contraseña que está en `firma/keystore.properties`
- Guarda la carpeta `firma/` en un lugar seguro (USB o Google Drive). Sin esa llave no podrás actualizar la app en Google Play.
