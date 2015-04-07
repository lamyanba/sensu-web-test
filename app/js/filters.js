'use strict';

/* Filters */

angular.module('SensuWebApp.filters', []).
  filter('environment', function() {
    return function(clientList, env){

    var prodClients = [];

    for(var i = 0; i < clientList.length; i++) 
        if (clientList[i].environment == env){ 
            prodClients.push(clientList[i]);
        }
    return prodClients;
    }
    
  }).
  filter('role', function(){
    return function(clients, rolename){
 
        var roleClients = [];
        angular.forEach(clients, function(client){
            if (client.role == rolename){ 
                roleClients.push(client);
            }

        });
        return roleClients;

  }
}).
  filter('filterFilter', function (filterFilter) {
    return function eventSelection(input, prop) {
      return filterFilter(input, { selected: true }).map(function (evnt) {
        return evnt[prop];
      });
    };
  });
 
/*
angular.module('SensuWebApp.filters', []).
  filter('environment', [function(){
    return function(clientList){

    var prodClients = [];
    for(var i = 0; i < clientList.length; i++) 
        if (clientList[i].environment == 'tlprod'){ 
            prodClients.push(clientList[i]);
        }
    return prodClients;
    }
    
  }]);
 
*/ 
/*
angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);
*/
