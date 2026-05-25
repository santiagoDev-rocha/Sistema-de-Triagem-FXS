function inicializarDashboard() {
    const listaPacientes = JSON.parse(localStorage.getItem('pacientes_sxf')) || [];
    const listaMedicos = JSON.parse(localStorage.getItem('medicos_sxf')) || []; 

    const triagensReais = [];
    listaPacientes.forEach(p => {
        if (p.triagens && p.triagens > 0) {
            triagensReais.push({
                paciente: p.nome,
                score: p.score || "0.00",
                data: p.dataTriagem || "",
                status: p.statusTriagem || "Monitorar"
            });
        }
    });

    const totalTriagens = triagensReais.length;
    
    document.getElementById('count-medicos').innerText = listaMedicos.length; 
    document.getElementById('count-pacientes').innerText = listaPacientes.length; 
    document.getElementById('count-triagens').innerText = totalTriagens; 
    
    const encaminhamentos = triagensReais.filter(t => t.status === "Encaminhar").length;
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
        container.innerHTML = triagensReais.map(t => `
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
                    <span><strong>${encaminhamentos}</strong> Encaminhar</span>
                </div>
                <div class="mini-card green-soft">
                    <i data-lucide="check-circle"></i>
                    <span><strong>${totalTriagens - encaminhamentos}</strong> Monitorar</span>
                </div>
            </div>
        `).join('');
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', inicializarDashboard);