let listaMedicos = JSON.parse(localStorage.getItem('medicos_sxf')) || [];

const modal = document.getElementById('modal-medico');
const form = document.getElementById('form-cadastro-medico');
const containerLista = document.querySelector('.medicos-list');
const contadorTexto = document.getElementById('contador-medicos');

function renderizarMedicos() {
    containerLista.innerHTML = '';
    
    if (listaMedicos.length === 0) {
        containerLista.innerHTML = `
            <div class="empty-warning">
                <p>Nenhum médico cadastrado no sistema.</p>
            </div>
        `;
        contadorTexto.innerText = "0 médicos cadastrados";
        if (window.lucide) lucide.createIcons();
        return;
    }

    listaMedicos.forEach(medico => {
        const iniciais = medico.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        const card = document.createElement('div');
        card.className = 'medico-card';
        card.innerHTML = `
            <div class="medico-avatar">${iniciais}</div>
            <div class="medico-info">
                <div class="name-row">
                    <strong>${medico.nome}</strong>
                    <span class="crm-tag">CRM ${medico.crm}</span>
                </div>
                <div class="details-row">
                    <span><i data-lucide="stethoscope"></i> ${medico.especialidade}</span>
                    <span><i data-lucide="phone"></i> ${medico.telefone}</span>
                    <span><i data-lucide="mail"></i> ${medico.email}</span>
                </div>
            </div>
            <div class="medico-actions">
                <button class="act-btn"><i data-lucide="edit-3"></i></button>
                <button class="act-btn delete" onclick="excluirMedico(${medico.id})"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        containerLista.appendChild(card);
    });

    contadorTexto.innerText = `${listaMedicos.length} médico${listaMedicos.length !== 1 ? 's' : ''} cadastrado${listaMedicos.length !== 1 ? 's' : ''}`;
    
    if (window.lucide) lucide.createIcons();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const novoMedico = {
        id: Date.now(),
        nome: document.getElementById('nome-medico').value,
        crm: document.getElementById('crm-medico').value,
        especialidade: document.getElementById('especialidade-medico').value,
        telefone: document.getElementById('telefone-medico').value,
        email: document.getElementById('email-medico').value
    };

    listaMedicos.push(novoMedico);
    localStorage.setItem('medicos_sxf', JSON.stringify(listaMedicos));

    modal.style.display = 'none';
    form.reset();
    
    renderizarMedicos();
});

function excluirMedico(id) {
    if (confirm('Tem certeza que deseja remover este profissional?')) {
        listaMedicos = listaMedicos.filter(m => m.id !== id);
        localStorage.setItem('medicos_sxf', JSON.stringify(listaMedicos));
        renderizarMedicos();
    }
}

document.getElementById('btn-abrir-modal').addEventListener('click', () => modal.style.display = 'flex');
document.getElementById('btn-fechar').addEventListener('click', () => modal.style.display = 'none');
document.getElementById('btn-cancelar').addEventListener('click', () => modal.style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', renderizarMedicos);