'use strict';

angular.module('gameModule', [])

.controller('GameCtrl', function($scope, $http, $routeParams, $location, $q) {

    var gameUrl =('http://apresmatch.fr/api/platini/game/' + $routeParams.gameId);
    $scope.tweetNb = 10;

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
        $scope.game = $scope.homeTeamShort + $scope.awayTeamShort;
    });

    $scope.noAmp = function (trend) {
        var text = trend.text;
        text = text.replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<');
        trend.text = text;
        return trend;
    }


    $scope.getTrends = function() {
        $scope.loading = true;
        var loadedTweets = loadTweets($scope, $http, $q);
        loadedTweets.then(function(tweetsLoaded){
            $scope.loading = false;
            $scope.trends = [];
            $scope.trends = $scope.trends.concat(tweetsLoaded.trends);
            $scope.oldTweet = tweetsLoaded.oldTweet;
        })
    }

    $scope.moreTweets = function() {
        $scope.loadingMore = true;
        var loadedTweets = loadTweets($scope, $http, $q);
        loadedTweets.then(function(tweetsLoaded){
            $scope.loadingMore = false;
            $scope.trends = $scope.trends.concat(tweetsLoaded.trends);
            $scope.oldTweet = tweetsLoaded.oldTweet;
        })

    }

})


.filter('unique', function() {
    return function(collection, keyname) {
        var output = [];
        var keys = [];

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

function loadTweets ($scope, $http, $q) {
    var deferred = $q.defer();
    var tweetQuery = $scope.game + '/' + $scope.tweetNb + (typeof($scope.oldTweet)!=undefined?('/'+$scope.oldTweet):'');
    var loadTweetsUrl = 'http://matuidi.herokuapp.com/api/tweets/' + tweetQuery;
    $http.get(loadTweetsUrl).success(function(data){
        var trends = data.tweets.statuses;
        for (var trend in trends) {
            var temp = trends[trend].retweeted_status;
            var rtId = trends[trend].id;
            if (temp != undefined) {
                trends[trend] = temp;
            }
            trends[trend].rtId= rtId;
            var date = new Date(trends[trend].created_at);
            trends[trend].smallDate= date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " à " + date.getHours() + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes();
        }
        var trendsNb = trends.length;
        console.log(trends);
        deferred.resolve({
        'trends' : trends,
        'oldTweet' : (typeof(trends[trendsNb-1])==undefined?'':trends[trendsNb-1].rtId)
        })
    })
    .error(function(data){
        $scope.error = 1;
    });
    return deferred.promise;
}
