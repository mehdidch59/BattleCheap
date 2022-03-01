// module gérant les événements liés à la barre du header
let event = (function () {
    return {
        // ajoute les différents événements nécessaires et affiche si besoin les raccourcis de la barre
        addEvent: () => {
            event.eventResize();

            window.addEventListener('scroll', event.eventScroll);
            window.addEventListener('resize', event.eventResize);
        },

        // événement liés au scroll de la page, noirci la bande si l'on descend
        eventScroll: () => {
            const nav = document.getElementsByTagName('nav');
            if (window.scrollY) {
                nav[0].setAttribute('class', 'black');
            } else {
                nav[0].removeAttribute('class');
            }
        },

        // supprime ou ajoute les éléments de la barre du header en fonction de la largeur de la page
        eventResize: () => {
            const ul = document.getElementsByTagName('ul');
            const logo = document.getElementsByClassName('logo');
        },
    }
})();