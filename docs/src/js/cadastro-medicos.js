var listaMedicos = [];
var filtroAtivo = 'todos';
var currentUid = null;

var modal = document.getElementById('modal-medico');
var form = document.getElementById('form-cadastro-medico');
var containerLista = document.querySelector('.medicos-list');
var contadorTexto = document.getElementById('contador-medicos');
var modalEditar = document.getElementById('modal-editar-medico');
var formEditar = document.getElementById('form-editar-medico');

function filtrarLista() {
    var busca = document.getElementById('busca-medico').value.toLowerCase();
    return listaMedicos.filter(function(m) {
        if (currentUid && m.firebaseUid === currentUid) return false;
        if (filtroAtivo === 'ativos' && m.ativo === false) return false;
        if (filtroAtivo === 'inativos' && m.ativo !== false) return false;
        if (busca && (m.nomeCompleto || '').toLowerCase().indexOf(busca) < 0) return false;
        return true;
    });
}

function renderizarMedicos() {
    var lista = filtrarLista();
    containerLista.innerHTML = '';

    if (lista.length === 0) {
        containerLista.innerHTML =
            '<div class="empty-warning"><p>Nenhum médico encontrado.</p></div>';
        contadorTexto.innerText = '0 médicos cadastrados';
        if (window.lucide) lucide.createIcons();
        return;
    }

    lista.forEach(function(medico) {
        var nome = medico.nomeCompleto || '';
        var iniciais = nome.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var inativo = medico.ativo === false;

        var card = document.createElement('div');
        card.className = 'medico-card' + (inativo ? ' inactive' : '');
        card.innerHTML =
            '<div class="medico-avatar">' + iniciais + '</div>' +
            '<div class="medico-info">' +
                '<div class="name-row">' +
                    '<strong>' + nome + '</strong>' +
                    (inativo ? '<span class="inactive-badge">Inativo</span>' : '') +
                    '<span class="role-tag">' + (medico.role || '') + '</span>' +
                '</div>' +
                '<div class="details-row">' +
                    '<span><i data-lucide="phone"></i> ' + (medico.telefone || '') + '</span>' +
                    '<span><i data-lucide="mail"></i> ' + (medico.email || '') + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="medico-actions">' +
                '<button class="act-btn edit-btn" data-id="' + medico.id + '" title="Editar"><i data-lucide="pencil"></i></button>' +
                (inativo
                    ? '<button class="act-btn reativar-btn" data-id="' + medico.id + '">Reativar</button>'
                    : '<button class="act-btn delete" data-id="' + medico.id + '"><i data-lucide="trash-2"></i></button>') +
            '</div>';
        containerLista.appendChild(card);
    });

    contadorTexto.innerText = listaMedicos.length + ' médico' + (listaMedicos.length !== 1 ? 's' : '') + ' cadastrado' + (listaMedicos.length !== 1 ? 's' : '');

    if (window.lucide) lucide.createIcons();

    containerLista.querySelectorAll('.act-btn.delete').forEach(function(btn) {
        btn.addEventListener('click', function() { desativarMedico(this.getAttribute('data-id')); });
    });
    containerLista.querySelectorAll('.act-btn.reativar-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { reativarMedicoAction(this.getAttribute('data-id')); });
    });
    containerLista.querySelectorAll('.act-btn.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var medico = listaMedicos.find(function(m) { return m.id === id; });
            if (medico) abrirEdicao(medico);
        });
    });
}

async function carregarMedicos() {
    try {
        var res = await api.listarFuncionarios();
        listaMedicos = res.data || [];
        renderizarMedicos();
    } catch (err) {
        console.error('Erro ao carregar médicos:', err);
    }
}

function abrirEdicao(medico) {
    document.getElementById('editar-medico-id').value = medico.id;
    document.getElementById('editar-medico-firebase-uid').value = medico.firebaseUid || '';
    document.getElementById('editar-medico-nome').value = medico.nomeCompleto || '';
    document.getElementById('editar-medico-telefone').value = medico.telefone || '';
    document.getElementById('editar-medico-data-nascimento').value = medico.dataNascimento || '';
    document.getElementById('editar-medico-cpf').value = medico.cpf || '';
    document.getElementById('editar-medico-email').value = medico.email || '';
    document.getElementById('editar-medico-role').value = medico.role || 'MEDICO';

    var isOwn = currentUid && medico.firebaseUid === currentUid;
    document.getElementById('editar-medico-role').disabled = isOwn;
    document.getElementById('role-aviso').style.display = isOwn ? 'block' : 'none';

    modalEditar.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
}

formEditar.addEventListener('submit', async function(e) {
    e.preventDefault();
    var id = document.getElementById('editar-medico-id').value;
    var medicoAtual = listaMedicos.find(function(m) { return m.id === id; });
    var novoRole = document.getElementById('editar-medico-role').value;

    var body = {
        nomeCompleto: document.getElementById('editar-medico-nome').value,
        email: medicoAtual ? medicoAtual.email : '',
        telefone: document.getElementById('editar-medico-telefone').value,
        dataNascimento: document.getElementById('editar-medico-data-nascimento').value || null
    };

    try {
        await api.atualizarFuncionario(id, body);

        // Role change if changed and not own account
        var isOwn = currentUid && (medicoAtual && medicoAtual.firebaseUid === currentUid);
        if (!isOwn && medicoAtual && novoRole !== medicoAtual.role) {
            if (confirm('Alterar role de ' + (medicoAtual.nomeCompleto || 'este médico') + ' para ' + novoRole + '?')) {
                await api.setRole(id, novoRole);
            }
        }

        modalEditar.style.display = 'none';
        formEditar.reset();
        await carregarMedicos();
    } catch (err) {
        alert(err.message || 'Erro ao atualizar médico.');
    }
});

async function desativarMedico(id) {
    if (!confirm('Tem certeza que deseja desativar este profissional?')) return;
    try {
        await api.desativarFuncionario(id);
        await carregarMedicos();
    } catch (err) {
        alert(err.message || 'Erro ao desativar médico.');
    }
}

async function reativarMedicoAction(id) {
    if (!confirm('Reativar este médico?')) return;
    try {
        await api.reativarFuncionario(id);
        await carregarMedicos();
    } catch (err) {
        alert(err.message || 'Erro ao reativar médico.');
    }
}

// Search
document.getElementById('busca-medico').addEventListener('input', function() {
    renderizarMedicos();
});

// Filters
document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        filtroAtivo = this.getAttribute('data-filter') || 'todos';
        renderizarMedicos();
    });
});

// Cadastro form (unchanged)
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    var nome = document.getElementById('nome-medico').value;
    var cpf = document.getElementById('cpf-medico').value.replace(/\D/g, '');
    var email = document.getElementById('email-medico').value;
    var telefone = document.getElementById('telefone-medico').value;
    var dataNascimento = document.getElementById('data-nascimento-medico').value || null;
    var senha = document.getElementById('senha-medico').value;

    try {
        var secondaryApp;
        try {
            secondaryApp = firebase.app('secondary');
        } catch (_) {
            secondaryApp = firebase.initializeApp(firebaseConfig, 'secondary');
        }

        var userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(email, senha);
        var firebaseUid = userCredential.user.uid;
        await secondaryApp.auth().signOut();

        await api.cadastrarFuncionario({
            firebaseUid: firebaseUid,
            nomeCompleto: nome,
            cpf: cpf,
            email: email,
            role: 'MEDICO',
            telefone: telefone,
            dataNascimento: dataNascimento
        });

        modal.style.display = 'none';
        form.reset();
        await carregarMedicos();
    } catch (err) {
        alert(err.message || 'Erro ao cadastrar médico.');
    }
});

// Modal handlers
document.getElementById('btn-abrir-modal').addEventListener('click', function() { modal.style.display = 'flex'; });
document.getElementById('btn-fechar').addEventListener('click', function() { modal.style.display = 'none'; });
document.getElementById('btn-cancelar').addEventListener('click', function() { modal.style.display = 'none'; });
window.addEventListener('click', function(e) { if (e.target === modal) modal.style.display = 'none'; });

document.getElementById('btn-fechar-editar').addEventListener('click', function() { modalEditar.style.display = 'none'; });
document.getElementById('btn-cancelar-editar').addEventListener('click', function() { modalEditar.style.display = 'none'; });
window.addEventListener('click', function(e) { if (e.target === modalEditar) modalEditar.style.display = 'none'; });

// Init
requireAuthWithRole(function(user, role) {
    currentUid = user ? user.uid : null;
    if (role !== 'ADMIN') {
        window.location.href = './home.html';
        return;
    }
    document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = ''; });
    carregarMedicos();
});
