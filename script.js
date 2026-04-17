// ===== CONFIGURAÇÃO DE SENHA =====
const ADMIN_PASSWORD = 'wellington2026';

// ===== URL DO GOOGLE SHEETS =====
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxq2toGXgueaugpJXBjnQVtFLhJo5ezxHeQGsGxYivMb3UCDnhnKRWah2p7K6PN6zIF/exec';

// ===== MENU MOBILE TOGGLE =====
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
    const socorroCoords = [-22.6519, -46.3026];
    
    const map = L.map('map').setView(socorroCoords, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);
    
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

// ===== GERENCIAR RSVPs NO LOCAL STORAGE E GOOGLE SHEETS =====
function salvarRSVP(dados) {
    // Salvar localmente
    let rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];
    dados.id = Date.now();
    rsvps.push(dados);
    localStorage.setItem('rsvps', JSON.stringify(rsvps));
    
    // Enviar para Google Sheets
    if (GOOGLE_SHEETS_URL) {
        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify({
                nome: dados.nome,
                email: dados.email,
                telefone: dados.telefone,
                acompanhantes: dados.acompanhantes,
                restricoes: dados.restricoes,
                mensagem: dados.mensagem
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log('✅ Dados enviados para Google Sheets:', result);
        })
        .catch(error => {
            console.error('❌ Erro ao enviar para Google Sheets:', error);
        });
    }
}

function carregarRSVPs() {
    return JSON.parse(localStorage.getItem('rsvps')) || [];
}

function verificarAdmin() {
    return localStorage.getItem('admin_logado') === 'true';
}

function fazerLoginAdmin(senha) {
    if (senha === ADMIN_PASSWORD) {
        localStorage.setItem('admin_logado', 'true');
        return true;
    }
    return false;
}

function fazerLogoutAdmin() {
    localStorage.removeItem('admin_logado');
}

// ===== ADMIN LOGIN MODAL =====
const btnAdminToggle = document.getElementById('btnAdminToggle');
const adminLoginModal = document.getElementById('adminLoginModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const adminPanel = document.getElementById('adminPanel');
const btnLogout = document.getElementById('btnLogout');

btnAdminToggle.addEventListener('click', () => {
    if (verificarAdmin()) {
        adminPanel.classList.add('show');
        atualizarAdminPanel();
    } else {
        adminLoginModal.classList.add('show');
    }
});

closeAdminModal.addEventListener('click', () => {
    adminLoginModal.classList.remove('show');
});

adminLoginModal.addEventListener('click', (e) => {
    if (e.target === adminLoginModal) {
        adminLoginModal.classList.remove('show');
    }
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const senha = document.getElementById('adminPassword').value;
    
    if (fazerLoginAdmin(senha)) {
        adminLoginMessage.textContent = '✅ Login realizado com sucesso!';
        adminLoginMessage.classList.add('success');
        adminLoginMessage.classList.remove('error');
        
        setTimeout(() => {
            adminLoginModal.classList.remove('show');
            adminPanel.classList.add('show');
            atualizarAdminPanel();
            adminLoginForm.reset();
            adminLoginMessage.textContent = '';
        }, 1000);
    } else {
        adminLoginMessage.textContent = '❌ Senha incorreta!';
        adminLoginMessage.classList.add('error');
        adminLoginMessage.classList.remove('success');
    }
});

btnLogout.addEventListener('click', () => {
    fazerLogoutAdmin();
    adminPanel.classList.remove('show');
    adminLoginForm.reset();
    adminLoginMessage.textContent = '';
});

// ===== ADMIN PANEL - TABS =====
const adminTabBtns = document.querySelectorAll('.admin-tab-btn');

adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        adminTabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// ===== EXIBIR RSVPs NO ADMIN =====
function atualizarAdminPanel() {
    exibirRSVPsAdmin();
    atualizarEstatisticas();
}

function exibirRSVPsAdmin() {
    const rsvps = carregarRSVPs();
    const adminRsvpList = document.getElementById('adminRsvpList');
    
    adminRsvpList.innerHTML = '';
    
    if (rsvps.length === 0) {
        adminRsvpList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 2rem;">Nenhuma confirmação ainda.</p>';
        return;
    }
    
    rsvps.forEach(rsvp => {
        const dataFormatada = new Date(rsvp.timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const card = document.createElement('div');
        card.className = 'admin-rsvp-card';
        card.innerHTML = `
            <div class="admin-rsvp-card-name">
                <i class="fas fa-user-check"></i> ${rsvp.nome}
            </div>
            <div class="admin-rsvp-card-info">
                <span><i class="fas fa-envelope"></i> ${rsvp.email}</span>
                <span><i class="fas fa-phone"></i> ${rsvp.telefone || 'N/A'}</span>
                <span><i class="fas fa-users"></i> ${rsvp.acompanhantes} ${rsvp.acompanhantes == 1 ? 'pessoa' : 'pessoas'}</span>
                ${rsvp.restricoes ? `<span><i class="fas fa-utensils"></i> ${rsvp.restricoes}</span>` : ''}
            </div>
            ${rsvp.mensagem ? `<div class="admin-rsvp-card-message">💬 "${rsvp.mensagem}"</div>` : ''}
            <div class="admin-rsvp-card-date">📅 ${dataFormatada}</div>
        `;
        
        adminRsvpList.appendChild(card);
    });
}

// ===== SEARCH E FILTER =====
const searchInput = document.getElementById('searchInput');
const filterRestrictions = document.getElementById('filterRestrictions');

if (searchInput) searchInput.addEventListener('input', filtrarRSVPs);
if (filterRestrictions) filterRestrictions.addEventListener('change', filtrarRSVPs);

function filtrarRSVPs() {
    const rsvps = carregarRSVPs();
    const adminRsvpList = document.getElementById('adminRsvpList');
    const searchTerm = searchInput.value.toLowerCase();
    const filterTerm = filterRestrictions.value.toLowerCase();
    
    adminRsvpList.innerHTML = '';
    
    const rsvpsFiltrados = rsvps.filter(rsvp => {
        const nomeMatch = rsvp.nome.toLowerCase().includes(searchTerm);
        const emailMatch = rsvp.email.toLowerCase().includes(searchTerm);
        const restricoesMatch = !filterTerm || (rsvp.restricoes && rsvp.restricoes.toLowerCase().includes(filterTerm));
        
        return (nomeMatch || emailMatch) && restricoesMatch;
    });
    
    if (rsvpsFiltrados.length === 0) {
        adminRsvpList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 2rem;">Nenhum resultado encontrado.</p>';
        return;
    }
    
    rsvpsFiltrados.forEach(rsvp => {
        const dataFormatada = new Date(rsvp.timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const card = document.createElement('div');
        card.className = 'admin-rsvp-card';
        card.innerHTML = `
            <div class="admin-rsvp-card-name">
                <i class="fas fa-user-check"></i> ${rsvp.nome}
            </div>
            <div class="admin-rsvp-card-info">
                <span><i class="fas fa-envelope"></i> ${rsvp.email}</span>
                <span><i class="fas fa-phone"></i> ${rsvp.telefone || 'N/A'}</span>
                <span><i class="fas fa-users"></i> ${rsvp.acompanhantes} ${rsvp.acompanhantes == 1 ? 'pessoa' : 'pessoas'}</span>
                ${rsvp.restricoes ? `<span><i class="fas fa-utensils"></i> ${rsvp.restricoes}</span>` : ''}
            </div>
            ${rsvp.mensagem ? `<div class="admin-rsvp-card-message">💬 "${rsvp.mensagem}"</div>` : ''}
            <div class="admin-rsvp-card-date">📅 ${dataFormatada}</div>
        `;
        
        adminRsvpList.appendChild(card);
    });
}

// ===== ESTATÍSTICAS =====
function atualizarEstatisticas() {
    const rsvps = carregarRSVPs();
    
    let totalPessoas = 0;
    let comRestrictions = 0;
    
    rsvps.forEach(rsvp => {
        totalPessoas += parseInt(rsvp.acompanhantes);
        if (rsvp.restricoes && rsvp.restricoes.trim()) {
            comRestrictions++;
        }
    });
    
    const totalConvidados = 100;
    const percentualConfirmacao = totalConvidados > 0 ? Math.round((rsvps.length / totalConvidados) * 100) : 0;
    
    document.getElementById('adminTotalConfirmados').textContent = rsvps.length;
    document.getElementById('adminTotalPessoas').textContent = totalPessoas;
    document.getElementById('adminComRestrictions').textContent = comRestrictions;
    document.getElementById('adminPercentual').textContent = percentualConfirmacao + '%';
}

// ===== EXPORTAR DADOS =====
const btnExportCSV = document.getElementById('btnExportCSV');
const btnExportJSON = document.getElementById('btnExportJSON');
const btnPrint = document.getElementById('btnPrint');
const btnLimparDados = document.getElementById('btnLimparDados');

if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
        const rsvps = carregarRSVPs();
        let csv = 'Nome,Email,Telefone,Acompanhantes,Restrições,Mensagem,Data\n';
        
        rsvps.forEach(rsvp => {
            const dataFormatada = new Date(rsvp.timestamp).toLocaleDateString('pt-BR');
            csv += `"${rsvp.nome}","${rsvp.email}","${rsvp.telefone}","${rsvp.acompanhantes}","${rsvp.restricoes}","${rsvp.mensagem}","${dataFormatada}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rsvp_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
}

if (btnExportJSON) {
    btnExportJSON.addEventListener('click', () => {
        const rsvps = carregarRSVPs();
        const json = JSON.stringify(rsvps, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rsvp_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
}

if (btnPrint) {
    btnPrint.addEventListener('click', () => {
        const rsvps = carregarRSVPs();
        let html = '<h1>Confirmações de Presença</h1>';
        html += `<p>Data de Impressão: ${new Date().toLocaleDateString('pt-BR')}</p>`;
        html += '<table style="width:100%; border-collapse: collapse;">';
        html += '<tr style="background: #f0f0f0;"><th style="border: 1px solid #ddd; padding: 8px;">Nome</th><th style="border: 1px solid #ddd; padding: 8px;">Email</th><th style="border: 1px solid #ddd; padding: 8px;">Acompanhantes</th><th style="border: 1px solid #ddd; padding: 8px;">Restrições</th></tr>';
        
        rsvps.forEach(rsvp => {
            html += `<tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${rsvp.nome}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${rsvp.email}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${rsvp.acompanhantes}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${rsvp.restricoes}</td>
            </tr>`;
        });
        
        html += '</table>';
        
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    });
}

if (btnLimparDados) {
    btnLimparDados.addEventListener('click', () => {
        if (confirm('⚠️ Tem certeza? Esta ação não pode ser desfeita!')) {
            localStorage.removeItem('rsvps');
            document.getElementById('adminRsvpList').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 2rem;">Nenhuma confirmação ainda.</p>';
            atualizarEstatisticas();
            alert('✅ Todos os dados foram limpos.');
        }
    });
}

// ===== RSVP FORM HANDLER =====
const rsvpForm = document.getElementById('rsvpForm');
const formMessage = document.getElementById('formMessage');

if (rsvpForm) {
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
        
        salvarRSVP(formData);
        
        console.log('Dados do RSVP salvos:', formData);
        
        formMessage.textContent = '✅ Presença confirmada com sucesso! Obrigado!';
        formMessage.classList.add('success');
        formMessage.classList.remove('error');
        
        rsvpForm.reset();
        
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.classList.remove('success');
        }, 5000);
    });
}

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
