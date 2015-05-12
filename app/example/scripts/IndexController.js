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

        $scope.eventlist = [
            {
                "source": {
                    "title": "394 class"
                },
                "start": {
                    "date": 2015-5-12,
                    "dateTime": "2015-5-12T11:00:00+0000",
                    "timeZone": "ET"
                },
                "end": {
                    "date": 2015-5-12,
                    "dateTime": "2015-5-12T12:00:00+0000",
                    "timeZone": "ET"
                }
            },
            {
                "source": {
                    "title": "395 class"
                },
                "start": {
                    "date": 2015-5-12,
                    "dateTime": "2015-5-12T13:00:00+0000",
                    "timeZone": "ET"
                },
                "end": {
                    "date": 2015-5-12,
                    "dateTime": "2015-5-12T14:00:00+0000",
                    "timeZone": "ET"
                }
            },
            {
                "source": {
                    "title": "396 class"
                },
                "start": {
                    "date": 2015 - 5 - 12,
                    "dateTime": "2015-5-12T15:00:00+0000",
                    "timeZone": "ET"
                },
                "end": {
                    "date": 2015 - 5 - 12,
                    "dateTime": "2015-5-12T16:00:00+0000",
                    "timeZone": "ET"
                }
            }];

        // this code determines if the user has a block of free time
        function makeSuggestion() {
            /*alert("here");
            var suggestion = {};
            //var source = {};

            //source.title = "Test";
            suggestion.summary = "Test";

            //suggestion.source = source;

            var start = {};

            start.dateTime = "2015-05-11T20:00:00+0000";
            start.timeZone = "America/Chicago";

            suggestion.start = start;

            var end = {};

            end.dateTime = "2015-05-11T21:00:00+0000";
            end.timeZone = "America/Chicago";

            suggestion.end = end;

            suggestion.kind = "calendar#event";

            alert("before");
            supersonic.logger.log("before");
            $scope.events.push(suggestion);
            $scope.$apply();
            supersonic.logger.log("after");
            alert("end");
            return;*/

            //sortEvents();

            var lastEvent;
            var firstEvent = true;

            $scope.events.forEach(function (event) {
                var now = event.start.dateTime;
                var hour = parseInt(now.toString().substring(12, 13));
                var minute = parseInt(now.toString().substring(14, 16));
                var effectiveTime = 60 * hour + minute;

                if (firstEvent === true) {
                    lastEvent = event;
                    firstEvent = false;
                    if (hour >= 5) {
                        //add code that inserts a suggestion here

                        alert("here");

                        var suggestion = {};
                        //var source = {};

                        //source.title = "Test";
                        suggestion.summary = "Test";

                        //suggestion.source = source;

                        var start = {};

                        start.dateTime = "2015-5-11T9:00:00+0000";
                        start.timeZone = "America/Chicago";

                        suggestion.start = start;

                        suggestion.kind = "calendar#event";

                        var end = {};

                        end.dateTime = now;
                        end.timeZone = "ET";

                        suggestion.end = end;

                        $scope.events.push(suggestion);
                        $scope.$apply();

                        lastEvent = suggestion;
                    }
                    return;
                }

                var before = lastEvent.end.dateTime;
                var lastHour = parseInt(before.toString().substring(12, 13));
                var lastMinute = parseInt(before.toString().substring(14, 16));
                var effectiveLastTime = 60 * lastHour + lastMinute;

                if (effectiveTime - effectiveLastTime >= 60 /*&& hour > 9 && hour < 18*/) {
                    //var i = 0;
                    //add code that inserts a suggestion here

                    var suggestion = {};
                    //var source = {};

                    //source.title = "Test";
                    suggestion.summary = "Test";

                    //suggestion.source = source;

                    var start = {};

                    start.dateTime = before;
                    start.timeZone = "America/Chicago";

                    suggestion.start = start;

                    suggestion.kind = "calendar#event";

                    var end = {};

                    end.dateTime = now;
                    end.timeZone = "ET";

                    suggestion.end = end;

                    $scope.events.push(suggestion);
                    $scope.$apply();

                    lastEvent = suggestion;
                    return;
                }

                lastEvent = event;
            });
            //sortEvents();
        }

        // sort json array by time
        function sortEvents() {
            supersonic.logger.log(a.start.dateTime);
            $scope.events.sort(function (a, b) {
                return parseInt(a.start.dateTime.toString().substring(12, 13)) - parseInt(b.start.dateTime.toString().substring(12, 13));
            });
        }

        today=new Date();
        $scope.today=new Date();
        function initArray(){
            this.length=initArray.arguments.length;
            for(var i=0;i<this.length;i++)
                this[i+1]=initArray.arguments[i]}
        var d=new initArray("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
        $scope.month_names=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $scope.month = $scope.month_names[$scope.today.getMonth()];
        $scope.date = $scope.today.getDate();
        $scope.year =$scope.today.getFullYear();
        $scope.day = d[$scope.today.getDay()+1];

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


        function getCalendarData(){
            $scope.cal = true;
            var request = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': (new Date()).toISOString(),
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
                //makeSuggestion();
            });
        }

        $scope.sugg = [
            {"id":1,"activity":'SPAC',"count":0,"take": false},
            {"id":2,"activity":'Meal',"count":0,"take": false},
            {"id":3,"activity":'Walk',"count":0,"take": false}
        ];
        $scope.active = 0;
        $scope.isActive = function (id) {
            return $scope.active === id;
        };

        $scope.setActive= function(id) {
            $scope.active = id;
        };
        $scope.nextSugg = function() {
        };

        $scope.showOption = false;
        $scope.toggle = function() {
            $scope.showOption = !$scope.showOption;
        }

    });
