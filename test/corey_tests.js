describe("A suite",function(){

    beforeEach(module('example'));

    var IndexController, scope;

    beforeEach(inject(function($rootScope, $controller){
        scope=$rootScope.$new();
        IndexController = $controller('IndexController', {
            $scope: scope
        });
    }));


    it("contains spec with an expectation", function(){
        expect(true).toBe(true);
    })
});