angular.module('commentCtrl', ['commentService'])


	.controller('CommentController', function(Comment, socketio) {


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