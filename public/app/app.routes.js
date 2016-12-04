angular.module('appRoutes', ['ngRoute'])


.config(function($routeProvider, $locationProvider) {

	$routeProvider

		.when('/', {
			templateUrl: 'app/views/pages/home.html',
			controller: 'MainController',
			controllerAs: 'main'
		})
		.when('/login', {
			templateUrl: 'app/views/pages/login.html'
		})
		.when('/signup', {
			templateUrl: 'app/views/pages/signup.html'
		})

		.when('/allComments', {
			templateUrl: 'app/views/pages/allComments.html',
			controller: 'AllCommentsController',
			controllerAs: 'comment',
			resolve: {
				comments: function(Comment) {
					return Comment.allComments();
				}
			}

		})

	$locationProvider.html5Mode(true);

})