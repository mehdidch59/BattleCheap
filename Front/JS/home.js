let log = document.getElementById("lienLog")
let reg = document.getElementById("lienReg")
let game = document.getElementById("jouer")
let wel = document.getElementById("bonjour")

socket.emit("isSession", "");


socket.on("onSession", data => {              //affichage selon s'il y a une session d'active ou non
    console.log(data);
    if (data) {
        log.style.display = "none";
        reg.style.display = "none";
        game.style.display = "block";
        wel.style.display = "block";
        document.getElementById("username").innerHTML = data;
    }
    else {
        log.style.display = "block";
        reg.style.display = "block";
        game.style.display = "none";
        wel.style.display = "none";
    }
});

let formInvit = document.getElementById("loginForm");