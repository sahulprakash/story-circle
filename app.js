const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const morgan = require('morgan')
const methodOverride = require('method-override')
const exphbs = require('express-handlebars')
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const { formatDate, stripTags, truncate, editIcon } = require('./helpers/hbs')
const MongoStore = require('connect-mongo')(session)

dotenv.config({ path: './config/config.env' })
require('./config/passport')(passport)
connectDB()

const app = express()
if (process.env.NODE_ENV === "developement") {
    app.use(morgan('dev'))
}
//handle bars
app.engine('.hbs', exphbs({
    helpers: {
        formatDate, stripTags, truncate, editIcon,
    }, defaultLayout: 'main', extname: '.hbs'
}));
app.set('view engine', '.hbs');

//bodyparser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
//session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// Method override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

app.use(passport.initialize())
app.use(passport.session())

//global variable
app.use(function(req,res,next){
    res.locals.user = req.user || null
    next()
})

//statis folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'))
const PORT = process.env.PORT || 3000
app.listen(PORT,
    console.log(`server runs on ${process.env.NODE_ENV} mode on port ${PORT}`)
)