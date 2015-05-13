angular
    .module('example')
    .controller('IndexController', function($scope, supersonic) {

        $scope.reminders = [
            {
                "source": {
                    "title": "394 midterm"
                },
                "start": {
                    "date": 2015-5-12,
                    "dateTime": "2015-5-12T12:00:00+0000",
                    "timeZone": "ET"
                },
                "end": {
                    "date": 2015-5-12,
                    "dateTime": "2015-5-12T13:00:00+0000",
                    "timeZone": "ET"
                }
            },
            {
                "source": {
                    "title": "395 midterm"
                },
                "start": {
                    "date": 2015-5-13,
                    "dateTime": "2015-5-13T12:00:00+0000",
                    "timeZone": "ET"
                },
                "end": {
                    "date": 2015-5-13,
                    "dateTime": "2015-5-13T13:00:00+0000",
                    "timeZone": "ET"
                }
            }
        ];

        // this code determines if the user has a block of free time
        function makeSuggestion() {

            var lastEvent;
            var firstEvent = true;
            var index = 0;

            $scope.events.forEach(function (event) {
                var now = event.start.dateTime;
                var hour = parseInt(now.toString().substring(11, 13));
                var minute = parseInt(now.toString().substring(14, 16));
                var effectiveTime = 60 * hour + minute;

                if (firstEvent === true) {
                    lastEvent = event;
                    firstEvent = false;
                    if (hour >= 10) {
                        //add code that inserts a suggestion here
                        var suggestion = {};
                        suggestion.summary = "Early Test";

                        var start = {};

                        start.dateTime = "2015-05-12T09:00:00-0500";
                        start.timeZone = "America/Chicago";

                        suggestion.start = start;

                        suggestion.kind = "calendar#event";

                        var end = {};

                        end.dateTime = now;
                        end.timeZone = "America/Chicago";

                        suggestion.end = end;

                        $scope.events.splice(index, 0, suggestion);
                        $scope.$apply();

                        lastEvent = suggestion;
                    }
                }

                var before = lastEvent.end.dateTime;
                var lastHour = parseInt(before.toString().substring(11, 13));
                var lastMinute = parseInt(before.toString().substring(14, 16));
                var effectiveLastTime = 60 * lastHour + lastMinute;

                if (effectiveTime - effectiveLastTime >= 30) {
                    //add code that inserts a suggestion here
                    var suggestion = {};

                    suggestion.summary = "Test";

                    var start = {};

                    start.dateTime = before;
                    start.timeZone = "America/Chicago";

                    suggestion.start = start;

                    suggestion.kind = "calendar#event";

                    var end = {};

                    end.dateTime = now;
                    end.timeZone = "America/Chicago";

                    suggestion.end = end;

                    $scope.events.splice(index, 0, suggestion);
                    $scope.$apply();
                }
                index = index + 1;
                lastEvent = event;
                return;
            });
            return;
        }

        // sort json array by time
        /*function sortEvents() {
            $scope.events.sort(function (a, b) {
                return parseInt(a.start.dateTime.toString().substring(11, 13)) - parseInt(b.start.dateTime.toString().substring(11, 13));
            });
        }*/

        today=new Date();
        $scope.today=new Date();
        function initArray(){
            this.length=initArray.arguments.length;
            for(var i=0;i<this.length;i++)
                this[i+1]=initArray.arguments[i]}
        var d=new initArray("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
        $scope.month_names=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        //$scope.date = $scope.today.getDate();

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
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
        }

        function handleAuthResult(authResult) {
            var authorizeButton = document.getElementById('authorize-button');
            if (authResult && !authResult.error) {
                authorizeButton.style.visibility = 'hidden';
                makeApiCall();
            } else {
                authorizeButton.style.visibility = '';
                authorizeButton.onclick = handleAuthClick;
            }
        }

        function handleAuthClick(event) {
            // Step 3: get authorization to use private data
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
            return false;
        }

        function makeApiCall() {
            gapi.client.load('calendar', 'v3', getCalendarData);
        }

        function initArray(){
            this.length=initArray.arguments.length;
            for(var i=0;i<this.length;i++)
                this[i+1]=initArray.arguments[i]
        }

        var d=new initArray("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
        $scope.month_names=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $scope.datacount=0;

        function getCalendarData(){
            $scope.cal = true;
            $scope.today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * $scope.datacount);
            $scope.today.setHours(0,0,0,0);
            $scope.today = $scope.today.toISOString();
            $scope.tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * $scope.datacount);
            $scope.tomorrow.setHours(23,59,59,999);
            $scope.tomorrow = $scope.tomorrow.toISOString();

            $scope.switch =  new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * $scope.datacount);
            $scope.date = $scope.switch.getDate();
            $scope.month = $scope.month_names[$scope.switch.getMonth()];
            $scope.year =$scope.switch.getFullYear();
            $scope.day = d[$scope.switch.getDay()+1];
            var request = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': $scope.today,
                'timeMax' : $scope.tomorrow,
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime'
            });
            request.execute(function(resp) {
                supersonic.logger.log('request executing');
                supersonic.logger.log(resp);
                var events = resp.items;
                events.forEach(function(x){supersonic.logger.log(x)});
                $scope.events = events;
                makeSuggestion();
                makeSuggestion();
            });
        }

        $scope.nextdate = function(){
            $scope.datacount += 1;
            getCalendarData()
        };

        $scope.prevdate = function(){
            $scope.datacount -= 1;
            getCalendarData()
        };

        $scope.sugg = [
            {"id":1,"activity":'SPAC',"count":0,"take": false},
            {"id":2,"activity":'Meal',"count":0,"take": false},
            {"id":3,"activity":'Walk',"count":0,"take": false}
        ];

        $scope.active = 0;
        $scope.addedEvent = false;
        $scope.showOption = false;
        $scope.isActive = function (id) {
            return $scope.active === id;
        };

        $scope.setActive= function(id) {
            $scope.active = id;
        };

        $scope.toggle = function() {
            $scope.showOption = !$scope.showOption;
        };

        $scope.newEvent = {
            end: { dateTime: "2015-05-12T12:30:00-05:00" },
            start: { dateTime: "2015-05-12T11:00:00-05:00" },
            summary: "test",
            colorId: "1"
        };

        $scope.addCalendarData = function(){
            $scope.newEvent.summary = $scope.sugg[$scope.active-1].activity;
            var request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': $scope.newEvent
            });
            request.execute(function(resp) {
                supersonic.logger.log('Event Added');
                supersonic.logger.log(resp);
                getCalendarData();
            });
            $scope.addedEvent = true;
            $scope.showOption = !$scope.showOption;
        };
    });
