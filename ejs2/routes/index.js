var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'all homework Express project' });
  //res.render('resourse');
});

router.get('/z1', function(req, res, next) {
  res.render('z1', { title: 'задание 1' });
});

router.get('/z2', function(req, res, next) {
  res.render('z2', { title: 'задание 2' });
});
router.get('/z2s40', function(req, res, next) {
  res.render('z2s40', { title: 'задание 2 слайд 40' });
});

router.get('/z3', function(req, res, next) {
  res.render('z3', { title: 'задание 3' });
});

router.get('/z5', function(req, res, next) {
  res.render('z5', { title: 'задание 5' });
});

router.get('/z6', function(req, res, next) {
  res.render('z6', { title: 'задание 6' });
});

router.get('/z7', function(req, res, next) {
  res.render('z7', { title: 'задание 7' });
});

module.exports = router;
