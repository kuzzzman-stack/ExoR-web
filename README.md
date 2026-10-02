# ExoR — Plataforma

Landing estática (HTML + CSS + JS puro, sin build ni dependencias).
Tres secciones: **Inicio**, **Portafolio** (tarjetas con logo de fondo
oscurecido) y **Contacto** (WhatsApp + formulario que arma un correo
pre-escrito).

- **Pantalla de carga**: logo con animación de giro mientras se prepara
  la página y el shader (tiene corte de seguridad propio).
- **Shader de fondo**: WebGL, solo en escritorio (≥901px y mouse). En
  móvil o con "reducir movimiento" queda el fondo oscuro.
- **Envío de correo**: en móvil abre la app de correo con todo escrito;
  en escritorio ofrece Gmail, Outlook, Yahoo, Proton (copia el mensaje)
  o la app predeterminada del equipo.

## Ver en local

Abrí `index.html` directo en el navegador, o serví la carpeta:

```bash
python -m http.server 8000
# http://localhost:8000
```

## Editar proyectos

Todo se maneja desde `assets/js/projects.js`. Cada tarjeta es un bloque:

```js
{
  visible: true,                    // false = oculta sin borrar
  name: "Mi Proyecto",
  nameHtml: 'MO<span class="flip">R</span>FI',  // opcional: nombre con HTML
  description: "Descripción breve.",
  url: "https://misitio.com",
  logo: "assets/logos/miapp.png",   // fondo de la tarjeta ("" = monograma)
},
```

Para agregar una tarjeta: **copiá un bloque, pegalo en el array y editalo**.
Los logos van en `assets/logos/`. El logo de ExoR (header y pantalla de
carga) está en `assets/logos/exor-logo.png`.

## Datos de contacto

En `assets/js/config.js`: email, número de WhatsApp (formato `wa.me` con
código de país) y mensaje pre-escrito.

## Deploy en GitHub Pages

1. Subí esta carpeta a un repositorio (el `index.html` en la raíz).
2. En GitHub: **Settings → Pages → Source → Deploy from a branch →
   `main` / `(root)`**.
3. Listo: se publica en `https://<usuario>.github.io/<repo>/`.
   Sin build, sin Actions, sin configuración extra.
