var express = require('express');
var router = express.Router();

var results = [];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', results: results});
});

module.exports = router;
