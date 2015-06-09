describe("Corey's Test Suite",function(){

    describe('Client Load Testing', function(){

        beforeEach(module('example'));

        var controller, $scope;

        beforeEach(inject(function($controller, $rootScope){
            $scope = $rootScope.$new();
            controller = $controller('IndexController',{
                $scope:$scope
            });
        }));

        it("Should try to get calendar data upon client load", function(){

            $scope.addMockEvents();

            spyOn($scope, 'getCalendarData').and.callThrough();

            $scope.handleClientLoad();
            expect($scope.getCalendarData).toHaveBeenCalled()
        })
    });

    describe('Editing Events', function(){
        beforeEach(module('example'));

        var controller, $scope;

        beforeEach(inject(function($controller, $rootScope){
            $scope = $rootScope.$new();
            controller = $controller('IndexController',{
                $scope:$scope
            });
        }));

        it("Should load an event to edit", function(){

            $scope.addMockEvents();

            var ev = $scope.mockEvents[0]

            $scope.getCalendarData();
            $scope.getEvent(ev);

            expect($scope.updateData).toBe(ev);
        });

        it("Should edit the colorId of an event", function(){

            $scope.addMockEvents();

            $scope.getCalendarData();

            var ev = $scope.updateData = {
                "id": 3,
                "summary": "[reminder]asdf",
                "colorId": "11",
                "start": {"dateTime": "2015-06-09T08:30:00-05:00"},
                "end": {"dateTime": "2015-06-09T09:00:00-05:00"}
            }

            $scope.addNewEvent();
            expect($scope.events).toContain(ev);

        })

    });


});