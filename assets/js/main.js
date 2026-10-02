/* ═══════════════════════════════════════════════════════════════
   ExoR — Lógica de la plataforma
   Loader · render de proyectos · navegación · contacto
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Helpers ──────────────────────────────────────────────── */

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function domainOf(url) {
    try {
      return new URL(url).host.replace(/^www\./, "");
    } catch {
      return url;
    }
  }

  function monogram(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  // Móvil/tablet → se usa mailto directo (app de correo del equipo)
  function isMobile() {
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 901
    );
  }

  /* ── Pantalla de carga ──────────────────────────────────────
     Se oculta cuando: cargó la página + fuentes + primer frame
     del shader (máx. 2,6s de espera) y pasó un mínimo de 800ms.
     CSS además la auto-oculta a los 4s por seguridad.         */

  function initLoader() {
    const t0 = performance.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      document.body.classList.add("is-loaded");
      const loader = $("#loader");
      if (loader) {
        loader.addEventListener(
          "transitionend",
          () => loader.remove(),
          { once: true }
        );
        setTimeout(() => loader.remove(), 1200); // respaldo
      }
    };

    const windowLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener("load", r, { once: true }));

    const fontsReady =
      document.fonts && document.fonts.ready
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve();

    const shaderReady = Promise.race([
      window.__shaderReady || Promise.resolve(),
      new Promise((r) => setTimeout(r, 2600)),
    ]);

    Promise.all([windowLoaded, fontsReady, shaderReady]).then(() => {
      const elapsed = performance.now() - t0;
      setTimeout(finish, Math.max(0, 800 - elapsed));
    });

    setTimeout(finish, 4000); // tope absoluto
  }

  /* ── Tarjetas de proyecto ─────────────────────────────────── */

  function cardHTML(p, index) {
    const num = String(index + 1).padStart(2, "0");
    const name = p.nameHtml || escapeHtml(p.name);
    const media = p.logo
      ? `<div class="pcard__media" style="background-image:url('${p.logo}')" role="img" aria-label="Logo de ${escapeHtml(p.name)}"></div>`
      : `<div class="pcard__media pcard__media--mono"><span>${monogram(p.name)}</span></div>`;

    return `
      <a class="pcard" href="${p.url}" target="_blank"
         rel="noopener noreferrer"
         aria-label="Abrir el sitio de ${escapeHtml(p.name)} en una pestaña nueva">
        ${media}
        <div class="pcard__shade"></div>
        <span class="pcard__num">${num}</span>
        <span class="material-symbols-outlined pcard__arrow">arrow_outward</span>
        <div class="pcard__body">
          <h3 class="pcard__name">${name}</h3>
          <p class="pcard__desc">${escapeHtml(p.description)}</p>
          <span class="pcard__link">
            <span class="pcard__domain">${domainOf(p.url)}</span>
            <span class="pcard__go">Visitar sitio
              <span class="material-symbols-outlined">arrow_outward</span>
            </span>
          </span>
        </div>
      </a>`;
  }

  function renderProjects() {
    const visible = PROJECTS.filter((p) => p.visible);
    const grid = $("#projectGrid");
    if (!grid) return;
    grid.innerHTML = visible.length
      ? visible.map((p, i) => cardHTML(p, i)).join("")
      : `<p class="cards__empty">Todavía no hay proyectos publicados.</p>`;
  }

  /* ── Cabecera: fondo al hacer scroll ──────────────────────── */

  function initHeader() {
    const header = $("#siteHeader");
    const onScroll = () =>
      header.classList.toggle("site-header--solid", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── Scrollspy ────────────────────────────────────────────── */

  function initScrollspy() {
    const links = document.querySelectorAll(".site-nav__link");
    const sections = [...links]
      .map((l) => document.getElementById(l.dataset.spy))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((l) =>
            l.classList.toggle(
              "site-nav__link--active",
              l.dataset.spy === e.target.id
            )
          );
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ── Menú móvil ───────────────────────────────────────────── */

  function initMenu() {
    const toggle = $("#navToggle");
    const nav = $("#siteNav");
    const icon = $("#navToggleIcon");

    const setOpen = (open) => {
      nav.classList.toggle("site-nav--open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      icon.textContent = open ? "close" : "menu";
    };

    toggle.addEventListener("click", () =>
      setOpen(!nav.classList.contains("site-nav--open"))
    );
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setOpen(false))
    );
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ── Selector de servicio de correo ─────────────────────────
     Escritorio: panel con Gmail / Outlook / Yahoo / Proton /
     app del dispositivo. Móvil: mailto directo.               */

  const PROVIDERS = [
    { id: "gmail",    label: "Gmail" },
    { id: "outlook",  label: "Outlook" },
    { id: "yahoo",    label: "Yahoo Mail" },
    { id: "proton",   label: "Proton Mail", hint: "copia el mensaje" },
    { id: "default",  label: "Aplicación del dispositivo" },
  ];

  function composeUrl(provider, to, subject, body) {
    const su = encodeURIComponent(subject);
    const bo = encodeURIComponent(body);
    const t = encodeURIComponent(to);
    switch (provider) {
      case "gmail":
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${t}&su=${su}&body=${bo}`;
      case "outlook":
        return `https://outlook.live.com/mail/0/deeplink/compose?to=${t}&subject=${su}&body=${bo}`;
      case "yahoo":
        return `https://compose.mail.yahoo.com/?to=${t}&subject=${su}&body=${bo}`;
      default:
        return null;
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) { /* sin soporte */ }
    ta.remove();
  }

  let pickerEl = null;
  let pickerData = { subject: "", body: "" };

  function buildPicker() {
    pickerEl = document.createElement("div");
    pickerEl.className = "mailpop";
    pickerEl.hidden = true;
    pickerEl.innerHTML = `
      <div class="mailpop__backdrop"></div>
      <div class="mailpop__panel" role="dialog" aria-label="Elegir servicio de correo">
        <p class="mono-label mailpop__title">Enviar correo con</p>
        <div class="mailpop__list">
          ${PROVIDERS.map(
            (p) => `
            <button type="button" class="mailpop__opt" data-p="${p.id}">
              <span class="mailpop__name">${p.label}</span>
              ${p.hint ? `<span class="mailpop__hint">${p.hint}</span>` : ""}
              <span class="material-symbols-outlined">arrow_outward</span>
            </button>`
          ).join("")}
        </div>
        <p class="mailpop__note" hidden></p>
      </div>`;
    document.body.appendChild(pickerEl);

    pickerEl
      .querySelector(".mailpop__backdrop")
      .addEventListener("click", closePicker);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePicker();
    });

    pickerEl.querySelectorAll(".mailpop__opt").forEach((btn) =>
      btn.addEventListener("click", () => chooseProvider(btn.dataset.p))
    );
  }

  function chooseProvider(id) {
    const { subject, body } = pickerData;
    const to = CONTACT.email;

    if (id === "default") {
      closePicker();
      window.location.href =
        `mailto:${to}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;
      return;
    }

    if (id === "proton") {
      // Proton no admite redactar vía URL: copiamos el mensaje
      const plain =
        `Para: ${to}\nAsunto: ${subject}\n\n${body}`;
      copyText(plain);
      const note = pickerEl.querySelector(".mailpop__note");
      note.textContent =
        "Mensaje copiado al portapapeles — pegalo al redactar en Proton.";
      note.hidden = false;
      window.open("https://mail.proton.me", "_blank", "noopener");
      return;
    }

    const url = composeUrl(id, to, subject, body);
    if (url) window.open(url, "_blank", "noopener");
    closePicker();
  }

  function openMailPicker(anchor, subject, body) {
    pickerData = { subject, body };
    const panel = pickerEl.querySelector(".mailpop__panel");
    pickerEl.querySelector(".mailpop__note").hidden = true;
    pickerEl.hidden = false;

    // Posicionar junto al elemento que lo abrió
    const r = anchor.getBoundingClientRect();
    const pw = Math.min(320, window.innerWidth - 32);
    let left = r.left + r.width / 2 - pw / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - pw - 16));
    let top = r.bottom + 12;
    const ph = panel.offsetHeight || 300;
    if (top + ph > window.innerHeight - 12) {
      top = Math.max(12, r.top - ph - 12);
    }
    panel.style.width = pw + "px";
    panel.style.left = left + "px";
    panel.style.top = top + "px";
  }

  function closePicker() {
    if (pickerEl) pickerEl.hidden = true;
  }

  /* ── Contacto ─────────────────────────────────────────────── */

  function initContact() {
    buildPicker();

    const waHref =
      `https://wa.me/${CONTACT.whatsappNumber}` +
      `?text=${encodeURIComponent(CONTACT.whatsappMessage)}`;
    const mailHref = `mailto:${CONTACT.email}`;

    $("#waRow").href = waHref;
    $("#waValue").textContent = CONTACT.whatsappDisplay;
    $("#mailValue").textContent = CONTACT.email;
    $("#footMail").href = mailHref;
    $("#footMail").textContent = CONTACT.email;
    $("#footWa").href = waHref;
    $("#footWa").textContent = "WhatsApp " + CONTACT.whatsappDisplay;

    // Fila "Mail": móvil → mailto directo · escritorio → opciones
    const mailRow = $("#mailRow");
    mailRow.href = mailHref;
    mailRow.addEventListener("click", (e) => {
      if (isMobile()) return; // deja actuar al mailto
      e.preventDefault();
      openMailPicker(mailRow, "Consulta", "");
    });

    const form = $("#contactForm");
    const error = $("#formError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      const marca = form.marca.value.trim();
      const contacto = form.contacto.value.trim();
      const mensaje = form.mensaje.value.trim();

      if (!nombre || !mensaje) {
        error.hidden = false;
        (!nombre ? form.nombre : form.mensaje).focus();
        return;
      }
      error.hidden = true;

      const subject = `Consulta — ${marca || nombre}`;
      const body = [
        `Hola, soy ${nombre}${marca ? `, de ${marca}` : ""}.`,
        "",
        "Lo que necesito:",
        mensaje,
        "",
        "— Datos de contacto —",
        `Nombre: ${nombre}`,
        `Marca / Empresa / Referente: ${marca || "—"}`,
        `Email / Teléfono: ${contacto || "—"}`,
      ].join("\n");

      if (isMobile()) {
        window.location.href =
          mailHref +
          `?subject=${encodeURIComponent(subject)}` +
          `&body=${encodeURIComponent(body)}`;
      } else {
        openMailPicker(form.querySelector("button[type=submit]"), subject, body);
      }
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */

  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    renderProjects();
    initHeader();
    initScrollspy();
    initMenu();
    initContact();
    $("#year").textContent = new Date().getFullYear();
  });
})();
