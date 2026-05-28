function renderizarAvaliacoes(diagnosticos, encaminhamentos) {
    var container = document.getElementById('evaluations-container');
    var btnVerTodos = document.getElementById('btn-ver-todos');

    if (!container) return;

    if (diagnosticos.length === 0) {
        if (btnVerTodos) btnVerTodos.style.display = 'none';
        container.innerHTML =
            '<div class="empty-state">' +
                '<i data-lucide="clipboard-list"></i>' +
                '<p>Nenhuma avaliação realizada</p>' +
            '</div>';
    } else {
        if (btnVerTodos) btnVerTodos.style.display = 'flex';
        var ultimos = diagnosticos.slice(0, 5);
        var html = '';
        ultimos.forEach(function(d) {
            var status = d.recomendacao ? 'Encaminhar' : 'Monitorar';
            var badgeClass = d.recomendacao ? 'badge-danger' : 'badge-success';
            var data = d.dataDiagnostico ? new Date(d.dataDiagnostico).toLocaleDateString('pt-BR') : '';
            html +=
                '<div class="eval-row">' +
                    '<div class="avatar-p">' + (d.pacienteNome ? d.pacienteNome.charAt(0) : '?') + '</div>' +
                    '<div class="eval-info">' +
                        '<strong>' + (d.pacienteNome || 'Paciente') + '</strong>' +
                        '<span>Score: ' + (d.score != null ? parseFloat(d.score).toFixed(4) : '0.0000') + ' • ' + data + '</span>' +
                    '</div>' +
                    '<span class="' + badgeClass + '">' + status + '</span>' +
                '</div>';
        });
        html +=
            '<div class="summary-cards">' +
                '<div class="mini-card red-soft">' +
                    '<i data-lucide="alert-circle"></i>' +
                    '<span><strong>' + encaminhamentos + '</strong> Encaminhar</span>' +
                '</div>' +
                '<div class="mini-card green-soft">' +
                    '<i data-lucide="check-circle"></i>' +
                    '<span><strong>' + (diagnosticos.length - encaminhamentos) + '</strong> Monitorar</span>' +
                '</div>' +
            '</div>';
        container.innerHTML = html;
    }

    if (window.lucide) lucide.createIcons();
}

requireAuthWithRole(async function(user, role) {
    if (role === 'ADMIN') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = ''; });
    }

    try {
        var promises = [api.listarPacientes(), api.listarDiagnosticos()];
        if (role === 'ADMIN') promises.unshift(api.listarFuncionarios());

        var resultados = await Promise.all(promises);

        var funcionarios = role === 'ADMIN' ? (resultados[0].data || []) : [];
        var pacientes = (role === 'ADMIN' ? resultados[1] : resultados[0]).data || [];
        var diagnosticos = (role === 'ADMIN' ? resultados[2] : resultados[1]).data || [];

        if (role === 'ADMIN') {
            document.getElementById('count-medicos').innerText = funcionarios.length;
        }
        document.getElementById('count-pacientes').innerText = pacientes.length;
        document.getElementById('count-triagens').innerText = diagnosticos.length;

        var encaminhamentos = diagnosticos.filter(function(d) { return d.recomendacao === true; }).length;
        document.getElementById('count-encaminhamentos').innerText = encaminhamentos;

        renderizarAvaliacoes(diagnosticos, encaminhamentos);
    } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
    }
});
