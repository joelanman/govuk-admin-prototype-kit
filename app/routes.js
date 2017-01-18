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

router.get('/admin', function(req,res){

  var organisations = require(__dirname+'/data/organisations');
  var ministers = require(__dirname+'/data/ministers');
  var policies = require(__dirname+'/data/policies').results;
  var policyAreas = require(__dirname+'/data/policy_areas').results;
  var topics = require(__dirname+'/data/topics').links.children;

  topics.sort(function(a,b){

    return (a.title >= b.title) ? 1 : -1;

  });

  //console.log(JSON.stringify(topics, null, '  '));

  res.render('admin',{organisations: organisations, ministers: ministers, topics: topics, policies: policies, policyAreas: policyAreas});

});

router.get('/topics', function(req,res){

  // var topics = require(__dirname+'/data/topics').links.children;
  //
  // topics.sort(function(a,b){
  //
  //   return (a.title >= b.title) ? 1 : -1;
  //
  // });
  //
  // console.log(JSON.stringify(topics, null, '  '));

  var topics = require('../resources/taxonomy.json')['Education, training and skills']

  res.render('topics',{topics: topics});

});

module.exports = router;
