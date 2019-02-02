var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.use('/api',require('./routes/authenticate')); //routes for api

var PORT = process.env.PORT || 5000; //port on which server listen
app.listen(PORT,function(error){
    if(error){
        console.log('Error occurred');
    }
    else{
        console.log('Server running at http://localhost:'+PORT); //success
    }
})
