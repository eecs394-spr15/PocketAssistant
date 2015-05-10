angular
    .module('example')
    .controller('IndexController', function($scope, supersonic) {
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
