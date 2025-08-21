// script.js — Tooltips por clic, edge-aware y compatibilidad con enlaces de #actions
(function () {
  'use strict';

  const ROOT  = document;
  const BOARD = document.getElementById('board');
  const SAFE  = 8; // margen interior para evitar que el tooltip toque los bordes del board

  if (!BOARD) return;

  /* =========================
     Utilidades
     ========================= */

  function closeAll() {
    ROOT.querySelectorAll('.hotspot.open').forEach(h => {
      h.classList.remove('open');
      h.setAttribute('aria-expanded', 'false');
    });
    ROOT.querySelectorAll('.tip.open').forEach(t => t.classList.remove('open'));
  }

  function getTipForHotspot(h) {
    if (!h) return null;
    // Preferencia: tip anidado
    let tip = h.querySelector('.tip');
    if (tip) return tip;
    // Respaldo: tip como siguiente hermano
    const next = h.nextElementSibling;
    if (next && next.classList && next.classList.contains('tip')) return next;
    return null;
  }

  function resetTipPosition(h, tip) {
    delete h.dataset.align; // 'left' | 'right'
    delete h.dataset.vpos;  // 'top'  | 'bottom'
    tip.style.marginLeft = '0px';
    tip.style.marginTop  = '0px';
  }

  // Coloca el tooltip evitando desbordes (auto-orientación + clamp)
  function placeTip(h) {
    const tip = getTipForHotspot(h);
    if (!tip) return;

    resetTipPosition(h, tip);

    // Aseguramos visibilidad para medir
    const wasOpen = h.classList.contains('open');
    if (!wasOpen) {
      h.classList.add('open');
      tip.classList.add('open'); // por si el tip no está anidado
    }

    // Force reflow para obtener medidas correctas
    void tip.offsetWidth;

    const boardRect = BOARD.getBoundingClientRect();
    const spotRect  = h.getBoundingClientRect();

    // Intento 1: TOP (ya es el default)
    let tipRect = tip.getBoundingClientRect();

    if (tipRect.top < boardRect.top + SAFE) {
      // No cabe arriba → intentar BOTTOM
      h.dataset.vpos = 'bottom';
      tip.style.marginLeft = '0px';
      tip.style.marginTop  = '0px';
      tipRect = tip.getBoundingClientRect();

      if (tipRect.bottom > boardRect.bottom - SAFE) {
        // Tampoco cabe abajo → elegir izquierda o derecha según espacio disponible
        delete h.dataset.vpos;
        const spaceRight = boardRect.right - spotRect.right;
        const spaceLeft  = spotRect.left  - boardRect.left;
        h.dataset.align = (spaceRight >= spaceLeft) ? 'right' : 'left';
        tip.style.marginTop = '0px';
        tipRect = tip.getBoundingClientRect();

        // Clamp vertical
        let dy = 0;
        if (tipRect.top < boardRect.top + SAFE) {
          dy += (boardRect.top + SAFE - tipRect.top);
        }
        if (tipRect.bottom > boardRect.bottom - SAFE) {
          dy -= (tipRect.bottom - (boardRect.bottom - SAFE));
        }
        tip.style.marginTop = `${dy}px`;
      } else {
        // BOTTOM elegido → clamp horizontal
        let dx = 0;
        if (tipRect.left < boardRect.left + SAFE) {
          dx += (boardRect.left + SAFE - tipRect.left);
        }
        if (tipRect.right > boardRect.right - SAFE) {
          dx -= (tipRect.right - (boardRect.right - SAFE));
        }
        tip.style.marginLeft = `${dx}px`;
      }
    } else {
      // TOP válido → clamp horizontal
      let dx = 0;
      if (tipRect.left < boardRect.left + SAFE) {
        dx += (boardRect.left + SAFE - tipRect.left);
      }
      if (tipRect.right > boardRect.right - SAFE) {
        dx -= (tipRect.right - (boardRect.right - SAFE));
      }
      tip.style.marginLeft = `${dx}px`;
    }

    // Si lo abrimos solo para medir, lo devolvemos a cerrado
    if (!wasOpen) {
      h.classList.remove('open');
      tip.classList.remove('open');
    }
  }

  function openHotspot(h) {
    const tip = getTipForHotspot(h);
    closeAll(); // apertura exclusiva
    h.classList.add('open');
    h.setAttribute('aria-expanded', 'true');
    if (tip) tip.classList.add('open'); // respaldo si el tip no está anidado
    placeTip(h); // posiciona con edge-awareness
  }

  function closeHotspot(h) {
    const tip = getTipForHotspot(h);
    h.classList.remove('open');
    h.setAttribute('aria-expanded', 'false');
    if (tip) tip.classList.remove('open');
  }

  /* =========================
     Listeners globales
     ========================= */

  ROOT.addEventListener('click', (e) => {
    // 1) Si el clic fue en un enlace/botón de #actions, no interferir
    if (e.target.closest('#actions a, #actions button')) {
      return; // deja que el navegador siga el enlace o ejecute el botón
    }

    // 2) Si el clic fue dentro de un tooltip, deja interactuar sin cerrar
    if (e.target.closest('.tip')) {
      e.stopPropagation();
      return;
    }

    // 3) Si el clic fue en un hotspot (o un hijo), togglear
    const hotspot = e.target.closest('.hotspot');
    if (hotspot) {
      e.stopPropagation();
      if (hotspot.classList.contains('open')) {
        closeHotspot(hotspot);
      } else {
        if (!hotspot.hasAttribute('aria-expanded')) {
          hotspot.setAttribute('aria-expanded', 'false');
        }
        openHotspot(hotspot);
      }
      return;
    }

    // 4) Clic fuera → cerrar todo
    closeAll();
  });

  // Cerrar con ESC
  ROOT.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // Reposicionar tooltips abiertos cuando cambia el tamaño
  window.addEventListener('resize', () => {
    ROOT.querySelectorAll('.hotspot.open').forEach(placeTip);
  });

  // Reposicionar cuando la imagen base termina de cargar (por si cambia tamaño)
  const baseImg = document.getElementById('base');
  if (baseImg && !baseImg.complete) {
    baseImg.addEventListener('load', () => {
      ROOT.querySelectorAll('.hotspot.open').forEach(placeTip);
    });
  }

  // Accesibilidad básica para hotspots (estáticos y dinámicos)
  const ensureAccessibility = () => {
    ROOT.querySelectorAll('.hotspot').forEach(h => {
      if (!h.hasAttribute('aria-expanded')) h.setAttribute('aria-expanded', 'false');
      if (h.tagName.toLowerCase() === 'button' && !h.hasAttribute('type')) {
        h.setAttribute('type', 'button'); // evita submit si hay forms
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureAccessibility);
  } else {
    ensureAccessibility();
  }

  // Si data.js inserta hotspots luego, actualiza accesibilidad y re-posiciona si hay abiertos
  const mo = new MutationObserver(() => {
    ensureAccessibility();
    ROOT.querySelectorAll('.hotspot.open').forEach(placeTip);
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // (Opcional) visor de coordenadas con tecla "E"
  const coords = document.getElementById('coords');
  if (coords) {
    let show = false;
    const updateCoords = (ev) => {
      if (!show) return;
      const rect = BOARD.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top)  / rect.height) * 100;
      coords.textContent = `x:${x.toFixed(1)}%  y:${y.toFixed(1)}%`;
    };
    BOARD.addEventListener('mousemove', updateCoords);
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'e') {
        show = !show;
        coords.hidden = !show;
      }
    });
  }
})();

