angular
    .module('example')
    .controller('IndexController', function($scope, supersonic) {


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
