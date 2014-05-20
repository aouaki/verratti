'use strict';

angular.module('gameModule', ['ui.bootstrap'])

.controller('GameCtrl', function($scope, $http, $routeParams, $location, $q) {

    //used to order tweets by the number of retweets
    $scope.predicate = '-date';
    
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
        $scope.homeVotePercent = Math.floor($scope.homeVote.votes * 100 / ($scope.homeVote.votes + $scope.awayVote.votes));
        $scope.awayVotePercent = 100 - $scope.homeVotePercent;
        $scope.$apply();
    });


    var gameUrl =('http://apresmatch.fr/api/platini/game/' + $routeParams.gameId);
    $scope.tweetNb = 10;
    $scope.loading = true;

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

    $scope.filterModel = 'date';

    //Gets JSON for the game
    $http.get(gameUrl).success(function (data) {
        $scope.awayTeam=data.away_team;
        $scope.homeTeam=data.home_team;
        $scope.gameDate=data.date;
        $scope.championship=data.championship;
        $scope.homeTeamShort=$scope.clubShort[data.home_team.id];
        $scope.awayTeamShort=$scope.clubShort[data.away_team.id];
        $scope.game = $scope.homeTeamShort + $scope.awayTeamShort;
        $scope.getTrends('tweets');
        $scope.getTrends('goaltweets');
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
        if (type=='tweets'){
            $scope.loading = true;
        }
        if (type=='goaltweets'){
            $scope.loadingGoals = true;
        }
        var loadedTweets = loadTweets($scope, $http, $q, type, 'loadAll');
        loadedTweets.then(function(tweetsLoaded){
            if (type=='tweets'){
                $scope.loading = false;
                $scope.trends = [];
                $scope.trends = $scope.trends.concat(tweetsLoaded.trends);
                if (tweetsLoaded.oldTweet){
                    $scope.oldTweet = tweetsLoaded.oldTweet;
                }
                if (tweetsLoaded.newTweet){
                    $scope.newTweet = tweetsLoaded.newTweet;
                }
            }
            if (type=='goaltweets') {
                $scope.loadingGoals = false;
                $scope.goalTrends = [];
                $scope.goalTrends = $scope.goalTrends.concat(tweetsLoaded.trends);
                if (tweetsLoaded.newTweet){
                    $scope.newGoalTweet = tweetsLoaded.newTweet;
                }
            }
        })
    }

    //function to get more tweets than the ones currently loaded
    $scope.moreTweets = function(type) {
        if (type=='tweets'){
            $scope.loadingMore = true;
        }
        if (type=='goaltweets'){
            $scope.loadingMoreGoals = true;
        }
        var loadedTweets = loadTweets($scope, $http, $q, type, 'loadMore');
        loadedTweets.then(function(tweetsLoaded){
            $scope.loadingMore = false;
            $scope.trends = $scope.trends.concat(tweetsLoaded.trends);
            if (tweetsLoaded.oldTweet){
                $scope.oldTweet = tweetsLoaded.oldTweet;
            }
        })

    }

    //function to get newer tweets
    $scope.reloadTweets = function(type) {
        if (type=='tweets'){
            $scope.loading = true;
        }
        if (type=='goaltweets'){
            $scope.loadingGoals = true;
        }
        var loadedTweets = loadTweets($scope, $http, $q, type, 'reload');
        loadedTweets.then(function(tweetsLoaded){
            if (type=='tweets'){
                $scope.loading = false;
                $scope.trends = $scope.trends.concat(tweetsLoaded.trends);
                if (tweetsLoaded.newTweet){
                    $scope.newTweet = tweetsLoaded.newTweet;
                }
            }
            if (type=='goaltweets'){
                $scope.loadingGoals = false;
                $scope.goalTrends = $scope.trends.unshift(tweetsLoaded.trends);
                if (tweetsLoaded.newTweet){
                    $scope.newGoalTweet = tweetsLoaded.newTweet;
                }
            }
        })

    }

    $scope.tweetFilter = function (filter) {
        $scope.predicate=filter;
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
})

//filter for goals tab to filter for current game
.filter('gameHashtag', function() {
    return function(collection, scope) {
        var output = [];

        angular.forEach(collection, function(trend) {
            var text= trend.text;
            if(text.indexOf(scope.game) != -1) {
                output.push(trend);
            }
        });

        return output;
    };
});


//function used for every Twitter query
function loadTweets ($scope, $http, $q, type, query) {
    var deferred = $q.defer();
    var tweetQuery='';
    if (type!='goaltweets'){
        if (query=='loadAll'){
            tweetQuery = 'all/' + $scope.game + '/' + $scope.tweetNb ;
        }
        if (query=='loadMore'){
            tweetQuery = 'older/' + $scope.game + '/' + $scope.tweetNb + '/' + $scope.oldTweet;
        }
        if (query=='reload'){
            tweetQuery = 'newer/' + $scope.game + '/' + $scope.tweetNb + '/' + $scope.newTweet;
        }
    }
    var loadTweetsUrl = 'http://matuidi.herokuapp.com/api/' + type + '/' + tweetQuery;
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
        'oldTweet' : (trendsNb==0)?'':trends[trendsNb-1].rtId,
        'newTweet' : (trendsNb==0)?'':trends[0].rtId
        })
    })
    .error(function(data){
        $scope.error = 1;
    });
    return deferred.promise;
}
