//app.mjs
import cookieParser from 'cookie-parser';
import e from 'express';
import express from 'express'
import session from 'express-session'
import mongoose from 'mongoose';
import * as url from 'url';
import DragonModel from "./public/models/dragon.mjs"

const URI = "mongodb+srv://stan-stan:dragons_have_invaded_dave_and_busterS@cluster0.zgrjyar.mongodb.net/?retryWrites=true&w=majority"

//database connection

async function connect() {
    try {
        await mongoose.connect(URI)
        await updateDragons()
        console.log("Connected to database")
    } catch (e) {
        console.log(e)
    }
}

connect()

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const app = express()
const PORT = 9000

var sessionOptions = {
	secret: 'secrets of targaryen',
	resave: true,
    saveUninitialized: true, 
    myCookies : {}
}

let dragons

async function updateDragons() {
    DragonModel.find(
        {},
        (err, data) => {
            if (err) {
                console.log("Error: ", err)
            } else {
                dragons = data
                console.log("Loaded Dragons")
            }
        }
     )
}


//settings
app.use(express.static(__dirname))

//configure handlebars engine
app.set('view engine', 'hbs')

app.use(express.urlencoded({extended: false}))
app.use(session(sessionOptions))

//middleware
app.use((req, res, next) => {
    console.log('req.method: ', req.method)
    console.log('req.path:', req.path);
    console.log('req.query:', req.query);
    console.log('req.body:', req.body);
    next()
})

//routing
let dragonsAdded = 0
app.post('/dragon', (req, res) => {
    //format user input as json
    let newDragon = JSON.parse(JSON.stringify(req.body))

    //create database model for mongo and inject user data
    let newDragonModel = new DragonModel()
    newDragonModel.dragonName = newDragon.dragonName
    newDragonModel.rider = newDragon.rider
    newDragonModel.identification = newDragon.identification
    newDragonModel.house = newDragon.house

    newDragonModel.save((err, data) => {
        if (err) {
            console.log("error inserting dragon (pause lol)")
            res.status(404)
        } else {
            updateDragons()
            res.status(200)
        }
    })
    if (newDragon.dragonName !== '') {
        dragonsAdded++
        dragons.push(newDragon)
        res.render('layout', {dragon:dragons})
    }
})

app.get('/dragon', (req, res) => {
    res.render('dragon')
})

app.get('/', (req, res) => {
    if (req.query.house_name === undefined || req.query.house_name.length === 0) {
        res.render('layout', {dragon:dragons})
    } else {
        let dragons_filtered = []
        dragons.forEach((x) => {
            if (x.house === req.query.house_name) {
                dragons_filtered.push(x)
            }
        })
        if (dragons_filtered.length > 0) {
            res.render('layout', {dragon:dragons_filtered})
        } else {
            res.render('layout', {dragon:dragons})
        }
    }
})

app.get('/stats', (req, res) => {
    res.render('stats', {numberOfDragonsAdded:dragonsAdded})
})


app.listen(9999, () => {
    console.log("Now listening on port: 9999")
})
