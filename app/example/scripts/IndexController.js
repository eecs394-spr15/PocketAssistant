angular
    .module('example')
    .controller('IndexController', function ($scope, supersonic, $timeout) {
        //------------------------------------------------------------------
        //GOOGLE API CREDENTIALS
        //------------------------------------------------------------------

        // clientId is the Oauth Client ID for web applications
        var clientId = '792909163379-01odbc9kccakdhrhpgognar3d8idug0q.apps.googleusercontent.com';

        //scopes is the applications we wish to authenticate for. This scope allows for Calendar read/write access
        var scopes = 'https://www.googleapis.com/auth/calendar';

        //apiKey is the public API key for browser applications
        var apiKey = 'AIzaSyAZkvW_yVrdUVEjrO7_DwFq2NidEkSEAoE';

        //------------------------------------------------------------------
        //SET DEFAULT FLAGS AND VARIABLES
        //------------------------------------------------------------------

        //flag representing whether or not we are on the main page
        $scope.mainPage = true;

        //Data structure holding the page header contents.
        $scope.titleBar = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};

        //flag denoting if calendar data is loading in order to show or hide the loading icon
        $scope.loading = false;

        //Date object representing the current date page on the calendar
        $scope.calendarDate = Date.now();

        //Number of days navigated forward or backward used to calculate calendar dates to load
        var dayCount = 0;

        //Text for reminder tag
        var reminderTag = "[reminder]";

        //------------------------------------------------------------------
        //Google Calendar Authentication
        //------------------------------------------------------------------

        /**
         * handleClientLoad sets the API Key and checks user authentication
         *
         * This function is called when the Authorization button is clicked. It sets the API key and calls checkAuth()
         * It can also be called on client load for automatic authentication.
         */
        $scope.handleClientLoad = function () {
            gapi.client.setApiKey(apiKey);
            window.setTimeout(checkAuth, 1);
        };

        /**
         * checkAuth checks the users authorization in the background.
         *
         * This function attempts to log in an already-authorized user for google calendar use without popping up a
         * confirmation box once it succeeds or fails, it passes control to the handleAuthResult function with an object
         * representing the result of the request.
         */
        function checkAuth() {
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
        }


        /**
         * handleAuthResult validates the result of an authorization request and determines if it was succesful or not
         *
         * takes an authResult, which is JSON returned by the Google API representing the success or failure of the
         * authorization request.
         *
         * If the authorization was successful, this makes the API call. Otherwise it tries to authenticate again with
         * Google's popup confirmation using the handleAuthClick function
         */
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

        /**
         * handleAuthClick attempts to authorize with an authorization popup through google.
         *
         * when the popup is completed, passes control back to handleAuthResult with the success or failure of the authorization
         */
        function handleAuthClick() {
            // Step 3: get authorization to use private data
            gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
            return false;
        }

        /**
         * makeAPICall removes the splash screen and loads the calendar API for data lodaing
         *
         * sets the background image css property to blank, then loads the calendar v3 API and returns control to
         * getCalendarData once loaded.
         */
        function makeApiCall() {
            document.body.style.background = "url()";
            gapi.client.load('calendar', 'v3', getCalendarData);
        }


        /**
         * getFutureDay gets the number of milliseconds in numDays days
         *
         * Takes a number of days
         * returns the number of milliseconds in that many days
         */
        function getFutureDay(numDays) {
            return (24 * 60 * 60 * 1000 * numDays);
        }


        /**
         * getCalendarData gets the current day's events from your google calendar
         *
         * it gets events that start after midnight today, and end before 11:59:59:9999 today and responds with them in an
         * array ordered by start time. Once this response is completed, the events are parsed, suggestions are made, and
         * reminders are gathered.
         */
        function getCalendarData() {
            $scope.loading = true;
            //limit our query to events occurring today
            var currDate = new Date(Date.now() + getFutureDay(dayCount));
            currDate.setHours(0, 0, 0, 0);

            $scope.calendarDate=currDate;
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
                supersonic.logger.log("hi");
                supersonic.logger.log(resp);

                //make suggestions based on events
                makeSuggestion();

                //find the current event
                checkCurrent();

                //check for conflicting events
                checkConflict();

                //find all reminders
                getTaggedEvents();
            });
        }

        $scope.Mock_events = {"kind":"calendar#events","etag":"\"1433436564831000\"","summary":"teambrown394@gmail.com","updated":"2015-06-04T16:49:24.831Z","timeZone":"America/Chicago","accessRole":"owner","defaultReminders":[{"method":"popup","minutes":30}],"items":[{"kind":"calendar#event","etag":"\"2866763623246000\"","id":"kqjhaugb2mkfmo7ddd8ngen50g","status":"confirmed","htmlLink":"https://www.google.com/calendar/event?eid=a3FqaGF1Z2IybWtmbW83ZGRkOG5nZW41MGcgdGVhbWJyb3duMzk0QG0","created":"2015-05-29T04:21:18.000Z","updated":"2015-06-04T01:36:51.623Z","summary":"Go for a run","colorId":"11","creator":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"organizer":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"start":{"dateTime":"2015-06-07T06:30:00-05:00"},"end":{"dateTime":"2015-06-07T07:30:00-05:00"},"iCalUID":"kqjhaugb2mkfmo7ddd8ngen50g@google.com","sequence":1,"reminders":{"useDefault":true}},{"kind":"calendar#event","etag":"\"2866763806744000\"","id":"gego598smdlf2d0ffm468i4oqc","status":"confirmed","htmlLink":"https://www.google.com/calendar/event?eid=Z2VnbzU5OHNtZGxmMmQwZmZtNDY4aTRvcWMgdGVhbWJyb3duMzk0QG0","created":"2015-06-04T01:38:23.000Z","updated":"2015-06-04T01:38:23.372Z","summary":"shopping with mom","creator":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"organizer":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"start":{"dateTime":"2015-06-07T14:00:00-05:00"},"end":{"dateTime":"2015-06-07T17:00:00-05:00"},"iCalUID":"gego598smdlf2d0ffm468i4oqc@google.com","sequence":0,"reminders":{"useDefault":true}},{"kind":"calendar#event","etag":"\"2866763761026000\"","id":"j80kcdm5jv6vq6pulpelqfdvms","status":"confirmed","htmlLink":"https://www.google.com/calendar/event?eid=ajgwa2NkbTVqdjZ2cTZwdWxwZWxxZmR2bXMgdGVhbWJyb3duMzk0QG0","created":"2015-06-04T01:37:53.000Z","updated":"2015-06-04T01:38:00.513Z","summary":"Emily's birthday party","colorId":"4","creator":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"organizer":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"start":{"dateTime":"2015-06-07T21:00:00-05:00"},"end":{"dateTime":"2015-06-07T22:00:00-05:00"},"iCalUID":"j80kcdm5jv6vq6pulpelqfdvms@google.com","sequence":0,"reminders":{"useDefault":true}}],"result":{"kind":"calendar#events","etag":"\"1433436564831000\"","summary":"teambrown394@gmail.com","updated":"2015-06-04T16:49:24.831Z","timeZone":"America/Chicago","accessRole":"owner","defaultReminders":[{"method":"popup","minutes":30}],"items":[{"kind":"calendar#event","etag":"\"2866763623246000\"","id":"kqjhaugb2mkfmo7ddd8ngen50g","status":"confirmed","htmlLink":"https://www.google.com/calendar/event?eid=a3FqaGF1Z2IybWtmbW83ZGRkOG5nZW41MGcgdGVhbWJyb3duMzk0QG0","created":"2015-05-29T04:21:18.000Z","updated":"2015-06-04T01:36:51.623Z","summary":"Go for a run","colorId":"11","creator":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"organizer":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"start":{"dateTime":"2015-06-07T06:30:00-05:00"},"end":{"dateTime":"2015-06-07T07:30:00-05:00"},"iCalUID":"kqjhaugb2mkfmo7ddd8ngen50g@google.com","sequence":1,"reminders":{"useDefault":true}},{"kind":"calendar#event","etag":"\"2866763806744000\"","id":"gego598smdlf2d0ffm468i4oqc","status":"confirmed","htmlLink":"https://www.google.com/calendar/event?eid=Z2VnbzU5OHNtZGxmMmQwZmZtNDY4aTRvcWMgdGVhbWJyb3duMzk0QG0","created":"2015-06-04T01:38:23.000Z","updated":"2015-06-04T01:38:23.372Z","summary":"shopping with mom","creator":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"organizer":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"start":{"dateTime":"2015-06-07T14:00:00-05:00"},"end":{"dateTime":"2015-06-07T17:00:00-05:00"},"iCalUID":"gego598smdlf2d0ffm468i4oqc@google.com","sequence":0,"reminders":{"useDefault":true}},{"kind":"calendar#event","etag":"\"2866763761026000\"","id":"j80kcdm5jv6vq6pulpelqfdvms","status":"confirmed","htmlLink":"https://www.google.com/calendar/event?eid=ajgwa2NkbTVqdjZ2cTZwdWxwZWxxZmR2bXMgdGVhbWJyb3duMzk0QG0","created":"2015-06-04T01:37:53.000Z","updated":"2015-06-04T01:38:00.513Z","summary":"Emily's birthday party","colorId":"4","creator":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"organizer":{"email":"teambrown394@gmail.com","displayName":"Team Brown","self":true},"start":{"dateTime":"2015-06-07T21:00:00-05:00"},"end":{"dateTime":"2015-06-07T22:00:00-05:00"},"iCalUID":"j80kcdm5jv6vq6pulpelqfdvms@google.com","sequence":0,"reminders":{"useDefault":true}}]}}
        // Call two functions to handle the start of touch and moving of touch.
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);

        // Initialize two variables to store the value before moving the finger of  X and Y axis.
        var xDown = null;
        var yDown = null;

        /**
         * handleTouchStart get the value before moving the finger of  X and Y axis.
         *
         * Takes an moving event as an input.
         * Calculate and store the values of xDown and yDown.
         *
         * Get the coordinate value by using .clientX or .clientY of the first element in the touches array.
         */
        function handleTouchStart(evt) {
            xDown = evt.touches[0].clientX;
            yDown = evt.touches[0].clientY;
        }

        /**
         * handleTouchMove fulfill the function of switching date when you swipe the page.
         *
         * takes an moving event as an input
         *
         * call the function of $scope.nextdate when swipe left, call the function of $scope.prevdate when swipe right
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


        /**
         * nextdate advances the calendar view forwards 1 day
         *
         * Calculates the date to load using the current date and the day offset stored in dayCount
         */
        $scope.nextdate = function () {
            $scope.calendarDate =  new Date(Date.now() + getFutureDay(++dayCount));
        };

        /**
         * prevdate moves the calendar view back 1 day
         *
         * Calculates the date to load using the current date and the day offset stored in dayCount
         */
        $scope.prevdate = function () {
            var currDate = new Date(Date.now() + getFutureDay(--dayCount));
            $scope.calendarDate = currDate;
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

        /**
         * sugg array holds attributes of suggestions from suggestion drop-down menu
         *
         * Drop-down menu displays when user clicks navicon (three line icon) to the right of empty time slots
         *
         * id: order of appearance in drop down menu, activity: title, count: , take: whether user chooses option,
         * hourLong: time duration of activity
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

        /**
         * isActive checks if an event is already set to active
         *
         * takes an event and an id as an input
         * returns a boolean
         *
         * If you already select the suggestion, it will return true, if you click another suggestion return false.
         */
        $scope.isActive = function (ev, id) {
            return ev.active === id;
        };

        /**
         * setActive set an event to active
         *
         * takes a suggestion event and an id as an input
         * set the active event represented by the event's id
         *
         * Set the suggestion to active once you click on the suggestion.
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

        //Initialize the variables to show all reminders at initial state
        $scope.hideReminder = false;
        $scope.chevron = "super-chevron-up";
        $scope.showOrHide = "Hide Reminders";

        /**
         * switchButton, show or hide reminders when you click it
         *
         * Get the current state to make a change of the button and show or hide the reminders
         *
         * Change the truth-value of ng-hide or ng-show based on the current state, and also change the direction of
         * the chevron.
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

        //initialize clear eventTag to not set an event to be a reminder at the beginning
        $scope.eventTag = false;

        /**
         * getEvent pull an event from your calendar with it's event id
         *
         * takes an event as an input
         *
         * This function will check if this event is a reminder first.
         * Then it will show edit page, and initial event information like summary, location, and etc.on this page.
         *
         */
        $scope.getEvent = function (ev) {
            $scope.eventTag = false;
            if (ev.summary.substring(0,10) == reminderTag){
                $scope.eventTag = true;
            }
            $scope.updateData = {};
            var startTime = new Date(ev.start.dateTime);
            $scope.updateData.start = {dateTime: startTime};
            var endTime = new Date(ev.end.dateTime);
            $scope.updateData.end = {dateTime: endTime};
            $scope.titleBar = {name: 'Edit your event', button: 'Clear', back: 'Back', addBut: ''};
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


        //confirm is a prompt to give user two options as yes or no to confirm an action to delete, update or add an event
        var confirm = {
            buttonLabels: ["Yes", "No"]
        };

        /**
         * update is a function to update an event after user confirm 'yes'
         *
         *  When user click update button on edit page, a prompt will pop out to ask user to confirm this update. If user choose 'yes',
         *  event will be updated.
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

        /**
         * updateEvent update an event on edit page to your google calendar
         *
         * Event should be checked if it should be added or deleted a reminder tag at first.If event is not a reminder and reminder toggle is set,reminder
         * tag should be added to event summary. If event is a reminder and reminder toggle is clear, tag should be removed as we cut the summary string.
         * After event updated,getCalendarData function will be called to refresh event list.An alert will pop out and main page will show.
         */
        $scope.updateEvent = function () {
            $scope.re = $scope.updateData;
            if($scope.re.summary.substring(0,10) == reminderTag){
                if($scope.eventTag == false) {
                    $scope.re.summary = $scope.re.summary.substr(10);
                }}
            else{
                if($scope.eventTag == true){
                    $scope.re.summary = reminderTag.concat($scope.re.summary);
                }
            }
            $scope.requestevent = gapi.client.calendar.events.update(
                {'calendarId': 'primary', 'eventId': $scope.re.id, 'resource': $scope.re});
            $scope.requestevent.execute(function (resp) {
                $scope.mainPage = true;
                $scope.titleBar = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
                getCalendarData();
                supersonic.ui.dialog.alert("Event Updated!");
            });
        };

        /**
         * delete event confirms with user the deletion of a calendar event
         *
         * Called when user clicks 'Delete' from edit page
         * Takes no input
         * If user confirms, calls 'deleteEvent' function
         */
        $scope.delete = function () {
            supersonic.ui.dialog.confirm("Are you sure you want to delete this event?", confirm).then(function (index) {
                if (index == 0) {
                    $scope.deleteEvent();
                }
            });
        };

        /**
         * deleteEvent delete an event currently on edit page from your calendar
         *
         * Google api will be called to delete an event with it's id.After event deleted,,getCalendarData function will be
         * called to refresh calendar list..An alert will pop out to notify event deleted, and main page will show.
         */
        $scope.deleteEvent = function () {
            $scope.requestevent = gapi.client.calendar.events.delete(
                {'calendarId': 'primary', 'eventId': $scope.re.id});
            $scope.requestevent.execute(function (resp) {
                $scope.mainPage = true;
                $scope.titleBar = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
                getCalendarData();
                supersonic.ui.dialog.alert("Event Deleted!");
            });
        };

        /**
         * undoButton reset all the values modified after entered the edit page
         *
         * Called when the Clear button is clicked.
         *
         * Use a ng-click to call this function, and first clear all the input values, and then call the getEvent
         * function to get the initial value for the input
         */
        $scope.undoButton = function () {
            if ($scope.mainPage == false && $scope.addPage == false) {
                $scope.eventTag = false;
                $scope.getEvent($scope.re);
                if($scope.re.summary.substring(0,10) == reminderTag){
                    $scope.eventTag = true;
                }
            }
        };

        /**
         * backButton goes to the home page
         *
         * Called when the Back button is clicked.
         *
         * Use a ng-click to call this function, and hide the edit page and show the main page by change the truth
         * values of the ng-show or ng-hide.
         */
        $scope.backButton = function () {
            $scope.mainPage = true;
            $scope.titleBar = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
            $scope.eventTag = false;
        };

        /**
         * addButton enter the Add an event page and user can add new event
         *
         * Called when the Add button is clicked.
         *
         * Use a ng-click to call this function, and hide the main page by set the $scope.mainPage to false, and enter
         * a new page which can add new event
         */
        $scope.addButton = function () {
            if ($scope.mainPage == true) {
                $scope.updateData = {"summary":'',"start":{"dateTime":''},"end":{"dateTime":''}};
                $scope.mainPage = false;
                $scope.titleBar = {name: 'Add an event', button: '', back: 'Back', addBut: ''};
                $scope.addPage = true;
                $scope.eventTag = false;
            }
        };

        /**
         * addEvent is a function to add an event after user confirm 'yes'
         *
         *  When user click add button on Add event page,it will check several conditions first, like if the summary of event is null,
         *  or if start time and end time are be added. Then, user will be alerted with corresponding information
         *  If this event is ready to be added, a prompt will pop out to ask user to confirm this add. If user choose 'yes',
         *  event will be updated.If choosing 'no',no action.
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

        /**
         * addNewEvent add a new event to your google calendar
         *
         * Event should be checked if it need a reminder tag at first.If reminder toggle is set,reminder tag should be added to event summary.
         * After event is added,event list will be refreshed.An alert will pop out to notify event adeed and main page will show.
         */
        $scope.addNewEvent = function(){
            if ($scope.eventTag == true){
                supersonic.logger.log('adding reminder tag is needed');
                $scope.updateData.summary = reminderTag.concat($scope.updateData.summary);
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
                $scope.titleBar = {name: 'Pocket Assistant', button: '', back: '', addBut: 'Add'};
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

        /**
         * getTaggedEvents searches user's calendar for events with '[reminder]' tag in summary attribute, pushes
         * queried events to 'countdown' array and calculates days/hours until event occurs
         *
         * Takes no arguments
         * Retrieves date currently being viewed by the user and present time of day ('hr')
         * Queries the user's calendar for all events with '[reminder]' tag (set to be in summary attribute, but
         * if elsewhere found, will also return those events)
         *
         * Retrieves date/time information from queried events and calculates time difference between event and the date
         * currently in view by the user
         * Checks whether reminder has already passed date in view and hides reminder if so
         *
         * Populates 'countdown' array with reminders
         * Adjusts 'visibleReminders' count for display purposes (text displayed when reminders area is collapsed)
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

        /**
         * setReminderToHidden allows user to hide a reminder from view without deleting the reminder
         *
         * Called when user clicks "X" on reminder event bar
         *
         * Takes event id as input and finds event within array of reminders
         * Sets 'visible' attribute to false to hide reminder and adjusts count of 'visibleReminders' for display purposes
         * (text displayed when reminders area is collapsed)
         */
        $scope.setReminderToHidden = function(id) {
            for (var c in $scope.countdown) {
                if ($scope.countdown[c].eventID == id) {
                    $scope.countdown[c].visible = false;
                }
            }
            $scope.visibleReminders -= 1;
            supersonic.logger.log($scope.countdown);
        };

        /**
         * $watch used to watch every change of 'calendarDate' value
         *
         * calendarDate is a ng-model value binding to date in calendar picker on the top of the main page. Every time user selects a date in calendar picker,
         * it will re-calculate dayCount value as the difference between current date and selected date, which will be used to show correct events on selected date
         */
        $scope.$watch('calendarDate',function() {
            var selectDate = $scope.calendarDate;
            selectDate.setHours(0, 0, 0, 0);
            var currDate = new Date();
            currDate.setHours(0, 0, 0, 0);
            dayCount = (selectDate-currDate)/(24 * 60 * 60 * 1000);
            $scope.daycount = dayCount;
        });

        /**
         * $watch used to watch every change of 'dayCount' value
         *
         * Whenever daycount is changed,getCalendarData will be called to refresh event list to show events on selected date.
         * Attribute $timeout is used to delay the function call, in case user will change the date too fast in calendar picker to cause problems.
         */
        $scope.$watch('daycount',function(){
            $timeout(getCalendarData(),1000);
        })
    });
