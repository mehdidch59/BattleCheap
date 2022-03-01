let SignUp = document.getElementById("register");             //on récupère les différents éléments de la page web
let User = document.getElementById("username");
let Pass = document.getElementById("password");
var Alert = false;                                            //Même utilité que la variable dans le login.JS

//code pour se créer un compte
SignUp.addEventListener('submit', event => {
    event.preventDefault();
    if (User.value.length > 2) {                //Pseudo de Plus de 3 caractères
        if (Pass.value.length > 3) {           //MDP de Plus de 4 caractères
            socket.emit("username", User.value);
            socket.on("resultUser", res => {
                console.log("wsh les gars");
                if (res.length === 0) {
                    socket.emit("crypt", Pass.value);
                    socket.on("resultCrypt", res => {
                        socket.emit("register", [User.value, res]);
                        logger.sendLogin(User.value);
                        alert('Compte créé avec succès.');
                        window.location.href = "/";         //redirection vers la page d'accueil
                    });
                } else if (!res.value) {
                    alert("Ce nom d'utilisateur existe déjà ");     //Pas besoin de préciser je pense
                    window.location.reload();                       //l'Alerte parle d'elle-même
                }
            });
        }
        if (Pass.value.length <= 2 && Alert == false) {
            window.alert('Mot de passe trop court');        //Pas besoin de préciser là aussi je pense
            Alert = true;
        }
    }
    else {
        window.location.reload();
        window.alert("Le nom d'utilisateur doit faire minimum 3 caractères");       //Je vais rien dire
    }
    Alert = false;
});