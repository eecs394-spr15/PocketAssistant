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

            $scope.getEvent($scope.events[0]);

            expect($scope.updateData).toBe($scope.events[0]);
        });


    });


});