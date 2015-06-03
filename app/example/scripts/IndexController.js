angular
    .module('example')
    .controller('IndexController', function ($scope, supersonic,$timeout) {
        var clientId = '792909163379-01odbc9kccakdhrhpgognar3d8idug0q.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/calendar';
        var apiKey = 'AIzaSyAZkvW_yVrdUVEjrO7_DwFq2NidEkSEAoE';
        $scope.authorized = 0;
        $scope.mainPage = true;
        $scope.titleName = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
        $scope.loading = false;
        $scope.exampleDate = Date.now();
        var remindertag = "[reminder]";

        $scope.handleClientLoad = function () {
            // Step 2: Reference the API key
            gapi.client.setApiKey(apiKey);
            window.setTimeout(checkAuth, 1);
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
            document.body.style.background = "url()";
            gapi.client.load('calendar', 'v3', getCalendarData);
            $scope.authorized = 1;
        }

        var dayCount = 0;

        function getFutureDay(numDays) {
            return (24 * 60 * 60 * 1000 * numDays);
        }

        function getCalendarData() {
            $scope.loading = true;
            //limit our query to events occurring today
            var currDate = new Date(Date.now() + getFutureDay(dayCount));
            supersonic.logger.log('show currDate');
            supersonic.logger.log(currDate);
            currDate.setHours(0, 0, 0, 0);
            $scope.exampleDate=currDate;
            $scope.today = currDate.toISOString();
            currDate.setHours(23, 59, 59, 999);
            $scope.tomorrow = currDate.toISOString();
            $scope.date = currDate.getDate();
            var request = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': $scope.today,
                'timeMax': $scope.tomorrow,
                'showDeleted': false,
                'singleEvents': true,
                'orderBy': 'startTime'
            });
            request.execute(function (resp) {
                //When Google Calendar Data is loaded, display it
                $scope.cal = true;
                $scope.events = resp.items;
                makeSuggestion();
                checkCurrent();
                checkConflict();
                getTaggedEvents();
            });
        }

        //Xin
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);

        //Xin
        var xDown = null;
        var yDown = null;

        /** Xin
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        function handleTouchStart(evt) {
            xDown = evt.touches[0].clientX;
            yDown = evt.touches[0].clientY;
        }

        /** Xin
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        function handleTouchMove(evt) {
            if ( ! xDown || ! yDown ) {
                return;
            }

            var xUp = evt.touches[0].clientX;
            var yUp = evt.touches[0].clientY;
            var xDiff = xDown - xUp;
            var yDiff = yDown - yUp;

            if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
                if ( xDiff > 10 ) {
                    $scope.nextdate();
                    supersonic.logger.log('swipeLeft');

                } else if (xDiff < -5){
                    $scope.prevdate();
                    supersonic.logger.log('swipeRight');

                }
            }
            xDown = null;
            yDown = null;
        }


        /** Corey
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.nextdate = function () {
            var currDate = new Date(Date.now() + getFutureDay(++dayCount));
            $scope.exampleDate = currDate;
        };

        /** Corey
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.prevdate = function () {
            var currDate = new Date(Date.now() + getFutureDay(--dayCount));
            $scope.exampleDate = currDate;
        };

        /**
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.isReminder = function(ev){
            return ev.summary.substr(0, 10) == '[reminder]';
        };

        /** Greg
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.isUntitled = function(ev){
            return ev.summary == null || ev.summary.substr(0,8) == 'undefined';
        };

        /**
         * addSuggestion inserts a free time slot (as an event) into events array
         *
         * takes start time and end time of an event as inputs, as well as index i where the event is to be inserted to
         * isHourLong is a boolean indicating length of the event
         * no returns
         *
         * MakeSuggestion function below locates free time slots in a day;
         * Then addSuggestion will be called to add a free time slot to events array
         * A new-added slot won't be sent to google calender until a customer chooses or adds an activity for this slot.
         */
        function addSuggestion(startTime, endTime, i, isHourLong) {
            var suggestion = {};
            suggestion.summary = "";
            suggestion.colorId = "0";
            suggestion.addedEvent = false;
            suggestion.showOption = false;
            suggestion.active = -1;
            suggestion.start = {dateTime: startTime};
            suggestion.end = {dateTime: endTime};
            if (isHourLong) {
                suggestion.greaterThanHour = true;
            }
            $scope.events.splice(i, 0, suggestion)
        }

        /**
         * Suggesetion8to9 inserts a 8am-9am suggestion into events array by calling addSuggestion function.
         *
         * takes insertion place (index i) as an input
         * nothing returned
         *
         * Code inside this function are used for multiple time by makeSuggestion function, so the function is created to simplify makeSuggestion.
         */
        function Suggestion8to9(i) {
            var t = new Date(new Date($scope.today));
            var startTime = new Date(t.setHours(8));
            var endTime = new Date(t.setHours(9));
            addSuggestion(startTime, endTime, i, 1);
        }
        /**
         * Given all events in a day, makeSuggestion function locates 1-hour long and 30-minute long free time slots, and inserts these slots into the events array by calling addSuggestion.
         *
         * takes no inputs
         * nothing returned
         *
         * This function looks for free time slots longer than 30 minutes between 8am to 10pm.
         * The function considers all the possible schedules of events in a day,
         * so a bunch of code is used to take care of special cases, such as a day without any event, a day with conflicting events, etc.
         *
         * The core for-loop in the function checks free time between event[i-1] and event[i], so for-loop ignores following possibilities:
         * - free all day (no events in a day)
         * - free time from 8am to event[0].start
         * - free time from end time of the last event to 10pm
         */
        function makeSuggestion() {
            //Special case: if there are no events in a day, this will manually insert a suggestion at 8 am
            if ($scope.events.length == 0) {
                Suggestion8to9(0);
            }
            //whether there is free time from 8am to event[0].start
            var FirstEventStart = new Date($scope.events[0].start.dateTime);
            if (FirstEventStart.getHours() >= 9) {
                Suggestion8to9(0);
            }
            else if (FirstEventStart.getHours() == 8 && FirstEventStart.getMinutes() >=30){
                var start8am = new Date(new Date($scope.today).setHours(8));
                addSuggestion(start8am, FirstEventStart, 0, 0);
            }
            else if ($scope.events.length == 1) {
                var prevEnd = new Date($scope.events[0].end.dateTime);
            }
            //The core for-loop checks free time between event[i-1] and event[i]
            for (var i = 1; i < $scope.events.length; i++) {
                var nextStart = new Date($scope.events[i].start.dateTime);
                var prevEnd = new Date($scope.events[i - 1].end.dateTime);
                //Special case: event[i-1] ends before 8am, but a suggestion will not be made until 8am
                if (prevEnd.getHours() <=7){
                    prevEnd = new Date(new Date($scope.today).setHours(8));
                }
                //Special case: event[i-2] covers event[i-1]
                if (i > 1){
                    var prevEnd2 = new Date($scope.events[i - 2].end.dateTime);
                    if (prevEnd2 > prevEnd) {
                        prevEnd = new Date(prevEnd2);
                    }
                }
                //while-loop makes 1-hour suggestions between event[i-1].end and event[i].start
                while (nextStart - prevEnd >= 3600000) {
                    var currEnd = new Date(prevEnd.getTime() + 3600000);
                    if (currEnd.getHours() < 22) {
                        addSuggestion(prevEnd, currEnd, i, 1);
                        i += 1;
                        prevEnd = currEnd;
                    }
                    else {
                        break;
                    }
                }
                //make a half-hour suggestion if the interval lasts 30mins to 60 mins.
                if (nextStart - prevEnd >= 1800000) {
                    if (nextStart.getHours() < 22) {
                        addSuggestion(prevEnd, nextStart, i, 0);
                    }
                    else {
                        var currEnd = new Date(new Date($scope.today).setHours(22));
                        if (currEnd - prevEnd >= 1800000) {
                            addSuggestion(prevEnd, currEnd, i, 0);
                        }
                    }
                }
            }
            //Code below is to find free time from end time of the last event to 10pm
            var lastEnd = new Date($scope.events[$scope.events.length - 1].end.dateTime);
            if (prevEnd > lastEnd) {
                lastEnd = new Date(prevEnd);
            }
            //Special case: last event is an early morning event ending before 8am
            if (lastEnd.getHours() <= 7){
                Suggestion8to9($scope.events.length);
                lastEnd = new Date(new Date($scope.today).setHours(9));
            }
            while (lastEnd.getHours() < 21) {
                var newEnd = new Date(lastEnd.getTime() + 3600000);
                addSuggestion(lastEnd, newEnd, $scope.events.length, 1);
                lastEnd = newEnd;
            }
            //make a half-hour suggestion if the last event ends between 9pm to 9:30pm
            if (lastEnd.getHours() < 22 && lastEnd.getMinutes() <= 30) {
                newEnd = new Date(new Date($scope.today).setHours(22));
                addSuggestion(lastEnd, newEnd, $scope.events.length, 0);
            }
        }

        /**
         * checkConflict checks if an event has time conflict with other events
         *
         * takes no inputs
         * nothing returned
         *
         * A user is supposed to be shown conflicting events when opening the app.
         * This function iterates $scope.events array to check each event.
         */
        function checkConflict() {
            var event1 = $scope.events[0];
            event1.conflict = 0;
            var event2;
            var i = 1;
            while (i < $scope.events.length) {
                event2 = $scope.events[i];
                event2.conflict = 0;
                var event1End = new Date(event1.end.dateTime);
                var event2Start = new Date(event2.start.dateTime);
                // If an event has time conflict with other events, its 'conflict' attribute will be set to a positive number.
                // Specific values 1, 2 and 3 are used for styling
                if (event1End > event2Start) {
                    event2.conflict = 3;
                    if (event1.conflict == 3) {
                        event1.conflict = 2;
                    }
                    else{
                        event1.conflict = 1;
                    }
                }
                event1 = event2;
                i += 1;
            }
        }

        /**
         * checkCurrent looks for event that is currently ongoing.
         *
         * takes no inputs
         * nothing returned
         *
         * A user is supposed to be shown which event is currently ongoing when opening the app.
         * This function iterates $scope.events array to check each event.
         */
        function checkCurrent() {
            var i = 0;
            var currentTime = new Date();
            while (i < $scope.events.length) {
                var ev = $scope.events[i];
                ev.current = false;
                var evStart = new Date(ev.start.dateTime);
                var evEnd = new Date(ev.end.dateTime);
                if (currentTime >= evStart && currentTime <= evEnd) {
                    ev.current = true;
                }
                i += 1;
            }
        }

        /** Cathy Jo
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.sugg = [
            {"id": 0, "activity": 'Go for a run', "count": 0, "take": false, "hourLong": true},
            {"id": 1, "activity": 'Eat a Meal', "count": 0, "take": false, "hourLong": true},
            {"id": 2, "activity": 'Take a Walk', "count": 0, "take": false, "hourLong": false},
            {"id": 3, "activity": 'Do jumping jacks', "count": 0, "take": false, "hourLong": false},
            {"id": 4, "activity": 'Go on a bike ride', "count": 0, "take": false, "hourLong": true},
            {"id": 5, "activity": 'Free Time', "count": 0, "take": false, "hourLong": true},
            {"id": 6, "activity": 'Free Time', "count": 0, "take": false, "hourLong": false}
        ];

        /** Greg
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.isNotHourLong = function (sug) {
            return !sug.hourLong;
        };

        /** Greg
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.greaterThanHour = function (ev) {
            return ev.greaterThanHour;
        };

        /** Xin
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.isActive = function (ev, id) {
            return ev.active === id;
        };

        /** Xin
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.setActive = function (ev, id) {
            ev.active = id;
        };

        /**
         * toggle shows or hides activity list
         *
         * takes an event (actually is a free time slot inserted by addSuggestion function) as an input
         * no return
         *
         * The suggested activities are shown when showOption attribute of an event is true.
         * This function will be called when the three-line button on an event is clicked.
         */
        $scope.toggle = function (ev) {
            ev.showOption = !ev.showOption;
        };

        // mySuggestion binds to an activity title input by a user; ng-model is used
        $scope.mySuggestion = {"summary":""};

        /**
         * addCalendarData adds an activity into google calendar
         *
         * takes a free-time event as an input
         * no return
         *
         * After an activity is selected/input and 'Add' button is clicked, the activity should be sent to google calendar as a new event.
         * Its start/end time is same as start/end time of the free time slot to which the activity is added.
         * This function creates a variable $scope.newEvent to store info of the activity and inserts $scope.newEvent to google calendar.
         */
        $scope.addCalendarData = function (ev) {
            $scope.newEvent = {};
            //'ev.active is -2' means the input row in the activity list is highlighted, so newEvent's title should take the input.
            //otherwise, newEvent's title should be the name of activity that is selected
            if (ev.active == -2) {
                $scope.newEvent.summary = $scope.mySuggestion.summary;}
            else {
                $scope.newEvent.summary = $scope.sugg[ev.active].activity;}
            $scope.newEvent.start = ev.start;
            $scope.newEvent.end = ev.end;
            $scope.newEvent.colorId = "11";
            var request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': $scope.newEvent
            });
            request.execute(function (resp) {
                getCalendarData();
            });
            //True addedEvent indicates an activity has been added to this free time slot
            //This attribute is used to show/hide a free time slot.
            ev.addedEvent = true;
            ev.showOption = !ev.showOption;
            $scope.mySuggestion.summary = "";
        };

        //Xin
        $scope.hideReminder = false;
        $scope.chevron = "super-chevron-up";
        $scope.showOrHide = "Hide Reminders";

        /** Xin
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.switchButton = function () {
            if ($scope.hideReminder == false) {
                $scope.hideReminder = true;
                $scope.chevron = "super-chevron-down";
                $scope.showOrHide = "Show Reminders";
            }
            else {
                $scope.hideReminder = false;
                $scope.chevron = "super-chevron-up";
                $scope.showOrHide = "Hide Reminders";
            }
        };

        //Chen
        $scope.numDays = "";
        $scope.eventTag = false;

        /** Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.getEvent = function (ev) {
            $scope.eventTag = false;
            if (ev.summary.substring(0,10) == remindertag){
                $scope.eventTag = true;
            }
            $scope.updateData = {};
            var startTime = new Date(ev.start.dateTime);
            $scope.updateData.start = {dateTime: startTime};
            var endTime = new Date(ev.end.dateTime);
            $scope.updateData.end = {dateTime: endTime};
            $scope.titleName = {name: 'Edit your event', button: 'Clear', back: 'Back', addBut: ''};
            $scope.mainPage = false;
            $scope.addPage = false;
            $scope.evid = ev.id;
            $scope.requestEvent = gapi.client.calendar.events.get({
                'calendarId': 'primary',
                'eventId': $scope.evid
            }).execute(function (resp) {
                supersonic.logger.log(resp);
                $scope.re = resp;
                $scope.updateData = $scope.re;
            });
        };

        /**Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        var confirm = {
            buttonLabels: ["Yes", "No"]
        };

        /** Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.update = function () {
            if (new Date($scope.updateData.end.dateTime).getTime() >= new Date($scope.updateData.start.dateTime).getTime() ){
                supersonic.ui.dialog.confirm("Are you sure you want to update this event?", confirm).then(function (index) {
                    if (index == 0) {
                        $scope.updateEvent();}
                });
            }
            else {
                supersonic.ui.dialog.alert('START time should be earlier than END time!')
            }
        };

        /** Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.updateEvent = function () {
            $scope.re = $scope.updateData;
            if($scope.re.summary.substring(0,10) == remindertag){
                if($scope.eventTag == false) {
                    $scope.re.summary = $scope.re.summary.substr(10);
                }}
            else{
                if($scope.eventTag == true){
                    $scope.re.summary = remindertag.concat($scope.re.summary);
                }
            }
            $scope.requestevent = gapi.client.calendar.events.update(
                {'calendarId': 'primary', 'eventId': $scope.re.id, 'resource': $scope.re});
            $scope.requestevent.execute(function (resp) {
                $scope.mainPage = true;
                $scope.titleName = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
                getCalendarData();
                supersonic.ui.dialog.alert("Event Updated!");
            });
        };

        /** Cat
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.delete = function () {
            supersonic.ui.dialog.confirm("Are you sure you want to delete this event?", confirm).then(function (index) {
                if (index == 0) {
                    $scope.deleteEvent();
                }
            });
        };

        /** Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.deleteEvent = function () {
            $scope.requestevent = gapi.client.calendar.events.delete(
                {'calendarId': 'primary', 'eventId': $scope.re.id});
            $scope.requestevent.execute(function (resp) {
                $scope.mainPage = true;
                $scope.titleName = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
                getCalendarData();
                supersonic.ui.dialog.alert("Event Deleted!");
            });
        };

        /** Xin
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.undoButton = function () {
            if ($scope.mainPage == false && $scope.addPage == false) {
                $scope.eventTag = false;
                $scope.getEvent($scope.re);
                if($scope.re.summary.substring(0,10) == remindertag){
                    $scope.eventTag = true;
                }
            }
        };

        /** Xin
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.backButton = function () {
            $scope.mainPage = true;
            $scope.titleName = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
            $scope.eventTag = false;
        };

        /** Xin
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.addButton = function () {
            if ($scope.mainPage == true) {
                $scope.updateData = {"summary":'',"start":{"dateTime":''},"end":{"dateTime":''}};
                $scope.mainPage = false;
                $scope.titleName = {name: 'Add an event', button: '', back: 'Back', addBut: ''};
                $scope.addPage = true;
                $scope.eventTag = false;
            }
        };

        /** Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.addEvent = function () {
            if (!$scope.updateData.start.dateTime | !$scope.updateData.summary | !$scope.updateData.end.dateTime | $scope.updateData.start.dateTime >= $scope.updateData.end.dateTime){
                if(!$scope.updateData.summary){
                    supersonic.ui.dialog.alert('Please add a SUMMARY for your new event!')
                }
                else if(!$scope.updateData.end.dateTime && !$scope.updateData.start.dateTime){
                    supersonic.ui.dialog.alert('Please select START and END time!')}
                else if(!$scope.updateData.start.dateTime){
                    supersonic.ui.dialog.alert('Please select a START time!')
                }
                else if(!$scope.updateData.end.dateTime){
                    supersonic.ui.dialog.alert('Please select an END time!')
                }
                else {
                    if ($scope.updateData.start.dateTime >= $scope.updateData.end.dateTime){
                        supersonic.ui.dialog.alert('START time should be earlier than END time!')
                    }
                }
            }
            else {
                supersonic.ui.dialog.confirm("Are you sure you want to add a new event?", confirm).then(function(index) {
                    if (index == 0) {
                        $scope.addNewEvent();
                    }
                });
            }
        };

        /** Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.addNewEvent = function(){
            if ($scope.eventTag == true){
                supersonic.logger.log('adding reminder tag is needed');
                $scope.updateData.summary = remindertag.concat($scope.updateData.summary);
            }
            $scope.newEvent = $scope.updateData;
            supersonic.logger.log($scope.updateData);
            var request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': $scope.newEvent
            });
            request.execute(function (resp) {
                supersonic.logger.log('Event Added');
                $scope.mainPage = true;
                $scope.addPage = false;
                $scope.titleName = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
                getCalendarData();
                supersonic.ui.dialog.alert('Event Added!');
            });
        };

        /**
         * updateEndTime sets the default end time of a new event to be its start time when an event is being created
         *
         * takes no inputs
         * no returns
         *
         * The earliest end time of an event is its start time.
         * For user convenience, this function updates the end time to be start time if the end time has not been set
         */
        $scope.updateEndTime = function(){
            if ($scope.addPage && !$scope.updateData.end.dateTime) {
                var sTime = $scope.updateData.start.dateTime;
                $scope.updateData.end.dateTime= sTime;
            }
        };

        /** Cathy
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        function getTaggedEvents() {
            $scope.countdown = [];
            var todayDate = new Date(Date.now() + getFutureDay(dayCount));
            todayDate.setHours(0,0,0,0);
            if(dayCount < 0){
                var currDate = new Date();
                currDate.setHours(0,0,0,0)
            }
            else {
                currDate = todayDate
            }
            var hr = new Date().getHours();
            var eventList = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': currDate.toISOString(),
                'q': '[reminder]',
                'showDeleted': false,
                'singleEvents': true,
                'orderBy': 'startTime'
            });
            eventList.execute(function(resp) {
                var events = resp.items;
                supersonic.logger.log(events);
                var passedReminder = 0;
                for (var i in events) {
                    var evHours = parseInt(events[i].start.dateTime.substr(11, 2));
                    var dayleft = Math.floor((new Date(events[i].start.dateTime)-todayDate)/(24 * 60 * 60 * 1000));
                    var hourleft = evHours - hr;
                    var metadata = {
                        'title': events[i].summary.substr(10),
                        'untilToday': dayCount,
                        'daysUntil': dayleft,
                        'hrsUntil': hourleft,
                        'eventID': events[i].id,
                        'visible': true
                    };
                    if (!metadata.untilToday && !metadata.daysUntil && metadata.hrsUntil < 0) {
                        metadata.visible = false;
                        passedReminder += 1;
                    }
                    $scope.countdown.push(metadata);
                }
                $scope.visibleReminders = $scope.countdown.length - passedReminder;
                $scope.loading = false;
            });
        }

        /** Cathy
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.invisibleReminder = function(id) {
            for (var c in $scope.countdown) {
                if ($scope.countdown[c].eventID == id) {
                    $scope.countdown[c].visible = false;
                }
            }
            $scope.visibleReminders -= 1;
            supersonic.logger.log($scope.countdown);
        };

        /** Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.$watch('exampleDate',function() {
            var selectDate = $scope.exampleDate;
            selectDate.setHours(0, 0, 0, 0);
            var currDate = new Date();
            currDate.setHours(0, 0, 0, 0);
            dayCount = (selectDate-currDate)/(24 * 60 * 60 * 1000);
            $scope.daycount = dayCount;
        });

        /** Chen
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.$watch('daycount',function(){
            $timeout(getCalendarData(),1000);
        })
    });
