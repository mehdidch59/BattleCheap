let SignIn = document.getElementById("login");
let User = document.getElementById("username");
let Pass = document.getElementById("password");
var Alert = false;                  //Me demandez pas pourquoi cette variable existe.


SignIn.addEventListener('submit', event => {
    event.preventDefault();

    console.log("Valeur du user et du password après submit", User.value, Pass.value);

    socket.emit("password", [User.value]);
    socket.on("resultPass", res => {
        if (res.length) {
            socket.emit("decrypt", [Pass.value, res]);
            socket.on("resultDecrypt", result => {
                if (result) {
                    logger.sendLogin(User.value);          //Petite connexion qui fait plaisir
                    window.location.href = "/";
                }
                else if (!result && Alert === false) {
                    alert('Mot de passe incorrect.');
                    Alert = true;
                }
            });
        }
        if (!res.length && Alert === false) {
            alert("Ce nom d'utilisateur n'existe pas.");
            Alert = true;                                       //Sans cette variable cela n'aurait pas fonctionné.
            console.log(res.length);
        }
    });
    Alert = false;
});