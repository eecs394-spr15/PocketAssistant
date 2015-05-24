angular
    .module('example')
    .controller('IndexController', function ($scope, supersonic) {
        var clientId = '792909163379-01odbc9kccakdhrhpgognar3d8idug0q.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/calendar';
        var apiKey = 'AIzaSyAZkvW_yVrdUVEjrO7_DwFq2NidEkSEAoE';
        $scope.authorized = 0;
        $scope.mainPage = true;
        $scope.titleName = {name: 'Pocket Assistant', button: '', back: ''};
        $scope.loading = false;

        $scope.handleClientLoad = function () {
            supersonic.logger.log('enter');
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
            document.body.style.background="url()";
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
            currDate.setHours(0, 0, 0, 0);
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
                'maxResults': 10,
                'orderBy': 'startTime'
            });
            request.execute(function (resp) {
                //When Google Calendar Data is loaded, display it
                $scope.cal = true;
                $scope.events = resp.items;
                makeSuggestion();
                getTaggedEvents();
                checkCurrent();
                checkConflict();

                $scope.loading = false;
            });
        }

        $scope.nextdate = function () {
            dayCount += 1;
            getCalendarData()
        };

        $scope.prevdate = function () {
            dayCount -= 1;
            getCalendarData()
        };

        //Add a suggestion to the events list at index i
        function addSuggestion(startTime, endTime, i, isHourLong) {
            var suggestion = {};
            suggestion.summary = "Free time";
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

        function makeSuggestion() {
            supersonic.logger.log('making suggestions');
            //this will manually insert a suggestion at 9 am if there are no events
            if ($scope.events.length == 0) {
                var today = new Date($scope.today);
                addSuggestion(today.setHours(9), today.setHours(10), 0);
            }

            for (var i = 0; i < $scope.events.length; i++) {
                var nextStart = new Date($scope.events[i].start.dateTime);
                var nextETime = nextStart.getTime();

                if (i == 0) {
                    if (nextStart.getHours() >= 10) {
                        var t = new Date(nextStart);
                        addSuggestion(t.setHours(9, 0, 0, 0), t.setHours(10, 0, 0, 0), i, true);
                    }
                    continue;
                }

                var prevEnd = new Date($scope.events[i - 1].end.dateTime);
                var prevETime = prevEnd.getTime();

                while (nextETime - prevETime >= 3600000) {
                    var currStart = new Date(prevETime);
                    var currEnd = new Date(prevETime + 3600000);
                    if (currEnd.getHours() <= 18) {
                        addSuggestion(currStart, currEnd, i, true);
                        i++;
                        prevEnd = currEnd;
                        prevETime = prevEnd.getTime();
                    }
                    else {
                        break;
                    }

                }

                if (nextStart.getHours() < 18 && nextETime - prevETime >= 1800000) {
                    addSuggestion(prevEnd, nextStart, i, false);
                }
            }

            var lastEnd = new Date($scope.events[$scope.events.length - 1].end.dateTime);
            while (lastEnd.getHours() < 18) {
                var newEnd = new Date(lastEnd.getTime() + 3600000);
                addSuggestion(lastEnd, newEnd, $scope.events.length, true);
                lastEnd = newEnd;
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
                    ev.conflict = 2;
                    eventA.conflict = 1;
                }
                eventA = ev;
                i += 1;
            }
        }

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

        $scope.sugg = [
            {"id": 0, "activity": 'SPAC', "count": 0, "take": false, "hourLong": true},
            {"id": 1, "activity": 'Meal', "count": 0, "take": false, "hourLong": true},
            {"id": 2, "activity": 'Walk', "count": 0, "take": false, "hourLong": false},
            {"id": 3, "activity": 'Free Time', "count": 0, "take": false, "hourLong": true},
            {"id": 4, "activity": 'Free Time', "count": 0, "take": false, "hourLong": false}
        ];

        $scope.isNotHourLong = function (sug) {
            return !sug.hourLong;
        };

        $scope.greaterThanHour = function (ev) {
            return ev.greaterThanHour;
        };

        $scope.isActive = function (ev, id) {
            return ev.active === id;
        };

        $scope.setActive = function (ev, id) {
            ev.active = id;
        };

        $scope.toggle = function (ev) {
            ev.showOption = !ev.showOption;
        };

        $scope.addCalendarData = function (ev) {
            $scope.newEvent = {};
            $scope.newEvent.summary = $scope.sugg[ev.active].activity;
            $scope.newEvent.start = ev.start;
            $scope.newEvent.end = ev.end;
            $scope.newEvent.colorId = "11";
            var request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': $scope.newEvent
            });
            request.execute(function (resp) {
                supersonic.logger.log('Event Added');
                supersonic.logger.log(resp);
                getCalendarData();
            });
            ev.addedEvent = true;
            ev.showOption = !ev.showOption;
        };

/*        $scope.reminders = [
            {
                "title": "394 midterm",
                "numDays": "3"
            },
            {
                "title": "395 midterm",
                "numDays": "2"
            }
        ];*/

        $scope.hideReminder = false;
        $scope.chevron = "super-chevron-up";
        $scope.showOrHide = "Hide Reminders";
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
        $scope.titleInput = "";
        $scope.numDays = "";
        $scope.addReminder = function () {
            if (($scope.titleInput == "") || ($scope.numDays == "")) {
                alert("Name or Time is empty!")
            }
            else {
                if ((isNaN($scope.numDays)) == true) {
                    alert("You must enter a number for the Time!")
                }
                else {
                    var reminder = {};
                    reminder.title = $scope.titleInput;
                    reminder.numDays = $scope.numDays;
                    //$scope.numOfReminders += 1;
                    $scope.reminders.push(reminder);
                    $scope.$apply();
                    sortReminders();
                }
            }
        };

        function sortReminders() {
            $scope.reminders.sort(function (a, b) {
                return parseInt(a.numDays) - parseInt(b.numDays);
            });
        }

        $scope.getEvent = function (ev) {
            $scope.titleName = {name: 'Edit your event', button: 'Undo', back: 'back'};
            $scope.mainPage = false;
            $scope.evid = ev.id;
            $scope.requestEvent = gapi.client.calendar.events.get({'calendarId': 'primary', 'eventId': $scope.evid});
            $scope.requestEvent.execute(function (resp) {
                supersonic.logger.log(resp);
                $scope.re = resp;
                $scope.start = $scope.re.start.dateTime;
                $scope.end = $scope.re.end.dateTime;
                $scope.updateData = $scope.re;
                $scope.updateData.start.dateTime = $scope.re.start.dateTime.substring(11, 16);
                $scope.updateData.end.dateTime = $scope.re.end.dateTime.substring(11, 16);
            });
        };

        $scope.update = function () {
            supersonic.ui.dialog.alert("Update successfully!");
            $scope.updateEvent();
            $scope.mainPage = true;
            $scope.titleName = {name: 'Pocket Assistant', button: '', back: ''};
            getCalendarData();
        };

        $scope.updateEvent = function () {
            findColor($scope.colorArray);
            $scope.re = $scope.updateData;
            $scope.re.end.dateTime = $scope.end.substring(0, 11) + $scope.updateData.end.dateTime + $scope.end.substr(16);
            $scope.re.start.dateTime = $scope.start.substring(0, 11) + $scope.updateData.start.dateTime + $scope.start.substr(16);
            $scope.requestevent = gapi.client.calendar.events.update(
                {'calendarId': 'primary', 'eventId': $scope.re.id, 'resource': $scope.re});
            $scope.requestevent.execute(function (resp) {
                supersonic.logger.log('update event');
                supersonic.logger.log(resp)
            });
        };

        //colorid representation:
        // bold read:11   bold green:10   blod blue:9   grey:8
        // yellow:5   orange:6   red:4  purple:3
        // blue:1  green:2  turquoise:7
        $scope.colorArray = [{title: 'Blue', id: '1'}, {title: 'Green', id: '2'}, {title: 'Purple', id: '3'},
            {title: 'Red', id: '4'}, {title: 'Yellow', id: '5'}, {title: 'Orange', id: '6'},
            {title: 'Turquoise', id: '7'}, {title: 'Grey', id: '8'},
            {title: 'Bold Blue', id: '9'}, {title: 'Bold Green', id: '10'}, {title: 'Bold Red', id: '11'}
        ];
        $scope.colorSelect = 1;

        function findColor(array) {
            for (var i in array) {
                if ($scope.colorSelect == array[i].title) {
                    $scope.updateData.colorId = array[i].id;
                }
            }
        }

        $scope.delete = function () {
            supersonic.ui.dialog.alert("You Delete the event!");
            $scope.deleteEvent();
            $scope.mainPage = true;
            $scope.titleName = {name: 'Pocket Assistant', button: '', back: ''};
            getCalendarData();
        };

        $scope.deleteEvent = function () {
            $scope.requestevent = gapi.client.calendar.events.delete(
                {'calendarId': 'primary', 'eventId': $scope.re.id});
            $scope.requestevent.execute(function (resp) {
                supersonic.logger.log('delete event');
                supersonic.logger.log(resp)
            });
        };
        $scope.undoButton = function () {
            $scope.getEvent($scope.re);
        };
        $scope.backButton = function () {
            $scope.mainPage = true;
            $scope.titleName = {name: 'Pocket Assistant', button: '', back: ''};
        };

        $scope.tags = [''];

        function getTaggedEvents() {
            $scope.countdown = [];
            $scope.numOfReminders = 0;
            var todayDate = new Date();
            var yyyy = todayDate.getFullYear();
            var mm = todayDate.getMonth() + 1;
            var dd = todayDate.getDate();

            var eventList = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': $scope.today,
                'q': 'reminder',
                'showDeleted': false,
                'singleEvents': true,
                'orderBy': 'startTime'
            });
            eventList.execute(function(resp) {
                var events = resp.items;
                for (var i in events) {
                    var evDay = parseInt(events[i].start.dateTime.substr(8, 2));
                    var evMonth = parseInt(events[i].start.dateTime.substr(5, 2));
                    var evYear = parseInt(events[i].start.dateTime.substr(0, 4));
                    var dayCount = Math.floor((365*evYear + evYear/4 - evYear/100 + evYear/400 + evDay + (153*evMonth+8)/5) - (365*yyyy + yyyy/4 - yyyy/100 + yyyy/400 + dd + (153*mm+8)/5));
                    var metadata = {
                        'title': events[i].summary.substr(11),
                        'daysUntil': dayCount
                    }
                    $scope.countdown.push(metadata);
                    $scope.numOfReminders += 1;
                }

                supersonic.logger.log($scope.countdown);
            });
        };

/*        $scope.addTag = function() {
            var options = {
                title: "Add a new tag",
                buttonLabels: ["OK"],
                defaultText: "Type tag word here"
            };

            supersonic.ui.dialog.prompt("New Custom Tag", options).then(function(result) {
                $scope.tags.push(result.input);
                supersonic.logger.log("User added new tag: " + result.input);
            });
        }*/
    });
