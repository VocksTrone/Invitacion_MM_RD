/* ══════════════════════════════════════════════════════
   BODA · CELESTE & RONALD · 5 DE DICIEMBRE 2026
   app.js
   ══════════════════════════════════════════════════════ */

/* ── EMAILJS CONFIG ──────────────────────────────────
   Pasos para activar:
   1. Crea cuenta gratis en https://www.emailjs.com
   2. Crea un "Email Service" (Gmail, Outlook, etc.)
   3. Crea un "Email Template" con las variables:
      {{nombre}}, {{asistencia}}, {{itinerario}}
   4. Reemplaza los tres valores de abajo con los tuyos.
   ─────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY = '1x3fgFi3mG6kLdYJd';   // ← reemplaza
const EMAILJS_SERVICE_ID = 'service_6bi7rjs';   // ← reemplaza
const EMAILJS_TEMPLATE_ID = 'template_xw582uh';  // ← reemplaza

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

/* ── NAVEGACIÓN ─────────────────────────────────── */
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');

    const nav = document.getElementById('mainNav');
    nav.style.display = id === 'home' ? 'none' : 'flex';

    document.querySelectorAll('.nav-links button').forEach(b => {
        b.classList.toggle('active', b.dataset.page === id);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── COUNTDOWN ───────────────────────────────────── */
function updateCountdown() {
    const target = new Date('2026-12-05T15:00:00').getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
        document.getElementById('countdown').innerHTML =
            '<p style="font-family:var(--font-script);font-style:italic;font-size:28px;color:var(--rose-deep);">¡Hoy es el gran día! 💕</p>';
        return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-hrs').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-min').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-sec').textContent = String(s).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ── RADIO CARDS ─────────────────────────────────── */
function selectCard(which) {
    document.getElementById('card-yes').classList.toggle('selected', which === 'yes');
    document.getElementById('card-no').classList.toggle('selected', which === 'no');
}

/* ── RSVP SEND ────────────────────────────────────── */
async function sendRSVP() {
    const nombre = document.getElementById('rsvp-name').value.trim();
    const asistencia = document.querySelector('input[name="asistencia"]:checked');
    const itinerario = document.getElementById('rsvp-itinerary').value.trim();
    const btn = document.getElementById('rsvp-btn');

    if (!nombre) { showMsg('Por favor escribe tu nombre 💕', 'error'); return; }
    if (!asistencia) { showMsg('Por favor selecciona si podrás asistir 💕', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'Enviando…';

    const asistenciaTexto = asistencia.value === 'si'
        ? '¡Sí! No me pierdo esta unión 💕'
        : 'No podré asistir, pero los acompaño en pensamiento 😢';

    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            nombre,
            asistencia: asistenciaTexto,
            itinerario: itinerario || '(No indicó itinerario)',
        });
        showMsg('¡Confirmación enviada! Con amor, Celeste & Ronald 💕', 'ok');
        btn.textContent = '✓ Enviado';
    } catch (err) {
        console.error(err);
        showMsg('¡Confirmación recibida! Te esperamos con mucho amor 💕', 'ok');
        btn.textContent = '✓ Enviado';
    }
}

function showMsg(text, type) {
    const msg = document.getElementById('form-msg');
    msg.textContent = text;
    msg.style.color = type === 'ok' ? 'var(--sage)' : 'var(--rose-deep)';
    msg.classList.add('visible');
}

/* ── ADD TO CALENDAR (.ics) ────────────────────────
   Genera un archivo .ics universal compatible con
   iOS Calendar, Google Calendar y Outlook.          */
function addToCalendar() {
    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CelesteRonald//Boda//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:boda-celeste-ronald-20261205@invitacion',
        'DTSTAMP:20261205T150000Z',
        'DTSTART:20261205T150000',
        'DTEND:20261206T010000',
        'SUMMARY:💍 Boda de Celeste & Ronald',
        'DESCRIPTION:Ceremonia a las 3:00pm · Recepción en Villa Yaquelin a las 6:00pm',
        'LOCATION:Parroquia Nuestra Señora de la Consolación\\, San Cristóbal\\, República Dominicana',
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boda-celeste-ronald.ics';
    a.click();
    URL.revokeObjectURL(url);
}

/* ── REPRODUCCIÓN DE MÚSICA & CONTROL DEL SOBRE ──────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const envelope = document.getElementById('envelope');
    const envelopeSeal = document.getElementById('envelope-seal');
    const envelopeCard = document.getElementById('envelope-card');
    const bgMusic = document.getElementById('bg-music');
    const musicControl = document.getElementById('music-control');

    if (!welcomeOverlay || !bgMusic || !musicControl) return;

    const soundOn = musicControl.querySelector('.sound-on');
    const soundOff = musicControl.querySelector('.sound-off');

    let isEnvelopeOpen = false;

    // 1. Clic en el Sello para abrir el sobre
    envelopeSeal.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que se propague al overlay

        // Iniciar música
        playMusicHelper();

        // Abrir sobre
        envelope.classList.add('open');
        isEnvelopeOpen = true;

        // Cambiar la instrucción de ayuda después de que suba la tarjeta (1.3s)
        setTimeout(() => {
            const instr = document.getElementById('envelope-instruction');
            if (instr) {
                instr.textContent = 'Toca la tarjeta para ver los detalles';
            }
        }, 1300);
    });

    // 2. Clic en la tarjeta o en el sobre abierto para revelar la invitación
    const revealInvitation = () => {
        if (!isEnvelopeOpen) return;

        // Iniciar música como fallback si no había comenzado
        playMusicHelper();

        // Asegurar que la invitación (Hero) sea lo primero visible
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Transición y desvanecimiento del overlay de bienvenida
        welcomeOverlay.classList.add('fade-out');

        // Mostrar botón flotante de música
        musicControl.style.display = 'flex';

        // Remover el overlay del DOM tras la animación (500ms)
        setTimeout(() => {
            welcomeOverlay.remove();
            // Scroll al tope nuevamente por si el navegador lo movió
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Efecto de entrada "desplegado" en la página principal
            const heroFrame = document.querySelector('.hero-frame');
            if (heroFrame) {
                heroFrame.style.animation = 'unfoldCard 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            }
        }, 500);
    };

    envelopeCard.addEventListener('click', (e) => {
        e.stopPropagation();
        revealInvitation();
    });

    welcomeOverlay.addEventListener('click', () => {
        if (isEnvelopeOpen) {
            revealInvitation();
        }
    });

    // Función auxiliar para reproducir música de manera segura
    function playMusicHelper() {
        if (bgMusic.paused) {
            bgMusic.play()
                .then(() => {
                    console.log("Música reproduciéndose.");
                    soundOn.style.display = 'block';
                    soundOff.style.display = 'none';
                    musicControl.classList.remove('paused');
                })
                .catch(err => {
                    console.warn("La reproducción automática falló o fue bloqueada:", err);
                });
        }
    }

    // Control de pausa y play
    musicControl.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar otros triggers
        if (bgMusic.paused) {
            bgMusic.play();
            soundOn.style.display = 'block';
            soundOff.style.display = 'none';
            musicControl.classList.remove('paused');
        } else {
            bgMusic.pause();
            soundOn.style.display = 'none';
            soundOff.style.display = 'block';
            musicControl.classList.add('paused');
        }
    });
});