var currentRole = null;

function formatarData(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleString('pt-BR');
}

async function carregarMedicos() {
    var select = document.getElementById('filtro-medico');
    try {
        var resp = await api.listarFuncionarios();
        (resp.data || []).forEach(function(f) {
            var opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = f.nomeCompleto;
            select.appendChild(opt);
        });
    } catch (e) { /* mantém apenas "Todos" */ }
}

async function carregarRelatorios() {
    var tbody = document.getElementById('lista-relatorios');
    var vazio = document.getElementById('relatorios-vazio');
    tbody.innerHTML = '';
    try {
        var resp = await api.listarRelatorios();
        var lista = resp.data || [];
        vazio.style.display = lista.length === 0 ? 'block' : 'none';
        lista.forEach(function(r) {
            var tr = document.createElement('tr');

            var tdTipo = document.createElement('td');
            tdTipo.textContent = r.tipo === 'INDIVIDUAL' ? 'Relatório do paciente' : 'Agregado';
            var tdNome = document.createElement('td');
            tdNome.textContent = r.nomeArquivo;
            var tdData = document.createElement('td');
            tdData.textContent = formatarData(r.createdAt);

            var tdAcao = document.createElement('td');
            var btn = document.createElement('button');
            btn.className = 'btn-baixar';
            btn.textContent = 'Baixar';
            btn.addEventListener('click', async function() {
                try {
                    var blob = await api.baixarRelatorio(r.id);
                    baixarBlobComoPdf(blob, r.nomeArquivo);
                } catch (err) { alert(err.message || 'Erro ao baixar relatório.'); }
            });
            tdAcao.appendChild(btn);

            tr.appendChild(tdTipo);
            tr.appendChild(tdNome);
            tr.appendChild(tdData);
            tr.appendChild(tdAcao);
            tbody.appendChild(tr);
        });
    } catch (err) {
        vazio.style.display = 'block';
    }
}

function wireFormAgregado() {
    var btn = document.getElementById('btn-gerar-agregado');
    document.getElementById('form-agregado').addEventListener('submit', async function(e) {
        e.preventDefault();
        var filtros = {
            dataInicio: document.getElementById('data-inicio').value,
            dataFim: document.getElementById('data-fim').value,
            medicoId: document.getElementById('filtro-medico').value,
            sexo: document.getElementById('filtro-sexo').value
        };
        btn.disabled = true;
        try {
            var blob = await api.gerarRelatorioAgregado(filtros);
            baixarBlobComoPdf(blob, 'relatorio-agregado.pdf');
            await carregarRelatorios();
        } catch (err) { alert(err.message || 'Erro ao gerar relatório.'); }
        finally { btn.disabled = false; }
    });
}

requireAuthWithRole(function(user, role) {
    currentRole = role;
    if (role !== 'ADMIN') {
        window.location.href = './home.html';
        return;
    }
    document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = ''; });
    carregarMedicos();
    carregarRelatorios();
    wireFormAgregado();
    if (window.lucide) lucide.createIcons();
});
