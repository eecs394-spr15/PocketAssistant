/**
 * Created by Xin on 6/7/15.
 */
describe('Unit: nextdate() and prevdate()', function() {
    beforeEach(module('example'));
    var controller, scope;
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        controller = $controller('IndexController', {
            $scope: scope
        });
    }));

    it('Switching to next day',function() {
        var dayCount = 0;
        scope.nextdate();
        expect(new Date(scope.calendarDate).getTime()).toBe( new Date(Date.now() + (24 * 60 * 60 * 1000)).getTime());
    });

    it('Switching to previous day',function() {
        var dayCount = 0;
        scope.prevdate();
        expect(new Date(scope.calendarDate).getTime()).toBe( new Date(Date.now() - (24 * 60 * 60 * 1000)).getTime());
    });
});

describe('Unit: checkCurrent()', function() {
    beforeEach(module('example'));
    var controller, scope;
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        controller = $controller('IndexController', {
            $scope: scope
        });
        var currDay = new Date(Date.now());
        scope.currHour = currDay.getHours();
    }));

    it('Only one event is current event',function() {
        var event1Start = scope.currHour - 2 ;
        var event1End = scope.currHour + 2;
        var event2Start = scope.currHour + 2;
        var event2End = scope.currHour + 4;
        scope.events = [{"start": {"dateTime": event1Start},"end": {"dateTime": event1End}},
            {"start": {"dateTime": event2Start},"end": {"dateTime": event2End}}];
        scope.checkCurrent();
        expect(scope.events[0].current).toBe(true);
        expect(scope.events[1].current).toBe(false);
    });

    it('Two events are current events',function() {
        var event1Start = scope.currHour - 2 ;
        var event1End = scope.currHour + 2;
        var event2Start = scope.currHour - 2;
        var event2End = scope.currHour + 4;
        scope.events = [{"start": {"dateTime": event1Start},"end": {"dateTime": event1End}},
            {"start": {"dateTime": event2Start},"end": {"dateTime": event2End}}];
        scope.checkCurrent();
        expect(scope.events[0].current).toBe(true);
        expect(scope.events[1].current).toBe(true);
    });

    it('None of the events is current event',function() {
        var event1Start = scope.currHour - 2 ;
        var event1End = scope.currHour - 1;
        var event2Start = scope.currHour + 2;
        var event2End = scope.currHour + 4;
        scope.events = [{"start": {"dateTime": event1Start},"end": {"dateTime": event1End}},
            {"start": {"dateTime": event2Start},"end": {"dateTime": event2End}}];
        scope.checkCurrent();
        expect(scope.events[0].current).toBe(false);
        expect(scope.events[1].current).toBe(false);
    });
});

