var SINTOMAS_LABELS = {
    sintDeficienciaIntelectual: 'Deficiência intelectual',
    sintFaceAlongadaOrelhas: 'Face alongada / orelhas de abano',
    sintMacroorquidismo: 'Macroorquidismo',
    sintHipermobilidadeArticular: 'Hipermobilidade articular',
    sintDificuldadeAprendizagem: 'Dificuldades de aprendizagem',
    sintDeficitAtencao: 'Déficit de atenção',
    sintMovimentosRepetitivos: 'Movimentos repetitivos',
    sintAtrasoFala: 'Atraso na fala',
    sintHiperatividade: 'Hiperatividade',
    sintEvitaContatoVisual: 'Evita contato visual',
    sintEvitaContatoFisico: 'Evita contato físico',
    sintAgressividade: 'Agressividade'
};

var PESOS_MASCULINO = { sintDeficienciaIntelectual:0.32, sintFaceAlongadaOrelhas:0.29, sintMacroorquidismo:0.26, sintHipermobilidadeArticular:0.19, sintDificuldadeAprendizagem:0.18, sintDeficitAtencao:0.17, sintMovimentosRepetitivos:0.17, sintAtrasoFala:0.14, sintHiperatividade:0.12, sintEvitaContatoVisual:0.06, sintEvitaContatoFisico:0.04, sintAgressividade:0.01 };
var PESOS_FEMININO = { sintDificuldadeAprendizagem:0.28, sintDeficienciaIntelectual:0.20, sintDeficitAtencao:0.12, sintFaceAlongadaOrelhas:0.09, sintEvitaContatoVisual:0.08, sintEvitaContatoFisico:0.07, sintMovimentosRepetitivos:0.05, sintHipermobilidadeArticular:0.04, sintHiperatividade:0.04, sintAgressividade:0.02, sintAtrasoFala:0.01 };
var LIMIAR_MASCULINO = 0.56;
var LIMIAR_FEMININO = 0.55;

var todosResultados = [];
var filtroPacienteId = null;
var currentRole = null;
var diagnosticoAtual = null;

function filtrarResultados() {
    var busca = document.getElementById('busca-nome').value.toLowerCase();
    var statusFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    var dataInicio = document.getElementById('filtro-data-inicio').value;
    var dataFim = document.getElementById('filtro-data-fim').value;

    var filtrados = todosResultados.filter(function(d) {
        if (busca && (d.pacienteNome || '').toLowerCase().indexOf(busca) < 0) return false;
        if (filtroPacienteId && d.pacienteId !== filtroPacienteId) return false;
        if (statusFilter === 'encaminhar' && !d.recomendacao) return false;
        if (statusFilter === 'monitorar' && d.recomendacao) return false;
        if (dataInicio) {
            var dData = d.dataDiagnostico ? d.dataDiagnostico.substring(0, 10) : '';
            if (dData < dataInicio) return false;
        }
        if (dataFim) {
            var dData2 = d.dataDiagnostico ? d.dataDiagnostico.substring(0, 10) : '';
            if (dData2 > dataFim) return false;
        }
        return true;
    });

    renderizarTabela(filtrados);
}

function renderizarTabela(dados) {
    var tbody = document.getElementById('resultados-body');
    var emptyState = document.getElementById('empty-state');

    if (dados.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
        return;
    }

    emptyState.style.display = 'none';
    var html = '';
    dados.forEach(function(d) {
        var data = d.dataDiagnostico ? new Date(d.dataDiagnostico).toLocaleDateString('pt-BR') : '';
        var sexoIcon = d.pacienteSexo === 'MASCULINO' ? '♂' : '♀';
        var badgeClass = d.recomendacao ? 'badge-encaminhar' : 'badge-monitorar';
        var badgeText = d.recomendacao ? 'Encaminhar' : 'Monitorar';

        html +=
            '<tr>' +
                '<td><span class="nome-clicavel" data-paciente-id="' + (d.pacienteId || '') + '" data-paciente-nome="' + (d.pacienteNome || '') + '">' + (d.pacienteNome || 'Paciente') + '</span></td>' +
                '<td>' + sexoIcon + '</td>' +
                '<td>' + (d.score != null ? parseFloat(d.score).toFixed(4) : '0.0000') + '</td>' +
                '<td><span class="' + badgeClass + '">' + badgeText + '</span></td>' +
                '<td>' + data + '</td>' +
                '<td>' + (d.funcionarioNome || '-') + '</td>' +
                '<td>' +
                    '<div class="action-btns">' +
                        '<button class="act-btn view" data-id="' + d.id + '" title="Ver detalhe"><i data-lucide="eye"></i></button>' +
                        '<button class="act-btn edit" data-id="' + d.id + '" title="Editar"><i data-lucide="edit"></i></button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    tbody.querySelectorAll('.nome-clicavel').forEach(function(el) {
        el.addEventListener('click', function() {
            filtroPacienteId = this.getAttribute('data-paciente-id');
            document.getElementById('filtro-paciente-nome').textContent = this.getAttribute('data-paciente-nome');
            document.getElementById('filtro-paciente-ativo').style.display = 'flex';
            filtrarResultados();
        });
    });

    tbody.querySelectorAll('.act-btn.view').forEach(function(btn) {
        btn.addEventListener('click', function() { abrirDetalhe(this.getAttribute('data-id')); });
    });

    tbody.querySelectorAll('.act-btn.edit').forEach(function(btn) {
        btn.addEventListener('click', function() { abrirEdicao(this.getAttribute('data-id')); });
    });
}

async function abrirDetalhe(id) {
    try {
        var res = await api.getDiagnostico(id);
        var d = res.data;
        diagnosticoAtual = d;

        var sexoLabel = d.pacienteSexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino';
        var data = d.dataDiagnostico ? new Date(d.dataDiagnostico).toLocaleDateString('pt-BR') : '';
        var badgeClass = d.recomendacao ? 'badge-encaminhar' : 'badge-monitorar';
        var badgeText = d.recomendacao ? 'Encaminhar para teste genético' : 'Monitorar';

        var html =
            '<div class="detalhe-paciente-info">' +
                '<strong>' + (d.pacienteNome || 'Paciente') + '</strong>' +
                '<span> • ' + sexoLabel + ' • ' + data + ' • Avaliador: ' + (d.funcionarioNome || '-') + '</span>' +
            '</div>' +
            '<div class="detalhe-sintomas">';

        for (var key in SINTOMAS_LABELS) {
            var presente = d[key] === true;
            var iconClass = presente ? 'sintoma-check' : 'sintoma-cross';
            var icon = presente ? '✅' : '❌';
            html += '<div class="sintoma-row"><span class="' + iconClass + '">' + icon + '</span> ' + SINTOMAS_LABELS[key] + '</div>';
        }

        html +=
            '</div>' +
            '<div class="detalhe-score-section">' +
                '<div class="detalhe-score-big">' + parseFloat(d.score).toFixed(4) + '</div>' +
                '<span class="' + badgeClass + '">' + badgeText + '</span>' +
            '</div>';

        document.getElementById('modal-detalhe-body').innerHTML = html;
        document.getElementById('modal-detalhe').style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    } catch (err) {
        alert(err.message || 'Erro ao carregar detalhe.');
    }
}

async function abrirEdicao(id) {
    try {
        var res = await api.getDiagnostico(id);
        var d = res.data;
        diagnosticoAtual = d;
        var isFeminino = d.pacienteSexo === 'FEMININO';
        var pesos = isFeminino ? PESOS_FEMININO : PESOS_MASCULINO;

        var html = '<div class="edit-checklist">';
        for (var key in SINTOMAS_LABELS) {
            if (isFeminino && key === 'sintMacroorquidismo') continue;
            var checked = d[key] === true;
            var peso = pesos[key] || 0;
            html +=
                '<div class="edit-sintoma-item' + (checked ? ' checked' : '') + '" data-key="' + key + '">' +
                    '<input type="checkbox" id="edit-cb-' + key + '" data-key="' + key + '"' + (checked ? ' checked' : '') + '>' +
                    '<label for="edit-cb-' + key + '">' + SINTOMAS_LABELS[key] + '</label>' +
                    '<span class="sintoma-peso">' + peso.toFixed(2) + '</span>' +
                '</div>';
        }
        html +=
            '</div>' +
            '<div class="edit-score-display">' +
                '<div class="edit-score-value" id="edit-score-valor">' + parseFloat(d.score).toFixed(4) + '</div>' +
                '<div id="edit-resultado-badge" class="' + (d.recomendacao ? 'badge-encaminhar' : 'badge-monitorar') + '">' +
                    (d.recomendacao ? 'Encaminhar' : 'Monitorar') +
                '</div>' +
            '</div>';

        document.getElementById('modal-editar-body').innerHTML = html;
        document.getElementById('modal-detalhe').style.display = 'none';
        document.getElementById('modal-editar').style.display = 'flex';

        document.querySelectorAll('.edit-sintoma-item').forEach(function(item) {
            item.addEventListener('click', function(e) {
                if (e.target.tagName === 'INPUT') return;
                var cb = item.querySelector('input[type="checkbox"]');
                cb.checked = !cb.checked;
                item.classList.toggle('checked', cb.checked);
                recalcularScoreEdicao();
            });
            item.querySelector('input[type="checkbox"]').addEventListener('change', function() {
                item.classList.toggle('checked', this.checked);
                recalcularScoreEdicao();
            });
        });

        if (window.lucide) lucide.createIcons();
    } catch (err) {
        alert(err.message || 'Erro ao carregar avaliação para edição.');
    }
}

function recalcularScoreEdicao() {
    if (!diagnosticoAtual) return;
    var isFeminino = diagnosticoAtual.pacienteSexo === 'FEMININO';
    var pesos = isFeminino ? PESOS_FEMININO : PESOS_MASCULINO;
    var limiar = isFeminino ? LIMIAR_FEMININO : LIMIAR_MASCULINO;
    var score = 0;

    document.getElementById('modal-editar').querySelectorAll('.edit-checklist input[type="checkbox"]').forEach(function(cb) {
        if (cb.checked) score += pesos[cb.getAttribute('data-key')] || 0;
    });

    var scoreArredondado = parseFloat(score.toFixed(4));
    var recomendacao = scoreArredondado >= limiar;

    document.getElementById('edit-score-valor').textContent = scoreArredondado.toFixed(4);
    var badge = document.getElementById('edit-resultado-badge');
    badge.className = recomendacao ? 'badge-encaminhar' : 'badge-monitorar';
    badge.textContent = recomendacao ? 'Encaminhar' : 'Monitorar';
}

async function salvarEdicao() {
    if (!diagnosticoAtual) return;
    var isFeminino = diagnosticoAtual.pacienteSexo === 'FEMININO';
    var pesos = isFeminino ? PESOS_FEMININO : PESOS_MASCULINO;
    var limiar = isFeminino ? LIMIAR_FEMININO : LIMIAR_MASCULINO;
    var score = 0;
    var sintomas = {};

    for (var key in SINTOMAS_LABELS) {
        var cb = document.getElementById('edit-cb-' + key);
        var checked = cb ? cb.checked : false;
        sintomas[key] = checked;
        if (checked) score += pesos[key] || 0;
    }

    var scoreArredondado = parseFloat(score.toFixed(4));
    var body = {
        score: scoreArredondado,
        recomendacao: scoreArredondado >= limiar,
        sintDeficienciaIntelectual: sintomas.sintDeficienciaIntelectual || false,
        sintFaceAlongadaOrelhas: sintomas.sintFaceAlongadaOrelhas || false,
        sintMacroorquidismo: sintomas.sintMacroorquidismo || false,
        sintHipermobilidadeArticular: sintomas.sintHipermobilidadeArticular || false,
        sintDificuldadeAprendizagem: sintomas.sintDificuldadeAprendizagem || false,
        sintDeficitAtencao: sintomas.sintDeficitAtencao || false,
        sintMovimentosRepetitivos: sintomas.sintMovimentosRepetitivos || false,
        sintAtrasoFala: sintomas.sintAtrasoFala || false,
        sintHiperatividade: sintomas.sintHiperatividade || false,
        sintEvitaContatoVisual: sintomas.sintEvitaContatoVisual || false,
        sintEvitaContatoFisico: sintomas.sintEvitaContatoFisico || false,
        sintAgressividade: sintomas.sintAgressividade || false
    };

    try {
        await api.atualizarDiagnostico(diagnosticoAtual.id, body);
        document.getElementById('modal-editar').style.display = 'none';
        alert('Avaliação atualizada com sucesso!');
        await carregarResultados();
    } catch (err) {
        alert(err.message || 'Erro ao atualizar avaliação.');
    }
}

async function carregarResultados() {
    try {
        var res = await api.listarDiagnosticos();
        todosResultados = res.data || [];

        var encaminhamentos = todosResultados.filter(function(d) { return d.recomendacao === true; }).length;
        document.getElementById('count-total').textContent = todosResultados.length;
        document.getElementById('count-encaminhar').textContent = encaminhamentos;
        document.getElementById('count-monitorar').textContent = todosResultados.length - encaminhamentos;
        document.getElementById('contador-resultados').textContent = todosResultados.length + ' avaliação(ões) realizada(s)';

        filtrarResultados();
    } catch (err) {
        console.error('Erro ao carregar resultados:', err);
    }
}

// Event listeners
document.getElementById('busca-nome').addEventListener('input', filtrarResultados);
document.getElementById('filtro-data-inicio').addEventListener('change', filtrarResultados);
document.getElementById('filtro-data-fim').addEventListener('change', filtrarResultados);

document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        filtrarResultados();
    });
});

document.getElementById('btn-limpar-filtros').addEventListener('click', function() {
    document.getElementById('busca-nome').value = '';
    document.getElementById('filtro-data-inicio').value = '';
    document.getElementById('filtro-data-fim').value = '';
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelector('.filter-btn[data-filter="todos"]').classList.add('active');
    filtroPacienteId = null;
    document.getElementById('filtro-paciente-ativo').style.display = 'none';
    filtrarResultados();
});

document.getElementById('btn-limpar-filtro-paciente').addEventListener('click', function() {
    filtroPacienteId = null;
    document.getElementById('filtro-paciente-ativo').style.display = 'none';
    filtrarResultados();
});

document.querySelectorAll('.btn-fechar-detalhe').forEach(function(btn) {
    btn.addEventListener('click', function() { document.getElementById('modal-detalhe').style.display = 'none'; });
});
document.querySelectorAll('.btn-fechar-editar').forEach(function(btn) {
    btn.addEventListener('click', function() { document.getElementById('modal-editar').style.display = 'none'; });
});
document.getElementById('btn-editar-from-detalhe').addEventListener('click', function() {
    if (diagnosticoAtual) abrirEdicao(diagnosticoAtual.id);
});
document.getElementById('btn-salvar-edicao').addEventListener('click', salvarEdicao);

window.addEventListener('click', function(e) {
    if (e.target === document.getElementById('modal-detalhe')) document.getElementById('modal-detalhe').style.display = 'none';
    if (e.target === document.getElementById('modal-editar')) document.getElementById('modal-editar').style.display = 'none';
});

requireAuthWithRole(function(user, role) {
    currentRole = role;
    if (role === 'MEDICO') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = 'none'; });
    }
    carregarResultados();
});
