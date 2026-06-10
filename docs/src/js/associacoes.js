var todasAssociacoes = [];
var filtroStatus = 'todos';
var filtroIdAtivo = null;
var filtroTipoAtivo = null;

var TIPO_LABELS = {
    CADASTRO: 'Cadastro',
    MEDICO_RESPONSAVEL: 'Médico Responsável',
    ACOMPANHAMENTO: 'Acompanhamento'
};

function filtrarAssociacoes() {
    var busca = document.getElementById('busca-assoc').value.toLowerCase();

    return todasAssociacoes.filter(function(a) {
        if (filtroStatus === 'ativos' && a.ativo === false) return false;
        if (filtroStatus === 'inativos' && a.ativo !== false) return false;
        if (filtroTipoAtivo && a.tipoAtribuicao !== filtroTipoAtivo) return false;
        var funcId = a.funcionario ? a.funcionario.id : '';
        var pacId = a.paciente ? a.paciente.id : '';
        if (filtroIdAtivo) {
            if (funcId !== filtroIdAtivo && pacId !== filtroIdAtivo) return false;
        }
        if (busca) {
            var funcNome = (a.funcionario ? a.funcionario.nomeCompleto || '' : '').toLowerCase();
            var pacNome = (a.paciente ? a.paciente.nomeCompleto || '' : '').toLowerCase();
            if (funcNome.indexOf(busca) < 0 && pacNome.indexOf(busca) < 0) return false;
        }
        return true;
    });
}

function renderizarTabela() {
    var dados = filtrarAssociacoes();
    var tbody = document.getElementById('assoc-body');
    var emptyState = document.getElementById('empty-state');

    if (dados.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
        return;
    }

    emptyState.style.display = 'none';
    var html = '';
    dados.forEach(function(a) {
        var funcId = a.funcionario ? a.funcionario.id : '';
        var funcNome = a.funcionario ? a.funcionario.nomeCompleto || '' : '';
        var pacId = a.paciente ? a.paciente.id : '';
        var pacNome = a.paciente ? a.paciente.nomeCompleto || '' : '';
        var data = a.dataAtribuicao ? new Date(a.dataAtribuicao).toLocaleDateString('pt-BR') : '';
        var tipo = TIPO_LABELS[a.tipoAtribuicao] || (a.tipoAtribuicao || '-');
        var ativo = a.ativo !== false;
        var statusBadge = ativo
            ? '<span class="badge-ativo">Ativo</span>'
            : '<span class="badge-inativo">Inativo</span>';
        var acaoBotao = ativo
            ? '<button class="act-btn desativar-btn" data-func-id="' + funcId + '" data-pac-id="' + pacId + '">Desativar</button>'
            : '<button class="act-btn reativar-btn" data-func-id="' + funcId + '" data-pac-id="' + pacId + '">Reativar</button>';

        html +=
            '<tr>' +
                '<td><span class="nome-clicavel" data-id="' + funcId + '" data-nome="' + funcNome + '" data-tipo="func">' + (funcNome || '-') + '</span></td>' +
                '<td><span class="nome-clicavel" data-id="' + pacId + '" data-nome="' + pacNome + '" data-tipo="pac">' + (pacNome || '-') + '</span></td>' +
                '<td>' + tipo + '</td>' +
                '<td>' + data + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + acaoBotao + '</td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Wire clicks
    tbody.querySelectorAll('.nome-clicavel').forEach(function(el) {
        el.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var nome = this.getAttribute('data-nome');
            filtroIdAtivo = id;
            document.getElementById('filtro-ativo-nome').textContent = nome;
            document.getElementById('filtro-ativo-tag').style.display = 'flex';
            renderizarTabela();
        });
    });

    tbody.querySelectorAll('.act-btn.desativar-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            desativarAssociacaoAction(this.getAttribute('data-func-id'), this.getAttribute('data-pac-id'));
        });
    });

    tbody.querySelectorAll('.act-btn.reativar-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            reativarAssociacaoAction(this.getAttribute('data-func-id'), this.getAttribute('data-pac-id'));
        });
    });
}

async function desativarAssociacaoAction(funcId, pacId) {
    if (!confirm('Desativar esta associação?')) return;
    try {
        await api.desativarAssociacao(funcId, pacId);
        await carregarAssociacoes();
    } catch (err) {
        alert(err.message || 'Erro ao desativar associação.');
    }
}

async function reativarAssociacaoAction(funcId, pacId) {
    if (!confirm('Reativar esta associação?')) return;
    try {
        await api.reativarAssociacao(funcId, pacId);
        await carregarAssociacoes();
    } catch (err) {
        alert(err.message || 'Erro ao reativar associação.');
    }
}

async function carregarAssociacoes() {
    try {
        var res = await api.listarAssociacoes();
        todasAssociacoes = res.data || [];
        document.getElementById('contador-associacoes').textContent = todasAssociacoes.length + ' associação(ões)';
        renderizarTabela();
    } catch (err) {
        console.error('Erro ao carregar associações:', err);
    }
}

// Filters
document.getElementById('busca-assoc').addEventListener('input', renderizarTabela);

document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        filtroStatus = this.getAttribute('data-filter') || 'todos';
        renderizarTabela();
    });
});

document.getElementById('filtro-tipo').addEventListener('change', function() {
    filtroTipoAtivo = this.value || null;
    renderizarTabela();
});

document.getElementById('btn-limpar-filtros').addEventListener('click', function() {
    document.getElementById('busca-assoc').value = '';
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelector('.filter-btn[data-filter="todos"]').classList.add('active');
    document.getElementById('filtro-tipo').value = '';
    filtroStatus = 'todos';
    filtroTipoAtivo = null;
    filtroIdAtivo = null;
    document.getElementById('filtro-ativo-tag').style.display = 'none';
    renderizarTabela();
});

document.getElementById('btn-limpar-filtro-ativo').addEventListener('click', function() {
    filtroIdAtivo = null;
    document.getElementById('filtro-ativo-tag').style.display = 'none';
    renderizarTabela();
});

// Init
requireAuthWithRole(function(user, role) {
    if (role !== 'ADMIN') {
        window.location.href = './home.html';
        return;
    }
    document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = ''; });
    carregarAssociacoes();
});
