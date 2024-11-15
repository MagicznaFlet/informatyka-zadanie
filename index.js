const bcrypt = require('bcrypt')
const express = require('express')
const User = require('./models/user')
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session')
const app = express()

mongoose.connect('mongodb://localhost:27017/authDemo')
    .then(() => {
        console.log('Database connected')
    })
    .catch((e) => {
        console.log('Failed to connect database!')
        console.log(e)
    })


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: 'secret' }))

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next()
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const foundUser = await User.findAndValidate(username, password)
    if (foundUser) {
        req.session.user_id = foundUser._id
        res.send('Welcome back')
    } else {
        res.send('Wrong password')
    }
})

app.get('/register', (req, res) => {
    res.render('register')
})
app.post('/register', async (req, res) => {
    const { username, password } = req.body
    const newUser = new User({
        username,
        password,
    })
    await newUser.save()
    req.session.user_id = newUser._id
    res.redirect('/')
})

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })

})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

app.listen(3000, () => {
    console.log('Listens on port http://localhost:3000')
})