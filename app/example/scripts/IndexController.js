angular
    .module('example')
    .controller('IndexController', function($scope, supersonic) {

        $scope.reminders = [
            {
                "title": "394 midterm",
                "numDays": "3"
            },
            {
                "title": "395 midterm",
                "numDays": "2"
            }
        ];

        var clientId = '792909163379-01odbc9kccakdhrhpgognar3d8idug0q.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/calendar';
        var apiKey = 'AIzaSyAZkvW_yVrdUVEjrO7_DwFq2NidEkSEAoE';
        $scope.authorized=0;
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
            $scope.authorized=1;
        }

        var dayCount=0;

        function getFutureDay(numDays){
            return (24*60*60*1000*numDays);
        }

        function getCalendarData(){

            //limit our query to events occurring today
            var currDate = new Date(Date.now() + getFutureDay(dayCount));
            currDate.setHours(0,0,0,0);
            $scope.today = currDate.toISOString();
            currDate.setHours(23,59,59,999);
            $scope.tomorrow = currDate.toISOString();

            $scope.date = currDate.getDate();

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
                //When Google Calendar Data is loaded, display it
                $scope.cal = true;
                $scope.events = resp.items;
                makeSuggestion();
            });
        }

        $scope.nextdate = function(){
            dayCount += 1;
            getCalendarData()
        };

        $scope.prevdate = function(){
            dayCount -= 1;
            getCalendarData()
        };

        // this code determines if the user has a block of free time
        function makeSuggestion() {

            //declaring some stuff
            var lastEvent;
            var isFirstEvent = true;
            var index = 0;
            var iterLength = $scope.events.length;

            //this will manually insert a suggestion at 9 am if there are no events
            if(iterLength == 0) {
                var suggestion = {};
                suggestion.summary = "Free time";
                suggestion.colorId = "0";
                suggestion.addedEvent = false;
                suggestion.showOption = false;
                suggestion.active = -1;

                var start = {};
                var s = new Date($scope.today);
                s.setHours(9);
                start.dateTime = s;
                suggestion.start = start;

                var end = {};
                var d = new Date(start.dateTime);
                d.setHours(d.getHours()+1);
                end.dateTime = d;
                suggestion.end = end;

                $scope.events.splice(index, 0, suggestion);
                $scope.$apply();
                iterLength = iterLength + 1;
            }

            //first event
            var event = $scope.events[0];

            //index starts at 0, iterLength is the number of events in the list
            while(index < iterLength) {

                // gets hour, minute, and "effective time" in order to compare events
                var now = new Date(event.start.dateTime);
                var hour = now.getHours();
                var minute = now.getMinutes();
                var effectiveTime = 60 * hour + minute;

                //if this is the first event
                if (isFirstEvent == true) {
                    lastEvent = event;

                    isFirstEvent = false;

                    //if its after 10 for the first events start time
                    //insert an event at 9
                    if (hour > 10) {
                        //make a suggestion object
                        var suggestion = {};
                        suggestion.summary = "Free time";
                        suggestion.colorId = "0";
                        suggestion.addedEvent = false;
                        suggestion.showOption = false;
                        suggestion.active = -1;
                        suggestion.greaterThanHour = true;

                        //get the date
                        var start = {};
                        var s = new Date(now);
                        //set start time to 9
                        s.setHours(9);
                        start.dateTime = s;
                        suggestion.start = start;

                        //set endtime to 10
                        var end = {};
                        var d = new Date(start.dateTime);
                        d.setHours(d.getHours()+1);
                        end.dateTime = d;
                        suggestion.end = end;

                        //add 'suggestion' at index in array, shifting rest of things (second parameter specifies this behavior)
                        $scope.events.splice(index, 0, suggestion);
                        $scope.$apply();


                        index = index + 1;
                        iterLength = iterLength + 1;
                        lastEvent = suggestion;
                    }
                }

                var lastEnd = new Date(lastEvent.end.dateTime);
                var lastHour = lastEnd.getHours();
                var lastMinute = lastEnd.getMinutes();
                //get time of previous event for comparison purposes
                var effectiveLastTime = 60 * lastHour + lastMinute;

                //add suggestions in 1 hour blocks until next real event
                while(effectiveTime - effectiveLastTime >= 60) {
                    //add code that inserts a suggestion here

                        var suggestion = {};
                        suggestion.summary = "Free time";
                        suggestion.colorId = "0";
                        suggestion.addedEvent = false;
                        suggestion.showOption = false;
                        suggestion.active = -1;
                        suggestion.greaterThanHour = true;

                        var start = {};
                        start.dateTime = lastEnd;
                        suggestion.start = start;
                        var end = {};
                        d = new Date(start.dateTime);
                        d.setHours(d.getHours() + 1);
                        end.dateTime = d;
                        suggestion.end = end;

                        if(lastHour >= 9 && lastHour < 18) {
                            $scope.events.splice(index, 0, suggestion);
                            $scope.$apply();
                            index = index + 1;
                            iterLength = iterLength + 1;
                        }
                        lastEnd = suggestion.end.dateTime;
                        lastHour = lastEnd.getHours();
                        lastMinute = lastEnd.getMinutes();
                        effectiveLastTime = 60 * lastHour + lastMinute;
                }

                //add a 30 minute event if there isn't a full hour left until the next one
                if(effectiveTime - effectiveLastTime >= 30) {
                    //add code that inserts a suggestion here

                    var suggestion = {};
                    suggestion.summary = "Free time";
                    suggestion.colorId = "0";
                    suggestion.addedEvent = false;
                    suggestion.showOption = false;
                    suggestion.active = -1;
                    suggestion.greaterThanHour = false;

                    var start = {};
                    start.dateTime = lastEnd;
                    suggestion.start = start;
                    var end = {};
                    d = new Date(start.dateTime);
                    d.setMinutes(d.getMinutes() + 30);
                    end.dateTime = d;
                    suggestion.end = end;

                    if(lastHour >= 9 && lastHour < 18) {
                        $scope.events.splice(index, 0, suggestion);
                        $scope.$apply();
                        index = index + 1;
                        iterLength = iterLength + 1;
                    }
                    lastEnd = suggestion.end.dateTime;
                    lastHour = lastEnd.getHours();
                    lastMinute = lastEnd.getMinutes();
                    effectiveLastTime = 60 * lastHour + lastMinute;
                }
                index = index + 1;
                lastEvent = event;
                event = $scope.events[index];
            };

            //suggestion after the last event on calendar
            var theLastEvent = $scope.events[$scope.events.length-1];
            var lastEventEnd = new Date(theLastEvent.end.dateTime);
            var lastEventEndHour = lastEventEnd.getHours();
            while (lastEventEndHour < 18) {
                var suggestion = {};
                suggestion.summary = "Free time";
                suggestion.colorId = "0";
                suggestion.addedEvent = false;
                suggestion.showOption = false;
                suggestion.active = -1;
                suggestion.greaterThanHour = true;

                var start = {};
                start.dateTime = lastEventEnd;
                suggestion.start = start;

                var end = {};
                d = new Date(start.dateTime);
                d.setHours(d.getHours()+1);
                end.dateTime = d;
                suggestion.end = end;
                $scope.events.splice($scope.events.length, 0, suggestion);
                $scope.$apply();

                lastEventEnd = suggestion.end.dateTime;
                lastEventEndHour = lastEventEnd.getHours();
            }

            //doesn't work
            sortEvents();

        }

        function sortEvents() {
            $scope.events.sort(function (a, b) {
                a = new Date(a);
                b = new Date(b);
                return parseInt(b.getHours()) - parseInt(a.getHours());
            });
        };

        $scope.sugg = [
            {"id":0,"activity":'SPAC',"count":0,"take": false,"hourLong":true},
            {"id":1,"activity":'Meal',"count":0,"take": false,"hourLong":true},
            {"id":2,"activity":'Walk',"count":0,"take": false,"hourLong":false},
            {"id":3,"activity":'Free Time',"count":0,"take": false,"hourLong":true},
            {"id":4,"activity":'Free Time',"count":0,"take": false,"hourLong":false}
        ];

        $scope.isNotHourLong = function (suggestion) {
            return !suggestion.hourLong;
        };

        $scope.greaterThanHour = function (ev) {
            return ev.greaterThanHour;
        };

        $scope.isActive = function (ev,id) {
            return ev.active === id;
        };

        $scope.setActive= function(ev,id) {
            ev.active = id;
        };

        $scope.toggle = function(ev) {
            ev.showOption = !ev.showOption;
        };

        $scope.addCalendarData = function(ev){
            $scope.newEvent = {};
            $scope.newEvent.summary = $scope.sugg[ev.active].activity;
            $scope.newEvent.start = ev.start;
            $scope.newEvent.end = ev.end;
            $scope.newEvent.colorId = "2";
            var request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': $scope.newEvent
            });
            request.execute(function(resp) {
                getCalendarData();
            });
            ev.addedEvent = true;
            ev.showOption = !ev.showOption;
        };

        $scope.titleInput = "";
        $scope.numDays = "";
        $scope.addReminder = function() {

            var reminder = {};
            reminder.title = $scope.titleInput;

            /*var start = {};
            //var d = new Date("2015-05-14T21:00:00-05:00");
            var d = new Date($scope.today);
            d.setHours(parseInt($scope.startInput));
            //d.setDate($scope.today);
            start.dateTime = d;
            reminder.start = start;

            var end = {};
            //end.dateTime = new Date("2015-05-14T21:00:00-05:00");
            d.setHours(parseInt($scope.endInput));
            end.dateTime = d;
            //end.dateTime = end.dateTime.substr(0,11) + $scope.endInput + end.dateTime.substr(14);
            reminder.end = end;*/

            reminder.numDays = $scope.numDays;

            $scope.reminders.push(reminder);
            $scope.$apply();
            sortReminders();
        };

        function sortReminders() {
            $scope.reminders.sort(function (a, b) {
                return parseInt(a.numDays) - parseInt(b.numDays);
            });
        };
    });