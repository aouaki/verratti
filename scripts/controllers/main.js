'use strict';

angular.module('mainModule', [])

.controller('MainCtrl', function($scope, $http, $routeParams, $location, $q) {


    $scope.clubShort = {};
    $scope.clubShort["1"] = "PSG";
    $scope.clubShort["2"] = "ACA";
    $scope.clubShort["3"] = "MHSC";
    $scope.clubShort["4"] = "FCGB";
    $scope.clubShort["5"] = "EAG";
    $scope.clubShort["6"] = "FCSM";
    $scope.clubShort["7"] = "ETG";
    $scope.clubShort["8"] = "TFC";
    $scope.clubShort["9"] = "VAFC";
    $scope.clubShort["10"] = "ASM";
    $scope.clubShort["11"] = "OL";
    $scope.clubShort["12"] = "FCN";
    $scope.clubShort["13"] = "LOSC";
    $scope.clubShort["14"] = "SRFC";
    $scope.clubShort["15"] = "OM";
    $scope.clubShort["16"] = "OGCN";
    $scope.clubShort["17"] = "ASSE";
    $scope.clubShort["18"] = "FCL";
    $scope.clubShort["19"] = "SCB";
    $scope.clubShort["20"] = "SR";

    var loadedWeek = loadWeek($scope, $routeParams, $http, 'current', $q);
    loadedWeek.then(function(week) {
        console.log(week);
        $scope.games = week.games;
        $scope.week = week.week;
    })

});

function loadWeek ($scope, $routeParams, $http, weekNumber, $q) {
    var deferred = $q.defer();
    var weekQuery = (weekNumber=='current') ? 'current_week' : ('week=' + weekNumber);
    var championshipId = ($routeParams.championshipId==undefined) ? '1' : ($routeParams.championshipId);
    var gameListUrl = ('http://apresmatch.fr/api/platini/game/?championship=' + championshipId + '&' + weekQuery);
    $http.get(gameListUrl).success(function (data) {
        var games = data.objects;
        if (games.length) {
            deferred.resolve({
            'week' : games[0].week,
            'games' : games
            })
        }
    });
    return deferred.promise;
}


