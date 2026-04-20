// ===== CONFIGURAÇÃO =====
const ADMIN_PASSWORD = 'wellington2026';
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxhAp4QfoDuFAWBiF0DklTzU4qTCdM70RWJAQQLKQVoLCj34U43JEqIR5-qWd2wSRZN/exec';

// ===== PÉTALAS ANIMADAS NO HERO =====
(function() {
    const canvas = document.getElementById('petalasCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const petalas = Array.from({length: 28}, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight,
        r: 6 + Math.random() * 8,
        speed: 0.6 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.5 + Math.random() * 0.5,
        color: ['#e8a0b4','#f4c2d2','#c97a99','#f9dce5','#d4778e'][Math.floor(Math.random()*5)]
    }));

    function drawHeart(ctx, x, y, r) {
        ctx.beginPath();
        ctx.moveTo(x, y + r * 0.3);
        ctx.bezierCurveTo(x, y - r * 0.3, x - r, y - r * 0.3, x - r, y + r * 0.2);
        ctx.bezierCurveTo(x - r, y + r * 0.7, x, y + r * 1.1, x, y + r * 1.1);
        ctx.bezierCurveTo(x, y + r * 1.1, x + r, y + r * 0.7, x + r, y + r * 0.2);
        ctx.bezierCurveTo(x + r, y - r * 0.3, x, y - r * 0.3, x, y + r * 0.3);
        ctx.closePath();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petalas.forEach(p => {
            p.y += p.speed;
            p.x += p.drift;
            p.rot += p.rotSpeed;
            if (p.y > canvas.height + 20) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            drawHeart(ctx, 0, 0, p.r);
            ctx.fill();
            ctx.restore();
        });
        requestAnimationFrame(animate);
    }
    animate();
})();

// ===== MÚSICA DE FUNDO =====
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnMusica');
    const audio = document.getElementById('audioFundo');
    const icon = document.getElementById('iconMusica');
    if (!btn || !audio) return;

    let tocando = false;
    btn.addEventListener('click', () => {
        if (tocando) {
            audio.pause();
            icon.className = 'fas fa-music';
            btn.classList.remove('tocando');
        } else {
            audio.play().catch(() => {});
            icon.className = 'fas fa-pause';
            btn.classList.add('tocando');
        }
        tocando = !tocando;
    });
});

// ===== MENU MOBILE =====
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('active'));
});

// ===== MAPA =====
function initMap() {
    const coords = [-22.6519, -46.3026];
    const map = L.map('map').setView(coords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19
    }).addTo(map);
    L.marker(coords, { title: 'Local do Casamento' }).addTo(map)
     .bindPopup(`<div style="text-align:center;"><h4 style="color:#d4556b;margin:0 0 .5rem">Rancho Socorro</h4><p style="margin:.5rem 0;font-size:.9rem">05 de Dezembro de 2026</p><p style="margin:0;font-size:.9rem;color:#666">19:00</p></div>`).openPopup();
}
document.addEventListener('DOMContentLoaded', initMap);

// ===== COUNTDOWN =====
function updateCountdown() {
    const weddingDate = new Date('2026-12-05T19:00:00').getTime();
    const timer = setInterval(() => {
        const distance = weddingDate - Date.now();
        if (distance < 0) {
            clearInterval(timer);
            document.querySelector('.countdown').innerHTML = '<h3>🎉 O Grande Dia Chegou! 🎉</h3>';
            return;
        }
        document.getElementById('dias').textContent    = Math.floor(distance / 86400000);
        document.getElementById('horas').textContent   = Math.floor((distance % 86400000) / 3600000);
        document.getElementById('minutos').textContent = Math.floor((distance % 3600000) / 60000);
        document.getElementById('segundos').textContent= Math.floor((distance % 60000) / 1000);
    }, 1000);
}
updateCountdown();

// ===== RSVP - STORAGE =====
function salvarRSVP(dados) {
    // Checar duplicata por email
    let rsvps = carregarRSVPs();
    const duplicata = rsvps.find(r => r.email.toLowerCase() === dados.email.toLowerCase());
    if (duplicata) return 'duplicata';

    dados.id = Date.now();
    rsvps.push(dados);
    localStorage.setItem('rsvps', JSON.stringify(rsvps));

    if (GOOGLE_SHEETS_URL) {
        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: new URLSearchParams({
                nome: dados.nome, email: dados.email, telefone: dados.telefone,
                presenca: dados.presenca, acompanhantes: dados.acompanhantes || 0,
                criancasPequenas: dados.criancasPequenas || 0,
                criancasMaiores: dados.criancasMaiores || 0,
                restricoes: dados.restricoes, mensagem: dados.mensagem
            })
        }).then(r => r.text()).then(r => console.log('✅ Google Sheets:', r))
          .catch(e => console.error('❌', e));
    }
    return 'ok';
}

function carregarRSVPs() {
    return JSON.parse(localStorage.getItem('rsvps')) || [];
}
function verificarAdmin() { return localStorage.getItem('admin_logado') === 'true'; }
function fazerLoginAdmin(s) {
    if (s === ADMIN_PASSWORD) { localStorage.setItem('admin_logado', 'true'); return true; }
    return false;
}
function fazerLogoutAdmin() { localStorage.removeItem('admin_logado'); }

// ===== ADMIN LOGIN =====
const btnAdminToggle  = document.getElementById('btnAdminToggle');
const adminLoginModal = document.getElementById('adminLoginModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const adminLoginForm  = document.getElementById('adminLoginForm');
const adminLoginMessage = document.getElementById('adminLoginMessage');
const adminPanel      = document.getElementById('adminPanel');
const btnLogout       = document.getElementById('btnLogout');

btnAdminToggle.addEventListener('click', () => {
    if (verificarAdmin()) { adminPanel.classList.add('show'); atualizarAdminPanel(); }
    else adminLoginModal.classList.add('show');
});
closeAdminModal.addEventListener('click', () => adminLoginModal.classList.remove('show'));
adminLoginModal.addEventListener('click', e => { if (e.target === adminLoginModal) adminLoginModal.classList.remove('show'); });

adminLoginForm.addEventListener('submit', e => {
    e.preventDefault();
    const senha = document.getElementById('adminPassword').value;
    if (fazerLoginAdmin(senha)) {
        adminLoginMessage.textContent = '✅ Login realizado com sucesso!';
        adminLoginMessage.className = 'admin-message success';
        setTimeout(() => {
            adminLoginModal.classList.remove('show');
            adminPanel.classList.add('show');
            atualizarAdminPanel();
            adminLoginForm.reset();
            adminLoginMessage.textContent = '';
        }, 1000);
    } else {
        adminLoginMessage.textContent = '❌ Senha incorreta!';
        adminLoginMessage.className = 'admin-message error';
    }
});

btnLogout.addEventListener('click', () => {
    fazerLogoutAdmin();
    adminPanel.classList.remove('show');
    adminLoginForm.reset();
    adminLoginMessage.textContent = '';
});

// ===== ADMIN TABS =====
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tab).classList.add('active');
    });
});

// ===== ADMIN PANEL =====
function atualizarAdminPanel() { exibirRSVPsAdmin(); atualizarEstatisticas(); }

function criarCardRSVP(rsvp) {
    const data = new Date(rsvp.timestamp).toLocaleDateString('pt-BR', {
        day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
    });
    const card = document.createElement('div');
    card.className = 'admin-rsvp-card';
    const badgePresenca = rsvp.presenca === 'nao'
        ? '<span class="badge-nao-vai">❌ Não vai comparecer</span>'
        : '<span class="badge-vai">✅ Confirmado</span>';
    card.innerHTML = `
        <div class="admin-rsvp-card-name"><i class="fas fa-user-check"></i> ${rsvp.nome} ${badgePresenca}</div>
        <div class="admin-rsvp-card-info">
            <span><i class="fas fa-envelope"></i> ${rsvp.email}</span>
            <span><i class="fas fa-phone"></i> ${rsvp.telefone || 'N/A'}</span>
            ${rsvp.presenca !== 'nao' ? `<span><i class="fas fa-users"></i> ${rsvp.acompanhantes || 1} ${rsvp.acompanhantes == 1 ? 'pessoa' : 'pessoas'}</span>` : ''}
            ${(rsvp.criancasPequenas > 0) ? `<span>👶 ${rsvp.criancasPequenas} criança(s) 0-6 anos</span>` : ''}
            ${(rsvp.criancasMaiores  > 0) ? `<span>🧒 ${rsvp.criancasMaiores} criança(s) 6-10 anos</span>`  : ''}
            ${rsvp.restricoes ? `<span><i class="fas fa-utensils"></i> ${rsvp.restricoes}</span>` : ''}
        </div>
        ${rsvp.mensagem ? `<div class="admin-rsvp-card-message">💬 "${rsvp.mensagem}"</div>` : ''}
        <div class="admin-rsvp-card-footer">
            <span class="admin-rsvp-card-date">📅 ${data}</span>
            <button class="btn-deletar-rsvp" onclick="deletarRSVP(${rsvp.id})"><i class="fas fa-trash"></i> Remover</button>
        </div>
    `;
    return card;
}

function exibirRSVPsAdmin() {
    const rsvps = carregarRSVPs();
    const list  = document.getElementById('adminRsvpList');
    list.innerHTML = '';
    if (rsvps.length === 0) {
        list.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:2rem;">Nenhuma confirmação ainda.</p>';
        return;
    }
    rsvps.forEach(r => list.appendChild(criarCardRSVP(r)));
}

// ===== DELETAR RSVP INDIVIDUAL =====
window.deletarRSVP = function(id) {
    if (!confirm('Remover esta confirmação?')) return;
    let rsvps = carregarRSVPs().filter(r => r.id !== id);
    localStorage.setItem('rsvps', JSON.stringify(rsvps));
    atualizarAdminPanel();
};

// ===== BUSCA / FILTRO =====
const searchInput = document.getElementById('searchInput');
const filterRestrictions = document.getElementById('filterRestrictions');
if (searchInput) searchInput.addEventListener('input', filtrarRSVPs);
if (filterRestrictions) filterRestrictions.addEventListener('change', filtrarRSVPs);

function filtrarRSVPs() {
    const rsvps = carregarRSVPs();
    const list  = document.getElementById('adminRsvpList');
    const term  = searchInput.value.toLowerCase();
    const filter= filterRestrictions.value.toLowerCase();
    list.innerHTML = '';
    const filtrados = rsvps.filter(r => {
        const nomeMail = r.nome.toLowerCase().includes(term) || r.email.toLowerCase().includes(term);
        const rest = !filter || (r.restricoes && r.restricoes.toLowerCase().includes(filter));
        return nomeMail && rest;
    });
    if (filtrados.length === 0) {
        list.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:2rem;">Nenhum resultado encontrado.</p>';
        return;
    }
    filtrados.forEach(r => list.appendChild(criarCardRSVP(r)));
}

// ===== ESTATÍSTICAS + GRÁFICO ROSCA =====
function atualizarEstatisticas() {
    const rsvps = carregarRSVPs();
    let totalPessoas = 0, comRestrictions = 0, criancasPequenas = 0, criancasMaiores = 0;
    const confirmados = rsvps.filter(r => r.presenca !== 'nao');

    confirmados.forEach(r => {
        totalPessoas += parseInt(r.acompanhantes) || 1;
        if (r.restricoes && r.restricoes.trim()) comRestrictions++;
        criancasPequenas += parseInt(r.criancasPequenas) || 0;
        criancasMaiores  += parseInt(r.criancasMaiores)  || 0;
    });

    const totalConvidados = 100;
    const pct = Math.round((confirmados.length / totalConvidados) * 100);

    document.getElementById('adminTotalConfirmados').textContent = confirmados.length;
    document.getElementById('adminTotalPessoas').textContent     = totalPessoas;
    document.getElementById('adminCriancasPequenas').textContent = criancasPequenas;
    document.getElementById('adminCriancasMaiores').textContent  = criancasMaiores;
    document.getElementById('adminComRestrictions').textContent  = comRestrictions;
    document.getElementById('adminPercentual').textContent       = pct + '%';

    // Gráfico de rosca
    const canvas = document.getElementById('graficaRosca');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const conf = confirmados.length;
    const rest = Math.max(0, totalConvidados - conf);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 70, ri = 45;
    // fundo
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#f0e0e5'; ctx.fill();
    // confirmados
    if (conf > 0) {
        const angle = (conf / totalConvidados) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, -Math.PI / 2, angle); ctx.closePath();
        ctx.fillStyle = '#5a0f14'; ctx.fill();
    }
    // buraco da rosca
    ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    // texto centro
    ctx.fillStyle = '#5a0f14'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(pct + '%', cx, cy + 4);
    ctx.fillStyle = '#999'; ctx.font = '11px sans-serif';
    ctx.fillText('confirmados', cx, cy + 18);

    document.getElementById('graficaLegenda').textContent =
        `${conf} confirmados de ${totalConvidados} esperados`;
}

// ===== EXPORTAR =====
const btnExportCSV  = document.getElementById('btnExportCSV');
const btnExportJSON = document.getElementById('btnExportJSON');
const btnPrint      = document.getElementById('btnPrint');
const btnLimparDados= document.getElementById('btnLimparDados');

if (btnExportCSV) btnExportCSV.addEventListener('click', () => {
    const rsvps = carregarRSVPs();
    let csv = 'Nome,Email,Telefone,Presença,Acompanhantes,Crianças 0-6,Crianças 6-10,Restrições,Mensagem,Data\n';
    rsvps.forEach(r => {
        csv += `"${r.nome}","${r.email}","${r.telefone}","${r.presenca}","${r.acompanhantes}","${r.criancasPequenas||0}","${r.criancasMaiores||0}","${r.restricoes}","${r.mensagem}","${new Date(r.timestamp).toLocaleDateString('pt-BR')}"\n`;
    });
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([csv], {type:'text/csv'})),
        download: `rsvp_${new Date().toISOString().split('T')[0]}.csv`
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
});

if (btnExportJSON) btnExportJSON.addEventListener('click', () => {
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([JSON.stringify(carregarRSVPs(), null, 2)], {type:'application/json'})),
        download: `rsvp_${new Date().toISOString().split('T')[0]}.json`
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
});

if (btnPrint) btnPrint.addEventListener('click', () => {
    const rsvps = carregarRSVPs();
    let html = '<h1>Confirmações de Presença</h1>';
    html += `<p>Data de Impressão: ${new Date().toLocaleDateString('pt-BR')}</p>`;
    html += '<table style="width:100%;border-collapse:collapse;"><tr style="background:#f0f0f0;">';
    html += '<th style="border:1px solid #ddd;padding:8px;">Nome</th><th style="border:1px solid #ddd;padding:8px;">Presença</th><th style="border:1px solid #ddd;padding:8px;">Acompanhantes</th><th style="border:1px solid #ddd;padding:8px;">Crianças</th><th style="border:1px solid #ddd;padding:8px;">Restrições</th></tr>';
    rsvps.forEach(r => {
        html += `<tr><td style="border:1px solid #ddd;padding:8px;">${r.nome}</td><td style="border:1px solid #ddd;padding:8px;">${r.presenca}</td><td style="border:1px solid #ddd;padding:8px;">${r.acompanhantes||1}</td><td style="border:1px solid #ddd;padding:8px;">${(r.criancasPequenas||0)+(r.criancasMaiores||0)}</td><td style="border:1px solid #ddd;padding:8px;">${r.restricoes||'-'}</td></tr>`;
    });
    html += '</table>';
    const w = window.open('','','width=800,height=600');
    w.document.write(html); w.document.close(); w.print();
});

if (btnLimparDados) btnLimparDados.addEventListener('click', () => {
    if (confirm('⚠️ Tem certeza? Esta ação não pode ser desfeita!')) {
        localStorage.removeItem('rsvps');
        document.getElementById('adminRsvpList').innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:2rem;">Nenhuma confirmação ainda.</p>';
        atualizarEstatisticas();
        alert('✅ Todos os dados foram limpos.');
    }
});

// ===== LÓGICA CRIANÇAS (global p/ onclick) =====
window.alterarCrianca = function(tipo, delta) {
    const idD = tipo === 'pequenas' ? 'qtd-pequenas'      : 'qtd-maiores';
    const idH = tipo === 'pequenas' ? 'criancasPequenas'  : 'criancasMaiores';
    const d = document.getElementById(idD), h = document.getElementById(idH);
    if (!d || !h) return;
    const v = Math.max(0, (parseInt(d.textContent) || 0) + delta);
    d.textContent = v; h.value = v;
};

// ===== RSVP FORM =====
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar/esconder campos de presença
    const simRadio  = document.getElementById('presencaSim');
    const naoRadio  = document.getElementById('presencaNao');
    const campos    = document.getElementById('camposPresente');
    const labelVou    = document.getElementById('labelVou');
    const labelNaoVou = document.getElementById('labelNaoVou');

    function toggleCampos() {
        if (simRadio && simRadio.checked) {
            campos.style.display = 'block';
            labelVou.classList.add('selected');
            labelNaoVou.classList.remove('selected');
        } else if (naoRadio && naoRadio.checked) {
            campos.style.display = 'none';
            labelNaoVou.classList.add('selected');
            labelVou.classList.remove('selected');
        }
    }
    if (simRadio) simRadio.addEventListener('change', toggleCampos);
    if (naoRadio) naoRadio.addEventListener('change', toggleCampos);

    // Mostrar crianças ao selecionar acompanhantes
    const acomp = document.getElementById('acompanhantes');
    const criancasSection = document.getElementById('criancasSection');
    if (acomp && criancasSection) {
        acomp.addEventListener('change', () => {
            const v = parseInt(acomp.value);
            criancasSection.style.display = v >= 2 ? 'block' : 'none';
            if (v < 2) {
                document.getElementById('qtd-pequenas').textContent = '0';
                document.getElementById('qtd-maiores').textContent  = '0';
                document.getElementById('criancasPequenas').value   = '0';
                document.getElementById('criancasMaiores').value    = '0';
            }
        });
    }

    // Submit form
    const rsvpForm   = document.getElementById('rsvpForm');
    const formMessage = document.getElementById('formMessage');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', e => {
            e.preventDefault();

            const presenca = document.querySelector('input[name="presenca"]:checked');
            if (!presenca) {
                formMessage.textContent = '⚠️ Por favor, indique se vai comparecer.';
                formMessage.className = 'form-message error';
                return;
            }

            const dados = {
                nome:     document.getElementById('nome').value,
                email:    document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                presenca: presenca.value,
                acompanhantes:   presenca.value === 'sim' ? (document.getElementById('acompanhantes').value || '1') : '0',
                criancasPequenas: parseInt(document.getElementById('criancasPequenas')?.value) || 0,
                criancasMaiores:  parseInt(document.getElementById('criancasMaiores')?.value)  || 0,
                restricoes: document.getElementById('restricoes')?.value || '',
                mensagem:  document.getElementById('mensagem').value,
                timestamp: new Date().toISOString()
            };

            const resultado = salvarRSVP(dados);

            if (resultado === 'duplicata') {
                formMessage.textContent = '⚠️ Este e-mail já confirmou presença anteriormente!';
                formMessage.className = 'form-message error';
                return;
            }

            if (presenca.value === 'sim') {
                dispararConfete();
                formMessage.textContent = '🎉 Presença confirmada com sucesso! Mal podemos esperar para te ver!';
            } else {
                formMessage.textContent = '💌 Recebemos sua resposta. Sentiremos sua falta!';
            }
            formMessage.className = 'form-message success';
            rsvpForm.reset();
            if (campos) campos.style.display = 'none';
            if (criancasSection) criancasSection.style.display = 'none';
            if (labelVou) labelVou.classList.remove('selected');
            if (labelNaoVou) labelNaoVou.classList.remove('selected');

            setTimeout(() => { formMessage.textContent = ''; formMessage.className = 'form-message'; }, 6000);
        });
    }

    // ===== FAQ ACCORDION =====
    document.querySelectorAll('.faq-pergunta').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const aberto = item.classList.contains('ativo');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('ativo'));
            if (!aberto) item.classList.add('ativo');
        });
    });
});

// ===== CONFETE =====
function dispararConfete() {
    const canvas = document.getElementById('confeteCanvas');
    if (!canvas) return;
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const cores = ['#5a0f14','#e8a0b4','#f4c2d2','#ffd700','#c97a99','#fff'];
    const particulas = Array.from({length: 120}, () => ({
        x: Math.random() * canvas.width,
        y: -10,
        r: 5 + Math.random() * 6,
        d: 1.5 + Math.random() * 3,
        cor: cores[Math.floor(Math.random() * cores.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngle: 0,
        tiltSpeed: 0.1 + Math.random() * 0.1,
        form: Math.random() > 0.5 ? 'rect' : 'circle'
    }));

    let frame = 0;
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particulas.forEach(p => {
            p.y += p.d;
            p.tiltAngle += p.tiltSpeed;
            p.tilt = Math.sin(p.tiltAngle) * 12;
            ctx.fillStyle = p.cor;
            ctx.beginPath();
            if (p.form === 'circle') {
                ctx.arc(p.x + p.tilt, p.y, p.r, 0, Math.PI * 2);
            } else {
                ctx.rect(p.x + p.tilt, p.y, p.r, p.r * 0.6);
            }
            ctx.fill();
        });
        frame++;
        if (frame < 180) requestAnimationFrame(loop);
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }
    loop();
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
    const nb = document.querySelector('.navbar');
    nb.style.boxShadow = window.scrollY > 50 ? '0 4px 15px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.1)';
});
