var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  
  res.render('index');

});


// Example routes - feel free to delete these

// Passing data into a page

router.get('/examples/template-data', function (req, res) {

  res.render('examples/template-data', { 'name' : 'Foo' });

});

// Branching

router.get('/examples/over-18', function (req, res) {

  // get the answer from the query string (eg. ?over18=false)
  var over18 = req.query.over18;

  if (over18 == "false"){

    // redirect to the relevant page
    res.redirect("/examples/under-18");

  } else {

    // if over18 is any other value (or is missing) render the page requested
    res.render('examples/over-18');

  }

});

// add your routes here

router.get('/tagging', function(req,res){

  var organisations = require(__dirname+'/data/organisations');
  var ministers = require(__dirname+'/data/ministers');
  var topics = require(__dirname+'/data/topics');

  console.log(JSON.stringify(topics, null, '  '));

  res.render('tagging',{organisations: organisations, ministers: ministers, topics: topics});

});

module.exports = router;
