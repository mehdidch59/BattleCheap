// Sélection des éléments du DOM
const SignIn = document.getElementById('login');
const User = document.getElementById('username');
const Pass = document.getElementById('password');

// Création d'un conteneur pour les messages d'erreur
let errorDiv = document.createElement('div');
errorDiv.id = 'login-error';
errorDiv.style.color = 'red';
SignIn.appendChild(errorDiv);

// Ajout d'un indicateur de chargement
let loading = document.createElement('span');
loading.id = 'login-loading';
loading.style.display = 'none';
loading.textContent = 'Connexion en cours...';
SignIn.appendChild(loading);

// Nettoyage des anciens listeners pour éviter les doublons
socket.off('resultPass');
socket.off('resultDecrypt');

SignIn.addEventListener('submit', (event) => {
    event.preventDefault();
    errorDiv.textContent = '';
    loading.style.display = 'inline';

    // Validation côté client
    if (User.value.length < 3) {
        errorDiv.textContent =
            "Le nom d'utilisateur doit faire au moins 3 caractères.";
        loading.style.display = 'none';
        return;
    }
    if (Pass.value.length < 4) {
        errorDiv.textContent =
            'Le mot de passe doit faire au moins 4 caractères.';
        loading.style.display = 'none';
        return;
    }

    // Demande le hash du mot de passe pour l'utilisateur
    socket.emit('password', [User.value]);

    socket.once('resultPass', (res) => {
        if (res && res.length) {
            socket.emit('decrypt', [Pass.value, res]);
            socket.once('resultDecrypt', (result) => {
                loading.style.display = 'none';
                if (result) {
                    logger.sendLogin(User.value);
                    window.location.href = '/';
                } else {
                    errorDiv.textContent = 'Mot de passe incorrect.';
                }
            });
        } else {
            loading.style.display = 'none';
            errorDiv.textContent = "Ce nom d'utilisateur n'existe pas.";
        }
    });
});
