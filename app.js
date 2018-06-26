var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var methodOverride =  require('method-override');
var mongoose = require('mongoose');
var Project = require('./models/project');
var User = require('./models/user');

//mongoose.connect('mongodb://localhost/icsa');

mongoose.connect('mongodb://akhilesh:akhilesh12@ds117701.mlab.com:17701/icsa');

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static(__dirname +'/public'));
app.use(methodOverride("_method"));

//passport
app.use(require('express-session')({
    secret:"icsaChemburMumbai",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next) {
    res.locals.currentUser = req.user;
    next();
})

app.get('/', (req,res) => {
    Project.find({}, function(err,allProjects) {
        if(err) {
            console.log(err)
        } else {
            res.render('landing',{projects:allProjects})

        }
    }).limit(3)
});

app.get('/projects', (req,res) => {
    Project.find({}, function(err,allProjects) {
        if(err) {
            console.log(err)
        } else {
            res.render('index',{projects:allProjects, currentUser: req.user})

        }
    })
});

app.post('/projects',isLoggedIn, (req,res) => {
    var newProject = req.body;
    Project.create(newProject, function(err, newlyCreated) {
        if(err) {
            res.redirect('/projects');
        } else {
            res.redirect('/projects');
        }
    })
})

app.get('/projects/new',isLoggedIn, (req,res) => {
    res.render('new')
})

app.get('/about', (req,res) => {
    res.render('about')
})
//show
app.get('/projects/:id', (req,res) => {
    Project.findById(req.params.id, (err,foundProject) => {
        if(err) {
            console.log(err)
        } else {
            res.render('show', {project:foundProject})

        }
    })
})
//edit
app.get('/projects/:id/edit',(req,res) => {
    Project.findById(req.params.id, (err, foundProject) => {
        if(err) {
            res.redirect('/projects')
        } else {
            res.render('edit', {project: foundProject});

        }
    })
})
//update
app.put('/projects/:id',isLoggedIn, (req,res) => {
    Project.findByIdAndUpdate(req.params.id, req.body, (err,updatedProject) => {
        if(err) {
            res.redirect('/projects')
        } else {
            res.redirect('/projects/'+req.params.id);
        }
    })
})
//destroy
app.delete('/projects/:id',isLoggedIn, (req,res) => {
    Project.findByIdAndRemove(req.params.id, (err) => {
        if(err) {
            res.redirect('/projects')
        } else {
            res.redirect('/projects')

        }
    }) 
})

//auth
app.get('/register', (req,res) => {
    res.render('register')
});

app.post('/register', (req,res) => {
    var newUser = new User({username:req.body.username})
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            return res.render('register')
        }
        passport.authenticate('local')(req,res, () => {
            res.redirect('/projects')
        })
    } )
    
})

//login
app.get('/login', (req,res) => {
    res.render('login')
});

app.post('/login', passport.authenticate('local',{successRedirect:'/projects', failureRedirect:'/login'}), (req,res) => {

})

app.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/projects');
})

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

app.listen(process.env.PORT || 3452)
