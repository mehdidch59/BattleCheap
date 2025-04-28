const fs = require('fs');
// Assurez-vous que 'con' (connexion MySQL) est bien importé ou passé en paramètre si besoin

let scoreHandler = (function () {
    let scores = [];

    return {
        //ecriture des scores dans le fichier .json
        writeScore(newScore) {
            fs.readFile('./Back/Data/Scores.json', (err, data) => {
                if (err) {
                    console.error('Erreur lecture Scores.json :', err.message);
                    return;
                }
                let newscores;
                try {
                    newscores = JSON.parse(data);
                } catch (e) {
                    console.error('Erreur parsing JSON :', e.message);
                    return;
                }

                if (newscores.scores.length === 5) {
                    newscores.scores.shift();
                }
                newscores.scores.push(newScore);

                let mydatas = JSON.stringify(newscores, null, 2);

                fs.writeFile('./Back/Data/Scores.json', mydatas, (err) => {
                    if (err) {
                        console.error(
                            'Erreur écriture Scores.json :',
                            err.message
                        );
                        return;
                    }
                    console.log('Data written to file');
                });
            });
        },
        //Lecture des scores dans le fichier .json
        readScore(index) {
            fs.readFile('./Back/Data/Scores.json', (err, data) => {
                if (err) {
                    console.error('Erreur lecture Scores.json :', err.message);
                    return;
                }
                try {
                    const scoresJson = JSON.parse(data);
                    scores = scoresJson;
                } catch (e) {
                    console.error('Erreur parsing JSON :', e.message);
                }
            });
        },
        //Ecriture d'un score dans la base de données
        writePersonnalScore(newScore) {
            if (
                !newScore ||
                !newScore.joueur1 ||
                !newScore.joueur2 ||
                !newScore.time
            ) {
                console.error('Score invalide');
                return;
            }
            let sql = 'INSERT INTO scores VALUES (default,?,?,?)';
            let winner, looser;
            if (newScore.winner === 1) {
                winner = newScore.joueur1;
                looser = newScore.joueur2;
            } else {
                winner = newScore.joueur2;
                looser = newScore.joueur1;
            }

            con.query(sql, [winner, looser, newScore.time], (err, result) => {
                if (err) {
                    console.error('Erreur insertion score :', err.message);
                    return;
                }
                console.log('1 record inserted');
                console.log(result);
                sql = 'INSERT INTO pionts VALUES (?,?,?)';
                for (let i in newScore.tabj1) {
                    con.query(
                        sql,
                        [result.insertId, i, newScore.tabj1[i].nombreRestant],
                        (err, result2) => {
                            if (err)
                                console.error(
                                    'Erreur insertion pionts j1 :',
                                    err.message
                                );
                        }
                    );
                }
                for (let i in newScore.tabj2) {
                    con.query(
                        sql,
                        [
                            result.insertId,
                            parseInt(i) + 12,
                            newScore.tabj2[i].nombreRestant,
                        ],
                        (err, result2) => {
                            if (err)
                                console.error(
                                    'Erreur insertion pionts j2 :',
                                    err.message
                                );
                        }
                    );
                }
            });
        },
        //Fonction qui renvoie tous les scores de quelqu'un à partir d'un nom
        readPersonnalScore(name) {
            //If you want to use this, careful that it's an async function
            //there is a promise to use it, with this form:
            // scoreHandler.readPersonnalScore("name here").then(function here)
            return new Promise((resolve, reject) => {
                con.query(
                    'SELECT * FROM scores WHERE winner = ? OR looser = ?',
                    [name, name],
                    (err, result) => {
                        if (err) {
                            console.error(
                                'Erreur lecture scores :',
                                err.message
                            );
                            return reject(err);
                        }
                        if (!result.length) return resolve([]);
                        let count = 0;
                        for (let i of result) {
                            con.query(
                                'SELECT * FROM pionts WHERE idscores = ?',
                                [i.idscores],
                                (err, result2) => {
                                    if (err) {
                                        console.error(
                                            'Erreur lecture pionts :',
                                            err.message
                                        );
                                        return reject(err);
                                    }
                                    let tab = [];
                                    for (let j of result2) {
                                        tab.push(j.quantity);
                                    }
                                    let Data = {
                                        winner: i.winner,
                                        looser: i.looser,
                                        time: i.time,
                                        pieces: tab,
                                    };
                                    scores.push(Data);
                                    count++;
                                    if (count === result.length) {
                                        resolve(scores);
                                    }
                                }
                            );
                        }
                    }
                );
            });
        },
        getScores() {
            return scores;
        },
    };
})();

module.exports = scoreHandler;
