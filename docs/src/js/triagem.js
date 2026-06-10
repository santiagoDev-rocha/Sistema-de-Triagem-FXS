var PESOS_MASCULINO = {
    sintDeficienciaIntelectual: 0.32,
    sintFaceAlongadaOrelhas: 0.29,
    sintMacroorquidismo: 0.26,
    sintHipermobilidadeArticular: 0.19,
    sintDificuldadeAprendizagem: 0.18,
    sintDeficitAtencao: 0.17,
    sintMovimentosRepetitivos: 0.17,
    sintAtrasoFala: 0.14,
    sintHiperatividade: 0.12,
    sintEvitaContatoVisual: 0.06,
    sintEvitaContatoFisico: 0.04,
    sintAgressividade: 0.01
};

var PESOS_FEMININO = {
    sintDificuldadeAprendizagem: 0.28,
    sintDeficienciaIntelectual: 0.20,
    sintDeficitAtencao: 0.12,
    sintFaceAlongadaOrelhas: 0.09,
    sintEvitaContatoVisual: 0.08,
    sintEvitaContatoFisico: 0.07,
    sintMovimentosRepetitivos: 0.05,
    sintHipermobilidadeArticular: 0.04,
    sintHiperatividade: 0.04,
    sintAgressividade: 0.02,
    sintAtrasoFala: 0.01
};

var LIMIAR_MASCULINO = 0.56;
var LIMIAR_FEMININO = 0.55;

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

var pacienteSelecionado = null;
var listaPacientes = [];

function calcularIdade(dataNasc) {
    var hoje = new Date();
    var nascimento = new Date(dataNasc);
    var idade = hoje.getFullYear() - nascimento.getFullYear();
    var m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

function getPesos() {
    if (!pacienteSelecionado) return PESOS_MASCULINO;
    return pacienteSelecionado.sexo === 'FEMININO' ? PESOS_FEMININO : PESOS_MASCULINO;
}

function getLimiar() {
    if (!pacienteSelecionado) return LIMIAR_MASCULINO;
    return pacienteSelecionado.sexo === 'FEMININO' ? LIMIAR_FEMININO : LIMIAR_MASCULINO;
}

function getMaxScore() {
    var pesos = getPesos();
    var soma = 0;
    for (var key in pesos) soma += pesos[key];
    return soma;
}

function renderizarChecklist() {
    var container = document.getElementById('checklist-container');
    var pesos = getPesos();
    var isFeminino = pacienteSelecionado && pacienteSelecionado.sexo === 'FEMININO';
    var html = '';

    for (var key in SINTOMAS_LABELS) {
        if (isFeminino && key === 'sintMacroorquidismo') continue;
        var peso = pesos[key] || 0;
        html +=
            '<div class="sintoma-item" data-key="' + key + '">' +
                '<input type="checkbox" id="cb-' + key + '" data-key="' + key + '">' +
                '<label for="cb-' + key + '">' + SINTOMAS_LABELS[key] + '</label>' +
                '<span class="sintoma-peso">' + peso.toFixed(2) + '</span>' +
            '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('.sintoma-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            if (e.target.tagName === 'INPUT') return;
            var cb = item.querySelector('input[type="checkbox"]');
            cb.checked = !cb.checked;
            item.classList.toggle('checked', cb.checked);
            calcularScore();
        });
        item.querySelector('input[type="checkbox"]').addEventListener('change', function() {
            item.classList.toggle('checked', this.checked);
            calcularScore();
        });
    });

    if (window.lucide) lucide.createIcons();
}

function calcularScore() {
    var pesos = getPesos();
    var limiar = getLimiar();
    var maxScore = getMaxScore();
    var score = 0;

    document.querySelectorAll('#checklist-container input[type="checkbox"]').forEach(function(cb) {
        if (cb.checked) {
            var key = cb.getAttribute('data-key');
            score += pesos[key] || 0;
        }
    });

    var scoreArredondado = parseFloat(score.toFixed(4));
    var recomendacao = scoreArredondado >= limiar;

    document.getElementById('score-valor').textContent = scoreArredondado.toFixed(4);

    var barPercent = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
    var bar = document.getElementById('score-bar');
    bar.style.width = barPercent + '%';
    bar.className = 'score-bar ' + (recomendacao ? 'danger' : 'safe');

    var thresholdPercent = maxScore > 0 ? (limiar / maxScore) * 100 : 50;
    document.getElementById('score-threshold').style.left = thresholdPercent + '%';
    document.getElementById('limiar-valor').textContent = limiar.toFixed(2);

    var badge = document.getElementById('resultado-badge');
    if (recomendacao) {
        badge.className = 'resultado-badge encaminhar';
        badge.innerHTML = '<i data-lucide="alert-circle"></i> Encaminhar para teste genético';
    } else {
        badge.className = 'resultado-badge monitorar';
        badge.innerHTML = '<i data-lucide="check-circle"></i> Monitorar';
    }

    if (window.lucide) lucide.createIcons();
}

function selecionarPaciente(paciente) {
    pacienteSelecionado = paciente;
    var iniciais = paciente.nomeCompleto.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    var idade = paciente.dataNascimento ? calcularIdade(paciente.dataNascimento) : '?';
    var sexoLabel = paciente.sexo === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino';

    document.getElementById('paciente-avatar').textContent = iniciais;
    document.getElementById('paciente-nome').textContent = paciente.nomeCompleto;
    document.getElementById('paciente-detalhes').textContent = sexoLabel + ' • ' + idade + ' anos';
    document.getElementById('paciente-selecionado').style.display = 'flex';
    document.getElementById('btn-iniciar').disabled = false;

    document.getElementById('lista-pacientes-dropdown').classList.remove('visible');
    document.getElementById('busca-paciente').value = '';
}

function renderizarDropdown(filtro) {
    var dropdown = document.getElementById('lista-pacientes-dropdown');
    var filtrados = listaPacientes.filter(function(p) {
        return p.nomeCompleto.toLowerCase().indexOf(filtro.toLowerCase()) >= 0;
    });

    if (filtro.length === 0 || filtrados.length === 0) {
        dropdown.classList.remove('visible');
        dropdown.innerHTML = '';
        return;
    }

    var html = '';
    filtrados.slice(0, 10).forEach(function(p) {
        var iniciais = p.nomeCompleto.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var sexoIcon = p.sexo === 'MASCULINO' ? '♂' : '♀';
        var idade = p.dataNascimento ? calcularIdade(p.dataNascimento) : '?';
        html +=
            '<div class="dropdown-item" data-id="' + p.id + '">' +
                '<div class="avatar-p">' + iniciais + '</div>' +
                '<div>' +
                    '<strong>' + p.nomeCompleto + '</strong><br>' +
                    '<small>' + sexoIcon + ' • ' + idade + ' anos</small>' +
                '</div>' +
            '</div>';
    });
    dropdown.innerHTML = html;
    dropdown.classList.add('visible');

    dropdown.querySelectorAll('.dropdown-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var paciente = listaPacientes.find(function(p) { return p.id === id; });
            if (paciente) selecionarPaciente(paciente);
        });
    });
}

async function salvarAvaliacao() {
    if (!pacienteSelecionado) return;
    var pesos = getPesos();
    var limiar = getLimiar();
    var score = 0;
    var sintomas = {};

    for (var key in SINTOMAS_LABELS) {
        var cb = document.getElementById('cb-' + key);
        var checked = cb ? cb.checked : false;
        sintomas[key] = checked;
        if (checked) score += pesos[key] || 0;
    }

    var scoreArredondado = parseFloat(score.toFixed(4));
    var body = {
        pacienteId: pacienteSelecionado.id,
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
        await api.cadastrarDiagnostico(body);
        alert('Avaliação salva com sucesso!');
        window.location.href = './resultados.html';
    } catch (err) {
        alert(err.message || 'Erro ao salvar avaliação.');
    }
}

// Event listeners
document.getElementById('busca-paciente').addEventListener('input', function() {
    renderizarDropdown(this.value);
});

document.getElementById('btn-trocar-paciente').addEventListener('click', function() {
    pacienteSelecionado = null;
    document.getElementById('paciente-selecionado').style.display = 'none';
    document.getElementById('btn-iniciar').disabled = true;
});

document.getElementById('btn-iniciar').addEventListener('click', function() {
    document.getElementById('passo-1').style.display = 'none';
    document.getElementById('passo-2').style.display = 'block';
    renderizarChecklist();
    calcularScore();
});

document.getElementById('btn-voltar').addEventListener('click', function() {
    document.getElementById('passo-2').style.display = 'none';
    document.getElementById('passo-1').style.display = 'block';
});

document.getElementById('btn-salvar').addEventListener('click', salvarAvaliacao);

// Close dropdown on outside click
document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('lista-pacientes-dropdown');
    var searchArea = document.querySelector('.select-paciente-area');
    if (searchArea && !searchArea.contains(e.target)) {
        dropdown.classList.remove('visible');
    }
});

// Init
requireAuthWithRole(async function(user, role) {
    if (role === 'ADMIN') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = ''; });
    }

    if (window.lucide) lucide.createIcons();

    try {
        var res = await api.listarPacientes();
        // Pacientes desativados não podem receber novas triagens (regra reforçada no backend).
        listaPacientes = (res.data || []).filter(function(p) { return p.ativo !== false; });

        // Check for pre-selected patient via query param
        var params = new URLSearchParams(window.location.search);
        var preSelectedId = params.get('pacienteId');
        if (preSelectedId) {
            var paciente = listaPacientes.find(function(p) { return p.id === preSelectedId; });
            if (paciente) selecionarPaciente(paciente);
        }
    } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
    }
});
