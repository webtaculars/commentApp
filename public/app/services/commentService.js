angular.module('commentService', [])


.factory('Comment', function($http) {


    var commentFactory = {};

    commentFactory.allComments = function() {
        return $http.get('/api/allcomments');
    }

    commentFactory.all = function() {
        return $http.get('/api/');
    }

    commentFactory.create = function(commentData) {
        return $http.post('/api/', commentData);
    }

    commentFactory.upvote = function(idData) {
        var id = {
            id: idData
        }
        return $http.post('/api/upvote', id);
    }

    commentFactory.downvote = function(idData) {
        var id = {
            id: idData
        }
        return $http.post('/api/downvote', id);
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
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }

    };

});
