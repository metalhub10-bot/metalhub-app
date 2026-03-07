# Repositorio Git del app (mobil)

Este proyecto está vinculado a: **https://github.com/metalhub10-bot/metalhub-app.git**

## Importante: usar Git desde esta carpeta

Para evitar errores con otros repositorios (por ejemplo el de tu carpeta de usuario), **ejecuta siempre los comandos de Git desde la carpeta `mobil`**:

```bash
cd /Users/ignaciomartin/Desktop/MetalHub/mobil
git status
git add .
git commit -m "tu mensaje"
git push origin main
```

Si abres la terminal en otra ruta, Git puede usar otro repo y dar errores como *"not recognized as a git repository"*.

## Autenticación con GitHub

- **No guardes el token** en el código ni en archivos del proyecto.
- Para hacer `git push` la primera vez (o si pide usuario/contraseña), puedes:
  1. Usar [Git Credential Manager](https://github.com/git-credential-manager/git-credential-manager) (recomendado), o
  2. Cuando Git pida contraseña, usar un **Personal Access Token** (no tu contraseña de GitHub).
- Crea el token en: GitHub → Settings → Developer settings → Personal access tokens. Si algún token se llegó a exponer, revócalo y genera uno nuevo.
