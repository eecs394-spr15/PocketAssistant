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

        // this code determines if the user has a block of free time
        function makeSuggestion() {
            var lastEvent;
            var isFirstEvent = true;
            var index = 0;

            $scope.events.forEach(function (event) {
                var now = event.start.dateTime;
                var hour = parseInt(now.toString().substring(11, 13));
                var minute = parseInt(now.toString().substring(14, 16));
                var effectiveTime = 60 * hour + minute;

                if (isFirstEvent == true) {
                    lastEvent = event;
                    isFirstEvent = false;
                    if (hour > 9) {
                        //add code that inserts a suggestion here
                        var suggestion = {};
                        suggestion.summary = "Free time";
                        suggestion.colorId = "0";
                        suggestion.addedEvent = false;
                        suggestion.showOption = false;
                        suggestion.active = -1;

                        var end = {};
                        end.dateTime = now;
                        suggestion.end = end;

                        var start = {};
                        start.dateTime = end.dateTime.substr(0,11)+"09:00:00-05:00";
                        suggestion.start = start;

                        $scope.events.splice(index, 0, suggestion);
                        $scope.$apply();
                        lastEvent = suggestion;
                    }
                }

                var lastEnd = lastEvent.end.dateTime;
                var lastHour = parseInt(lastEnd.toString().substring(11, 13));
                var lastMinute = parseInt(lastEnd.toString().substring(14, 16));
                var effectiveLastTime = 60 * lastHour + lastMinute;

                if (effectiveTime - effectiveLastTime >= 30) {
                    //add code that inserts a suggestion here
                    var suggestion = {};
                    suggestion.summary = "Free time";
                    suggestion.colorId = "0";
                    suggestion.addedEvent = false;
                    suggestion.showOption = false;
                    suggestion.active = -1;

                    var start = {};
                    start.dateTime = lastEnd;
                    suggestion.start = start;
                    var end = {};
                    end.dateTime = now;
                    suggestion.end = end;

                    $scope.events.splice(index, 0, suggestion);
                    $scope.$apply();
                }
                index = index + 1;
                lastEvent = event;
            });

            //suggestion after the last event on calendar
            var ThelastEvent = $scope.events[$scope.events.length-1];
            var lastEventEnd = ThelastEvent.end.dateTime;
            var lastEventEndHour = parseInt(lastEventEnd.toString().substring(11, 13));
            if (lastEventEndHour < 21) {
                var suggestion = {};
                suggestion.summary = "Free time";
                suggestion.colorId = "0";
                suggestion.addedEvent = false;
                suggestion.showOption = false;
                suggestion.active = -1;

                var start = {};
                start.dateTime = lastEventEnd;
                suggestion.start = start;

                var end = {};
                end.dateTime = start.dateTime.substr(0,11)+"21:00:00-05:00";
                suggestion.end = end;
                $scope.events.splice($scope.events.length, 0, suggestion);
                $scope.$apply();
            }
        }

        $scope.sugg = [
            {"id":0,"activity":'Free Time',"count":0,"take": false},
            {"id":1,"activity":'SPAC',"count":0,"take": false},
            {"id":2,"activity":'Meal',"count":0,"take": false},
            {"id":3,"activity":'Walk',"count":0,"take": false}
        ];

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
                supersonic.logger.log('Event Added');
                supersonic.logger.log(resp);
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
