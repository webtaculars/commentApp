var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var CommentSchema = new Schema({

	creator: String,
	content: String,
	created: { type: Date, defauly: Date.now},
	upvotes: [String],
	downvotes: [String],
	numOfUp: Number,
	numOfDown: Number


});

module.exports = mongoose.model('Comment', CommentSchema);