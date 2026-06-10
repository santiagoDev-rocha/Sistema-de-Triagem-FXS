// Dev (live-server local) fala com a API local; qualquer outro host usa a API publicada.
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:8082'
    : 'https://fxs-detectorapi.onrender.com';

const firebaseConfig = {
    apiKey: "AIzaSyCP24casgC0MO__TsC5oNojRM1smEAGNm8",
    authDomain: "fxs-detector.firebaseapp.com",
    projectId: "fxs-detector",
    storageBucket: "fxs-detector.firebasestorage.app",
    messagingSenderId: "737885244825",
    appId: "1:737885244825:web:5c28eab4c44ede95b75708",
    measurementId: "G-2J3T26NJHE"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

async function getToken() {
    var user = firebase.auth().currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    return user.getIdToken();
}

async function getUserRole() {
    var user = firebase.auth().currentUser;
    if (!user) return null;
    var result = await user.getIdTokenResult();
    return result.claims.role || null;
}

async function apiRequest(method, path, body) {
    var token = await getToken();
    var options = {
        method: method,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    };
    if (body !== undefined) options.body = JSON.stringify(body);
    var response = await fetch(API_BASE + path, options);
    var data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message || 'Erro desconhecido', data: data };
    return data;
}

var api = {
    get:   function(path) { return apiRequest('GET', path); },
    post:  function(path, body) { return apiRequest('POST', path, body); },
    put:   function(path, body) { return apiRequest('PUT', path, body); },
    patch: function(path) { return apiRequest('PATCH', path); },

    listarFuncionarios:         function() { return this.get('/funcionarios/return/all'); },
    cadastrarFuncionario:       function(body) { return this.post('/funcionarios/register', body); },
    desativarFuncionario:       function(id) { return this.patch('/funcionarios/desativar/' + id); },
    getFuncionario:             function(id) { return this.get('/funcionarios/return/' + id); },
    getFuncionarioAtual:        function() { return this.get('/funcionarios/return'); },
    atualizarFuncionario:       function(id, body) { return this.put('/funcionarios/update/' + id, body); },
    atualizarFuncionarioAtual:  function(body) { return this.put('/funcionarios/update', body); },
    reativarFuncionario:        function(id) { return this.patch('/funcionarios/reativar/' + id); },
    setRole:                    function(id, role) { return this.patch('/funcionarios/role/' + id + '/' + role); },

    listarPacientes:            function() { return this.get('/pacientes/return/all'); },
    cadastrarPaciente:          function(body) { return this.post('/pacientes/register', body); },
    desativarPaciente:          function(id) { return this.patch('/pacientes/desativar/' + id); },
    getPaciente:                function(id) { return this.get('/pacientes/return/' + id); },
    getPacienteByCpf:           function(cpf) { return this.get('/pacientes/return/cpf/' + cpf); },
    atualizarPaciente:          function(id, body) { return this.put('/pacientes/update/' + id, body); },
    reativarPaciente:           function(id) { return this.patch('/pacientes/reativar/' + id); },

    associarPaciente:           function(cpf) { return this.post('/funcionariopaciente/associar/' + cpf); },
    listarAssociacoes:          function() { return this.get('/funcionariopaciente/return/all'); },
    getAssociacoesPaciente:     function(id) { return this.get('/funcionariopaciente/return/paciente/' + id); },
    getAssociacoesFuncionario:  function(id) { return this.get('/funcionariopaciente/return/funcionario/' + id); },
    desativarAssociacao:        function(funcId, pacId) { return this.patch('/funcionariopaciente/desativar/' + funcId + '/' + pacId); },
    reativarAssociacao:         function(funcId, pacId) { return this.patch('/funcionariopaciente/reativar/' + funcId + '/' + pacId); },

    listarDiagnosticos:         function() { return this.get('/diagnosticos/return/all'); },
    cadastrarDiagnostico:       function(body) { return this.post('/diagnosticos/register', body); },
    getDiagnostico:             function(id) { return this.get('/diagnosticos/return/' + id); },
    getDiagnosticosPaciente:    function(id) { return this.get('/diagnosticos/return/paciente/' + id); },
    atualizarDiagnostico:       function(id, body) { return this.put('/diagnosticos/update/' + id, body); },

    uploadFotoPaciente: async function(id, tipo, file) {
        var token = await getToken();
        var formData = new FormData();
        formData.append('file', file);
        var response = await fetch(API_BASE + '/pacientes/' + id + '/fotos/' + tipo, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        });
        var data = await response.json();
        if (!response.ok) throw { status: response.status, message: data.message || 'Erro ao enviar foto', data: data };
        return data;
    },
    getFotoPacienteBlob: async function(id, tipo) {
        var token = await getToken();
        var response = await fetch(API_BASE + '/pacientes/' + id + '/fotos/' + tipo, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw { status: response.status, message: 'Erro ao carregar foto' };
        return response.blob();
    },
    getFotoPacienteUrl: async function(id, tipo) {
        var blob = await this.getFotoPacienteBlob(id, tipo);
        return URL.createObjectURL(blob);
    },
    removerFotoPaciente: async function(id, tipo) {
        var token = await getToken();
        var response = await fetch(API_BASE + '/pacientes/' + id + '/fotos/' + tipo, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var data = await response.json();
        if (!response.ok) throw { status: response.status, message: data.message || 'Erro ao remover foto', data: data };
        return data;
    },
    gerarDossiePaciente: async function(id) {
        var token = await getToken();
        var response = await fetch(API_BASE + '/relatorios/paciente/' + id, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw { status: response.status, message: 'Erro ao gerar dossiê' };
        return response.blob();
    },
    gerarRelatorioAgregado: async function(filtros) {
        var token = await getToken();
        var qs = new URLSearchParams();
        if (filtros.dataInicio) qs.append('dataInicio', filtros.dataInicio);
        if (filtros.dataFim) qs.append('dataFim', filtros.dataFim);
        if (filtros.medicoId) qs.append('medicoId', filtros.medicoId);
        if (filtros.sexo) qs.append('sexo', filtros.sexo);
        var query = qs.toString();
        var response = await fetch(API_BASE + '/relatorios/agregado' + (query ? '?' + query : ''), {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw { status: response.status, message: 'Erro ao gerar relatório agregado' };
        return response.blob();
    },
    listarRelatorios: function() { return this.get('/relatorios'); },
    baixarRelatorio: async function(id) {
        var token = await getToken();
        var response = await fetch(API_BASE + '/relatorios/' + id + '/download', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw { status: response.status, message: 'Erro ao baixar relatório' };
        return response.blob();
    }
};

function baixarBlobComoPdf(blob, nomeArquivo) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo || 'relatorio.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function requireAuth(callback) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = '../../index.html';
            return;
        }
        callback(user);
    });
}

function requireAuthWithRole(callback) {
    firebase.auth().onAuthStateChanged(async function(user) {
        if (!user) {
            window.location.href = '../../index.html';
            return;
        }
        var role = await getUserRole();
        callback(user, role);
    });
}

// Hide admin-only elements immediately to prevent FOUC for non-admin users.
// Runs synchronously on defer — DOM is ready, no async wait.
// requireAuthWithRole callbacks will show them for ADMIN role.
document.querySelectorAll('[data-admin-only]').forEach(function(el) { el.style.display = 'none'; });

function logout() {
    firebase.auth().signOut().then(function() {
        window.location.href = '../../index.html';
    });
}
