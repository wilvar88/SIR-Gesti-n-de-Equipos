/* =======================================================
   data.js — Hotspots + Botones con estilo por botón
   ======================================================= */

/* ===== HOTSPOTS (ejemplo, edítalos si quieres) ===== */
window.HOTSPOTS = [
  {
    x: 45.8, y: 45.2, n: 1,
    title: "Acciones módulo equipos:",
    text: "Se encuentra un campo de búsqueda el cual filtra según los parámetros insertados, se tiene el botón de exportar el cual permite descargar el listado de equipos en diferentes formatos, se tiene el botón para crear un nuevo equipo, un botón de acceso rápido a las agencias y un botón para crear los tipos de equipos."
  },
  {
    x: 79.8, y: 61.5, n: 2,
    title: "Acciones equipo:",
    text: "Estas acciones permiten gestionar un equipo seleccionado, se tiene el botón para ampliar información, podemos editar el equipo y eliminarlo."
  },
];

/* ===== BOTONES (ahora con estilo por botón) =====
   Campos de style (todos opcionales):
   style: {
     bg: "#RRGGBB" | "transparent" | "rgba(...)",  // color de fondo
     bgOpacity: 0..1,                               // opacidad SOLO del fondo (si bg es hex)
     textColor: "#000" | "white",                   // color del texto
     borderColor: "#ccc" | "transparent",           // color del borde
     width: 150, height: 28,                        // número = px, string = usa tal cual
     padding: "0.5rem 1rem",                        // padding
     fontSize: 12, fontWeight: 600,                 // tipografía (número=px)
     radius: 200,                                   // border-radius en px
     shadow: true | false | "0 4px 12px rgba(0,0,0,.15)",  // sombra
     backdropBlur: 14                               // desenfoque (px) para fondos semitransparentes
   }
*/
window.BUTTONS = [
  {
    x: 95, y: 95,
    label: "Manual",
    href: "manuales/MANUAL SIR EQUIPOS.pdf",
    target: "blank",
    // Puedes mantener variant/size si quieres estilos base y luego override con style:
    variant: "ghost",
    // Estilo específico SOLO para este botón
    style: {
      bg: "#ffffff",
      bgOpacity: 0.75,
      textColor: "#0b1220",
      borderColor: "#d9dfea",
      width: 90,
      height: 32,
      fontSize: 12,
      fontWeight: 600,
      radius: 200,
      shadow: "0 12px 36px rgba(0,0,0,.12)",
      backdropBlur: 14
    }
  },
  {
    x: 75.8, y: 45.7, // +Equipos
    label: "+",
    href: "https://wilvar88.github.io/SIR-Crear-Terminal/",
    target: "self",
    // Si quieres totalmente transparente, puedes usar la variante 'transparent'
    // (ojo: pone background transparente con !important)
    variant: "transparent",
    style: {
      // Como usamos la variante 'transparent', NO pongas bg aquí.
      bg: "#ffffff01",
      bgOpacity: 0.1,
      textColor: "#fbfbfb10",
      width: 90,
      height: 24,
      fontSize: 12,
      fontWeight: 600,
      radius: 200,
      shadow: false,           // sin sombra
      borderColor: "transparent"
    }
  },
  {
    x:92.2, y:45.7, // Tipos Equipos
    label: "+",
    href: "https://wilvar88.github.io/SIR-Tipos-Equipos/",
    target: "self",
    // Si quieres totalmente transparente, puedes usar la variante 'transparent'
    // (ojo: pone background transparente con !important)
    variant: "transparent",
    style: {
      // Como usamos la variante 'transparent', NO pongas bg aquí.
      bg: "#ffffff01",
      bgOpacity: 9.1,
      textColor: "#fbfbfb10",
      width: 90,
      height: 28,
      fontSize: 12,
      fontWeight: 600,
      radius: 200,
      shadow: false,           // sin sombra
      borderColor: "transparent"
    }
  },
  {
    x: 82.9, y: 95, // Menu SIR
    label: "Menu SIR",
    href: "https://wilvar88.github.io/SIR-Men-ABT/",
    target: "blank",
    // Si quieres totalmente transparente, puedes usar la variante 'transparent'
    // (ojo: pone background transparente con !important)
    variant: "transparent",
    style: {
      // Como usamos la variante 'transparent', NO pongas bg aquí.
      bg: "#9d9d9dff",
      bgOpacity: 9.1,
      textColor: "#222121ff",
      width: 90,
      height: 28,
      fontSize: 12,
      fontWeight: 600,
      radius: 200,
      shadow: false,           // sin sombra
      borderColor: "transparent"
    }
  },
  
];

/* =======================================================
   RENDER
   ======================================================= */
(function () {
  const hotspotLayer = document.getElementById('hotspots');
  const actionsLayer = document.getElementById('actions');
  const board = document.getElementById('board');

  if (!hotspotLayer || !actionsLayer || !board) {
    console.warn('[data.js] Falta #hotspots, #actions o #board.');
    return;
  }

  // Utilidad para escapar texto simple
  const escapeHTML = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Hex → rgba(r,g,b,alpha)
  function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string') return null;
    let h = hex.replace('#', '').trim();
    if (![3,6].includes(h.length)) return null;
    if (h.length === 3) {
      h = h.split('').map(ch => ch + ch).join('');
    }
    const num = parseInt(h, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
  }

  // Convierte número → "px", deja strings tal cual
  const px = (val) => (typeof val === 'number' ? `${val}px` : val);

  // Aplica estilo por botón (inline)
  function applyButtonStyle(el, style = {}) {
    if (!style || typeof style !== 'object') return;

    // Fondo con opacidad de solo fondo
    if (style.bg) {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(style.bg) && typeof style.bgOpacity === 'number') {
        const rgba = hexToRgba(style.bg, style.bgOpacity);
        if (rgba) el.style.background = rgba;
      } else {
        el.style.background = style.bg; // rgba(), transparent, hsl(), etc.
      }
    } else if (typeof style.bgOpacity === 'number') {
      // Si solo dan opacidad pero no color (poco común), ignora: no hay base a la cual aplicarla
    }

    if (style.textColor)   el.style.color = style.textColor;
    if (style.borderColor) el.style.borderColor = style.borderColor;

    if (style.width)       el.style.width = px(style.width);
    if (style.height)      el.style.height = px(style.height);
    if (style.padding)     el.style.padding = style.padding;

    if (style.fontSize)    el.style.fontSize = px(style.fontSize);
    if (style.fontWeight)  el.style.fontWeight = String(style.fontWeight);

    if (style.radius != null) el.style.borderRadius = px(style.radius);

    if (style.shadow === false) {
      el.style.boxShadow = 'none';
    } else if (typeof style.shadow === 'string') {
      el.style.boxShadow = style.shadow;
    }

    if (typeof style.backdropBlur === 'number') {
      el.style.backdropFilter = `blur(${style.backdropBlur}px)`;
      el.style.webkitBackdropFilter = `blur(${style.backdropBlur}px)`;
    }
  }

  /* ---- Hotspots ---- */
  (window.HOTSPOTS || []).forEach((h, idx) => {
    const btn = document.createElement('button');
    btn.className = 'hotspot';
    btn.style.left = (typeof h.x === 'number' ? `${h.x}%` : h.x);
    btn.style.top  = (typeof h.y === 'number' ? `${h.y}%` : h.y);
    btn.setAttribute('aria-label', (h.title || `Punto ${h.n ?? idx + 1}`));
    btn.setAttribute('type', 'button');

    if (h.align) btn.dataset.align = h.align;
    if (h.vpos)  btn.dataset.vpos  = h.vpos;

    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = (h.n ?? idx + 1);

    const tip = document.createElement('div');
    tip.className = 'tip';

    if (h.title) {
      const h3 = document.createElement('h3');
      h3.innerHTML = escapeHTML(h.title);
      tip.appendChild(h3);
    }
    if (h.text) {
      const p = document.createElement('p');
      p.innerHTML = escapeHTML(h.text);
      tip.appendChild(p);
    }
    if (h.link && h.link.href) {
      const a = document.createElement('a');
      a.className = 'tip-link';
      a.textContent = h.link.label || 'Abrir';
      a.href = h.link.href;
      a.target = (h.link.target === 'self') ? '_self' : '_blank';
      a.rel = a.target === '_blank' ? 'noopener noreferrer' : '';
      tip.appendChild(a);
    }

    btn.appendChild(num);
    btn.appendChild(tip);
    hotspotLayer.appendChild(btn);
  });

  /* ---- Botones flotantes ---- */
  (window.BUTTONS || []).forEach((b) => {
    const a = document.createElement('a');

    // Clases base + opcionales
    a.className = ['action-btn', b.variant || '', b.size || ''].join(' ').trim();

    a.style.left = (typeof b.x === 'number' ? `${b.x}%` : b.x);
    a.style.top  = (typeof b.y === 'number' ? `${b.y}%` : b.y);

    a.textContent = b.label || 'Acción';
    a.href = b.href || '#';
    a.target = (b.target === 'self') ? '_self' : '_blank';
    a.rel = a.target === '_blank' ? 'noopener noreferrer' : '';

    // Aplicar estilo por botón (después de clases para que sobrescriba)
    applyButtonStyle(a, b.style);

    actionsLayer.appendChild(a);
  });

  /* ---- (Opcional) Visor de coordenadas (#coords) ---- */
  const coords = document.getElementById('coords');
  if (coords) {
    let show = false;
    const updateCoords = (ev) => {
      if (!show) return;
      const rect = board.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top)  / rect.height) * 100;
      coords.textContent = `x:${x.toFixed(1)}%  y:${y.toFixed(1)}%`;
    };
    board.addEventListener('mousemove', updateCoords);
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'e') {
        show = !show;
        coords.hidden = !show;
      }
    });
  }
})();
