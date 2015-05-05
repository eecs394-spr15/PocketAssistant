angular.module('services',[])
    .factory('gCal',function(){
        var calFactory = {};

        var calModel = {}

        calFactory.authorize = function() {
            var config = {
                'client_id': '792909163379-01odbc9kccakdhrhpgognar3d8idug0q.apps.googleusercontent.com',
                'scope': 'https://www.googleapis.com/auth/calendar',
                'immediate': 'true'
            };
            gapi.auth.authorize(config, function () {
                supersonic.logger.log('login complete');
                calModel.token = gapi.auth.getToken();
                return gapi.client.load('calendar', 'v3')
            });
        };

        calFactory.getCalToken = function(){
            return calModel.token;
        };

        return calFactory;

    });
