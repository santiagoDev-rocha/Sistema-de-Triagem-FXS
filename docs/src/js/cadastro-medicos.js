var listaMedicos = [];

var modal = document.getElementById('modal-medico');
var form = document.getElementById('form-cadastro-medico');
var containerLista = document.querySelector('.medicos-list');
var contadorTexto = document.getElementById('contador-medicos');

function renderizarMedicos() {
    containerLista.innerHTML = '';

    if (listaMedicos.length === 0) {
        containerLista.innerHTML =
            '<div class="empty-warning">' +
                '<p>Nenhum médico cadastrado no sistema.</p>' +
            '</div>';
        contadorTexto.innerText = "0 médicos cadastrados";
        if (window.lucide) lucide.createIcons();
        return;
    }

    listaMedicos.forEach(function(medico) {
        var nome = medico.nomeCompleto || '';
        var iniciais = nome.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();

        var card = document.createElement('div');
        card.className = 'medico-card';
        card.innerHTML =
            '<div class="medico-avatar">' + iniciais + '</div>' +
            '<div class="medico-info">' +
                '<div class="name-row">' +
                    '<strong>' + nome + '</strong>' +
                '</div>' +
                '<div class="details-row">' +
                    '<span><i data-lucide="phone"></i> ' + (medico.telefone || '') + '</span>' +
                    '<span><i data-lucide="mail"></i> ' + (medico.email || '') + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="medico-actions">' +
                '<button class="act-btn delete" data-id="' + medico.id + '"><i data-lucide="trash-2"></i></button>' +
            '</div>';
        containerLista.appendChild(card);
    });

    contadorTexto.innerText = listaMedicos.length + ' médico' + (listaMedicos.length !== 1 ? 's' : '') + ' cadastrado' + (listaMedicos.length !== 1 ? 's' : '');

    if (window.lucide) lucide.createIcons();

    document.querySelectorAll('.act-btn.delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            desativarMedico(this.getAttribute('data-id'));
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

async function desativarMedico(id) {
    if (!confirm('Tem certeza que deseja desativar este profissional?')) return;
    try {
        await api.desativarFuncionario(id);
        await carregarMedicos();
    } catch (err) {
        alert(err.message || 'Erro ao desativar médico.');
    }
}

document.getElementById('btn-abrir-modal').addEventListener('click', function() { modal.style.display = 'flex'; });
document.getElementById('btn-fechar').addEventListener('click', function() { modal.style.display = 'none'; });
document.getElementById('btn-cancelar').addEventListener('click', function() { modal.style.display = 'none'; });

window.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
});

requireAuthWithRole(function(user, role) {
    if (role === 'MEDICO') {
        window.location.href = './home.html';
        return;
    }
    carregarMedicos();
});
