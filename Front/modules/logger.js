let logger = (function(){

    function postLog(username) {
        console.log('username :', username);
        $.ajax({
            type: "POST",
            url: "/login",
            data: {
                login: username,
            },
            success: () => {
                if(window.location.pathname === '/'){
                    window.location.href="/waitingRoom";
                }
                else if(window.location.pathname === '/login' || window.location.pathname === '/register'){
                    window.location.href="/";
                }
            },
        });
    }

    return {
        sendLogin(username) {
            postLog(username);
        }
    }
})();