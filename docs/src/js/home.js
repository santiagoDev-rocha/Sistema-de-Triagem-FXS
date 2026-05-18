function inicializarDashboard() {
    // 1. Puxa a lista real de pacientes criada na tela de cadastro através do LocalStorage
    const listaPacientes = JSON.parse(localStorage.getItem('pacientes_sxf')) || [];

    // 2. Cria um array dinâmico filtrando apenas os pacientes que já realizaram alguma triagem
    // Como o Santiago foi recém-cadastrado, ele começa com 0 triagens, então esse array ficará vazio []
    const triagensReais = [];
    listaPacientes.forEach(p => {
        if (p.triagens && p.triagens > 0) {
            // Se no futuro o paciente tiver dados de triagem salvos, alimentamos aqui
            triagensReais.push({
                paciente: p.nome,
                score: p.score || "0.00",
                data: p.dataTriagem || "",
                status: p.statusTriagem || "Monitorar"
            });
        }
    });

    const totalTriagens = triagensReais.length;
    
    // 3. Atualiza os contadores principais com dados 100% dinâmicos
    document.getElementById('count-medicos').innerText = 0; // Pode ser integrado ao LocalStorage futuramente
    document.getElementById('count-pacientes').innerText = listaPacientes.length; // Aqui vai aparecer "1" por causa do Santiago
    document.getElementById('count-triagens').innerText = totalTriagens; // Vai aparecer "0"
    
    const encaminhamentos = triagensReais.filter(t => t.status === "Encaminhar").length;
    document.getElementById('count-encaminhamentos').innerText = encaminhamentos; // Vai aparecer "0"

    // 4. Controla a renderização da seção de Últimas Avaliações
    const container = document.getElementById('evaluations-container');
    const btnVerTodos = document.getElementById('btn-ver-todos');

    if (!container) return;

    // Se o Santiago não tem triagens, renderiza o Estado Vazio limpando o Pedro Henrique fixo
    if (totalTriagens === 0) {
        if (btnVerTodos) btnVerTodos.style.display = 'none';
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="clipboard-list"></i>
                <p>Nenhuma avaliação realizada</p>
            </div>
        `;
    } else {
        // Se houver alguma triagem real futuramente, renderiza os cards
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

    // Processa os ícones do Lucide criados dinamicamente
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', inicializarDashboard);