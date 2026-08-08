/* ==========================================================================
   NÓMADAS PROFESIONALES — XV AÑOS
   JavaScript puro, sin dependencias.
   Responsabilidades:
     1. Revelar elementos al hacer scroll (IntersectionObserver)
     2. Acordeón de Preguntas Frecuentes
     3. Cambiar el estado del header (transparente -> sólido) al scrollear
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  inicializarRevelado();
  inicializarAcordeonFAQ();
  inicializarHeader();
  inicializarVideoCierre();
});

/**
 * 1. Revelado por scroll.
 * Cualquier elemento con [data-reveal] entra con fade + translateY
 * cuando cruza el umbral del viewport. Se observa una sola vez por
 * elemento (unobserve) para no recalcular estilos de más.
 */
function inicializarRevelado() {
  const elementos = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    // Fallback: si el navegador no soporta IntersectionObserver,
    // mostramos todo directamente sin animación.
    elementos.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          observer.unobserve(entrada.target);
        }
      });
    },
    {
      threshold: 0.25,
      rootMargin: '0px 0px -5% 0px',
    }
  );

  elementos.forEach((el) => observer.observe(el));
}

/**
 * 2. Acordeón de FAQ.
 * Un solo ítem abierto a la vez. Usa aria-expanded para accesibilidad
 * y grid-template-rows en CSS para una animación de altura suave.
 */
function inicializarAcordeonFAQ() {
  const preguntas = document.querySelectorAll('.faq__pregunta');

  preguntas.forEach((boton) => {
    boton.addEventListener('click', () => {
      const item = boton.closest('.faq__item');
      const estabaAbierto = item.classList.contains('is-open');

      document.querySelectorAll('.faq__item').forEach((i) => {
        i.classList.remove('is-open');
        i.querySelector('.faq__pregunta').setAttribute('aria-expanded', 'false');
      });

      if (!estabaAbierto) {
        item.classList.add('is-open');
        boton.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * 3. Header dinámico.
 * Mientras el usuario está sobre el Hero (fondo oscuro), el header
 * permanece transparente con el logo en blanco. Al superar esa
 * altura, el header pasa a fondo blanco sólido y logo en negro.
 * Se usa un IntersectionObserver sobre el propio Hero en vez de
 * escuchar el evento "scroll" para evitar cálculos innecesarios.
 */
function inicializarHeader() {
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');

  if (!header || !hero) return;

  if (!('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        header.classList.toggle('is-scrolled', !entrada.isIntersecting);
      });
    },
    {
      threshold: 0,
      rootMargin: '-90% 0px 0px 0px',
    }
  );

  observer.observe(hero);
}

/**
 * 4. Video de cierre.
 * El video se reproduce de fondo, sin sonido y en loop, únicamente
 * mientras el usuario lo tiene en pantalla — así no consume datos ni
 * batería de más cuando todavía no se llegó hasta ahí, y se pausa
 * solo si el usuario vuelve a subir. También respeta la preferencia
 * de movimiento reducido: si está activada, el video no se
 * reproduce automáticamente y se muestra solo el poster.
 */
function inicializarVideoCierre() {
  const seccion = document.querySelector('.video-cierre');
  const video = document.querySelector('.video-cierre__media');

  if (!seccion || !video) return;

  const prefiereMovimientoReducido = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefiereMovimientoReducido || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          // Recién acá se pide cargar el video (preload="none" en el HTML),
          // para no gastar ancho de banda de más si el usuario nunca llega al final.
          if (video.preload === 'none') {
            video.preload = 'auto';
          }
          video.play().catch(() => {
            /* El navegador puede bloquear el autoplay; el poster queda como respaldo visual. */
          });
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(seccion);
}
