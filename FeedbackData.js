const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/StudentManage');
const Schema = mongoose.Schema;
var FeedbackSchema = new Schema({
    fullname:String,
    studid:String,
    pemail:String,
   fdbk:String,
   date:String,
month:String,
time: String
});
var FeedbackData = mongoose.model('feedback', FeedbackSchema);
module.exports = FeedbackData;