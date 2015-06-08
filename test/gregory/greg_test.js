    /**
 * Created by Gregory on 6/6/2015.
 */

describe('IndexController', function () {

    /*it("contains", function(){
        expect(true).toBe(true);
    });*/

    beforeEach(module('example'));

    /*var $controller;

    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));*/

    var IndexController, scope;

    beforeEach(inject(function($rootScope, $controller){
        scope=$rootScope.$new();
        IndexController = $controller('IndexController', {
            $scope: scope
        });
    }));

    describe('$scope.isNotHourLong', function() {
        it("returns true if the suggestion is less than an hour long", function() {
            //var $scope = {};
            //var controller = IndexController;//$controller('IndexController', { $scope: $scope });

            scope.addMockEvents();

            var events_length = scope.mockEvents.length;

            var start = new Date(new Date(scope.today));
            var end = new Date(start.getTime() + 3600000);
            scope.testAddSuggestion(start, end, 0, true);

            var new_length = scope.mockEvents.length;

            expect(events_length + 1).toEqual(new_length);

            //var testBoolean = scope.isNotHourLong(scope.sugg[0]);
            //expect(testBoolean).toEqual(false);
        });
    });

    /*var $controller;

    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));*/

});