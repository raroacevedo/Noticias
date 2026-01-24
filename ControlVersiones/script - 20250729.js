// Function to toggle the visibility of the tab content
function showTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.querySelectorAll('.tab').forEach(button => button.classList.remove('active'));
  document.getElementById(tabId).classList.remove('hidden');
  event.target.classList.add('active');
}

// Lee noticias
//fetch('/content/NoticiasUPBVIRTUAL/news.json')
fetch('news.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('noticias');
    data.forEach(news => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${news.image}" alt="${news.title}" />
        <div class="card-content">
          <div>
            <p>${news.category}</p>
            <h5>${news.title}</h5>
          </div>
          <div class="card-footer">
            <a href="${news.link}" target="_blank">Continuar leyendo</a>
            <span>${news.date}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  });

//Leer agenda
//fetch('/content/NoticiasUPBVIRTUAL/agenda.json')
fetch('agenda.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('agenda');
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" />
        <div class="card-content">
          <div>
            <p>${item.date}</p>
            <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
          </div>
          <div class="card-footer">
            <span>${item.location}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  });