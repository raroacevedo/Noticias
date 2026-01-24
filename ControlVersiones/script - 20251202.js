   document.addEventListener('DOMContentLoaded', loadNews);
    /**
     * Carga las noticias desde un archivo JSON y las muestra en la página.
     **/
    function loadNews() {
      /**const DATA_URL = './news.json';**/
      const DATA_URL = '/content/Componentes/NoticiasUPBVIRTUAL/news.json';

      fetch(DATA_URL, { cache: 'no-cache' })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then(renderNews)
        .catch(handleError);
    }

    function renderNews(data) {
      const container = document.getElementById('news');
      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p>No hay noticias disponibles.</p>';
        return;
      }

      const CAL_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABBUlEQVR4nO2XPQrCQBBGHxZWnkKw9Rxp7Gz1Op7BY3ilWCSglQiWI4EoS5I1cUlgRufBV+SHmXlsSDYwnAw4A1Inr8+NxdT13+RBk7CZlfpvXsVjx9rr2xPZA9eO5W2m2WjsvOi7r5p1RweXkRtNLSL1zC36llLboyWx638jkit7/UqqSNZoNsUHMf+ifrKINsRFrImIsbT4OREriIsoQ1xEGeIiyhAXSWQDHIE1hkVWwda8EjIlMgcOwAl4BHXNiSwieyJzIjNgGeRuVaTJzUU+4yKpuEgPLpKKi/Tgu19tiIsoQ1xEGeIiyhAXUYbE5i0i/9qaU3SJbIFSwXAyMGU9s4NGnvfUCTNinY/tAAAAAElFTkSuQmCC'
      data.forEach((item) => {
        const article = document.createElement('article');
        article.className = 'card';
        article.innerHTML = `
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
          <div class="card-content">
            <p class="category">${item.category}</p>
            <h2 class="title">${item.title}</h2>
            <div class="card-footer">
              <a href="${item.link}" target="_blank" rel="noopener">${item.moreread}</a>
              <span class="date"><img src="${CAL_ICON}" alt="" aria-hidden="true" /><time datetime="${formatDateISO(item.date)}">${item.date}</time></span>
            </div>
          </div>`;
        container.appendChild(article);
      });
    }

    function handleError(error) {
      console.error('Error al cargar noticias:', error);
      document.getElementById('news').innerHTML =
        '<p>Lo sentimos, no fue posible cargar las noticias en este momento.</p>';
    }

    function formatDateISO(dateString) {
      try {
        const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        const [mes, dia, anio] = dateString.replace(',', '').split(' ');
        const monthIndex = months.indexOf(mes.toLowerCase());
        if (monthIndex === -1) throw new Error('Mes inválido');
        return `${anio}-${String(monthIndex + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
      } catch {
        return '';
      }
    }