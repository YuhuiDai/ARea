var express = require('express');
var Request = require('request');
var bodyParser = require('body-parser');
var path = require('path');
var port = process.env.PORT || 3000;
var app = express();

//Set up the views directory
app.set("views", __dirname + '/views');
//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

var CLOUDANT_USERNAME="yuhui";
var CLOUDANT_DATABASE="final";
var CLOUDANT_KEY="hemblealsompletcommedgen";
var CLOUDANT_PASSWORD="572475627dd0945396be0bcb297fb79c432ce144";

var CLOUDANT_URL = "https://" + CLOUDANT_USERNAME + ".cloudant.com/" + CLOUDANT_DATABASE;


app.get("/", function (request, response) {
    console.log("Login Page");
    response.render('login');
});

app.get("/guideline", function (request, response) {
    console.log("guide Page");
    response.render('guideline');
});

app.get("/personal", function (request, response) {
    console.log("personal Page");
    response.render('personal_info');
});

app.get("/bio", function (request, response) {
    console.log("bio Page");
    response.render('bio');
});

app.get("/marker", function (request, response) {
    console.log("marker Page");
    response.render('marker');
});

app.get("/fun_facts", function (request, response) {
    console.log("fun Page");
    response.render('fun_facts');
});

// app.post("/save", function (request, response) {
//     console.log("Making a post!");
//
//     Request.post({
//             url: CLOUDANT_URL,
//             auth: {
//                 user: CLOUDANT_KEY,
//                 pass: CLOUDANT_PASSWORD
//             },
//             json: true,
//             body: request.body
//         },
//         function (err, res, body) {
//             if (res.statusCode == 201){
//                 console.log('Doc was saved!');
//                 response.json(body);
//             }
//             else{
//                 console.log('Error: '+ res.statusCode);
//                 console.log(body);
//             }
//         });
// });


// app.get("/api", function (request, response) {
//     console.log('Making a db request for all data');
//     Request.get({
//         url: CLOUDANT_URL+"/_all_docs?include_docs=true",
//         auth: {
//             user: CLOUDANT_KEY,
//             pass: CLOUDANT_PASSWORD
//         },
//         json: true
//     }, function (err, res, body){
//
//         var theData = body.rows;
//         if (theData){
//             response.json(theData);
//         }
//         else{
//             response.json({noData:true});
//         }
//     });
// });


// app.get("/:user", function (request, response) {
//     console.log("Here...");
//     console.log(request.url);
//
//     //Save the data here...
//     response.render('createDream',{title: "DreamShare", user:request.params.user});
// });


// app.get("/api/:key", function (request, response) {
//     console.log("In api :key");
//     var theNamespace = request.params.key;
//     console.log('Making a db request for namespace ' + theNamespace);
//
//     Request.get({
//         url: CLOUDANT_URL+"/_all_docs?include_docs=true",
//         auth: {
//             user: CLOUDANT_KEY,
//             pass: CLOUDANT_PASSWORD
//         },
//         json: true
//     }, function (err, res, body){
//
//         var theData = body.rows;
//
//         if (theData){
//
//             var filteredData = theData.filter(function (d) {
//                 return d.doc.namespace == request.params.key;
//             });
//
//             response.json(filteredData);
//         }
//         else{
//             response.json({noData:true});
//         }
//     });
// });


app.get("*", function(request,response){
    response.send("Sorry, nothing to see here.");
});

app.listen(port);
console.log('Express started on port '+ port);