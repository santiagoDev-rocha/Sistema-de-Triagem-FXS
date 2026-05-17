// 1. Carrega o array limpo do LocalStorage. Se não houver nada criado, inicia vazio [].
let listaPacientes = JSON.parse(localStorage.getItem('pacientes_sxf')) || [];

// 2. Elementos do DOM capturados para controle
const modal = document.getElementById('modal-paciente');
const form = document.getElementById('form-cadastro');
const containerLista = document.querySelector('.patients-list');
const contadorTexto = document.getElementById('contador-pacientes');

// 3. Função Principal para Desenhar os Pacientes ou Alerta de Vazio
function renderizarPacientes() {
    containerLista.innerHTML = ''; // Limpa antes de reconstruir
    
    // REGRA: Se a lista estiver vazia, não desenha cards. Mostra o aviso.
    if (listaPacientes.length === 0) {
        containerLista.innerHTML = `
            <div class="empty-warning">
                <p>Nenhum paciente cadastrado no sistema.</p>
            </div>
        `;
        contadorTexto.innerText = "0 pacientes cadastrados";
        if (window.lucide) lucide.createIcons();
        return; // Finaliza o fluxo aqui
    }

    // Caso existam cadastros feitos pelo usuário:
    listaPacientes.forEach(paciente => {
        // Separa as iniciais do nome para o Avatar (ex: Pedro Henrique -> PH)
        const iniciais = paciente.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const idade = calcularIdade(paciente.dataNasc);
        const dataFormatada = new Date(paciente.dataNasc).toLocaleDateString('pt-BR');

        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <div class="patient-avatar">${iniciais}</div>
            <div class="patient-info">
                <div class="name-row">
                    <strong>${paciente.nome}</strong>
                    <span class="gender-tag ${paciente.sexo === 'M' ? 'male' : 'female'}">
                        <i data-lucide="${paciente.sexo === 'M' ? 'mars' : 'venus'}"></i> 
                        ${paciente.sexo === 'M' ? 'masculino' : 'feminino'}
                    </span>
                </div>
                <div class="details-row">
                    <span><i data-lucide="calendar"></i> ${idade} anos • ${dataFormatada}</span>
                    <span><i data-lucide="user"></i> Resp: ${paciente.responsavel}</span>
                    <span><i data-lucide="phone"></i> ${paciente.telefone}</span>
                </div>
            </div>
            <div class="patient-stats">
                <strong>${paciente.triagens}</strong>
                <span>triagem</span>
            </div>
            <div class="patient-actions">
                <button class="act-btn"><i data-lucide="clipboard-list"></i></button>
                <button class="act-btn edit"><i data-lucide="edit-3"></i></button>
                <button class="act-btn delete" onclick="excluirPaciente(${paciente.id})"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        containerLista.appendChild(card);
    });

    // Atualiza o contador do cabeçalho
    contadorTexto.innerText = `${listaPacientes.length} paciente${listaPacientes.length !== 1 ? 's' : ''} cadastrado${listaPacientes.length !== 1 ? 's' : ''}`;
    
    // Força a biblioteca Lucide a processar os novos ícones injetados
    if (window.lucide) lucide.createIcons();
}

// 4. Captura do Formulário (Salvar dados reais)
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede a página de recarregar

    // Coleta as strings digitadas nas caixas de input
    const novoPaciente = {
        id: Date.now(), // ID numérico baseado no milissegundo atual
        nome: form.querySelector('input[placeholder="Nome completo"]').value,
        sexo: form.querySelector('input[name="sexo"]:checked').value,
        dataNasc: form.querySelector('input[type="date"]').value,
        responsavel: form.querySelector('input[placeholder="Nome do pai/mãe/responsável"]').value,
        telefone: form.querySelector('input[placeholder="(41) 99999-9999"]').value,
        triagens: 0
    };

    // Alimenta o array e grava no LocalStorage
    listaPacientes.push(novoPaciente);
    localStorage.setItem('pacientes_sxf', JSON.stringify(listaPacientes));

    // Fecha a caixa e limpa as caixas de texto
    modal.style.display = 'none';
    form.reset();
    
    // Atualiza os componentes visuais na tela
    renderizarPacientes();
});

// 5. Cálculos Auxiliares
function calcularIdade(dataNasc) {
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

function excluirPaciente(id) {
    if (confirm('Tem certeza que deseja remover este paciente do sistema?')) {
        listaPacientes = listaPacientes.filter(p => p.id !== id);
        localStorage.setItem('pacientes_sxf', JSON.stringify(listaPacientes));
        renderizarPacientes();
    }
}

// 6. Escuta de Cliques (Abrir/Fechar Modal)
document.getElementById('btn-abrir-modal').addEventListener('click', () => modal.style.display = 'flex');
document.getElementById('btn-fechar').addEventListener('click', () => modal.style.display = 'none');
document.getElementById('btn-cancelar').addEventListener('click', () => modal.style.display = 'none');

// Garante o fechamento caso o usuário clique fora da caixa branca
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Inicialização Automática ao abrir a tela
document.addEventListener('DOMContentLoaded', renderizarPacientes);