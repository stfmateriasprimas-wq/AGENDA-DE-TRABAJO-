# SyncroWork Pro • STF GROUP S.A.

Sistema integral de gestión operativa, programación de trabajo, métricas de eficiencia en tiempo real, biometría Face ID y sincronización con Google Sheets para **STF GROUP**.

---

## 🚀 Despliegue y Publicación Automática

Este repositorio está configurado con **GitHub Actions** para compilar y desplegar automáticamente la aplicación en cada actualización (`git push`).

### 1. Activar GitHub Pages en este Repositorio:
1. En GitHub, ve a la pestaña **Settings** (Configuración) de este repositorio.
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment > Source**, selecciona:
   👉 **`GitHub Actions`**.
4. ¡Listo! En cuanto hagas un push a la rama `main`, la pestaña **Actions** ejecutará el despliegue y te dará la URL pública:
   `https://<tu-usuario>.github.io/<nombre-del-repositorio>/`

---

## 🛠️ Ejecución Local

### Requisitos previos:
- [Node.js](https://nodejs.org/) (versión 18 o superior)

### Pasos:
1. Clonar o descargar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el entorno de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador en [http://localhost:3000](http://localhost:3000).

---

## 📦 Compilación para Producción

```bash
npm run build
```
Los archivos compilados y optimizados se generarán en la carpeta `dist/`.
