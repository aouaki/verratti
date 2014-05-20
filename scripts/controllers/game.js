'use strict';

angular.module('gameModule', ['ui.bootstrap'])

.controller('GameCtrl', function($scope, $http, $routeParams, $location, $q) {

    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });

    $('.btn-toggle').click(function() {
        $(this).find('.btn').toggleClass('active').toggleClass('btn-default').toggleClass('btn-primary');
    });

    //Default tab is the tweet view
    $scope.tab = 0;

    //used to order tweets by the number of retweets
    $scope.predicate = '-retweet_count';
    
    //Initializing websocket and functions for voting
    var socket = io.connect('http://matuidi.herokuapp.com:80');

    $scope.voteFor = function(choice){
        socket.emit('vote', {vote : choice }, function(data){
        }
        )
    }

    socket.on('votes', function(msg){
        $scope.homeVote = msg.votes[$scope.homeTeam.id - 1];
        $scope.awayVote = msg.votes[$scope.awayTeam.id - 1];
        $scope.votePercent = Math.floor($scope.homeVote.votes * 100 / ($scope.homeVote.votes + $scope.awayVote.votes));
        $scope.$apply();
    });


    var gameUrl =('http://apresmatch.fr/api/platini/game/' + $routeParams.gameId);
    $scope.tweetNb = 10;

    //Hardcode of team's short name
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

    

    //Gets JSON for the game
    $http.get(gameUrl).success(function (data) {
        $scope.awayTeam=data.away_team;
        $scope.homeTeam=data.home_team;
        $scope.gameDate=data.date;
        $scope.championship=data.championship;
        $scope.homeTeamShort=$scope.clubShort[data.home_team.id];
        $scope.awayTeamShort=$scope.clubShort[data.away_team.id];
        $scope.game = $scope.homeTeamShort + $scope.awayTeamShort;
    });

    //Filter to replace some not working characters in the JSON. Will be used soon
    $scope.noAmp = function (trend) {
        var text = trend.text;
        text = text.replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<');
        trend.text = text;
        return trend;
    }

    //gets the tweets for the loading of the view
    $scope.getTrends = function(type) {
        $scope.loading = true;
        var loadedTweets = loadTweets($scope, $http, $q, type);
        loadedTweets.then(function(tweetsLoaded){
            $scope.loading = false;
            if (type=='tweets'){
                $scope.trends = [];
                $scope.trends = $scope.trends.concat(tweetsLoaded.trends);
                $scope.oldTweet = tweetsLoaded.oldTweet;
            }
            if (type=='goals') {
                $scope.goalTrends = [];
                $scope.goalTrends = $scope.goalTrends.concat(tweetsLoaded.trends);
                $scope.oldGoalTweet = tweetsLoaded.oldTweet;
            }
        })
    }

    //function to get more tweets than the ones currently loaded
    $scope.moreTweets = function(type) {
        $scope.loadingMore = true;
        var loadedTweets = loadTweets($scope, $http, $q, type);
        loadedTweets.then(function(tweetsLoaded){
            if (type=='tweets'){
                $scope.loadingMore = false;
                $scope.trends = $scope.trends.concat(tweetsLoaded.trends);
                $scope.oldTweet = tweetsLoaded.oldTweet;
            }
            if (type=='goals'){
                $scope.loadingMore = false;
                $scope.goalTrends = $scope.trends.concat(tweetsLoaded.trends);
                $scope.oldGoalTweet = tweetsLoaded.oldTweet;
            }
        })

    }

    //function to change view between goals and tweets
    $scope.changeView = function(tab) {
        $scope.tab = tab
    }
})

//filter to remove retweets
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

//filter for goals tab to filter for current game
/*
.filter('gameHashtag', function() {
    return function(collection, keyname) {
        var output = [];
        var keys = [];

        angular.forEach(collection, function(trend) {
            var key = trend.id;
            if(text.indexOfkey) === -1) {
                keys.push(key);
                output.push(trend);
            }
        });

        return output;
    };
});
*/


//function used for every Twitter query
function loadTweets ($scope, $http, $q, type) {
    var deferred = $q.defer();
    if (type=='tweets'){
        var tweetQuery = $scope.game + '/' + $scope.tweetNb + (typeof($scope.oldTweet)!=undefined?('/'+$scope.oldTweet):'');
        var loadTweetsUrl = 'http://matuidi.herokuapp.com/api/tweets/' + tweetQuery;
    }
    if (type=='goals'){
        var loadTweetsUrl = 'http://matuidi.herokuapp.com/api/goaltweets/';
    }
    $http.get(loadTweetsUrl).success(function(data){
        var trends = data.tweets;
        if (type=='tweets'){
            trends = trends.statuses;
        }
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
