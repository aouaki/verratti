'use strict';

angular.module('mainModule', [])

.controller('MainCtrl', function($scope, $http, $routeParams, $location, $q) {


    //Hardcode of hashtags for teams' ids
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

    //loading week's games when loading page
    var loadedWeek = loadWeek($scope, $routeParams, $http, $routeParams.weekId, $q);
    loadedWeek.then(function(week) {
        $scope.games = week.games;
        $scope.week = week.week;
    })

});

//function loading list of games for the week
function loadWeek ($scope, $routeParams, $http, weekNumber, $q) {
    var deferred = $q.defer();
    var weekQuery = (weekNumber==undefined) ? 'current_week' : ('week=' + weekNumber);
    var championshipId = 1;
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
