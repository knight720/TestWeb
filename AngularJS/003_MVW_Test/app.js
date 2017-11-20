var firstApp = angular.module('firstApp', []);

firstApp.controller('FirstController', function FirstController($scope) {
	$scope.list = [
		{
			a:'aa',
			b:'bb'
		},{
			a:'cc',
			b:'dd',
		},{
			a:'YAMAHA',
			b:'X Max 300',
		}
	];
});