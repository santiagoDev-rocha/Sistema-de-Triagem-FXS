requireAuthWithRole(async function(user, role) {
    if (role === 'MEDICO') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = 'none'; });
    }

    try {
        var res = await api.getFuncionarioAtual();
        var f = res.data;

        document.getElementById('perfil-nome').value = f.nomeCompleto || '';
        document.getElementById('perfil-email').value = f.email || '';
        document.getElementById('perfil-cpf').value = f.cpf || '';
        document.getElementById('perfil-telefone').value = f.telefone || '';
        document.getElementById('perfil-data-nascimento').value = f.dataNascimento || '';
        document.getElementById('perfil-role').textContent = f.role || '';
        document.getElementById('perfil-data-cadastro').textContent = f.dataCadastro ? new Date(f.dataCadastro).toLocaleDateString('pt-BR') : '';
    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
    }
});

document.getElementById('form-perfil').addEventListener('submit', async function(e) {
    e.preventDefault();
    var body = {
        nomeCompleto: document.getElementById('perfil-nome').value,
        email: document.getElementById('perfil-email').value,
        telefone: document.getElementById('perfil-telefone').value,
        dataNascimento: document.getElementById('perfil-data-nascimento').value || null
    };

    try {
        await api.atualizarFuncionarioAtual(body);
        alert('Perfil atualizado com sucesso!');
    } catch (err) {
        alert(err.message || 'Erro ao atualizar perfil.');
    }
});
