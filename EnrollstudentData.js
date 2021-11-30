const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/StudentManage');
const Schema = mongoose.Schema;
var EnrollStudentSchema = new Schema({
    fullname:String,
    fathername:String,
    mothername:String,
    parentsemail:String,
    dob:String,
    email:String,
    phone:String,
    course:String,
    address:String,
    studid:String,
    photo:String,
    photourl:String,
    confstatus:String
});
var EnrollstudentData = mongoose.model('enrollstud', EnrollStudentSchema);
module.exports = EnrollstudentData;
