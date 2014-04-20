'use strict';

angular
  .module('TwitterFootbar', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'gameModule',
    'mainModule'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        controller: 'MainCtrl'
      })
      .when('/:championshipId', {
        templateUrl: 'views/index.html',
        controller: 'MainCtrl'
      })
      .when('/game/:gameId', {
        templateUrl : 'views/game.html',
        controller: 'GameCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
