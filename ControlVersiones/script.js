// Function to toggle the visibility of the tab content
function showTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.querySelectorAll('.tab').forEach(button => button.classList.remove('active'));
  document.getElementById(tabId).classList.remove('hidden');
  event.target.classList.add('active');
}

// Event listeners for tab buttons
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
            <h3>${news.title}</h3>
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