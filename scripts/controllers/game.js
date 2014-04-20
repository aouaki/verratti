'use strict';

angular.module('gameModule', [])

.controller('GameCtrl', function($scope, $http, $routeParams, $location) {

    var gameUrl =('http://apresmatch.fr/api/platini/game/' + $routeParams.gameId);

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

    $http.get(gameUrl).success(function (data) {
        $scope.awayTeam=data.away_team;
        $scope.homeTeam=data.home_team;
        $scope.gameDate=data.date;
        $scope.championship=data.championship;
        $scope.homeTeamShort=$scope.clubShort[data.home_team.id];
        $scope.awayTeamShort=$scope.clubShort[data.away_team.id];
        console.log(data);
    });

    $scope.setGame = function(game){
        $location.url('/game/' + game);
    }

    $scope.getTrends = function() {
        $scope.game = $scope.homeTeamShort + $scope.awayTeamShort;
        $scope.loading = true;
        $http.get('http://matuidi.herokuapp.com/api/tweets/' + $scope.game).success(function(data){
            $scope.loading = false;
            var trends = data.tweets.statuses;
            for (var trend in trends) {
                var temp = trends[trend].retweeted_status;
                if (temp != undefined) {
                    trends[trend] = temp;
                }
                var date = new Date(trends[trend].created_at);
                trends[trend].smallDate= date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " à " + date.getHours() + ":" + date.getMinutes();
            }
            $scope.trends = trends;
        })
        .error(function(data){
            $scope.loading=false;
            $scope.error = 1
        });
    }
    
    // Uncomment for auto loading of tweets
    // $scope.getTrends();

    $scope.noAmp = function (trend) {
        var text = trend.text;
        text = text.replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<');
        trend.text = text;
        return trend;
    }

})


.filter('unique', function() {
    return function(collection, keyname) {
        var output = [], 
keys = [];

angular.forEach(collection, function(trend) {
    var key = trend.id;
    if(keys.indexOf(key) === -1) {
        keys.push(key);
        output.push(trend);
    }
});

return output;
};
});
