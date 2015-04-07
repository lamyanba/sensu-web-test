'use strict';




/* SensuWeb Controllers */
angular.module('SensuWebApp.controllers', []).
controller('checksController', function($scope, SensuAPIservice) {
    
    $scope.checkFilter = null;
    $scope.checksList = [];
    
    /*
    $scope.searchCheckFilter = function(checks){
        var keyword = new RegExp(
            $scope.checkFilter, 'i'
        );
        return !$scope.checkFilter || keyword.test(check.Driver.givenName) || keyword.test(driver.Driver.familyName);
        
    }
    */
    
    // get list of checks from Sensu Api
    SensuAPIservice.getChecks().success(function (response) {
        //Dig into the responde to get the relevant data
        
        for(var i = 0; i < response.length; i++) {
            $scope.checksList.push(response[i].name);
        }
        
        
        //$scope.checksList = response;
    });
    

}).

controller('homeController', function($route, $scope, $timeout,  $interval,  SensuAPIservice, $log){
    $scope.timer = 120;


    $scope.onTimeout = function(){
        if($scope.timer == 0){
            $scope.timer = 120;
        }
        $scope.timer--;
        mytimeout = $timeout($scope.onTimeout,1000);
    }
    var mytimeout = $timeout($scope.onTimeout,1000);
    
    $scope.stop = function(){
        $timeout.cancel(mytimeout);
    }

    $scope.$watch('timer', function() {
        if ($scope.timer == 0) { $route.reload(); }
    }, true);

    $scope.reloadPage = function(){
        $route.reload();
        $scope.reloadCounter++;
    }

    $scope.fetchData = function(){

        var allChecks = SensuAPIservice.getChecks();
        $scope.homeChecks = [];

        // returns a promise which can be chained up later
        var getAllChecks = function(){
           return SensuAPIservice
               .getChecks()
               .then(function(response){
                   var homeChecks = [];
                   angular.forEach(response.data, function(check){
                       if(check.subscribers.indexOf("webchecks") != -1){
                           //$log.info("subscriber: " + check.name + " is a webcheck");
                           homeChecks.push(check.name);
                       }
                       if(check.subscribers.indexOf("critical-system") != -1){
                           //$log.info("subscriber: " + check.name + " is a critical-system");
                           homeChecks.push(check.name);
                       }
                   }) ;
                   $scope.homeChecks = homeChecks;
                   return homeChecks;
           }); 
           
        }, 
        getChecksStatus = function(homeChecks){
            return SensuAPIservice
                .getClientHistory('tl-sensu-i-c6e84bad')
                .then(function(response){
                    $scope.clientHistory = response.data; 
                    $scope.homeChecksStatus = {};
                    angular.forEach(response.data, function(checkInfo){
                        //$log.info("history before: " + checkInfo.check);
                        if (homeChecks.indexOf(checkInfo.check) != -1){
                            //$log.info("history after check: " + checkInfo.check + " in webcheck");
                            $scope.homeChecksStatus[checkInfo.check] = {};
                            $scope.homeChecksStatus[checkInfo.check]['last_execution'] = checkInfo.last_execution;
                            $scope.homeChecksStatus[checkInfo.check]['last_status'] = checkInfo.last_status;
                            $scope.homeChecksStatus[checkInfo.check]['history'] = checkInfo.history;
                            $scope.homeChecksStatus[checkInfo.check]['subscription'] = checkInfo.subscription;
                        }
                });
   
            });
        };

        // chain the async promise request so that checks are populated before we get the status 
        getAllChecks()
            .then(getChecksStatus);

        //Get events 
        SensuAPIservice.getEvents()
            .then(function(response){
                $scope.events = [];
                angular.forEach(response.data, function(event){
                    $scope.events.push(event); 
            });
        });
 
    } // End of Fetch function


    //$timeout(function() { $scope.fetchData(); }, 1000);
    $scope.fetchData()
    
    

}).

controller('homeControllerOld', function($scope, SensuAPIservice, $log){
    $scope.homeChecks = null;
    $scope.checks = [];
    $scope.clientHistory = null;
    $scope.criticalChecks = [];
    var webChecks = [];

    $scope.webChecksStatus = {};
    $scope.criticalCheckStatus = {};

     
    var allChecks = SensuAPIservice.getChecks();

    allChecks.then(function(response){
        angular.forEach(response.data, function(check){
            //$log.info(check.subscribers);
            if(check.subscribers.indexOf("webchecks") != -1){
               $log.info("subscriber: " + check.name + " is a webcheck");
               webChecks.push(check.name);
            }
            //$log.info("check: " + check.subscribers);
            if(check.subscribers.indexOf("critical-system") != -1){
               //$log.info("check: " + check.name + " is a critical system");
               $scope.criticalChecks.push(check.name);
            }
        });
    }, function(response){
        $log.error("Error: Couldnot not get checks from sensu api");
    });

    SensuAPIservice.getClientHistory('tl-sensu-i-c6e84bad').then(
        function(response){   //handle success response
            $scope.clientHistory = response;

            angular.forEach($scope.clientHistory.data, function(checkInfo){ 
                $log.info("history before: " + checkInfo.check);
                if (webChecks.indexOf(checkInfo.check) != -1){
                    $log.info("history after check: " + checkInfo.check + " in webcheck");
                    $scope.webChecksStatus[checkInfo.check] = {};
                    $scope.webChecksStatus[checkInfo.check]['last_execution'] = checkInfo.last_execution;
                    $scope.webChecksStatus[checkInfo.check]['last_status'] = checkInfo.last_status;
                    $scope.webChecksStatus[checkInfo.check]['history'] = checkInfo.history;
                }else if ($scope.criticalChecks.indexOf(checkInfo.check) != -1){
                    $scope.criticalChecksStatus[checkInfo.check] = {};
                    $scope.criticalChecksStatus[checkInfo.check]['last_execution'] = checkInfo.last_execution;
                    $scope.criticalChecksStatus[checkInfo.check]['last_status'] = checkInfo.last_status;
                    $scope.criticalChecksStatus[checkInfo.check]['history'] = checkInfo.history;

                }
                /*
                angular.forEach(check, function(data, key){
                   
                    if (!angular.isObject($scope.checksInfo[data.check])) $scope.checksInfo[data.check] = {}; // creat the object in case it doesnt exist

                    $scope.checksInfo[data.check]['last_execution'] = data.last_execution;
                    $scope.checksInfo[data.check]['last_status'] = data.last_status;
                    $scope.checksInfo[data.check]['history'] = data.history;
                    
                });
                */

                     
            });

        },
        function(response){ // handle errors
            $log.error("Error: Error trying to query sensu api for client history. Check Sensu api");
        }
    );


    
}).


controller('checkController', function($scope, $routeParams, SensuAPIservice){
    $scope.name = $routeParams.name;
    $scope.check = null;
    
    SensuAPIservice.getCheckDetails($scope.name).success(function (response) {
        $scope.check = response;
    });
    
    
}).

controller('clientsController', function($scope, $location, SensuAPIservice, $log){
    $scope.check = null;
    $scope.clientList = [];
    $scope.clientsByEnv = {};
    $scope.clientsByEnvRole = {};

    $scope.role = $location.search();

    if('role' in $scope.role){
        $log.info("role: " + $scope.role['role']);
    
    }else{
        $log.info("no role " );
    }
 
    $scope.status = { //control if the accordian group is open or not
        open: true
    };
    $scope.sensuStatusByRole = {};
  
    
    SensuAPIservice.getClients().success(function (response) {
        $scope.clientList = response;
        angular.forEach($scope.clientList, function(client){
 
             //placeholder to store critcal, warning and checks count
             client['critical'] = 0;
             client['warning'] = 0;
             client['checks'] = 0;
              // creat the object in case it doesnt exist
             if (!angular.isObject($scope.clientsByEnv[client.environment])) $scope.clientsByEnv[client.environment] = []; 
             $scope.clientsByEnv[client.environment].push(client);
             
             if(!angular.isObject($scope.clientsByEnvRole[client.environment])){
                 //console.log("adding: env" + client.environment);
                 $scope.clientsByEnvRole[client.environment] = {};
             }

             if(!angular.isObject($scope.clientsByEnvRole[client.environment][client.role])){
               //console.log("adding: role to " + client.environment + ": " + client.role);
               $scope.clientsByEnvRole[client.environment][client.role] = {} ;
               $scope.clientsByEnvRole[client.environment][client.role]['clients'] = [];
               $scope.clientsByEnvRole[client.environment][client.role]['critical'] = 0;
               $scope.clientsByEnvRole[client.environment][client.role]['warning'] = 0;
               $scope.clientsByEnvRole[client.environment][client.role]['count'] = 0;
             }
             //console.log("client: " +$scope.clientsByEnvRole[client.environment][client.role]['clients']);
             $scope.clientsByEnvRole[client.environment][client.role]['count'] += 1;
             var clientHistory = SensuAPIservice.getClientHistory(client.name);
             clientHistory.then(function(response){
               angular.forEach(response, function(check){
                 client['checks'] += 1;
                 if(check.last_status == 2 ) { 
                     $scope.clientsByEnvRole[client.environment][client.role]['critical'] += 1;
                     client['critical'] += 1;
                 }
                 if(check.last_status == 1 ){
                     $scope.clientsByEnvRole[client.environment][client.role]['warning'] += 1;
                     client['warning'] += 1;

                 }
               });
             }, function(respose){
                 console.log("Error: error trying to get history for client " + client.name);
           
             });
             $scope.clientsByEnvRole[client.environment][client.role]['clients'].push(client);
          });
        });
    
    
}).

controller('clientController', function($scope, $routeParams, SensuAPIservice, $log){
    $scope.name = $routeParams.name;
    $scope.client = null;
    $scope.subscription = null;
    $scope.clientChecks = [];
    $scope.subcriptionsChecks = {};
    $scope.clientHistory = null;
    $scope.checksInfo = {};

    SensuAPIservice.getClientHistory($scope.name).then(
        function(response){   //handle success response
            $scope.clientHistory = response;
            /*
            for(var i = 0; i < $scope.clientHistory.length; i++){
               $log.info("Check: " + response[i].check);
                
            }
            */ 

            angular.forEach($scope.clientHistory, function(check){ 

                angular.forEach(check, function(data, key){

                    if (!angular.isObject($scope.checksInfo[data.check])) $scope.checksInfo[data.check] = {}; // creat the object in case it doesnt exist

                    $scope.checksInfo[data.check]['last_execution'] = data.last_execution;
                    $scope.checksInfo[data.check]['last_status'] = data.last_status;
                    $scope.checksInfo[data.check]['history'] = data.history;
                    
                });

                     
            });

        },
        function(response){ // handle errors
            $log.error("Error: Error trying to query sensu api for client history. Check Sensu api");
        }
    );


    
    SensuAPIservice.getClientDetails($scope.name).success(function (response) {
       $scope.client = response;
       $scope.subscriptions = $scope.client.subscriptions;

       SensuAPIservice.getChecks().success(function (checkList) {
           
           for(var i = 0; i < checkList.length; i++) {
               for(var s = 0; s < $scope.subscriptions.length; s++){
                   if(checkList[i].subscribers.indexOf($scope.subscriptions[s]) != -1){

                       if (!angular.isObject($scope.subcriptionsChecks[$scope.subscriptions[s]])) $scope.subcriptionsChecks[$scope.subscriptions[s]] = []; // creat the object in case it doesnt exist

                       if(checkList[i].name in $scope.checksInfo){
                          
                           //popuplate all the data in checksInfo into the checkList 
                           angular.forEach($scope.checksInfo[checkList[i].name], function(data, key){
                               checkList[i][key] = data;
                           });
                       }
                       
                       checkList[i]['subscription'] = $scope.subscriptions[s]; // add the subcription info to the checkList
                       $scope.subcriptionsChecks[$scope.subscriptions[s]].push(checkList[i]);
                       $scope.clientChecks.push(checkList[i]);
                   }
               }
           }
       });


    });
    
    
}).

controller('reloadController', function($scope, $location, $route, SensuAPIservice, $log, $timeout){
    $scope.reloadCounter = 0;
    $scope.reloadPage = function(){
        $route.reload();
        $scope.reloadCounter++;
    }
}).

controller('eventsController', function($scope, filterFilter, SensuAPIservice, $route, $log, $timeout){
        //Get events 
    $scope.events = [];
    $scope.selectedEvents = [];
    $scope.stashes = [];
    $scope.timer = 120;

    $scope.onTimeout = function(){
        if($scope.timer == 0){
            $scope.timer = 120;
        }
        $scope.timer--;
        mytimeout = $timeout($scope.onTimeout,1000);
    }

    var mytimeout = $timeout($scope.onTimeout,1000);

    $scope.$watch('timer', function() {
        if ($scope.timer == 0) { $route.reload(); }
    }, true);

    $scope.reloadPage = function(){
        $route.reload();
        $scope.reloadCounter++;
    }

    var updateData = function(){

       var getAllStashes = function(){
          return SensuAPIservice
              .getStashes()
              .then(function(response){
                  var stashes = [];
                  angular.forEach(response.data, function(stash){
                          //$log.info("subscriber: " + check.name + " is a critical-system");
                          stashes.push(stash.path);
                      }
                  ) ;
                  $scope.stashes = stashes;
                  return stashes;
          }); 
          
       }, 

       fetchEvents = function() {
           return SensuAPIservice.getEvents()
               .then(function(response){
                   var events = [];
                   angular.forEach(response.data, function(event){
                       event['selected'] = false;  // create a selected key and assign it to false
                       if($scope.stashes.indexOf("silence/" + event.client + "/" + event.check ) != -1){
                           event['silenced'] = true;  
                       }else{
                           event['silenced'] = false;  
                       }
                       $scope.events.push(event); 
               });
           });
       };


       getAllStashes()
           .then(fetchEvents);
  
    }

    // populate the scope data
    updateData();

    $scope.checkAll = function(){
        angular.forEach($scope.events, function(event){
            event['selected'] = true;
        });
    }

    $scope.unCheckAll = function(){
        angular.forEach($scope.events, function(event){
            event['selected'] = false;
        });
    }

    $scope.selection = []; 
    // helper method
    $scope.selectedEvents = function selectedEvents() {
      return filterFilter($scope.events, { selected: true });
    };

    //$scope.$watch('events|filter:{selected:true}', function (nv) {
    //  $scope.selection = nv.map(function (evnt) {
    //    return evnt;
    //  });
    //}, true);

    $scope.silenceEvents = function(){
        angular.forEach($scope.events, function(evnt){
            if(evnt.selected == true){
                var timestamp = new Date().getTime();
                console.log("silencing: " + evnt.client+ "/" + evnt.check + " : " + timestamp);
                var path = 'silence/' + evnt.client + '/' + evnt.check;
                var data = {"content": { "timestamp": timestamp, "description": "created by angular-web"} }

                SensuAPIservice.createStashes(path, data).then(function(response){
                    evnt['silenced'] = true;

                }, function(response){
                    $log.warning("Could not Create Stash : " + path + "\n");
                });
 
                
            }
        });
        //$scope.$watch('events', function(){
        //    
        //});

    }



    $scope.unSilenceEvents = function(){
        angular.forEach($scope.events, function(evnt){
            if(evnt.selected == true){
                console.log("Deleting stash: " + evnt.client+ "/" + evnt.check );
                var path = 'silence/' + evnt.client + '/' + evnt.check;
                SensuAPIservice.deleteStash(path).then(function(response){
                    evnt['silenced'] = false;
                },
                function(response){
                    $log.warning("Could not delete Stash : " + path + "\n");
                });
 
                
            }
        });
        //$scope.$apply(updateData);

    }

    $scope.silenceClient= function(){
        angular.forEach($scope.events, function(evnt){
            if(evnt.selected == true){
                var timestamp = new Date().getTime();
                console.log("silencing: " + evnt.client + " : " + timestamp);
                var path = 'silence/' + evnt.client ;
                var data = {"content": { "timestamp": timestamp, "description": "created by angular-web"} }
                SensuAPIservice.createStashes(path, data).then(function(response){
                    evnt['silenced'] = true;

                }, function(response){
                    $log.warning("Could not delete Stash : " + path + "\n");
                });
                
            }
        });

    }

    $scope.unSilenceClient = function(){
        angular.forEach($scope.events, function(evnt){
            if(evnt.selected == true){
                console.log("Deleting stash: " + evnt.client);
                var path = 'silence/' + evnt.client ;
                SensuAPIservice.deleteStash(path).then(function(response){
                    evnt['silenced'] = false;
                },

                function(response){
                    $log.warning("Could not delete Stash : " + path + "\n");
                });
                
            }
        });

    }
   
}).

controller('stashesController', function($scope, SensuAPIservice, $log, $timeout) {
    
    $scope.refreshInterval = 60;

    var updateStashes = function(){

        SensuAPIservice.getStashes().then(function (response) {
            $scope.count += 1;
            //Dig into the responde to get the relevant data
            angular.forEach(response.data, function(stash){
               stash['button_txt'] = 'Delete Stash'; // use this for storing the text to be put in stash button
               stash['button_class'] = 'btn-primary'; // use this for storing the text to be put in stash button
               $scope.stashes.push(stash); 
            }); 
            
        }, function(response){ //handle any non 200 response from the server
            $log.error("Error trying to get stashes from sensu api");
        });
    };

    updateStashes();
    

    $scope.deleteStash = function(stash){

        SensuAPIservice.deleteStash(stash.path).then(
            function(response){
                if(response.status == 204){ // Sensu api returns 204 on successful stash deletion
                   stash['button_class'] = 'btn-success';
                   stash['button_txt'] = 'stash deleted successfully'; 
                }
                var newStashes = $scope.stashes.filter(function(st){
                    return st.path !== stash.path;
                    
                });
                $scope.stashes = newStashes;
                //$scope.$apply(updateStashes);
            },
            function(response){
                stash['button_class'] = 'btn-danger';
                   if(response.status == 404){
                       stash['button_txt'] = 'Cannot Find Stash'; 
                       $log.warning("Couldnot find Stash " + stash.path + ". Got a 404 from sensu api");
                   }else {
                       stash['button_txt'] = 'Error While Deleting'
                       $log.warning("Error Deleting Stash " + stash.path + ". Got a 500 response from sensu api");
                   }
            }
        );
    };
   
    $scope.stashes = [];
    $scope.count = 0;

});
