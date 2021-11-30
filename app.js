const express = require('express');
const SignupData = require('./src/model/SignupData');
const EnrollstudentData = require('./src/model/EnrollstudentData');
const FeedbackData = require('./src/model/FeedbackData');
const cors = require('cors');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const { parseConnectionUrl } = require('nodemailer/lib/shared');
var app = new express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
username="admin@ictak.in";
passwords="Abcde123@";
var desgn='';
function verifyToken(req,res,next){
    if(!req.headers.authorization){
       return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if(token=='null'){
        return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token,'secretKey')
    
    if(!payload){
        return res.status(401).send('Unauthorized request')
    }
    req.userId= payload.subject
    next()
    }
       //login
app.post('/login',function(req,res){
    email=req.body.email;
    password=req.body.password;
    if(username==email && passwords==password){
        let payload={subject:email+password};
        let token=jwt.sign(payload,'secretKey');
        let role="admin"
        res.status(200).send({token,role});
    }
    else {
    SignupData.findOne({email:email,password:password}, function (err, user) {
        if(!user){
            res.status(401).send('Email and Password dont match') 
        }
        else {
             if (user.designation=="Student" && user.confstatus==""){
                 let role="newstudent"
                 let payload={subject:email+password};
                 let token=jwt.sign(payload,'secretKey');
                res.status(200).send({token,role});
             }
             else if (user.designation=="Student" && user.confstatus=="confirm"){
                let role="student"
                 let payload={subject:email+password};
                 let token=jwt.sign(payload,'secretKey');
                 res.status(200).send({token,role});
             }
             else if (user.designation=="Parent"){
                 let role="newparent"
                 let payload={subject:email+password};
                 let token=jwt.sign(payload,'secretKey');
                res.status(200).send({token,role});
             }
             else if (user.designation=="Staff"){
                let role="newemployee"
                let payload={subject:email+password};
                let token=jwt.sign(payload,'secretKey');
               res.status(200).send({token,role});
            }
             else if (user.confstatus=="pending"){
                let role="notifywait"
                let payload={subject:email+password};
                let token=jwt.sign(payload,'secretKey');
               res.status(200).send({token,role});
            }
            }
    });
}
})
//sign up data store
app.post('/signupnew',function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    console.log(req.body);
    if(req.body.signup.designation=="Parent" || req.body.designation=="Staff"){
         var signup=
        {
            fname:req.body.signup.fname,
            lname:req.body.signup.lname,
            mobnumber:req.body.signup.mobnumber,
            designation:req.body.signup.designation,
           email:req.body.signup.email,
           password:req.body.signup.password,
           confirmpwd:req.body.signup.confirmpwd,
           regid:"",
           confstatus:req.body.signup.confstatus
        }
        email=req.body.signup.email;
        SignupData.findOne({email:email}, function (err, user) {
            if (user) {
                res.status(401).send('Email already exists')   
            }
            else{
               newsignup = new SignupData(signup);
              newsignup.save();
              console.log(req.body);
              res.status(200).send();
            }
        });
    }
    else {
         var signup=
        {
            fname:req.body.signup.fname,
            lname:req.body.signup.lname,
            mobnumber:req.body.signup.mobnumber,
            designation:req.body.signup.designation,
           email:req.body.signup.email,
           password:req.body.signup.password,
           confirmpwd:req.body.signup.confirmpwd,
           regid:"",
           confstatus:req.body.signup.confstatus
        }
        email=req.body.signup.email;
        SignupData.findOne({email:email}, function (err, user) {
            if (user) {
                res.status(401).send('Email already exists')   
            }
            else{
               newsignup = new SignupData(signup);
              newsignup.save();
              console.log(req.body);
              res.status(200).send();
            }
        });
    }   
  });
  //to enroll student
app.post('/enrollstudent',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*")
    res.header('Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS');
    
    var newstudenroll={
        fullname:req.body.studenroll.fullname,
        fathername:req.body.studenroll.fathername,
        mothername:req.body.studenroll.mothername,
        parentsemail:req.body.studenroll.parentsemail,
       dob:req.body.studenroll.dob,
        email:req.body.studenroll.email,
        phone:req.body.studenroll.phone,
        address:req.body.studenroll.address,
        course:req.body.studenroll.course,
        studid:req.body.studenroll.studid,
       photo:req.body.studenroll.photo,
  photourl:req.body.studenroll.photourl,
  confstatus:req.body.studenroll.confstatus
     }
     email=req.body.studenroll.email 
     EnrollstudentData.findOne({email:email},function (err, user) {
         if(user){
             res.status(401).send('Email already exists') 
         }
         else{
            var newstudenroll={
                fullname:req.body.studenroll.fullname,
                fathername:req.body.studenroll.fathername,
                mothername:req.body.studenroll.mothername,
                parentsemail:req.body.studenroll.parentsemail,
               dob:req.body.studenroll.dob,
                email:req.body.studenroll.email,
                phone:req.body.studenroll.phone,
                address:req.body.studenroll.address,
                course:req.body.studenroll.course,
                studid:req.body.studenroll.studid,
               photo:req.body.studenroll.photo,
          photourl:req.body.studenroll.photourl,
          confstatus:req.body.studenroll.confstatus
             }
   // console.log(studenroll);
    var newstudenroll=new EnrollstudentData(newstudenroll);
    newstudenroll.save();
    res.status(200).send();
    SignupData.findOneAndUpdate({email:email},
        {$set:{ "confstatus": "pending"
           }})
.then(function(){
res.send();
})
         }
        })
});
//to add feedback
app.post('/sendfeedback',function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    console.log(req.body);
    let date_ob = new Date();
    let monthnum=date_ob.getMonth();
    let monthname=['January','February','March','April','May','June','July','August','September','October','November','December'];
    var feedback=
        {
            fullname:req.body.feedback.fullname,
            studid:req.body.feedback.studid,
            pemail:req.body.feedback.pemail,
            fdbk:req.body.feedback.fdbk,
            date:date_ob.getDate(),
      month:monthname[monthnum],
      time:date_ob.getHours()+ ':' + date_ob.getMinutes()
        }
               feedback = new FeedbackData(feedback);
              feedback.save();
              res.status(200).send();

  });
//update student course by admin
app.put('/updatecourse',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id
    email=req.body.email
   console.log(id)
    EnrollstudentData.findByIdAndUpdate({"_id":id},
    {$set:{  
      "course":req.body.course
     }})  
  .then(function(){
    res.send();
  })
  });

//notification count
app.get('/pendingenroll',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    SignupData.countDocuments({confstatus:"pending"})
    .then(function(pending){
        res.status(200).send({pending});
        console.log(pending)
    });
})
app.get('/notificationstudent',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
   EnrollstudentData.find({"confstatus":"pending"})
    .then(function(notifystudent){
        res.send(notifystudent);
    });
});
app.get('/notificationparent',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
   SignupData.find({"confstatus":"pending","designation":"Parent"})
    .then(function(notifyparent){
        res.send(notifyparent);
    });
});
app.get('/notificationstaff',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    SignupData.find({"confstatus":"pending","designation":"Staff"})
    .then(function(notifystaff){
        res.send(notifystaff);
    });
});
app.get('/singlenewstudent/:id',  (req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    const id = req.params.id;
    console.log(id);
     EnrollstudentData.findOne({"_id":id})
      .then((student)=>{
          res.send(student);
      });
  })
  //show single employee data
  app.get('/singlenewemployee/:id',  (req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    const id = req.params.id;
     SignupData.findOne({"_id":id})
      .then((employee)=>{
          res.send(employee);
      });
  })
  //show single parent data
  app.get('/singlenewparent/:id',  (req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    const id = req.params.id;
     SignupData.findOne({"_id":id})
      .then((parent)=>{
          res.send(parent);
      });
  })
  //show total employees list to assign
  app.get('/employee',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  SignupData.find({confstatus:"confirm", designation:"Staff"})
    .then(function(employees){
        res.send(employees);
    });
});
//show total parents list to assign
app.get('/parent',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  SignupData.find({confstatus:"confirm", designation:"Parent"})
    .then(function(parents){
        res.send(parents);
    });
});
app.get('/student',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  EnrollstudentData.find({confstatus:"confirm"})
    .then(function(students){
        res.send(students);
    });
});
//dispaly student dashboard
app.get('/singlestudentprofile/:id',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  email=req.params.id
  console.log(email)
    EnrollstudentData.findOne({"email":email})
    .then(function(studentdatas){
        res.send(studentdatas)
});
});


//update parents profile
app.put('/editparprofiles',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id
    email=req.body.email
    fname=req.body.fname
   SignupData.findOneAndUpdate({"fname":fname},
   {$set:{ "email": email,
   "mobnumber":req.body.mobnumber
      }})
      .then()
    res.send();
    })  
//update employee profile
app.put('/editempprofiles',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id
    email=req.body.email
    fname=req.body.fname
   SignupData.findOneAndUpdate({"fname":fname},
   {$set:{ "email": email,
   "mobnumber":req.body.mobnumber
      }})
      .then()
    res.send();
    }) 
  
  // employee_profile
  
  app.get('/singleemployeedet/:id',verifyToken, (req, res) => {
    const id = req.params.id;
    console.log(id)
    SignupData.findOne({"email":id})
      .then((employee)=>{
          res.send(employee);
      });
  })
   // parent_profile
   app.get('/getfeeds/:id',verifyToken,function(req,res){  
    const emailpar = req.params.id;
    console.log(emailpar)
    FeedbackData.find({pemail:emailpar})
    .then((parentstud)=>{
        res.send(parentstud);
        console.log(parentstud)
    });
}); 
   app.get('/singleparentdet/:id',verifyToken, (req, res) => {
    const idsd = req.params.id;
    console.log(idsd)
    SignupData.findOne({"email":idsd})
      .then((parent)=>{
          res.send(parent);
          console.log(parent)
      });
  })
    //get parent child
   /* app.get('/parentst/:id',verifyToken,function(req,res){
        res.header("Access-Control-Allow-Origin","*");
        res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
        const idse = req.params.id;
        console.log(idse)
       EnrollstudentData.findOne({"email":idse})
        .then((parentsc)=>{
            res.send(parentsc);
        });
    }); */
       
      //feedbcak
       
//update student data profile
app.put('/updatestudents',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id
    email=req.body.email
    studid=req.body.studid
   console.log(id)
   SignupData.findOne({email:email}, function (err, user) {
    if (user) {
      if(user.regid==studid){
        EnrollstudentData.findByIdAndUpdate({"_id":id},
        {$set:{  "phone":req.body.phone,
          "address":req.body.address,
          "place":req.body.place,
          "qualification":req.body.qualification,
          "passout":req.body.passout,
          "skill":req.body.skill,
          "empstatus":req.body.empstatus,
          "techtrain":req.body.techtrain,
          "year":req.body.year,
         "photo":req.body.photo,
      "photourl":req.body.photourl}})  
      .then(function(){
        res.status(200).send();
        }) 
      }
      else{
        res.status(401).send({emailerrors})   
      }
    }
    else{
   SignupData.findOneAndUpdate({"regid":studid},
   {$set:{ "email": email
      }})
      .then()
    EnrollstudentData.findByIdAndUpdate({"_id":id},
    {$set:{  "email":req.body.email,
      "phone":req.body.phone,
      "address":req.body.address,
      "place":req.body.place,
      "qualification":req.body.qualification,
      "passout":req.body.passout,
      "skill":req.body.skill,
      "empstatus":req.body.empstatus,
      "techtrain":req.body.techtrain,
      "year":req.body.year,
     "photo":req.body.photo,
  "photourl":req.body.photourl}})  
  .then(function(){
    res.send();
    })  
  }
   }) 
  });
  //confirm new student
 app.put('/confirmnewstudent',(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id,
    email=req.body.email
    confstatus=req.body.confstatus
    console.log(confstatus)
    EnrollstudentData.findOne().sort({studid:-1})
    .then((data)=>{
      console.log(data.studid)
        idnews=data.studid
        if(!data.studid){
           idemps=`STD`+`01`
       }
       else{
      var num = idnews.slice(-2)
      console.log(num)
      let id1= parseInt(num);
      id2=id1+1
   console.log(id2)
      if(id2<10){
          id2= `0`+`${id2}`;
      }
    idemps=`STD`+`${id2}`
} 
        EnrollstudentData.findByIdAndUpdate({"_id":id},
        {$set:{ "confstatus": req.body.confstatus,
                "studid":idemps
           }})
.then()
  
studentId=idemps
SignupData.findOneAndUpdate({"email":email},
{$set:{ "confstatus": "confirm",
       "regid": studentId
   }})
.then(function(){
res.send();
})
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hridscp123@gmail.com',
      pass: 'Jith1234#'
    }
  });
  
  var mailOptions = {
    from: 'hridscp123@gmail.com',
    to: req.body.email,
    subject: 'Confirmation mail',
    text: "Greeting from the academy,It our pleasure to inform you that you have been successfully enrolled as a student in our institution. Your student ID will be " +studentId
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
      res.render("welcomes",{
         fname:req.query.names
      });
  })
  }) 

  app.put('/confirmnewemployee',(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id,
    email=req.body.email
    confstatus=req.body.confstatus
    console.log(confstatus)
    
SignupData.findOneAndUpdate({"_id":id},
{$set:{ "confstatus": "confirm"
   }})
.then(function(){
res.send();
})
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hridscp123@gmail.com',
      pass: 'Jith1234#'
    }
  });
  
  var mailOptions = {
    from: 'hridscp123@gmail.com',
    to: req.body.email,
    subject: 'Confirmation mail',
    text: "Greeting from the academy,It our pleasure to inform you that you have been successfully enrolled as an employee in our institution."
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
      res.render("welcomes",{
         fname:req.query.names
      });
  })
  //confirm parent
  
  app.put('/confirmnewparent',(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id,
    email=req.body.email
    confstatus=req.body.confstatus
    console.log(confstatus)
    
SignupData.findOneAndUpdate({"_id":id},
{$set:{ "confstatus": "confirm"
   }})
.then(function(){
res.send();
})
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hridscp123@gmail.com',
      pass: 'Jith1234#'
    }
  });
  
  var mailOptions = {
    from: 'hridscp123@gmail.com',
    to: req.body.email,
    subject: 'Confirmation mail',
    text: "Greeting from the academy,It our pleasure to inform you that you have been successfully registered in our institution."
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
      res.render("welcomes",{
         fname:req.query.names
      });
  })
//deny student
app.delete('/removestudentden/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    idstud = req.params.id;
    console.log(idstud)
   EnrollstudentData.findOne({'_id':idstud})
   .then((studentsden)=>{
    emailstud= studentsden.email
    SignupData.deleteOne({'email':emailstud})
    .then()
    EnrollstudentData.deleteOne({'_id':idstud})
    .then()
    res.send();
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'hridscp123@gmail.com',
          pass: 'Jith1234#'
        }
      });
      
      var mailOptions = {
        from: 'hridscp123@gmail.com',
        to: emailstud,
        subject: 'Enrollment mail',
        text: "Greeting from the academy, unfortunately your enrollment has been denied. For further details please contact ICT academy"
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
          res.render("welcomes",{
             fname:req.query.names
          }); 
  })
  })
  //deny complete employee data 
 app.delete('/removeempden/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    ids = req.params.id;
    console.log(ids)
        
        SignupData.deleteOne({'_id':ids})
        .then()
        res.send();
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hridscp123@gmail.com',
              pass: 'Jith1234#'
            }
          });
          
          var mailOptions = {
            from: 'hridscp123@gmail.com',
            to: emailid,
            subject: 'Enrollment mail',
            text: "Greeting from the academy, unfortunately your enrollment has been denied. For further details please contact academy"
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
              res.render("welcomes",{
                 fname:req.query.names
              });  
        })
//deny complete employee data 
app.delete('/removeparden/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    ids = req.params.id;
    console.log(ids)
        
        SignupData.deleteOne({'_id':ids})
        .then()
        res.send();
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hridscp123@gmail.com',
              pass: 'Jith1234#'
            }
          });
          
          var mailOptions = {
            from: 'hridscp123@gmail.com',
            to: emailid,
            subject: 'Enrollment mail',
            text: "Greeting from the accademy, unfortunately your registeration has been denied. For further details please contact academy"
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
              res.render("welcomes",{
                 fname:req.query.names
              });  
        })
         //delete complete employee data
  app.delete('/removeemployeeenroll/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id = req.params.id;
        SignupData.deleteOne({'_id':id})
        .then() 
      res.send();
      })
             //delete complete parent data
  app.delete('/removeparentenroll/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id = req.params.id;
        SignupData.deleteOne({'_id':id})
        .then() 
      res.send();
      })
       //remove student
  app.delete('/removestudentenroll/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id = req.params.id;
      EnrollstudentData.findOne({'_id':id})
      .then((students)=>{
        email= students.email
        SignupData.deleteOne({'email':email})
        .then()
        EnrollstudentData.deleteOne({'_id':id})
        .then()
        res.send();
      })
  })
  app.listen(5200);