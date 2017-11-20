describe('FirstController', function() {
	
	beforeEach(module('firstApp'));
	
	it('bala bala', inject(function($controller) {
		var scope = {};
		var ctrl = $controller('FirstController', {$scope: scope});
		
		expect(scope.list.length).toBe(32);
	}));
});