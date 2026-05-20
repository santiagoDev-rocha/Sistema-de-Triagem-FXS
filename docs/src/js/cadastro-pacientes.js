let listaPacientes = JSON.parse(localStorage.getItem('pacientes_sxf')) || [];

const modal = document.getElementById('modal-paciente');
const form = document.getElementById('form-cadastro');
const containerLista = document.querySelector('.patients-list');
const contadorTexto = document.getElementById('contador-pacientes');

function renderizarPacientes() {
    containerLista.innerHTML = ''; 
    
    if (listaPacientes.length === 0) {
        containerLista.innerHTML = `
            <div class="empty-warning">
                <p>Nenhum paciente cadastrado no sistema.</p>
            </div>
        `;
        contadorTexto.innerText = "0 pacientes cadastrados";
        if (window.lucide) lucide.createIcons();
        return; 
    }

    listaPacientes.forEach(paciente => {
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
                    <span><i data-lucide="fingerprint"></i> CPF: ${paciente.cpf || 'Não informado'}</span> <span><i data-lucide="user"></i> Resp: ${paciente.responsavel}</span>
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

    contadorTexto.innerText = `${listaPacientes.length} paciente${listaPacientes.length !== 1 ? 's' : ''} cadastrado${listaPacientes.length !== 1 ? 's' : ''}`;
    
    if (window.lucide) lucide.createIcons();
}

form.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const novoPaciente = {
        id: Date.now(), 
        nome: form.querySelector('input[placeholder="Nome completo"]').value,
        sexo: form.querySelector('input[name="sexo"]:checked').value,
        dataNasc: form.querySelector('input[type="date"]').value,
        cpf: document.getElementById('cpf-paciente').value,
        responsavel: form.querySelector('input[placeholder="Nome do pai/mãe/responsável"]').value,
        telefone: form.querySelector('input[placeholder="(41) 99999-9999"]').value,
        triagens: 0
    };

    listaPacientes.push(novoPaciente);
    localStorage.setItem('pacientes_sxf', JSON.stringify(listaPacientes));

    modal.style.display = 'none';
    form.reset();
    
    renderizarPacientes();
});

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

document.getElementById('btn-abrir-modal').addEventListener('click', () => modal.style.display = 'flex');
document.getElementById('btn-fechar').addEventListener('click', () => modal.style.display = 'none');
document.getElementById('btn-cancelar').addEventListener('click', () => modal.style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', renderizarPacientes);