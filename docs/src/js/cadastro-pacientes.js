var listaPacientes = [];
var filtroAtivo = 'todos';

var modal = document.getElementById('modal-paciente');
var form = document.getElementById('form-cadastro');
var containerLista = document.querySelector('.patients-list');
var contadorTexto = document.getElementById('contador-pacientes');
var currentRole = null;
var modalEditar = document.getElementById('modal-editar-paciente');
var formEditar = document.getElementById('form-editar-paciente');
var modalDetalhe = document.getElementById('modal-detalhe-paciente');

function calcularIdade(dataNasc) {
    var hoje = new Date();
    var nascimento = new Date(dataNasc);
    var idade = hoje.getFullYear() - nascimento.getFullYear();
    var m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

function filtrarLista() {
    var busca = document.getElementById('busca-paciente').value.toLowerCase();
    return listaPacientes.filter(function(p) {
        if (filtroAtivo === 'ativos' && p.ativo === false) return false;
        if (filtroAtivo === 'inativos' && p.ativo !== false) return false;
        if (filtroAtivo === 'masculino' && p.sexo !== 'MASCULINO') return false;
        if (filtroAtivo === 'feminino' && p.sexo !== 'FEMININO') return false;
        if (busca) {
            var matchNome = (p.nomeCompleto || '').toLowerCase().indexOf(busca) >= 0;
            var matchCpf = (p.cpf || '').replace(/\D/g, '').indexOf(busca.replace(/\D/g, '')) >= 0;
            if (!matchNome && !matchCpf) return false;
        }
        return true;
    });
}

function renderizarPacientes(role) {
    var lista = filtrarLista();
    containerLista.innerHTML = '';

    if (lista.length === 0) {
        containerLista.innerHTML =
            '<div class="empty-warning">' +
                '<p>Nenhum paciente encontrado.</p>' +
            '</div>';
        contadorTexto.innerText = "0 pacientes cadastrados";
        if (window.lucide) lucide.createIcons();
        return;
    }

    lista.forEach(function(paciente) {
        var nome = paciente.nomeCompleto || '';
        var iniciais = nome.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var idade = paciente.dataNascimento ? calcularIdade(paciente.dataNascimento) : '?';
        var dataFormatada = paciente.dataNascimento ? new Date(paciente.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '';
        var sexoLabel = paciente.sexo === 'MASCULINO' ? 'masculino' : 'feminino';
        var sexoIcon = paciente.sexo === 'MASCULINO' ? 'mars' : 'venus';
        var sexoClass = paciente.sexo === 'MASCULINO' ? 'male' : 'female';
        var inativo = paciente.ativo === false;

        var card = document.createElement('div');
        card.className = 'patient-card' + (inativo ? ' inactive' : '');

        var actionsHtml = '<div class="patient-actions">';
        actionsHtml += '<button class="act-btn edit-btn" data-id="' + paciente.id + '" title="Editar"><i data-lucide="pencil"></i></button>';
        if (role === 'ADMIN') {
            if (inativo) {
                actionsHtml += '<button class="act-btn reativar-btn" data-id="' + paciente.id + '">Reativar</button>';
            } else {
                actionsHtml += '<button class="act-btn delete" data-id="' + paciente.id + '"><i data-lucide="trash-2"></i></button>';
            }
        }
        actionsHtml += '</div>';

        card.innerHTML =
            '<div class="patient-avatar">' + iniciais + '</div>' +
            '<div class="patient-info">' +
                '<div class="name-row">' +
                    '<span class="nome-clicavel" data-id="' + paciente.id + '">' + nome + '</span>' +
                    (inativo ? '<span class="inactive-badge">Inativo</span>' : '') +
                    '<span class="gender-tag ' + sexoClass + '">' +
                        '<i data-lucide="' + sexoIcon + '"></i> ' + sexoLabel +
                    '</span>' +
                '</div>' +
                '<div class="details-row">' +
                    '<span><i data-lucide="calendar"></i> ' + idade + ' anos • ' + dataFormatada + '</span>' +
                    '<span><i data-lucide="fingerprint"></i> CPF: ' + (paciente.cpf || 'Não informado') + '</span>' +
                '</div>' +
            '</div>' +
            actionsHtml;

        containerLista.appendChild(card);
    });

    contadorTexto.innerText = listaPacientes.length + ' paciente' + (listaPacientes.length !== 1 ? 's' : '') + ' cadastrado' + (listaPacientes.length !== 1 ? 's' : '');

    if (window.lucide) lucide.createIcons();

    // Wire actions
    containerLista.querySelectorAll('.nome-clicavel').forEach(function(el) {
        el.addEventListener('click', function() { abrirDetalhe(this.getAttribute('data-id')); });
    });
    containerLista.querySelectorAll('.act-btn.delete').forEach(function(btn) {
        btn.addEventListener('click', function() { desativarPaciente(this.getAttribute('data-id')); });
    });
    containerLista.querySelectorAll('.act-btn.reativar-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { reativarPacienteAction(this.getAttribute('data-id')); });
    });
    containerLista.querySelectorAll('.act-btn.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var paciente = listaPacientes.find(function(p) { return p.id === id; });
            if (paciente) abrirEdicao(paciente);
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

function abrirEdicao(paciente) {
    document.getElementById('editar-paciente-id').value = paciente.id;
    document.getElementById('editar-nome').value = paciente.nomeCompleto || '';
    document.getElementById('editar-data-nascimento').value = paciente.dataNascimento || '';
    document.getElementById('editar-cpf').value = paciente.cpf || '';
    document.getElementById('editar-responsavel-nome').value = paciente.responsavelNome || '';
    document.getElementById('editar-responsavel-telefone').value = paciente.telefone || '';
    document.getElementById('editar-parentesco').value = paciente.responsavelParentesco || '';

    var sexoVal = paciente.sexo === 'MASCULINO' ? 'M' : 'F';
    var radios = formEditar.querySelectorAll('input[name="editar-sexo"]');
    radios.forEach(function(r) { r.checked = r.value === sexoVal; });

    modalEditar.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
}

formEditar.addEventListener('submit', async function(e) {
    e.preventDefault();
    var id = document.getElementById('editar-paciente-id').value;
    var sexoRadio = formEditar.querySelector('input[name="editar-sexo"]:checked');
    var sexoBackend = sexoRadio && sexoRadio.value === 'M' ? 'MASCULINO' : 'FEMININO';

    var body = {
        nomeCompleto: document.getElementById('editar-nome').value,
        dataNascimento: document.getElementById('editar-data-nascimento').value,
        sexo: sexoBackend,
        responsavelNome: document.getElementById('editar-responsavel-nome').value,
        telefone: document.getElementById('editar-responsavel-telefone').value,
        responsavelParentesco: document.getElementById('editar-parentesco').value
    };

    try {
        await api.atualizarPaciente(id, body);
        await enviarFotosSelecionadas(id, 'editar-foto-frente', 'editar-foto-perfil');
        modalEditar.style.display = 'none';
        formEditar.reset();
        await carregarPacientes(currentRole);
    } catch (err) {
        alert(err.message || 'Erro ao atualizar paciente.');
    }
});

async function abrirDetalhe(pacienteId) {
    try {
        var resP = await api.getPaciente(pacienteId);
        var p = resP.data;
        var idade = p.dataNascimento ? calcularIdade(p.dataNascimento) : '?';
        var sexoLabel = p.sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino';
        var dataFormatada = p.dataNascimento ? new Date(p.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '';

        var html =
            '<div class="detalhe-section">' +
                '<p><strong>Nome:</strong> ' + (p.nomeCompleto || '') + '</p>' +
                '<p><strong>Sexo:</strong> ' + sexoLabel + '</p>' +
                '<p><strong>Idade:</strong> ' + idade + ' anos (' + dataFormatada + ')</p>' +
                '<p><strong>CPF:</strong> ' + (p.cpf || '') + '</p>' +
                '<p><strong>Responsável:</strong> ' + (p.responsavelNome || '') + ' (' + (p.responsavelParentesco || '') + ')</p>' +
                '<p><strong>Telefone:</strong> ' + (p.telefone || '') + '</p>' +
            '</div>';

        html +=
            '<div class="detalhe-section detalhe-fotos">' +
                '<h4 style="margin-bottom:10px">Fotos</h4>' +
                '<div class="fotos-slots">' +
                    montarSlotFoto('frente', 'Frente', p.temFotoFrente) +
                    montarSlotFoto('perfil', 'Perfil', p.temFotoPerfil) +
                '</div>' +
            '</div>';

        try {
            var resD = await api.getDiagnosticosPaciente(pacienteId);
            var diags = resD.data || [];
            if (diags.length > 0) {
                html += '<div class="detalhe-section"><h4 style="margin-bottom:10px">Avaliações</h4><table class="detalhe-diagnosticos-table"><thead><tr><th>Data</th><th>Score</th><th>Resultado</th></tr></thead><tbody>';
                diags.forEach(function(d) {
                    var data = d.dataDiagnostico ? new Date(d.dataDiagnostico).toLocaleDateString('pt-BR') : '';
                    var resultado = d.recomendacao ? 'Encaminhar' : 'Monitorar';
                    html += '<tr><td>' + data + '</td><td>' + (d.score != null ? parseFloat(d.score).toFixed(4) : '-') + '</td><td>' + resultado + '</td></tr>';
                });
                html += '</tbody></table></div>';
            } else {
                html += '<div class="detalhe-section"><p style="color:#999">Nenhuma avaliação registrada.</p></div>';
            }
        } catch(e) { /* ignore diagnostic fetch error */ }

        document.getElementById('detalhe-paciente-body').innerHTML = html;
        document.getElementById('btn-nova-triagem').href = './triagem.html?pacienteId=' + pacienteId;
        modalDetalhe.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
        await carregarFotosDetalhe(pacienteId);
        wireAcoesFoto(pacienteId);
    } catch (err) {
        alert(err.message || 'Erro ao carregar detalhes do paciente.');
    }
}

async function reativarPacienteAction(id) {
    if (!confirm('Reativar este paciente?')) return;
    try {
        await api.reativarPaciente(id);
        await carregarPacientes(currentRole);
    } catch (err) {
        alert(err.message || 'Erro ao reativar paciente.');
    }
}

// ── Search ──
document.getElementById('busca-paciente').addEventListener('input', async function() {
    var valor = this.value.trim();
    var cpfLimpo = valor.replace(/\D/g, '');
    // CPF search: 11 digits or formatted xxx.xxx.xxx-xx
    if (cpfLimpo.length === 11) {
        try {
            var res = await api.getPacienteByCpf(cpfLimpo);
            if (res.data) {
                listaPacientes = [res.data];
            } else {
                listaPacientes = [];
            }
        } catch(e) {
            listaPacientes = [];
        }
    } else if (cpfLimpo.length === 0) {
        await carregarPacientes(currentRole);
        return;
    }
    renderizarPacientes(currentRole);
});

// ── Filter buttons ──
document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        filtroAtivo = this.getAttribute('data-filter') || 'todos';
        // If CPF search was active, reload full list
        if (document.getElementById('busca-paciente').value.replace(/\D/g,'').length === 11) {
            carregarPacientes(currentRole).then(function() { renderizarPacientes(currentRole); });
        } else {
            renderizarPacientes(currentRole);
        }
    });
});

// ── Existing modal handlers ──
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
        var resCad = await api.cadastrarPaciente(body);
        var novoId = resCad.data && resCad.data.id;
        if (novoId) {
            await enviarFotosSelecionadas(novoId, 'foto-frente', 'foto-perfil');
        }
        modal.style.display = 'none';
        form.reset();
        await carregarPacientes(currentRole);
    } catch (err) {
        alert(err.message || 'Erro ao cadastrar paciente.');
    }
});

async function desativarPaciente(id) {
    if (!confirm('Tem certeza que deseja desativar este paciente?')) return;
    try {
        await api.desativarPaciente(id);
        await carregarPacientes(currentRole);
    } catch (err) {
        alert(err.message || 'Erro ao desativar paciente.');
    }
}

document.getElementById('btn-abrir-modal').addEventListener('click', function() { modal.style.display = 'flex'; });
document.getElementById('btn-fechar').addEventListener('click', function() { modal.style.display = 'none'; });
document.getElementById('btn-cancelar').addEventListener('click', function() { modal.style.display = 'none'; });
window.addEventListener('click', function(e) { if (e.target === modal) modal.style.display = 'none'; });

var modalAssociar = document.getElementById('modal-associar');
var formAssociar = document.getElementById('form-associar');

document.getElementById('btn-abrir-associar').addEventListener('click', function() {
    modalAssociar.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
});
document.getElementById('btn-fechar-associar').addEventListener('click', function() { modalAssociar.style.display = 'none'; });
document.getElementById('btn-cancelar-associar').addEventListener('click', function() { modalAssociar.style.display = 'none'; });
window.addEventListener('click', function(e) { if (e.target === modalAssociar) modalAssociar.style.display = 'none'; });

formAssociar.addEventListener('submit', async function(e) {
    e.preventDefault();
    var cpf = document.getElementById('cpf-associar').value.replace(/\D/g, '');
    try {
        await api.associarPaciente(cpf);
        modalAssociar.style.display = 'none';
        formAssociar.reset();
        await carregarPacientes(currentRole);
    } catch (err) {
        alert(err.message || 'Erro ao associar paciente. Verifique o CPF.');
    }
});

// ── Edit modal handlers ──
document.getElementById('btn-fechar-editar').addEventListener('click', function() { modalEditar.style.display = 'none'; });
document.getElementById('btn-cancelar-editar').addEventListener('click', function() { modalEditar.style.display = 'none'; });
window.addEventListener('click', function(e) { if (e.target === modalEditar) modalEditar.style.display = 'none'; });

// ── Detail modal handlers ──
document.getElementById('btn-fechar-detalhe').addEventListener('click', function() { modalDetalhe.style.display = 'none'; liberarFotoUrls(); });
document.getElementById('btn-fechar-detalhe-footer').addEventListener('click', function() { modalDetalhe.style.display = 'none'; liberarFotoUrls(); });
window.addEventListener('click', function(e) { if (e.target === modalDetalhe) { modalDetalhe.style.display = 'none'; liberarFotoUrls(); } });

async function enviarFotosSelecionadas(pacienteId, idInputFrente, idInputPerfil) {
    var inputFrente = document.getElementById(idInputFrente);
    var inputPerfil = document.getElementById(idInputPerfil);
    if (inputFrente && inputFrente.files[0]) {
        await api.uploadFotoPaciente(pacienteId, 'frente', inputFrente.files[0]);
    }
    if (inputPerfil && inputPerfil.files[0]) {
        await api.uploadFotoPaciente(pacienteId, 'perfil', inputPerfil.files[0]);
    }
}

var fotoObjectUrls = [];

function montarSlotFoto(tipo, label, possui) {
    var podeGerenciar = currentRole === 'ADMIN' || currentRole === 'MEDICO';
    var corpo = possui
        ? '<img class="foto-img" data-tipo="' + tipo + '" alt="Foto ' + label + '">'
        : '<div class="foto-vazia">Sem foto</div>';
    var acoes = podeGerenciar
        ? '<div class="foto-acoes">' +
              '<label class="foto-btn">' + (possui ? 'Trocar' : 'Enviar') +
                  '<input type="file" class="foto-input" data-tipo="' + tipo + '" accept="image/jpeg,image/png,image/webp" hidden>' +
              '</label>' +
              (possui ? '<button class="foto-btn foto-remover" data-tipo="' + tipo + '">Remover</button>' : '') +
          '</div>'
        : '';
    return '<div class="foto-slot"><span class="foto-label">' + label + '</span>' + corpo + acoes + '</div>';
}

async function carregarFotosDetalhe(pacienteId) {
    var imgs = document.querySelectorAll('#detalhe-paciente-body .foto-img');
    for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        try {
            var url = await api.getFotoPacienteUrl(pacienteId, img.getAttribute('data-tipo'));
            fotoObjectUrls.push(url);
            img.src = url;
        } catch (e) { /* sem foto / erro: deixa o slot como está */ }
    }
}

function wireAcoesFoto(pacienteId) {
    document.querySelectorAll('#detalhe-paciente-body .foto-input').forEach(function(input) {
        input.addEventListener('change', async function() {
            if (!this.files[0]) return;
            try {
                await api.uploadFotoPaciente(pacienteId, this.getAttribute('data-tipo'), this.files[0]);
                await abrirDetalhe(pacienteId);
            } catch (err) { alert(err.message || 'Erro ao enviar foto.'); }
        });
    });
    document.querySelectorAll('#detalhe-paciente-body .foto-remover').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            if (!confirm('Remover esta foto?')) return;
            try {
                await api.removerFotoPaciente(pacienteId, this.getAttribute('data-tipo'));
                await abrirDetalhe(pacienteId);
            } catch (err) { alert(err.message || 'Erro ao remover foto.'); }
        });
    });
}

function liberarFotoUrls() {
    fotoObjectUrls.forEach(function(u) { URL.revokeObjectURL(u); });
    fotoObjectUrls = [];
}

// ── Init ──
requireAuthWithRole(function(user, role) {
    currentRole = role;
    if (role === 'ADMIN') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = ''; });
    }
    if (role === 'MEDICO') {
        var btnAssociar = document.getElementById('btn-abrir-associar');
        if (btnAssociar) btnAssociar.style.display = '';
    }
    carregarPacientes(role);
});
