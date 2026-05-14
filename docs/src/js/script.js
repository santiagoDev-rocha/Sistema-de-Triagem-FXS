const dados = {
    medicos: [], 
    pacientes: [], 
    triagens: [
        { 
            paciente: "Pedro Henrique Santos", 
            score: "0.94", 
            data: "09/04/2024", 
            status: "Encaminhar" 
        }
    ]
};

function inicializarDashboard() {
    const totalTriagens = dados.triagens.length;
    
    document.getElementById('count-medicos').innerText = dados.medicos.length;
    document.getElementById('count-pacientes').innerText = dados.pacientes.length;
    document.getElementById('count-triagens').innerText = totalTriagens;
    
    const encaminhamentos = dados.triagens.filter(t => t.status === "Encaminhar").length;
    document.getElementById('count-encaminhamentos').innerText = encaminhamentos;

    const container = document.getElementById('evaluations-container');
    const btnVerTodos = document.getElementById('btn-ver-todos');

    if (!container) return;

    if (totalTriagens === 0) {
        if (btnVerTodos) btnVerTodos.style.display = 'none';
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="clipboard-list"></i>
                <p>Nenhuma avaliação realizada</p>
            </div>
        `;
    } else {
        if (btnVerTodos) btnVerTodos.style.display = 'flex';
        container.innerHTML = dados.triagens.map(t => `
            <div class="eval-row">
                <div class="avatar-p">${t.paciente.charAt(0)}</div>
                <div class="eval-info">
                    <strong>${t.paciente}</strong>
                    <span>Score: ${t.score} • ${t.data}</span>
                </div>
                <span class="badge-danger">${t.status}</span>
            </div>
            <div class="summary-cards">
                <div class="mini-card red-soft">
                    <i data-lucide="alert-circle"></i>
                    <span><strong>1</strong> Encaminhar</span>
                </div>
                <div class="mini-card green-soft">
                    <i data-lucide="check-circle"></i>
                    <span><strong>0</strong> Monitorar</span>
                </div>
            </div>
        `).join('');
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', inicializarDashboard);