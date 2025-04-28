// socket.on("sendScore" ,(scores) => {
//     if(i == 0) {
//         let tableauScr = document.getElementById("tableauScr");
//         for (let i of scores.scores) {
//             //console.log("jsuis al")
//             let tr = document.createElement("tr");
//             let winner, looser;
//             if (i.winner === 1) {
//                 winner = i.joueur1;
//                 looser = i.joueur2;
//             } else {
//                 winner = i.joueur2;
//                 looser = i.joueur1;
//             }
//             let columnScr1 = document.createElement("td");
//             columnScr1.textContent = winner;
//             tr.appendChild(columnScr1);
//             let columnScr2 = document.createElement("td");
//             columnScr2.textContent = looser;
//             tr.appendChild(columnScr2);

//             let columnScr3 = document.createElement("td");
//             columnScr3.textContent =  Math.trunc(i.time / 3600)+"h " + Math.trunc((i.time% 3600) / 60)+"m " +  i.time% 60+"s";
//             tr.appendChild(columnScr3);

//             tableauScr.appendChild(tr);
//         }
//     }
//     i++;
// })
// let i = 0;
// socket.emit("getScore");
