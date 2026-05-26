var listaPacientes = [];

var modal = document.getElementById('modal-paciente');
var form = document.getElementById('form-cadastro');
var containerLista = document.querySelector('.patients-list');
var contadorTexto = document.getElementById('contador-pacientes');

function calcularIdade(dataNasc) {
    var hoje = new Date();
    var nascimento = new Date(dataNasc);
    var idade = hoje.getFullYear() - nascimento.getFullYear();
    var m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

function renderizarPacientes(role) {
    containerLista.innerHTML = '';

    if (listaPacientes.length === 0) {
        containerLista.innerHTML =
            '<div class="empty-warning">' +
                '<p>Nenhum paciente cadastrado no sistema.</p>' +
            '</div>';
        contadorTexto.innerText = "0 pacientes cadastrados";
        if (window.lucide) lucide.createIcons();
        return;
    }

    listaPacientes.forEach(function(paciente) {
        var nome = paciente.nomeCompleto || '';
        var iniciais = nome.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var idade = paciente.dataNascimento ? calcularIdade(paciente.dataNascimento) : '?';
        var dataFormatada = paciente.dataNascimento ? new Date(paciente.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '';
        var sexoLabel = paciente.sexo === 'MASCULINO' ? 'masculino' : 'feminino';
        var sexoIcon = paciente.sexo === 'MASCULINO' ? 'mars' : 'venus';
        var sexoClass = paciente.sexo === 'MASCULINO' ? 'male' : 'female';

        var card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML =
            '<div class="patient-avatar">' + iniciais + '</div>' +
            '<div class="patient-info">' +
                '<div class="name-row">' +
                    '<strong>' + nome + '</strong>' +
                    '<span class="gender-tag ' + sexoClass + '">' +
                        '<i data-lucide="' + sexoIcon + '"></i> ' + sexoLabel +
                    '</span>' +
                '</div>' +
                '<div class="details-row">' +
                    '<span><i data-lucide="calendar"></i> ' + idade + ' anos • ' + dataFormatada + '</span>' +
                    '<span><i data-lucide="fingerprint"></i> CPF: ' + (paciente.cpf || 'Não informado') + '</span>' +
                '</div>' +
            '</div>' +
            (role === 'ADMIN'
                ? '<div class="patient-actions">' +
                      '<button class="act-btn delete" data-id="' + paciente.id + '"><i data-lucide="trash-2"></i></button>' +
                  '</div>'
                : '');
        containerLista.appendChild(card);
    });

    contadorTexto.innerText = listaPacientes.length + ' paciente' + (listaPacientes.length !== 1 ? 's' : '') + ' cadastrado' + (listaPacientes.length !== 1 ? 's' : '');

    if (window.lucide) lucide.createIcons();

    document.querySelectorAll('.act-btn.delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            desativarPaciente(this.getAttribute('data-id'));
        });
    });
}

async function carregarPacientes(role) {
    try {
        var res = await api.listarPacientes();
        listaPacientes = res.data || [];
        renderizarPacientes(role);
    } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    var sexoRadio = form.querySelector('input[name="sexo"]:checked');
    var sexoValue = sexoRadio ? sexoRadio.value : null;
    var sexoBackend = sexoValue === 'M' ? 'MASCULINO' : 'FEMININO';

    var cpfLimpo = document.getElementById('cpf-paciente').value.replace(/\D/g, '');

    var body = {
        nomeCompleto: document.getElementById('nome-paciente').value,
        cpf: cpfLimpo,
        dataNascimento: document.getElementById('data-nascimento-paciente').value,
        sexo: sexoBackend,
        responsavelNome: document.getElementById('responsavel-nome').value,
        telefone: document.getElementById('responsavel-telefone').value,
        responsavelParentesco: document.getElementById('parentesco-responsavel').value
    };

    try {
        await api.cadastrarPaciente(body);
        modal.style.display = 'none';
        form.reset();
        await carregarPacientes('ADMIN');
    } catch (err) {
        alert(err.message || 'Erro ao cadastrar paciente.');
    }
});

async function desativarPaciente(id) {
    if (!confirm('Tem certeza que deseja desativar este paciente?')) return;
    try {
        await api.desativarPaciente(id);
        await carregarPacientes('ADMIN');
    } catch (err) {
        alert(err.message || 'Erro ao desativar paciente.');
    }
}

document.getElementById('btn-abrir-modal').addEventListener('click', function() { modal.style.display = 'flex'; });
document.getElementById('btn-fechar').addEventListener('click', function() { modal.style.display = 'none'; });
document.getElementById('btn-cancelar').addEventListener('click', function() { modal.style.display = 'none'; });

window.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
});

var modalAssociar = document.getElementById('modal-associar');
var formAssociar = document.getElementById('form-associar');

document.getElementById('btn-abrir-associar').addEventListener('click', function() {
    modalAssociar.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
});
document.getElementById('btn-fechar-associar').addEventListener('click', function() {
    modalAssociar.style.display = 'none';
});
document.getElementById('btn-cancelar-associar').addEventListener('click', function() {
    modalAssociar.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === modalAssociar) modalAssociar.style.display = 'none';
});

formAssociar.addEventListener('submit', async function(e) {
    e.preventDefault();
    var cpf = document.getElementById('cpf-associar').value.replace(/\D/g, '');
    try {
        await api.associarPaciente(cpf);
        modalAssociar.style.display = 'none';
        formAssociar.reset();
        await carregarPacientes('MEDICO');
    } catch (err) {
        alert(err.message || 'Erro ao associar paciente. Verifique o CPF.');
    }
});

requireAuthWithRole(function(user, role) {
    if (role === 'MEDICO') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) {
            el.style.display = 'none';
        });
        var btnAssociar = document.getElementById('btn-abrir-associar');
        if (btnAssociar) btnAssociar.style.display = '';
    }
    carregarPacientes(role);
});
