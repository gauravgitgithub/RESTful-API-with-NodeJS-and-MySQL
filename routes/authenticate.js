var mysql      = require('mysql');
var express = require('express');
//var bcrypt = require('bcrypt'); //For Encrypting passwords
var router = express.Router();
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : null,
  database : 'test2'
});
connection.connect(function(err){
if(!err) {
    console.log("APP Connected with Database.");
} else {
    console.log("Error occurred while connecting with Database.");
}
});



//Handling User Registration
router.post('/signup', function(req,res){
    var date = new Date(); //getting date and time
    var users ={ //parameters to pass
        'first_name': req.body.first_name,
        'last_name' : req.body.last_name,
        'email' : req.body.email,
        'phone' : req.body.phone,
        'password' : req.body.password,  //var hash = bcrypt.hashSync(password, 10);  //When we use Bcrypt
        'created_on' : date,
        'modified_on': date
    }

    connection.query('INSERT INTO users SET ?',users, function(error,results){
        if(error){ //Error may generate when account with given email already exists in DB
            res.send({
                'success': false,
                'message' : 'Error occurred'
            });
        }
        else{
            res.send({
                'success': true,
                'message': 'User Registered ' //success
            });
        }
    });
});


//Handling Login
router.post('/signin',function(req,res){
    var email=req.body.email;
    var password=req.body.password;
    connection.query('SELECT * FROM users WHERE email = ?',[email], function (error, results) { //looking for a profile with given email
      if (error) {
          res.send({
            'success':false,
            'message':'Error occurred.'
            });
      }else{
        if(results.length >0){
            if(password==results[0].password){//checking password
                //if(bcrypt.compareSync(password, results[0].hash)){   //When we use Bcrypt
                res.send({
                    'success':true,
                    'message':'Login Sucessfull . Welcome '+email //success
                });
            }else{
                res.send({
                  'success':false,
                  'message':'Password does not match' //Wrong password
                 });
            }
         }
        else{
          res.send({
              status:false,    
            message:"Email does not exits" //Account does not exist
          });
        }
      }
    });
});


//Handling update profile --- Updating Mobile no. 
router.post('/update',function(req,res){
    var first_name = req.body.first_name;
    var phone = req.body.phone;
    var last_name = req.body.last_name;
    var newphone = req.body.newphone;
    var date = new Date();
    connection.query('SELECT * FROM users WHERE first_name = ?',[first_name], function (error, results) { //Looks for an user if first_name matches with any profile or not
        if (error) {
            res.send({
              'success':false,
              'message':'Error occurred.'
              });
        }else{
          if(results.length >0){ //Check whether any existence is found or not
              if(last_name==results[0].last_name){ //Checks for last name
                  if(phone==results[0].phone){ //checks for phone number
                      var params = [newphone,date,phone]; //parameters to pass 
                      connection.query('UPDATE users SET phone = ?,modified_on = ? WHERE phone = ?',params,function(error,results){ //update query
                          res.send({
                              'success': true,
                              'message':'Profile updated successfully' //success
                          });
                      });
                  }else{
                      res.send({
                          'success': false,
                          'message':'Phone number does not match.' //When Phone no does not match
                      });
                  }
              }else{
                  res.send({
                    'success':false,
                    'message':'Last name does not match'//When last name does not match
                   });
              }
           }
          else{
            res.send({
                'success':false,    
              'message':'Account does not exits with given first_name' //When first name does not match
            });
          }
        }
      });
});


//Search an user with Email ID, First Name, Last Name and Phone no
router.get('/finduser',function(req,res){
    var email = req.body.email;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var phone = req.body.phone;
    connection.query('SELECT * FROM users WHERE email = ?',[email],function(error,results){  //look for user with given email in db
        if(error){
            res.send({
                'success':false,
                'message':'Error occurred.'
            });
        }
        else{
            if(results.length > 0){ // check whether any existence found
                if(first_name==results[0].first_name){ //Check for the first name
                    if(last_name==results[0].last_name){ //Check for the last name
                        if(phone==results[0].phone){//Check for Phone number
                            res.send({
                                'success':true,
                                'message':'User found with given details having USER ID : '+results[0].id+' and Email : '+email //User found
                            });

                        }else{
                            res.send({
                                'success':false,
                                'message':'Given profile does not exists with phone : '+phone //if user finds with a wrong phone number
                            });
                        }

                    }else{
                        res.send({
                            'success':false,
                            'message':'Given profile does not exists with last_name :'+last_name //if user finds with a wrong lastname
                        });
                    }

                }
                else{
                    res.send({
                        'success':false,
                        'message':'Given profile does not exists with first_name :'+first_name //if user finds with wrong first name
                    });
                }

            }
            else{
                res.send({
                    'success':false,
                    'message':'No user exists with Email : '+email //if users finds with wrong Email ID
                });
            }
        }
    });

});


// Adding message for specific user

router.post('/addmessage',function(req,res){
    var email = req.body.email;
    var message = req.body.message;
    var status = 'unread';
    var params = { //parameters to pass
        'message':message,
        'email': email,
        'status':status

    }
    connection.query('SELECT * FROM users WHERE email = ?',[email],function(error,results){ //finding existence for user in users table
        if(error){
            res.send({
                'success': false,
                'message':'Error occurred'
            });
        }
        else{
            if(results.length > 0){ //got a user with given email id 
                connection.query('INSERT INTO usermessages SET ?',params,function(error,results){ //adding message for that user in another table
                    if(error){
                        res.send({
                            'success':false,
                            'message':'Error occurred in query'
                        });
                    }else{
                        res.send({
                            'success':true,
                            'message':'Message added to Email ID : '+email  //success
                        });
                    }

                });

            }
            else{
                res.send({
                    'success': false,
                    'message':'User does not exist with this email' //User not found
                });
            }
        }

    });

});



//Handling Get New Message

router.get('/readmessage',function(req,res){
    var email = req.body.email;
    connection.query('SELECT * FROM users WHERE email = ?',[email],function(error,results){ //checking for user whether it exists or not
        if(error){
            res.send({
                'success':false,
                'message':'Error Occurred' //Error
            });
        }
        else{
            if(results.length > 0){
                var params = [email,'unread']; //passing parameters
                connection.query('SELECT message FROM usermessages WHERE email = ? and status = ?',params,function(error,rows,results){ //query for get unread messages
                        if(error){
                            res.send({
                                'success':false,
                                'message':'Error occurred while fetching messages' //Error
                            });
                        }
                        else{
                            var messages = []; //object to carry list of messages ---- will be empty if there is no any unread message -------
                            for (var i = 0;i < rows.length; i++) {
                                 messages.push({message: rows[i].message});
                                }                               
                            res.send({
                                'succcess':true,
                                'message': messages // show messages
                                
                            });
                            var params1 = ['read',email];
                            connection.query('UPDATE usermessages SET status = ? WHERE email = ?',params1); //marking the message as read
                        }
                });

            }
            else{
                res.send({
                    'success':'User does not exist with Email : '+email //user not found
                });
            }
        }
    });
});


module.exports =router;