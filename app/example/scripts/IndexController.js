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
                supersonic.logger.log($scope.events);
                $scope.$apply();
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

        //Add a suggestion to the events list at index i
        function addSuggestion(startTime, endTime, i, isHourLong){
            var suggestion = {};
            suggestion.summary = "Free time";
            suggestion.colorId = "0";
            suggestion.addedEvent = false;
            suggestion.showOption = false;
            suggestion.active = -1;
            suggestion.start = {dateTime:startTime};
            suggestion.end = {dateTime:endTime};

            if(isHourLong){
                suggestion.greaterThanHour = true;
            }

            $scope.events.splice(i, 0, suggestion)
        }


        function makeSuggestion() {
            //this will manually insert a suggestion at 9 am if there are no events
            if($scope.events.length == 0) {
                var today = new Date($scope.today);
                addSuggestion(today.setHours(9), today.setHours(10), 0);
            }

            for(var i=0; i<$scope.events.length; i++){
                var nextStart = new Date($scope.events[i].start.dateTime);
                var nextETime = nextStart.getTime();

                if(i==0){
                    if(nextStart.getHours()>10){
                        var t = new Date(nextStart);
                        addSuggestion(t.setHours(9,0,0,0), t.setHours(10,0,0,0), i, true);
                    }
                    continue;
                }

                var prevEnd = new Date($scope.events[i-1].end.dateTime);
                var prevETime = prevEnd.getTime();


                while(nextETime - prevETime >= 3600000){
                    var currStart = new Date(prevETime);
                    var currEnd = new Date(prevETime+3600000);
                    addSuggestion(currStart,currEnd,i,true);
                    i++;
                    prevEnd = currEnd;
                    prevETime = prevEnd.getTime();
                }

                if(nextETime-prevETime >= 1800000){
                    addSuggestion(prevEnd, prevEnd.setMinutes(prevEnd.getMinutes()+30),i,false);
                }
            }

        }

        /*function sortEvents() {
            $scope.events.sort(function (a, b) {
                a = new Date(a);
                b = new Date(b);
                return parseInt(b.getHours()) - parseInt(a.getHours());
            });
        };*/

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