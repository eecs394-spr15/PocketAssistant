<<<<<<< HEAD
=======
/**
 * Created by Mingyue on 5/4/15.
 */
>>>>>>> 7bccec3fae397df229426a15c9ed64599065dc9e
angular
    .module('example')
    .controller('IndexController', function($scope, supersonic) {

        today=new Date();
        function initArray(){
            this.length=initArray.arguments.length;
            for(var i=0;i<this.length;i++)
                this[i+1]=initArray.arguments[i]}
        var d=new initArray("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
        $scope.month = today.getMonth() + 1;
        $scope.day = today.getDate();
        $scope.year =today.getYear()-100;
        $scope.xx = d[today.getDay()+1];//" ",today.getMonth()+1,"/",today.getDate(),"/",today.getYear()-100,"   ",d[today.getDay()+1],"!";

    });




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
    });
