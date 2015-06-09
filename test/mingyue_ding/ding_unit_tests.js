/**
 * Created by Mingyue on 6/7/15.
 */
describe('Unit: checkConflict()', function() {
    beforeEach(module('example'));
    var controller, scope;
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        controller = $controller('IndexController', {
            $scope: scope
        });
        var currDate = new Date(Date.now());
        currDate.setHours(0, 0, 0, 0);
        scope.today = currDate.toISOString();
    }));

    it('Two events 9am-1pm, 11am-12pm: conflict',function() {
        var t = new Date(new Date(scope.today));
        var starttime1 = new Date(t.setHours(9));
        var endtime1 = new Date(t.setHours(13));
        var starttime2 = new Date(t.setHours(11));
        var endtime2 = new Date(t.setHours(12));
        scope.events = [{"start": {"dateTime": starttime1},"end": {"dateTime": endtime1}},
            {"start": {"dateTime": starttime2},"end": {"dateTime": endtime2}}];
        scope.checkConflict();
        expect(scope.events[0].conflict).toBe(1);
        expect(scope.events[1].conflict).toBe(3);
    });

    it('Two events 9am-11pm, 11am-12pm: no conflict',function() {
        var t = new Date(new Date(scope.today));
        var starttime1 = new Date(t.setHours(9));
        var endtime1 = new Date(t.setHours(11));
        var starttime2 = new Date(t.setHours(11));
        var endtime2 = new Date(t.setHours(12));
        scope.events = [{"start": {"dateTime": starttime1},"end": {"dateTime": endtime1}},
            {"start": {"dateTime": starttime2},"end": {"dateTime": endtime2}}];
        scope.checkConflict();
        expect(scope.events[0].conflict).toBe(0);
        expect(scope.events[1].conflict).toBe(0);
    });

    it('3 events 9am-4pm, 11am-12pm,1pm-2pm : conflict',function() {
        var t = new Date(new Date(scope.today));
        var starttime1 = new Date(t.setHours(9));
        var endtime1 = new Date(t.setHours(16));
        var starttime2 = new Date(t.setHours(11));
        var endtime2 = new Date(t.setHours(12));
        var starttime3 = new Date(t.setHours(13));
        var endtime3 = new Date(t.setHours(14));
        scope.events = [{"start": {"dateTime": starttime1},"end": {"dateTime": endtime1}},
            {"start": {"dateTime": starttime2},"end": {"dateTime": endtime2}},
            {"start": {"dateTime": starttime3},"end": {"dateTime": endtime3}}];
        scope.checkConflict();
        expect(scope.events[0].conflict).toBe(1);
        expect(scope.events[1].conflict).toBe(2);
        expect(scope.events[2].conflict).toBe(3);
    });

    it('3 events 9am-1pm, 11am-2pm,1pm-3pm : conflict',function() {
        var t = new Date(new Date(scope.today));
        var starttime1 = new Date(t.setHours(9));
        var endtime1 = new Date(t.setHours(13));
        var starttime2 = new Date(t.setHours(11));
        var endtime2 = new Date(t.setHours(14));
        var starttime3 = new Date(t.setHours(13));
        var endtime3 = new Date(t.setHours(15));
        scope.events = [{"start": {"dateTime": starttime1},"end": {"dateTime": endtime1}},
            {"start": {"dateTime": starttime2},"end": {"dateTime": endtime2}},
            {"start": {"dateTime": starttime3},"end": {"dateTime": endtime3}}];
        scope.checkConflict();
        expect(scope.events[0].conflict).toBe(1);
        expect(scope.events[1].conflict).toBe(2);
        expect(scope.events[2].conflict).toBe(3);
    });
});


describe('Unit: makeSuggestion()', function() {
    beforeEach(module('example'));
    var controller, scope;
    beforeEach(inject(function($controller, $rootScope){
        scope = $rootScope.$new();
        controller = $controller('IndexController',{
            $scope:scope
        });
        var currDate = new Date(Date.now());
        currDate.setHours(0, 0, 0, 0);
        scope.today = currDate.toISOString();
    }));

    it('No events: should create 14 new events',function() {
        scope.events = [];
        expect(scope.events.length).toBe(0);
        //given empty events array, 14 one-hour long events should be created from 8am to 10pm.
        scope.makeSuggestion();
        expect(scope.events.length).toBe(14);
    });

    it('One event 6am-7am: should create 14 new events',function() {
        var t = new Date(new Date(scope.today));
        var starttime = new Date(t.setHours(6));
        var endtime = new Date(t.setHours(7));
        scope.events = [{"start": {"dateTime": starttime},"end": {"dateTime": endtime}}];
        //given one event ending before 8am, 14 one-hour long events should be created from 8am to 10pm.
        expect(scope.events.length).toBe(1);
        scope.makeSuggestion();
        expect(scope.events.length-1).toBe(14);
    });

    it('One event 12pm-1pm: should create 13 new events',function() {
        var t = new Date(new Date(scope.today));
        var starttime = new Date(t.setHours(12));
        var endtime = new Date(t.setHours(13));
        scope.events = [{"start": {"dateTime": starttime},"end": {"dateTime": endtime}}];
        expect(scope.events.length).toBe(1);
        scope.makeSuggestion();
        expect(scope.events.length-1).toBe(13);
    });

    it('One event 12pm-2:30pm: should create 12 new events',function() {
        var t = new Date(new Date(scope.today));
        var starttime = new Date(t.setHours(12));
        var endtime = new Date(t.setHours(14));
        endtime = new Date(endtime.setMinutes(30));
        scope.events = [{"start": {"dateTime": starttime},"end": {"dateTime": endtime}}];
        expect(scope.events.length).toBe(1);
        scope.makeSuggestion();
        expect(scope.events.length-1).toBe(12);
    });
});