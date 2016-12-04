angular.module('commentService', [])


.factory('Comment', function($http) {


	var commentFactory = {};

	commentFactory.allComment = function() {
		return $http.get('/api/allcomments');
	}

	commentFactory.all = function() {
		return $http.get('/api/');
	}

	commentFactory.create = function(commentData) {
		return $http.post('/api/', commentData);
	}


	

	return commentFactory;


})

.factory('socketio', function($rootScope) {

	var socket = io.connect();
	return {

		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},

		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}

	};

});