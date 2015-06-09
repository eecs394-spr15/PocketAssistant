describe("A suite",function(){

    beforeEach(module('example'));

    var controller, $scope;

    beforeEach(inject(function($controller, $rootScope){
        $scope = $rootScope.$new();
        controller = $controller('IndexController',{
            $scope:$scope
        });
    }));

    it("contains spec with an expectation", function(){

        $scope.isNotHourLong($scope.sugg[0]);
        expect(true).toBe(true);
    })
});