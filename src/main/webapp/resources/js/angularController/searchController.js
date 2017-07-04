var myApp = angular.module('myApp', []);
myApp.controller('searchController', function ($scope, $http) {
    $scope.dashboards = [];
    $scope.statistiques = [];
    $scope.username = "";

    $scope.init = function (username) {
        $scope.username = username.toLowerCase();
        
        $http.get("/Dashboard/rest/users/get/"+username.toLowerCase()).then(function(response){
            $scope.fullUser = response.data;
        });
        
        $http.get("/Dashboard/rest/dashboards/available/" + $scope.username).then(function (response) {
            console.log(response.data)
            for(var i=0;i<response.data.length;i++){
                if(response.data[i] != null)
                  $scope.dashboards.push(response.data[i]);
            }
        });
    }



    $scope.initStats = function (username) {
        $http.get("/Dashboard/rest/users/get/"+username.toLowerCase()).then(function(response){
            $scope.fullUser = response.data;
            console.log($scope.fullUser);
        });
        $scope.username = username.toLowerCase();
        $http.get("/Dashboard/rest/statistique/available/" + $scope.username).then(function (response) {
            for (var elem in response.data) {
                for (var i = 0; i < response.data[elem].length; i++) {
                    if (!$scope.foundStat(response.data[elem][i])) {
                        $scope.statistiques.push(response.data[elem][i])
                    }
                }

            }
        });
    }

    $scope.foundStat = function (stat) {
        for (var i = 0; i < $scope.statistiques.length; i++) {
            if ($scope.statistiques[i].id == stat.id)
                return true;
        }
        return false;
    }
    $scope.deleteStat = function (stat) {
        swal({
            title: "Êtes-vous sûr?",
            text: "La statistique sera supprimer!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Oui, supprimer !",
            closeOnConfirm: true
        },
                function () {

                    $http.post("/Dashboard/rest/statistiques/delete", stat).then(function (response) {
                        $scope.statistiques = [];
                        $scope.initStats($scope.username);
                    })
                });

    }

    $scope.deleteDashboard = function (dashboard) {
        console.log("bfzeb")
        swal({
            title: "Êtes-vous sûr?",
            text: "Le Dashboard sera supprimer!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Oui",
            closeOnConfirm: true
        },
                function () {
                    $http.post("/Dashboard/rest/dashboard/delete", dashboard).then(function () {
                        $.notify("Dashboard supprimer", "success");
                        $scope.init($scope.username);
                    });
                });
    }

});
