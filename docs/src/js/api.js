const API_BASE = 'http://localhost:8082';

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
    atualizarDiagnostico:       function(id, body) { return this.put('/diagnosticos/update/' + id, body); }
};

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

function logout() {
    firebase.auth().signOut().then(function() {
        window.location.href = '../../index.html';
    });
}
