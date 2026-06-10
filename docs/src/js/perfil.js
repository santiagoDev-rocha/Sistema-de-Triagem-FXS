requireAuthWithRole(async function(user, role) {
    if (role === 'ADMIN') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = ''; });
    }

    if (window.lucide) lucide.createIcons();

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

function mostrarFeedbackSenha(mensagem, tipo) {
    var el = document.getElementById('senha-feedback');
    el.textContent = mensagem;
    el.className = 'senha-feedback ' + tipo;
    el.style.display = 'block';
}

function mensagemErroSenha(err) {
    switch (err && err.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
            return 'Senha atual incorreta.';
        case 'auth/weak-password':
            return 'A nova senha é muito fraca. Use no mínimo 6 caracteres.';
        case 'auth/too-many-requests':
            return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
        case 'auth/requires-recent-login':
            return 'Sessão antiga demais. Saia e entre novamente antes de alterar a senha.';
        default:
            return (err && err.message) || 'Erro ao alterar a senha.';
    }
}

document.getElementById('form-senha').addEventListener('submit', async function(e) {
    e.preventDefault();

    var senhaAtual = document.getElementById('senha-atual').value;
    var senhaNova = document.getElementById('senha-nova').value;
    var senhaConfirmacao = document.getElementById('senha-confirmacao').value;

    if (senhaNova !== senhaConfirmacao) {
        mostrarFeedbackSenha('A confirmação não confere com a nova senha.', 'erro');
        return;
    }
    if (senhaNova === senhaAtual) {
        mostrarFeedbackSenha('A nova senha deve ser diferente da senha atual.', 'erro');
        return;
    }

    var btn = document.getElementById('btn-alterar-senha');
    btn.disabled = true;
    try {
        var user = firebase.auth().currentUser;
        var credencial = firebase.auth.EmailAuthProvider.credential(user.email, senhaAtual);
        await user.reauthenticateWithCredential(credencial);
        await user.updatePassword(senhaNova);

        mostrarFeedbackSenha('Senha alterada com sucesso!', 'sucesso');
        this.reset();
    } catch (err) {
        mostrarFeedbackSenha(mensagemErroSenha(err), 'erro');
    } finally {
        btn.disabled = false;
    }
});
