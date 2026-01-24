/**
 * Constantes y Configuración
 */
const CONFIG = {
  dataUrl: './news.json',
  calendarIcon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABBUlEQVR4nO2XPQrCQBBGHxZWnkKw9Rxp7Gz1Op7BY3ilWCSglQiWI4EoS5I1cUlgRufBV+SHmXlsSDYwnAw4A1Inr8+NxdT13+RBk7CZlfpvXsVjx9rr2xPZA9eO5W2m2WjsvOi7r5p1RweXkRtNLSL1zC36llLboyWx638jkit7/UqqSNZoNsUHMf+ifrKINsRFrImIsbT4OREriIsoQ1xEGeIiyhAXSWQDHIE1hkVWwda8EjIlMgcOwAl4BHXNiSwieyJzIjNgGeRuVaTJzUU+4yKpuEgPLpKKi/Tgu19tiIsoQ1xEGeIiyhAXUYbE5i0i/9qaU3SJbIFSwXAyMGU9s4NGnvfUCTNinY/tAAAAAElFTkSuQmCC'
};

/**
 * Inicialización
 */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadData();
});

/**
 * Gestión de Pestañas (Tabs)
 */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetId = tab.getAttribute('aria-controls');
      
      // Desactivar todos
      document.querySelectorAll('.tab-btn').forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.classList.remove('active');
      });
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active');
      });

      // Activar seleccionado
      tab.setAttribute('aria-selected', 'true');
      tab.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

/**
 * Carga de Datos
 */
async function loadData() {
  try {
    const response = await fetch(CONFIG.dataUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    processData(data);

  } catch (error) {
    console.error('Error cargando noticias:', error);
    showError('news-grid');
    showError('events-container');
  }
}

function showError(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<p class="error">Lo sentimos, no se pudo cargar la información. Verifique que está ejecutando en un servidor local.</p>';
}

// --- Utilidades de Fecha ---
function startOfDay(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function parseDateDDMMYYYY(dateStr) {
  if (!dateStr) return null;
  // Soporta formatos DD/MM/YYYY o YYYY-MM-DD u otros parseables por Date
  const trimmed = String(dateStr).trim();
  const parts = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const year = parseInt(parts[3], 10);
    const d = new Date(year, month, day);
    return startOfDay(d);
  }

  // Fallback: intentar parseo ISO u otros formatos
  const parsed = new Date(trimmed);
  if (!isNaN(parsed)) return startOfDay(parsed);
  return null;
}

/**
 * Procesamiento de Datos
 */
function processData(data) {
  if (!Array.isArray(data)) return;

  const today = startOfDay(new Date());

  // REGLA 1 (Noticias): filtrar por 'fechacorte' >= fecha actual, ordenar por fecha descendente y limitar a 3
  const newsData = data
    .filter(item => {
      const fc = parseDateDDMMYYYY(item.fechacorte || item.date);
      return fc && fc >= today;
    })
    .sort((a, b) => {
      const da = parseDateDDMMYYYY(a.fechacorte || a.date);
      const db = parseDateDDMMYYYY(b.fechacorte || b.date);
      return db - da;
    })
    .slice(0, 3);

  renderNewsGrid(newsData);

  // REGLA 2 (Eventos): Tipo == 'Eventos' y fechacorte < fecha actual
  const eventsData = data
    .filter(item => item.Tipo === 'Eventos')
    .filter(item => {
      const fc = parseDateDDMMYYYY(item.fechacorte || item.date);
      // Cargar eventos cuyo fechacorte sea menor a la fecha actual (eventos pasados)
      return fc && fc < today;
    })
    .sort((a, b) => {
      const da = parseDateDDMMYYYY(a.fechacorte || a.date);
      const db = parseDateDDMMYYYY(b.fechacorte || b.date);
      return da - db; // ordenar ascendente por fecha de evento
    });

  renderEventsSection(eventsData);
}

/**
 * Renderizado: Noticias (Grid Estático)
 */
function renderNewsGrid(items) {
  const container = document.getElementById('news-grid');
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = 
     `
      <div class="empty-state">
        <p>No hay noticias programados en este momento.</p>
        <img src="./images/ProximosEventos.jpg" 
             alt="Imagen ilustrativa de próximas noticias" 
             onerror="this.style.display='none'"> 
      </div>
    `;
    return;
  }

  if (items.length <= 3) {
    const grid = document.createElement('div');
    grid.className = 'news-grid-centered';
    grid.style.display = 'flex';
    grid.style.justifyContent = 'center';
    grid.style.gap = '1rem';
    grid.style.alignItems = 'stretch';

    const cardWidth = `${(100 / 3).toFixed(6)}%`;
    items.forEach(item => {
      const card = createCard(item);
      card.style.flex = `0 0 ${cardWidth}`;
      card.style.maxWidth = cardWidth;
      grid.appendChild(card);
    });

    container.appendChild(grid);
    return;
  }

  // Si hay más de 3 (aunque por regla no debería), mostrar los primeros 3
  items.slice(0, 3).forEach(item => {
    container.appendChild(createCard(item));
  });
}

/**
 * Renderizado: Eventos (Carrusel o Fallback)
 */
function renderEventsSection(items) {
  const container = document.getElementById('events-container');
  container.innerHTML = '';

  // REGLA: Si no hay eventos, mostrar imagen "ProximosEventos"
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No hay eventos programados en este momento.</p>
        <img src="./images/ProximosEventos.jpg" 
             alt="Imagen ilustrativa de próximos eventos" 
             onerror="this.style.display='none'"> 
      </div>
    `;
    return;
  }

  // REGLA: Si hay eventos, construir el carrusel solo cuando haya más de 3
  // Si hay 3 o menos, mostrar los items centrados conservando la misma dimensión
  if (items.length > 3) {
    buildCarousel(items, container);
  } else {
    const grid = document.createElement('div');
    grid.className = 'events-grid-centered';
    grid.style.display = 'flex';
    grid.style.justifyContent = 'center';
    grid.style.gap = '1rem';
    grid.style.alignItems = 'stretch';

    const cardWidth = `${(100 / 3).toFixed(6)}%`;
    items.forEach(item => {
      const card = createCard(item);
      card.style.flex = `0 0 ${cardWidth}`;
      card.style.maxWidth = cardWidth;
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }
}

/**
 * Construcción del componente Carrusel
 */
function buildCarousel(items, parentContainer) {
  // Estructura DOM del carrusel
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-roledescription', 'carrusel');

  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.setAttribute('tabindex', '0'); // Hacemos focusable para teclado
  container.setAttribute('aria-label', 'Carrusel de eventos. Use flechas izquierda y derecha para navegar.');

  const track = document.createElement('ul');
  track.className = 'carousel-track';
  track.style.display = 'flex';
  track.style.padding = '0';
  track.style.margin = '0';
  track.style.listStyle = 'none';
  track.style.transition = 'transform 300ms ease';

  // Llenar Slides
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'carousel-slide';
    li.style.boxSizing = 'border-box';
    li.style.padding = '0.5rem';
    li.appendChild(createCard(item));
    track.appendChild(li);
  });

  container.appendChild(track);

  // Controles visibles Prev / Next
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-prev';
  prevBtn.setAttribute('aria-label', 'Evento anterior');
  prevBtn.innerHTML = '\u2039';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-next';
  nextBtn.setAttribute('aria-label', 'Siguiente evento');
  nextBtn.innerHTML = '\u203A';

  // Navegación (dots)
  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  nav.setAttribute('role', 'tablist');

  // Añadir elementos al DOM
  wrapper.appendChild(prevBtn);
  wrapper.appendChild(container);
  wrapper.appendChild(nextBtn);
  wrapper.appendChild(nav);
  parentContainer.appendChild(wrapper);

  // --- Lógica de Movimiento del Carrusel ---
  let currentIndex = 0;

  function getItemsPerView() {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
  }

  function updateCarousel() {
    const itemsPerView = getItemsPerView();

    // Ajustar ancho de cada slide según itemsPerView (visualmente muestra N items)
    const visibleCount = Math.min(itemsPerView, items.length);
    const slideWidthPercent = 100 / visibleCount; // ancho relativo en el contenedor

    // Aplicar ancho a cada slide
    const slides = track.querySelectorAll('.carousel-slide');
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${slideWidthPercent}%`;
      slide.style.maxWidth = `${slideWidthPercent}%`;
    });

    // Límite de índice: último desplazamiento que muestra el último ítem
    const maxIndex = Math.max(0, items.length - visibleCount);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    // Desplazamiento en porcentaje relativo al ancho de una "columna" (slideWidthPercent)
    const translate = currentIndex * slideWidthPercent;
    track.style.transform = `translateX(-${translate}%)`;

    // (Re)crear indicadores en función de pages
    nav.innerHTML = '';
    const pages = maxIndex + 1;
    for (let i = 0; i < pages; i++) {
      const btn = document.createElement('button');
      btn.className = `carousel-indicator`;
      btn.setAttribute('aria-label', `Ir al evento ${i + 1}`);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-pressed', i === currentIndex ? 'true' : 'false');
      if (i === currentIndex) btn.classList.add('active');
      btn.onclick = () => moveToSlide(i);
      nav.appendChild(btn);
    }

    // Estado de botones prev/next
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  function moveToSlide(index) {
    const itemsPerView = getItemsPerView();
    const visibleCount = Math.min(itemsPerView, items.length);
    const maxIndex = Math.max(0, items.length - visibleCount);

    // Normalizar índice
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;

    currentIndex = index;
    updateCarousel();
    // Mover foco al contenedor para accesibilidad al navegar por teclado/ratón
    container.focus({ preventScroll: true });
  }

  // Eventos de Teclado (Accesibilidad)
  container.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === 'ArrowLeft' || key === 'Left') {
      e.preventDefault();
      moveToSlide(currentIndex - 1);
    } else if (key === 'ArrowRight' || key === 'Right') {
      e.preventDefault();
      moveToSlide(currentIndex + 1);
    }
  });

  // Soporte adicional: Prev/Next con click/teclado
  prevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
  prevBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      moveToSlide(currentIndex - 1);
    }
  });
  nextBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      moveToSlide(currentIndex + 1);
    }
  });

  // Responsividad
  window.addEventListener('resize', updateCarousel);
  
  // Iniciar
  updateCarousel();
}

/**
 * Utilidad: Crear Tarjeta HTML
 */
function createCard(item) {
  const article = document.createElement('article');
  article.className = 'card';
  
  // Limpieza básica de fecha para datetime attribute
  const dateSource = item.fechacorte || item.date;
  const dateFormatted = cleanDateForISO(dateSource);
  // Mostrar el campo `date` tal como viene en el JSON (informativo)
  const displayDate = item.date || dateSource || '';

  article.innerHTML = `
    <img src="${item.image}" title="${item.titular || ''}" alt="${item.titular || ''}" loading="lazy" />
    <div class="card-content">
      <h3 class="titular">${item.titular}</h3>
      <p class="copy">${item.copy}</p>
      <div class="card-footer">
        <a href="${item.link}" target="_blank" rel="noopener noreferrer">
          ${item.moreread || 'Leer más'} <span class="sr-only">sobre ${item.titular}</span>
        </a>
        <span class="date">
          <img src="${CONFIG.calendarIcon}" alt="Fecha" />
          <time datetime="${dateFormatted}">${displayDate}</time>
        </span>
      </div>
    </div>
  `;
  return article;
}

function cleanDateForISO(dateStr) {
  const d = parseDateDDMMYYYY(dateStr);
  if (!d) return '';
  return d.toISOString().split('T')[0];
}