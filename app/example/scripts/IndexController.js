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

        /**
         * isUntitled checks if an event is untitled
         *
         * takes an event as an input
         * returns a boolean
         *
         * This function checks if an event's title, denoted by its summary attribute, is empty or undefined
         */
        $scope.isUntitled = function(ev){
            return ev.summary == null || ev.summary == undefined || ev.summary == '';
        };

        /** Ding
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
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

        /** Ding
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        function makeSuggestion() {
            supersonic.logger.log('making suggestions');
            //this will manually insert a suggestion at 9 am if there are no events
            if ($scope.events.length == 0) {
                var t = new Date(new Date($scope.today));
                var starttime = new Date(t.setHours(8));
                var endtime = new Date(t.setHours(9));
                addSuggestion(starttime, endtime, 0, 1);
            }

            for (var i = 0; i < $scope.events.length; i++) {
                var nextStart = new Date($scope.events[i].start.dateTime);
                var nextETime = nextStart.getTime();

                if (i == 0) {
                    if (nextStart.getHours() >= 9) {
                        var t = new Date(new Date($scope.today));
                        var starttime = new Date(t.setHours(8));
                        var endtime = new Date(t.setHours(9));
                        addSuggestion(starttime, endtime, i, 1);
                    }
                    else if ($scope.events.length == 1) {
                        var prevEnd = new Date($scope.events[0].end.dateTime);
                    }
                    continue;
                }

                var prevEnd = new Date($scope.events[i - 1].end.dateTime);
                var prevETime = prevEnd.getTime();
                if (i > 1){
                    var prevEnd2 = new Date($scope.events[i - 2].end.dateTime);
                    var prevETime2 = prevEnd2.getTime();
                    if (prevETime2 > prevETime) {
                        prevETime = prevETime2;
                        prevEnd = new Date($scope.events[i - 2].end.dateTime);
                    }
                }

                while (nextETime - prevETime >= 3600000) {
                    var currStart = new Date(prevETime);
                    var currEnd = new Date(prevETime + 3600000);
                    if (currStart.getHours()>7 && currEnd.getHours() < 22) {
                        addSuggestion(currStart, currEnd, i, 1);
                        i += 1;
                        prevEnd = currEnd;
                        prevETime = prevEnd.getTime();
                    }
                    else if (currStart.getHours() <= 7) {
                        var t = new Date(new Date($scope.today));
                        var currStart = new Date(t.setHours(8));
                        var currEnd = new Date(t.setHours(9));
                        addSuggestion(currStart, currEnd, i, 1);
                        i += 1;
                        prevEnd = currEnd;
                        prevETime = prevEnd.getTime();
                    }
                    else {
                        break;
                    }
                }

                if (nextETime - prevETime >= 1800000) {
                    if (nextStart.getHours() < 22) {
                        addSuggestion(prevEnd, nextStart, i, 0);
                    }
                    else {
                        var t = new Date(new Date($scope.today));
                        var currEnd = new Date(t.setHours(22));
                        var currETime = currEnd.getTime();
                        if (currETime - prevETime >= 1800000) {
                            var currEnd = new Date(currETime);
                            addSuggestion(prevEnd, currEnd, i, 0);
                        }
                    }
                }
            }

            var lastEnd = new Date($scope.events[$scope.events.length - 1].end.dateTime);
            if (lastEnd.getHours() <= 7){
                var t = new Date(new Date($scope.today));
                var lastEnd = new Date(t.setHours(8));
                var newEnd = new Date(t.setHours(9));
                addSuggestion(lastEnd, newEnd, $scope.events.length, 1);
                lastEnd = newEnd;
            }
            if (lastEnd.getHours() < 21){
                if (prevEnd.getTime() > lastEnd.getTime()) {
                    lastEnd = new Date(prevEnd);
                }
            }
            while (lastEnd.getHours() < 21) {
                var newEnd = new Date(lastEnd.getTime() + 3600000);
                addSuggestion(lastEnd, newEnd, $scope.events.length, 1);
                lastEnd = newEnd;
            }
            if (lastEnd.getHours() < 22 && lastEnd.getMinutes() <= 30) {
                var t = new Date(new Date($scope.today));
                newEnd = new Date(t.setHours(22));
                addSuggestion(lastEnd, newEnd, $scope.events.length, 0);
            }
        }

        function checkConflict() {
            var i = 1;
            var ev;
            var eventA = $scope.events[0];
            eventA.conflict = 0;
            while (i < $scope.events.length) {
                ev = $scope.events[i];
                ev.conflict = 0;
                var thatEnd = new Date(eventA.end.dateTime);
                var thisStart = new Date(ev.start.dateTime);
                if (thatEnd.getTime() > thisStart.getTime()) {
                    if (eventA.conflict == 3) {
                        eventA.conflict = 2;
                    }
                    else{
                        eventA.conflict = 1;
                    }
                    ev.conflict = 3;
                }
                eventA = ev;
                i += 1;
            }
        }

        /** Ding
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        function checkCurrent() {
            var i = 0;
            var ev;
            var thisStart;
            var thisEnd;
            var currentTime = new Date();
            while (i < $scope.events.length) {
                ev = $scope.events[i];
                ev.current = false;
                thisStart = new Date(ev.start.dateTime);
                thisEnd = new Date(ev.end.dateTime);
                if (currentTime.getTime() >= thisStart.getTime() && currentTime.getTime() <= thisEnd.getTime()) {
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

        /**
         * isNotHourLong checks if a suggestion is designed for an hour long free block or a half hour long free block
         *
         * takes a suggestion from the $scope.sugg array as an input
         * returns a boolean
         *
         * Suggestions are stored in the $scope.sugg array. Suggestions are made during free blocks of either an hour
         * or a half hour. This function will check if the suggestions hourLong attribute is true or not in order to
         * determine whether the suggestion should be made in an hour long free block or a half hour long free block.
         */
        $scope.isNotHourLong = function (sug) {
            return !sug.hourLong;
        };

        /**
         * greaterThanHour checks if an event is an hour long or half an hour long
         *
         * takes an event as an input
         * returns a boolean
         *
         * All the free time in one's calendar is split into blocks of one hour or half an hour suggestions. In the
         * html, we only display certain suggestions that fit into either the half hour blocks or the full hour blocks
         * using an ng-show and an ng-hide. This function will check if an event that has been assigned to be a
         * suggestion event is an hour long or a half hour long, based on that event's greaterThanHour attribute,
         * in order to determine which suggestions to display and which to hide.
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

        /** Ding
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.toggle = function (ev) {
            ev.showOption = !ev.showOption;
        };

        //Ding
        $scope.mySuggestion = {"summary":""};

        /**
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
         */
        $scope.addCalendarData = function (ev) {
            $scope.newEvent = {};
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

        /** Ding
         * isReminder checks if an event is a reminder
         *
         * takes an event as an input
         * returns a boolean
         *
         * Reminders are denoted by a text tag of [reminder] at the beginning of their title (the summary attribute).
         * This function checks if an event has that reminder tag.
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
                    if (!metadata.daysUntil && metadata.hrsUntil < 0) {
                        metadata.visible = false;
                    }
                    $scope.countdown.push(metadata);
                }
                $scope.visibleReminders = $scope.countdown.length;
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
