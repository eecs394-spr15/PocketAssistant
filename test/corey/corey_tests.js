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

            spyOn($scope, 'getCalendarData');

            $scope.handleClientLoad();
            expect($scope.getCalendarData).toHaveBeenCalled();
        });

        it("Should make suggestions, check conflicts, and get reminders on client load", function(){

            $scope.addMockEvents();

            spyOn($scope, 'makeSuggestion');
            spyOn($scope, 'checkConflict');

            $scope.handleClientLoad();
            expect($scope.makeSuggestion).toHaveBeenCalled();
            expect($scope.checkConflict).toHaveBeenCalled();

        });

        it("Should initialize environment variables and show the calendar succesfully", function(){

            $scope.addMockEvents();
            $scope.handleClientLoad();

            expect($scope.today).toBeDefined();
            expect($scope.date).toBeDefined();
            expect($scope.cal).toBe(true);
            expect($scope.events).toBeDefined();
        });
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

            var ev = $scope.mockEvents[0];

            $scope.getCalendarData();
            $scope.getEvent(ev);

            expect($scope.updateData.id).toEqual(ev.id);
        });

        it("Should edit the event successfully", function(){

            $scope.addMockEvents();

            var originalEvent = $scope.mockEvents[0];

            $scope.getCalendarData();

            var originalLen = $scope.events.length;

            $scope.getEvent(originalEvent);

            $scope.updateData.colorId = '3';
            $scope.updateData.summary = 'Updated';

            $scope.updateEvent();

            expect($scope.events).toContain($scope.updateData);
            expect($scope.events).not.toContain($scope.originalEvent);
            expect($scope.events.length).toBe(originalLen)

        });

        it("Should reset the updateData when undo is pressed", function(){

            $scope.addMockEvents();

            var originalEvent = $scope.mockEvents[0];

            expect($scope.mockEvents).toContain(originalEvent);
            $scope.getCalendarData();

            $scope.getEvent(originalEvent);

            $scope.updateData.colorId = '3';
            $scope.updateData.summary = 'Updated';

            expect($scope.mockEvents).not.toContain($scope.updateData);
            $scope.undoButton();

            expect($scope.updateData.id).toEqual(originalEvent.id);
            expect($scope.updateData.colorId).toEqual(originalEvent.colorId);
            expect($scope.updateData.summary).toEqual(originalEvent.summary);
            expect($scope.events).toContain($scope.updateData);
        });

        it("Should take you back to the main page when back is pressed", function(){

            $scope.addMockEvents();

            $scope.getEvent($scope.mockEvents[0]);

            $scope.backButton();

            expect($scope.mainPage).toBe(true);
            expect($scope.eventTag).toBe(false);

        });

    });


});