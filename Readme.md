---
title: Sistema de Triagem FXS Brasil — Frontend
date: 2026-06-11
---

# Sistema de Triagem FXS Brasil

Dashboard web para o Sistema de Triagem da Síndrome do X Frágil (FXS) — projeto
acadêmico para o curso de Bacharelado em Ciência da Computação da Pontifícia
Universidade Católica do Paraná (PUCPR).

O sistema utiliza um checklist clínico validado, combinado a um algoritmo de
Machine Learning (Random Forest) executado pelo backend, para auxiliar na
triagem populacional com alta sensibilidade.

- **Backend:** [FXS-DetectorAPI](https://github.com/CaioKloppel/FXS-DetectorAPI) (Spring Boot)

---

## 🚀 Funcionalidades

- **Login:** autenticação via Firebase (e-mail/senha).
- **Dashboard de Monitoramento:** visão geral de médicos, pacientes, triagens e encaminhamentos.
- **Gestão de Usuários:** cadastro de médicos e pacientes, com associação médico↔paciente.
- **Triagem Clínica:** formulário do checklist clínico de sintomas.
- **Resultados:** histórico de avaliações com score de probabilidade e status (monitoramento/encaminhamento).
- **Relatórios:** geração e download de dossiês individuais e relatórios agregados em PDF.
- **Perfil:** dados do funcionário logado.
- **Estado Dinâmico:** interface adapta-se a estados vazios quando não há dados cadastrados.
- **Controle por Role:** elementos administrativos (`data-admin-only`) só aparecem para usuários ADMIN.

---

## 🛠️ Tecnologias e Arquitetura

- **HTML5 + CSS3** (Variáveis CSS, Flexbox, Grid) — sem framework, sem bundler.
- **JavaScript ES6+ vanilla** — manipulação direta do DOM, sem componentes.
- **Firebase Auth** (SDK compat `12.13.0`, via CDN) — login e tokens de sessão.
- **Lucide Icons** (via CDN) — ícones das páginas internas.
- **Font Awesome 6.4.0** (via CDN) — ícones da tela de login.

Todo o site é estático e fica dentro de `docs/`, o que permite publicar
diretamente como **Static Site no Render** apontando para essa pasta.

### Comunicação com a API (`docs/src/js/api.js`)

- Detecta o ambiente pela URL: em `localhost`/`127.0.0.1` fala com a API local
  em `http://localhost:8082`; em qualquer outro host, usa a API publicada em
  `https://fxs-detectorapi.onrender.com`.
- Centraliza a config do Firebase, a obtenção do token (`getToken`), a role do
  usuário (`getUserRole`) e os guards de página (`requireAuth`,
  `requireAuthWithRole`, `logout`).
- Expõe um objeto `api` com um método por endpoint do backend (funcionários,
  pacientes, associações, diagnósticos, fotos e relatórios).

---

## 📂 Estrutura de Pastas

```text
fxsDetectorFront/
└── docs/                       # raiz publicada (Render Static Site)
    ├── index.html              # tela de login
    └── src/
        ├── css/                # 1 CSS por página + style.css (global/login)
        ├── js/
        │   ├── api.js           # cliente da API + auth/Firebase
        │   ├── script.js        # lógica do login (docs/index.html)
        │   └── <pagina>.js       # 1 JS por página interna
        ├── img/
        │   └── logo.png
        └── pages/
            ├── home.html
            ├── cadastro-medicos.html
            ├── cadastro-pacientes.html
            ├── associacoes.html
            ├── triagem.html
            ├── resultados.html
            ├── relatorios.html
            ├── perfil.html
            └── sobre-fxs.html
```

### Convenções

- Funções nomeadas em português, camelCase (`renderizarMedicos`, `inicializarDashboard`).
- IDs de elementos em kebab-case (`form-cadastro-medico`, `btn-abrir-modal`).
- Classes CSS em kebab-case (`medico-card`, `empty-warning`).
- Modais controlados via `display: flex/none`.
- Ícones Lucide renderizados com `lucide.createIcons()` após inserir HTML dinâmico.

---

## ▶️ Rodando localmente

Não há build nem instalação de dependências — é HTML/CSS/JS puro.

1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `docs/index.html` → **Open with Live Server**
   (sobe em `http://localhost:5500`).
4. Para as chamadas à API funcionarem, suba também o backend localmente
   ([FXS-DetectorAPI](https://github.com/CaioKloppel/FXS-DetectorAPI), porta
   `8082` em dev) — `http://localhost:5500` já está liberado no CORS do
   profile `dev`.
5. Faça login com um usuário cadastrado no backend (veja o README da API para
   criar o admin inicial via bootstrap).

> Em produção, basta publicar a pasta `docs/` como **Static Site no Render**
> (Build Command vazio, Publish Directory `docs`). O `api.js` troca
> automaticamente para a API publicada quando o host não é `localhost`.

---

## ✒️ Autoria e Contexto

- **Instituição:** Pontifícia Universidade Católica do Paraná (PUCPR).
- **Disciplina:** Experiência Criativa.
- **Estudantes:** Santiago Rocha, Caio Kloppel, Eduardo Dellarosa e Henrique Franco Nishimura.
- **Professor:** Andrey Cabral Meira.
- **Versão:** 1.0.0 - 2025.
