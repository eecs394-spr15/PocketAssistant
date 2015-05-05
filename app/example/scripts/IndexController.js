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
                alert('login complete');
                $scope.token = gapi.auth.getToken();
            });
        }
    });
