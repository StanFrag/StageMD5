'use strict';

angular.module('md5App')
.controller('MainCtrl', function ($scope, $http, cfpLoadingBar, $route) {

	// Creation d'une date pour le titre de l'export
   	var today = new Date(); 
	var dd = today.getDate(); 
	var mm = today.getMonth()+1;//January is 0! 
	var yyyy = today.getFullYear(); 
	var hour = today.getHours();
	var min = today.getMinutes();

	// modification pour le format, permet de faire la date proprement
	if(dd<10){dd='0'+dd} 
	if(mm<10){mm='0'+mm}
	if(min<10){min='0'+min}

	// Etat de la page: le fichier a il ete traité?
	$scope.istreated = false;

	// Tableaux contenant les previews des fichiers traités
    $scope.csvPreview = [];
	$scope.jsonPreview = [];
	$scope.recapPreview = [];

	// Option de l'import du fichier csv
    $scope.csvExport = 
    	{
    		title : "MD5-Match " + hour +"h"+ min + ' ' + dd+'-'+mm+'-'+yyyy,
    		headName : "MD5 Mail"
    	};

    // Options des objets crée à l'import 
    $scope.csvClient = {
    	name: null,
	    content: null,
	    header: true,
	    separator: ',',
	    result: null
    };

    $scope.csvIntern = {
    	name: null,
	    content: null,
	    header: true,
	    separator: ',',
	    result: null
    };

    // Fonction de demarage de la barre de progression
    $scope.start = function() {
      cfpLoadingBar.start();
    };

    // Fonction de fin de barre de progression
    $scope.complete = function () {
      cfpLoadingBar.complete();
    };

    // Fonction d'envoi du traitement
    $scope.startMatch = function() {
	    
	    // On lance la barre de progression
	    $scope.start();

	    // Verification que les deux fichiers pour le matching sont bien importé
	    if(!$scope.csvClient.content || !$scope.csvIntern.content){
	    	// Si non on previent le client
	    	alert("Veuillez integrer les fichiers de bases de données avant de continuer");
	    }else{

	    	console.log("result: ",$scope.csvClient.result);
	    	console.log("content: ",$scope.csvClient.content);

	    	var contentClient = encodeURIComponent(JSON.stringify($scope.csvClient.result));
	    	var contentIntern = encodeURIComponent(JSON.stringify($scope.csvIntern.result));

	    	// Envoi au serveur de la demande de traitement avec les deux fichiers importés
	    	$http({
    			url:'/api/matchs',
    			method: 'POST',
    			data: {'client': contentClient, 'intern':contentIntern},
    			headers: {'Content-Type': 'application/json'}
	    	})
	    	.success(function(data, status, headers, config) {
	    		// En cas de succes du traitement
	    		// Reponse du serveur avec envoi du resultat de traitement: data
	    		var objDecode = decodeURIComponent(data);
	    		var obj = JSON.parse(objDecode);

	    		// On stop la barre de progression
	    		$scope.complete();

	    		// On attribue la json recuperé au preview
	    		$scope.jsonPreview = obj.array;

	    		$scope.recapPreview = 'Nombre d\'entité dans le premier fichier CSV: ' + obj.stats[0].baseOne + '\r\n'
	    							+ 'Nombre d\'entité dans le second fichier CSV: ' + obj.stats[1].baseTwo + '\r\n\n'
	    							+ 'Nombre de match entre les deux fichiers de MD5: ' + obj.stats[2].nbrMatch + '\r\n\n'
									+ 'Traitement effectué en ' + obj.stats[3].tmpTraitement;

	    		// On lance la conversation pour l'export du CSV
	    		$scope.JSONToCSVConvertor(obj.array, $scope.csvExport.headName);
		    })
		    .error(function(err){
		    	// En cas de reponse negative du serveur, on envoi une alerte au client
		    	alert("Veuillez contacter le support, erreur: ", err);
		    });
	    }
	};

	// Fonction de conversation et d'export du CSV
	$scope.JSONToCSVConvertor = function(JSONData, ReportTitle) {

	    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
	    //Si le json recuperé nest pas un objet alors on parse le sting json en objet
	    var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
	    
	    var CSV = '';
	    
	    // Mise en place du header
	    CSV += ReportTitle + '\r\n';
	    
	    //1st loop is to extract each row
	    for (var i = 0; i < arrData.length; i++) {
	        var row = "";
	        
	        //2nd loop will extract each column and convert it in string comma-seprated
	        for (var index in arrData[i]) {
	            row += '"' + arrData[i][index] + '",';
	        }

	        row.slice(0, row.length - 1);
	        
	        //add a line break after each row
	        CSV += row + '\r\n';
	    }

	    if (CSV == '') {        
	        alert("Invalid data");
	        return;
	    }

	    $scope.csvPreview = CSV;
	    $scope.istreated = true;
	}

	$scope.exportCSV = function(csv, title) {
		//Generate a file name
	    var fileName = title;

	    //this will remove the blank-spaces from the title and replace it with an underscore
	    fileName = fileName.replace(/ /g,'_');
	    
	    //Initialize file format you want csv or xls
	    var uri = 'data:text/csv;charset=utf-8,' + escape(csv);
	    
	    // Now the little tricky part.
	    // you can use either>> window.open(uri);
	    // but this will not work in some browsers
	    // or you will not get the correct file extension    
	    
	    //this trick will generate a temp <a /> tag
	    var link = document.createElement("a");    
	    link.href = uri;
	    
	    //set the visibility hidden so it will not effect on your web-layout
	    link.style = "visibility:hidden";
	    link.download = fileName + ".csv";
	    
	    //this part will append the anchor tag and remove it after automatic click
	    document.body.appendChild(link);
	    link.click();
	    document.body.removeChild(link);
	}

	$scope.exportJSON = function(json, title) {

		//Generate a file name
	    var fileName = title;

	    //this will remove the blank-spaces from the title and replace it with an underscore
	    fileName = fileName.replace(/ /g,'_');
	    
	    //Initialize file format you want csv or xls
	    var uri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));  
		var a = document.createElement('a');

		a.href = uri;
		a.target = '_blank';
		a.style = "visibility:hidden";
		a.download = fileName + '.json';

		document.body.appendChild(a);
		a.click();
	}

	$scope.exportTxt = function(text, title) {

		//Generate a file name
	    var fileName = "RECAP_" + title;

	    //this will remove the blank-spaces from the title and replace it with an underscore
	    fileName = fileName.replace(/ /g,'_');
	    
	    //Initialize file format you want csv or xls
	    var uri = "data:text/html;charset=utf-8," + escape(text);  
		var a = document.createElement('a');

		a.href = uri;
		a.target = '_blank';
		a.style = "visibility:hidden";
		a.download = fileName + '.txt';

		document.body.appendChild(a);
		a.click();
	}

	$scope.reloadLocation = function(){
		//$route.reload();
		window.location.reload();
	}

});
