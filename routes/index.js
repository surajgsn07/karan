var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel = require('./users');
const postModel  = require('./post');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require('./multer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav :false});
});

router.get('/register', function(req, res, next) {
  res.render('register', {nav :false});
});

router.get('/feed', async function(req, res, next) {
  try {
    const alldata = await postModel.find().populate('user').exec();
    console.log(alldata);
    res.render('feed', {nav: true, alldata});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/profile' ,isLoggedIn , async function(req,res){
  const user = await userModel.findOne({username : req.session.passport.user})
              .populate("posts");
  console.log(user);
  res.render('profile' , {user , nav:true});
} )

router.post('/fileupload' ,isLoggedIn  ,upload.single('image') , async function(req,res){
  
  const user = await userModel.findOne({username : req.session.passport.user});
  user.profilepicture = req.file.filename;
  await user.save();
  res.redirect('/profile');
} );

router.post('/create' ,isLoggedIn  ,upload.single('filepost') , async function(req,res){
  const user = await userModel.findOne({username : req.session.passport.user});
  const post =  await postModel.create({
    title :req.body.title,
    description:req.body.description,
    user:user._id,
    image:req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});


router.post('/register', function(req, res, next) {
  let userdata = new userModel({
    name : req.body.name ,
    username : req.body.username ,
    contact : req.body.contact
  });

  userModel.register(userdata , req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/profile');
    })
  })
});

router.get('/create', function(req, res, next) {
  res.render('createpost', {nav :true});
});


router.post('/login' , passport.authenticate("local" , {
  successRedirect : "/profile" ,
  failureRedirect:"/"
}) , function(req, res){ });

router.get('/logout' , function(req,res ,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
  })
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

module.exports = router;
