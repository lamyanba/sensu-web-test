'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.


angular.module('SensuWebApp.services', []).
  factory('SensuAPIservice', function($http) {

    var sensuAPI = {};
    var sensuUrl = "###url that sensu api is listening on ### "

    sensuAPI.getChecks = function() {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/checks"
      });
    }
    
    
    sensuAPI.getCheckDetails = function(name) {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/checks/" + name
      });
    }
 
    sensuAPI.getClientDetails = function(name) {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/client/" + name
      });
    }
    
    
    sensuAPI.getClients = function() {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/clients"
      });
    }

    sensuAPI.getStashes= function() {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/stashes"
      });
    }

    sensuAPI.createStashes= function(path, info) {
      return $http({
        method: 'POST', 
        url: sensuUrl + "/stashes/" + path,
        data: info
      });
    }
 
    sensuAPI.deleteStash = function(path) {
      return $http({
        method: 'DELETE', 
        url: sensuUrl + "/stashes/" + path
      });
    }
    
   
    sensuAPI.getClientDetails = function(name) {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/clients/" + name
      });
    }
 
    sensuAPI.getEvents = function() {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/events"
      });
    }
 
    sensuAPI.getClientEvents = function(client) {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/events/" + client
      });
    }
 
    sensuAPI.getClientEvent = function(client, eventname) {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/events/" + client + "/" + eventname
      });
    }

    
    sensuAPI.getClientHistory = function(client) {
      return $http({
        method: 'GET', 
        url: sensuUrl + "/clients/" + client + "/history",
        data: '',
        headers: {
            "Content-Type": "application/json"
        }
      });
    }


    sensuAPI.getClientByEnvRole = function() {
      var clientsByEnvRole = {};
      var status = null;
      var promise = $http({
        method: 'GET', 
        url: sensuUrl + "/clients"
      });

      promise.success(
        function(response){
          angular.forEach(response, function(client){
              //angular.forEach(clientInfo, function(client){
                  //console.log("role: " + client.role);
                  //console.log("env: " + client.environment);
                  if(!angular.isObject(clientsByEnvRole[client.environment])){
                      //console.log("adding: env" + client.environment);
                      clientsByEnvRole[client.environment] = {};
                  }

                  if(!angular.isObject(clientsByEnvRole[client.environment][client.role])){
                    //console.log("adding: role to " + client.environment + ": " + client.role);
                    clientsByEnvRole[client.environment][client.role] = {} ;
                    clientsByEnvRole[client.environment][client.role]['clients'] = [];
                    clientsByEnvRole[client.environment][client.role]['critical'] = 0;
                    clientsByEnvRole[client.environment][client.role]['warning'] = 0;
                    clientsByEnvRole[client.environment][client.role]['count'] = 0;
                  }
                  clientsByEnvRole[client.environment][client.role]['clients'].push(client);
                  //console.log("client: " +clientsByEnvRole[client.environment][client.role]['clients']);
                  clientsByEnvRole[client.environment][client.role]['count'] += 1;
                  var clientHistory = sensuAPI.getClientHistory(client.name);
                  clientHistory.then(function(response){
                    angular.forEach(response, function(check){
                      if(check.last_status == 2 ) clientsByEnvRole[client.environment][client.role]['critical'] += 1;
                      if(check.last_status == 1 ) clientsByEnvRole[client.environment][client.role]['warning'] += 1;
                    });
                  }, function(respose){
                      console.log("Error: error trying to get history for client " + client.name);
           
                  });
                  //console.log("Info: " + clientsByEnvRole);
    

              //});
          });
          console.log("here 1");
          angular.forEach(clientsByEnvRole['tlprod']['api']['clients'], function(value){
              //console.log("key: " + key);
              console.log("value: " + value);
          } );
          return clientsByEnvRole;
        }); 

        promise.error(function(response){
             console.log("Error: error trying to get clients " );
           
        });
    }
    


    return sensuAPI;
  });
