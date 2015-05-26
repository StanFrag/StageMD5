/**
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

// Module necessaire au bon fonctionnement du traitement
var _ = require('lodash'),
    Q = require('q');

exports.create = function(req,res){

  console.log('Reception d\'une requete de traitement de matching md5. Debut du traitement.');

  var start       =   process.hrtime(),     // Debut du calcul du temps de traitement
      matchCount  =   0,                    // Nombre d'entité matché
      objSend     =   {                     // Creation du json qui sera envoyé au client
                        'array':[],
                        'stats': []
                      };

  // Si le req est bien defini grace à l'envoi du client
  if(req.body){

    var decodeClient    =   decodeURIComponent(req.body.client),    // Decodage des deux fichier CSV recus
        decodeIntern    =   decodeURIComponent(req.body.intern),
        firstArray      =   JSON.parse(decodeClient),               // Parse des deux base de donnée CSV
        secondArray     =   JSON.parse(decodeIntern),
        promises        =   [];                                     // Creation d'un tableau de promesse pour le traitement

    // Push des premiers donnée statistiques liée au traitement
    objSend.stats.push({'baseOne' : firstArray.length});
    objSend.stats.push({'baseTwo' : secondArray.length});

    // Lancement du traitement de match pour chaque entité du premier tableau
    for(var i = 0; i < firstArray.length; i++){
      // Push de la fonction dans le tableau des promises
      promises.push(matchingTraitement(i));
    }

    // Lorsque toute les promesses ont ete terminé on envoi la reponse au client
    Q.all(promises).then(function(results) {

      console.info("Traitement des match effectué avec succes");

      // Recuperation du temps de traitement
      var tmpMs = elapsed_time();
      var tmp = msToS(tmpMs);

      // Push des données statistiques apres traitement
      objSend.stats.push({'nbrMatch' : matchCount});
      objSend.stats.push({'tmpTraitement' : tmp});

      // Envoi au client du resultat
      res.json(encodeURIComponent(JSON.stringify(objSend)));

    }, function(reason) {
      // Recuperation de l'erreur des promises
      console.error(reason);
      // Reponse au client de l'erreur
      res.status(500).send('Contact Support');
    });

  }else{
    // Reponse au client de l'erreur
    res.status(404).send('Not found');
  }

  function matchingTraitement(i){

    var deferred = Q.defer();

    var promisesSecond = [];

    // Lancement du traitement de match
    for(var u = 0; u < secondArray.length; u++){
      promisesSecond.push(verifMatch(i,u));
    }

    // Si l'ensemble des promises renvoient une reponse positive on envoi une reponse positive au niveau d'arborescence superieur
    Q.all(promisesSecond).then(function(results) {
      deferred.resolve();
    }, function(reason) {
      deferred.reject();
    });

    return deferred.promise;
  }

  function verifMatch(i,u){

    var deferred = Q.defer();

    if(firstArray[i][0] == secondArray[u][0]){
      // creation d'une variable contenant la donnée amtch
      var tmpObj = firstArray[i][0];

      if(tmpObj != ""){

        // Permet de retirer les données deja match, pour ne pas avoir de doublon
        firstArray.splice(i,1);
        secondArray.splice(u,1);

        // on push la donné match dans le nouveau tableau
        objSend.array.push({'MD5 mail':tmpObj});

        matchCount++;

        // On resolve la promise
        deferred.resolve();
      }else{
        // On resolve la promise
        deferred.resolve();
      }

    }else{
      deferred.resolve();
    }

    return deferred.promise;
  }

  var elapsed_time = function(note){
      var precision = 3; // 3 decimal places
      var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
      start = process.hrtime(); // reset the timer
      var tmp = elapsed.toFixed(precision);
      return tmp;
  }

  function msToS (milliseconds) {

      var temp = milliseconds / 100;
      var seconds = temp % 60;

      return seconds.toFixed(2) + " secondes";
  }

}

