angular.module('commentCtrl', ['commentService'])


.controller('CommentController', function(Comment, socketio, $route) {


    var vm = this;

    Comment.all()
        .success(function(data) {
            vm.comments = data;
        });


    vm.createComment = function() {

        vm.processing = true;


        vm.message = '';
        Comment.create(vm.commentData)
            .success(function(data) {
                vm.processing = false;
                //clear up the form
                vm.commentData = {};
                vm.message = data.message;


            });

    };

    vm.doUpvote = function(id) {

        vm.processing = true;

        vm.message = '';
        Comment.upvote(id)
            .success(function(data) {
                vm.processing = false;
                vm.commentData = {};
                vm.message = data.message;
                $route.reload();

            });

    };

    vm.doDownvote = function(id) {

        vm.processing = true;

        vm.message = '';
        Comment.downvote(id)
            .success(function(data) {
                vm.processing = false;
                vm.commentData = {};
                vm.message = data.message;
                $route.reload();

            });

    };


    socketio.on('comment', function(data) {
        vm.comments.push(data);
    })

})

.controller('AllCommentsController', function(comments, socketio) {

    var vm = this;

    vm.comments = comments.data;

    socketio.on('comment', function(data) {
        vm.comments.push(data);
    });



});
