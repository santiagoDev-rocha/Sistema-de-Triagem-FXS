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
            tr.innerHTML =
                '<td>' + (r.tipo === 'INDIVIDUAL' ? 'Dossiê' : 'Agregado') + '</td>' +
                '<td>' + r.nomeArquivo + '</td>' +
                '<td>' + formatarData(r.createdAt) + '</td>' +
                '<td><button class="btn-baixar" data-id="' + r.id + '" data-nome="' + r.nomeArquivo + '">Baixar</button></td>';
            tbody.appendChild(tr);
        });
        tbody.querySelectorAll('.btn-baixar').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                try {
                    var blob = await api.baixarRelatorio(this.getAttribute('data-id'));
                    baixarBlobComoPdf(blob, this.getAttribute('data-nome'));
                } catch (err) { alert(err.message || 'Erro ao baixar relatório.'); }
            });
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
    carregarMedicos();
    carregarRelatorios();
    wireFormAgregado();
    if (window.lucide) lucide.createIcons();
});
