/**
 * Created by Mingyue on 5/4/15.
 */
angular
    .module('example')
    .controller('IndexController', function($scope, supersonic) {

        today=new Date();
        function initArray(){
            this.length=initArray.arguments.length;
            for(var i=0;i<this.length;i++)
                this[i+1]=initArray.arguments[i]}
        var d=new initArray("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
        $scope.month = today.getMonth() + 1;
        $scope.day = today.getDate();
        $scope.year =today.getYear()-100;
        $scope.xx = d[today.getDay()+1];//" ",today.getMonth()+1,"/",today.getDate(),"/",today.getYear()-100,"   ",d[today.getDay()+1],"!";

    });



