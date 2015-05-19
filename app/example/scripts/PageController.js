angular
    .module('example')
    .controller('PageController', function($scope, supersonic) {
        $scope.evid = steroids.view.params.id;

        var clientId = '792909163379-01odbc9kccakdhrhpgognar3d8idug0q.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/calendar';
        var apiKey = 'AIzaSyAZkvW_yVrdUVEjrO7_DwFq2NidEkSEAoE';

        $scope.handleClientLoad = function() {
            supersonic.logger.log('enter');
            // Step 2: Reference the API key
            gapi.client.setApiKey(apiKey);
            window.setTimeout(checkAuth,1);
        };
        function checkAuth() {
            supersonic.logger.log('checkAuth');
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
        }
        function handleAuthResult(authResult) {
            var authorizeButton = document.getElementById('authorize-button');
            supersonic.logger.log('handleAuthResult');
            if (authResult && !authResult.error) {
                authorizeButton.style.visibility = 'hidden';
                makeApiCall();
            } else {
                authorizeButton.style.visibility = '';
                authorizeButton.onclick = handleAuthClick;
            }
        }
        function handleAuthClick(event) {
            supersonic.logger.log('handleAuthClick');
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
            return false;
        };

        function makeApiCall() {
            supersonic.logger.log('makeApicall');
            gapi.client.load('calendar', 'v3', $scope.getEvent);
        }
        $scope.getEvent = function() {
            $scope.cal=true;
            $scope.requestevent = gapi.client.calendar.events.get({'calendarId':'primary', 'eventId': $scope.evid});
            $scope.requestevent.execute(function(resp){
                supersonic.logger.log(resp);
                $scope.re = resp;
                $scope.start = $scope.re.start.dateTime;
                $scope.end = $scope.re.end.dateTime;
                $scope.updateData = $scope.re;
                $scope.updateData.start.dateTime = $scope.re.start.dateTime.substring(11,16);
                $scope.updateData.end.dateTime = $scope.re.end.dateTime.substring(11,16);
                $scope.endTime=$scope.end.substring(0,11)+$scope.updateData.end.dateTime+$scope.end.substr(16);
                $scope.startTime=$scope.start.substring(0,11)+$scope.updateData.start.dateTime+$scope.start.substr(16);
            });
        };
        //$scope.endTime=$scope.end.substring(0,11)+$scope.updateData.end.dateTime+$scope.end.substr(16);
        //$scope.startTime=$scope.start.substring(0,11)+$scope.updateData.start.dateTime+$scope.start.substr(16);

        $scope.updateEvent = function(){
            findColor($scope.colorArray);
            $scope.re = $scope.updateData;
            $scope.re.end.dateTime = $scope.end.substring(0,11)+$scope.updateData.end.dateTime+$scope.end.substr(16);
            $scope.re.start.dateTime = $scope.start.substring(0,11)+$scope.updateData.start.dateTime+$scope.start.substr(16);
            $scope.requestevent = gapi.client.calendar.events.update(
                {'calendarId':'primary', 'eventId': $scope.re.id,'resource':$scope.re});
            $scope.requestevent.execute(function(resp){
                supersonic.logger.log('update event');
                supersonic.logger.log(resp);
            });
        };

        $scope.deleteEvent = function(){
            $scope.requestevent = gapi.client.calendar.events.delete(
                {'calendarId':'primary', 'eventId': $scope.re.id});
            $scope.requestevent.execute(function(resp){
                supersonic.logger.log('delete event');
            });
        };

        //colorid representation:
        // bold read:11   bold green:10   blod blue:9   grey:8
        // yellow:5   orange:6   red:4  purple:3
        // blue:1  green:2  turquoise:7

        $scope.colorArray = [{title: 'Blue', id: '1'}, {title: 'Bold Blue', id: '9'},
            {title: 'Red', id:'4'}, {title: 'Bold Red', id: '11'},{title: 'None', id: ''},
            {title: 'Green', id: '2'}, {title: 'Bold Green', id: '10'},
            {title: 'Grey', id: '8'}, {title: 'Yellow', id: '5'}, {title: 'Orange', id: '6'},
            {title: 'Turquoise', id: '7'}, {title: 'Purple', id: '3'}];



        $scope.colorSelect=1;
        function findColor(x){
            for(var i in x){
                if($scope.colorSelect == x[i].title){
                    $scope.updateData.colorId = x[i].id;}}
        };
        $scope.delete=function(){
            supersonic.ui.dialog.alert("You Delete the event!");
            $scope.deleteEvent();
            supersonic.ui.layers.pop();
        };
        $scope.update=function(){
            supersonic.ui.dialog.alert("Update successfully!");
            $scope.updateEvent();
            supersonic.ui.layers.pop();
        };
        $scope.undoButton = function(){
            $scope.getEvent()
        };
    })


