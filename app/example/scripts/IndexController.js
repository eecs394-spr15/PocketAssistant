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
        ]

        $scope.events = [
            {
                "source": {
                    "title": "394 class"
                },
                "start": {
                    "date": 2015-5-10,
                    "dateTime": "2015-5-10T11:00:00+0000",
                    "timeZone": "ET"
                },
                "end": {
                    "date": 2015-5-10,
                    "dateTime": "2015-5-10T12:00:00+0000",
                    "timeZone": "ET"
                }
            },
            {
                "source": {
                    "title": "395 class"
                },
                "start": {
                    "date": 2015-5-10,
                    "dateTime": "2015-5-10T13:00:00+0000",
                    "timeZone": "ET"
                },
                "end": {
                    "date": "5/10/2015",
                    "dateTime": "2015-5-10T14:00:00+0000",
                    "timeZone": "ET"
                }
            },
            {
                "source": {
                    "title": "396 class"
                },
                "start": {
                    "date": "5/10/2015",
                    "dateTime": "2015-5-10T15:00:00+0000",
                    "timeZone": "ET"
                },
                "end": {
                    "date": "5/10/2015",
                    "dateTime": "2015-5-10T16:00:00+0000",
                    "timeZone": "ET"
                }
            }
        ]

        // this code determines if the user has a block of free time
        var lastEvent;
        var firstEvent = true;
        $scope.events.forEach(function(event) {
            var now = event.start.dateTime;
            var hour = parseInt(now.toString().substring(10,12));
            var minute = parseInt(now.toString().substring(13,15));
            var effectiveTime = 60 * hour + minute;

            if(firstEvent == true) {
                lastEvent = event;
                firstEvent = false;
                return;
            }

            var before = lastEvent.end.dateTime;
            var lastHour = parseInt(before.toString().substring(10,12));
            var lastMinute = parseInt(before.toString().substring(13,15));
            var effectiveLastTime = 60 * lastHour + lastMinute;

            if(effectiveTime - effectiveLastTime >= 60 && hour > 9 && hour < 18) {
                window.alert("good");
                //add code that deals with this now
            }

            lastEvent = event;
        });

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

        $scope.auth = function() {
            var config = {
                'client_id': '792909163379-01odbc9kccakdhrhpgognar3d8idug0q.apps.googleusercontent.com',
                'scope': 'https://www.googleapis.com/auth/calendar',
                'immediate': 'true'
            };
            gapi.auth.authorize(config, function () {
                supersonic.logger.log('login complete');
                $scope.token = gapi.auth.getToken();
                gapi.client.load('calendar', 'v3', getCalendarData)
            });
        };

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
                $scope.events = events;
            });
        }

        /*$scope.sugg = [{activity:'gym',count:0},{activity:'meal',count:0},{activity:'pills',count:0}];*/
        $scope.suggAct=['SPAC','Meal','Walk'];
        $scope.suggCount = [0,0,0];
        $scope.take = [false, false,false];
        $scope.suggId = 0;
        $scope.takeSugg= function() {
            $scope.suggCount[$scope.suggId] += 1;
            $scope.take[$scope.suggId] = true;
        };
        $scope.nextSugg = function() {
            if ($scope.suggId < $scope.suggAct.length-1) {
                $scope.suggId +=1;
            }
            else {
                $scope.suggId = 0;
            }
        };


       
    });
