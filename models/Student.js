var mongoose = require('mongoose')
var Schema = mongoose.Schema

// create a schema
var studentSchema = new Schema({
    name: String,
    regnumber: { type: Number, required: true, unique: true },
    created_at: Date,
    votestatus: Boolean,
});

var Student = mongoose.model('Student', studentSchema);

module.exports = Student;