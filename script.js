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

// Countdown Timer
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

// RSVP Form Handler
const rsvpForm = document.getElementById('rsvpForm');
const formMessage = document.getElementById('formMessage');

rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        acompanhantes: document.getElementById('acompanhantes').value,
        restricoes: document.getElementById('restricoes').value,
        mensagem: document.getElementById('mensagem').value,
        data: new Date().toLocaleDateString('pt-BR')
    };
    
    // Simular envio do formulário (você pode integrar com um backend depois)
    console.log('Dados do RSVP:', formData);
    
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

// Smooth Scroll - compatibilidade adicional
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

// Adicionar efeito de scroll na navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});