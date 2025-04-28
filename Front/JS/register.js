// Sélection des éléments du DOM
const SignUp = document.getElementById('register');
const User = document.getElementById('username');
const Pass = document.getElementById('password');

// Création d'un conteneur pour les messages d'erreur
let errorDiv = document.createElement('div');
errorDiv.id = 'register-error';
errorDiv.style.color = 'red';
SignUp.appendChild(errorDiv);

// Ajout d'un indicateur de chargement
let loading = document.createElement('span');
loading.id = 'register-loading';
loading.style.display = 'none';
loading.textContent = 'Création du compte...';
SignUp.appendChild(loading);

// Nettoyage des anciens listeners pour éviter les doublons
socket.off('resultUser');
socket.off('resultCrypt');

SignUp.addEventListener('submit', (event) => {
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

    socket.emit('username', User.value);
    socket.once('resultUser', (res) => {
        if (res.length === 0) {
            socket.emit('crypt', Pass.value);
            socket.once('resultCrypt', (hash) => {
                socket.emit('register', [User.value, hash]);
                logger.sendLogin(User.value);
                loading.style.display = 'none';
                errorDiv.style.color = 'green';
                errorDiv.textContent = 'Compte créé avec succès.';
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            });
        } else {
            loading.style.display = 'none';
            errorDiv.textContent = "Ce nom d'utilisateur existe déjà.";
        }
    });
});
