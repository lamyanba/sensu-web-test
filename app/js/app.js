'use strict';


// Declare app level module which depends on filters, and services

angular.module('SensuWebApp', [
  'SensuWebApp.controllers',
  'SensuWebApp.services',
  'SensuWebApp.filters',
  'ngRoute',
  'ui.bootstrap'
]).
config(['$routeProvider', function($routeProvider){
  $routeProvider.
    when("/checks", {templateUrl: "partials/checks.html", controller: "checksController"} ).
    when("/checks/:name", {templateUrl: "partials/check.html", controller: "checkController"}).
    when("/stashes", {templateUrl: "partials/stashes.html", controller: "stashesController"}).
    when("/events", {templateUrl: "partials/events.html", controller: "eventsController"}).
    when("/clients", {templateUrl: "partials/clients.html", controller: "clientsController"}).
    when("/clients/:name", {templateUrl: "partials/client.html", controller: "clientController"}).
    when("/home", {templateUrl: "partials/home.html", controller: "homeController"}).

    otherwise({redirectTo: '/home'});

}]);
/*
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
*/
