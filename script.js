// Menu Mobile Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Fechar menu ao clicar em um link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== INICIALIZAR MAPA =====
function initMap() {
    // Coordenadas do Socorro, SP
    const socorroCoords = [-22.6519, -46.3026];
    
    const map = L.map('map').setView(socorroCoords, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);
    
    // Adicionar marcador do local do casamento
    const marker = L.marker(socorroCoords, {
        title: 'Local do Casamento'
    }).addTo(map);
    
    marker.bindPopup(`
        <div style="text-align: center;">
            <h4 style="color: #d4556b; margin: 0 0 0.5rem 0;">Rancho Socorro</h4>
            <p style="margin: 0.5rem 0; font-size: 0.9rem;">05 de Dezembro de 2026</p>
            <p style="margin: 0; font-size: 0.9rem; color: #666;">19:00</p>
        </div>
    `).openPopup();
}

// Inicializar mapa quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
    const weddingDate = new Date('2026-12-05T19:00:00').getTime();
    
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        const dias = Math.floor(distance / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('dias').textContent = dias;
        document.getElementById('horas').textContent = horas;
        document.getElementById('minutos').textContent = minutos;
        document.getElementById('segundos').textContent = segundos;
        
        if (distance < 0) {
            clearInterval(timer);
            document.querySelector('.countdown').innerHTML = '<h3>🎉 O Grande Dia Chegou! 🎉</h3>';
        }
    }, 1000);
}

updateCountdown();

// ===== GERENCIAR RSVPs NO LOCAL STORAGE =====
function salvarRSVP(dados) {
    let rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];
    dados.id = Date.now();
    rsvps.push(dados);
    localStorage.setItem('rsvps', JSON.stringify(rsvps));
}

function carregarRSVPs() {
    return JSON.parse(localStorage.getItem('rsvps')) || [];
}

function exibirRSVPs() {
    const rsvps = carregarRSVPs();
    const rsvpList = document.getElementById('rsvpList');
    const totalConfirmados = document.getElementById('totalConfirmados');
    const totalPessoas = document.getElementById('totalPessoas');
    
    rsvpList.innerHTML = '';
    
    if (rsvps.length === 0) {
        rsvpList.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma confirmação ainda.</p>';
        totalConfirmados.textContent = '0';
        totalPessoas.textContent = '0';
        return;
    }
    
    let totalPessoasCount = 0;
    
    rsvps.forEach(rsvp => {
        totalPessoasCount += parseInt(rsvp.acompanhantes);
        
        const dataFormatada = new Date(rsvp.timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const rsvpItem = document.createElement('div');
        rsvpItem.className = 'rsvp-item';
        rsvpItem.innerHTML = `
            <div class="rsvp-item-header">
                <span class="rsvp-item-name">
                    <i class="fas fa-user-check" style="color: #d4556b;"></i> ${rsvp.nome}
                </span>
                <span class="rsvp-item-date">${dataFormatada}</span>
            </div>
            <div class="rsvp-item-info">
                <span><i class="fas fa-envelope"></i> ${rsvp.email}</span>
                <span><i class="fas fa-phone"></i> ${rsvp.telefone || 'N/A'}</span>
                <span><i class="fas fa-users"></i> ${rsvp.acompanhantes} ${rsvp.acompanhantes == 1 ? 'pessoa' : 'pessoas'}</span>
                ${rsvp.restricoes ? `<span><i class="fas fa-utensils"></i> ${rsvp.restricoes}</span>` : ''}
            </div>
            ${rsvp.mensagem ? `<p style="margin-top: 0.5rem; font-style: italic; color: #666;">💬 "${rsvp.mensagem}"</p>` : ''}
        `;
        rsvpList.appendChild(rsvpItem);
    });
    
    totalConfirmados.textContent = rsvps.length;
    totalPessoas.textContent = totalPessoasCount;
}

// ===== RSVP FORM HANDLER =====
const rsvpForm = document.getElementById('rsvpForm');
const formMessage = document.getElementById('formMessage');

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        acompanhantes: document.getElementById('acompanhantes').value,
        restricoes: document.getElementById('restricoes').value,
        mensagem: document.getElementById('mensagem').value,
        timestamp: new Date().toISOString()
    };
    
    // Salvar no localStorage
    salvarRSVP(formData);
    
    console.log('Dados do RSVP salvos:', formData);
    
    // Mostrar mensagem de sucesso
    formMessage.textContent = '✅ Presença confirmada com sucesso! Obrigado!';
    formMessage.classList.add('success');
    formMessage.classList.remove('error');
    
    // Limpar formulário
    rsvpForm.reset();
    
    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        formMessage.textContent = '';
        formMessage.classList.remove('success');
    }, 5000);
});

// ===== MODAL DE RSVPs =====
const btnVerRsvps = document.getElementById('btnVerRsvps');
const rsvpModal = document.getElementById('rsvpModal');
const closeModal = document.getElementById('closeModal');

btnVerRsvps.addEventListener('click', () => {
    exibirRSVPs();
    rsvpModal.classList.add('show');
});

closeModal.addEventListener('click', () => {
    rsvpModal.classList.remove('show');
});

rsvpModal.addEventListener('click', (e) => {
    if (e.target === rsvpModal) {
        rsvpModal.classList.remove('show');
    }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== EFEITO NAVBAR AO SCROLL =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});
