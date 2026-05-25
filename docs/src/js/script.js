const loginForm = document.getElementById('login-form');
const mensagemErro = document.getElementById('mensagem-erro');

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;

        firebase.auth().signInWithEmailAndPassword(email, senha)
            .then(response => {
                window.location.href = "./src/pages/home.html";
            })
            .catch(error => { 
                mensagemErro.textContent = "Credenciais incorretas ou usuário não cadastrado";
                mensagemErro.style.display = "block";
            });
    });
}