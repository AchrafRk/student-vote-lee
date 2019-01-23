'use strict'
let express = require('express')
let app = express()
const port = 3000
let bodyParser = require('body-parser')
const path = require('path')
const util = require('util')
let fs = require('fs')
const readFile = util.promisify(require('fs').readFile)
var mongoose = require('mongoose')
var Student = require('../models/Student.js')
var datetime = new Date()
var nodeMailer = require('nodemailer')


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/candidatesdb',{ useNewUrlParser: true })
    .then(() =>  console.log('Connection Successful'))
    .catch((err) => console.error(err))

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('src/public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})


//Show Candidate (Vote Page)
app.post('/show-candidates', (req, res) => {
    async function getData() {
        return await readFile(path.join(__dirname, '/data.json'), {encoding: 'utf8'});
    }
    getData().then(data => {
        if (data != '') {
            res.send(data)
        } else {
            res.send(null)
        }
    })
})

// Increment Vote Using Promise
app.post('/increment-vote', (req, res) => {

    // create a new student
    var student  = new Student({
        name: req.body.name,
        regnumber: req.body.numb,
        created_at: datetime,
        votestatus:true
    })

    Student.create(student, function (err, magueule) {
        if (err) {  console.log(req.body.name,',You already voted')}
        else {
            readFile(path.join(__dirname, '/data.json'), {encoding: 'utf8'})
                .then((data) => {
                    let obj = {data: []}
                    if (data != '') {
                        obj = JSON.parse(data)
                        switch (req.body.btn) {
                            case '1':
                                obj.data[0].votes++
                                break
                            case '2':
                                obj.data[1].votes++
                                break
                            case '3':
                                obj.data[2].votes++
                                break
                            case '4':
                                obj.data[3].votes++
                                break
                            default:
                                console.log('404')
                        }
                    } else {
                        res.send(null)
                    }
                    let json = JSON.stringify(obj)
                    fs.writeFile(path.join(__dirname, '/data.json'), json, 'utf8', (err) => {
                        if (err) {
                            throw err
                        }
                    })
                })
                .catch((err) => {
                    console.error('Some error occurred', err)
                })
        }
    })
})


//Add Candidate
app.post('/add-candidate', (req, res) => {

    fs.readFile(path.join(__dirname, '/data.json'), 'utf8', (err, data) => {
        if (err) {
            console.log(err)
        } else {
            let obj = {
                data: []
            }
            if (data != '') {
                obj = JSON.parse(data)
                if (obj.data.length < 4) {

                    obj.data.push({firstName: req.body.firstName, lastName:req.body.lastName, email: req.body.email, age: req.body.age, votes: 0})
                    res.send('User Added')
                } else {
                    res.send('Il existe deja 4 candidat !')
                }
            } else {
                console.log(obj.data.length)
                obj.data.push({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    age: req.body.age,
                    votes: 0
                })
                res.send('Candidate Added')
            }
            let json = JSON.stringify(obj)
            fs.writeFile(path.join(__dirname, '/data.json'), json, 'utf8', (err) => {
                if (err) {
                    throw err
                }
            })
        }
    })
})

//Delete Candidate
app.post('/delete-candidate', (req, res) => {
    fs.readFile(path.join(__dirname, '/data.json'), 'utf8', (err, data) => {
        if (err) {
            console.log(err)
        } else {
            if (data != '') {
                let obj = JSON.parse(data)
                let newObj = {
                    data: []
                }
                for (let i = 0;i < obj.data.length;i++) {
                    if (obj.data[i].firstName != req.body.firstName) {
                        newObj.data.push(obj.data[i])
                    }
                }
                let json = JSON.stringify(newObj)
                fs.writeFile('src/data.json', json, (err) => {
                    if (err) {
                        throw (err)
                    }
                })
                res.send('Candidate Deleted')
            } else {
                res.send(null)
            }
        }
    })
})

app.get('/users', (req, res) => {
    fs.readFile(path.join(__dirname, '/data.json'), 'utf8', (err, data) => {

        let obj = {
            data: []
        }
        if (data != '') {
            obj = JSON.parse(data)
        }
        res.setHeader('Content-Type', 'application/json')
        res.send(obj)

    })
})

app.post('/send-email', (req, res) => {
    fs.readFile(path.join(__dirname, '/data.json'), 'utf8', (err, data) => {
        let obj = JSON.parse(data)
        for (let i = 0; i < obj.data.length; i++) {
            if (obj.data[i].votes === Math.max(obj.data[0].votes, obj.data[1].votes, obj.data[2].votes, obj.data[3].votes)) {

                let transporter = nodeMailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'studentvotep13@gmail.com',
                        pass: 'aeurwsffqvlqoops'
                    }
                })
                let mailOptions = {
                    from: '"Student Vote" <xx@gmail.com>', // Sender address
                    to: obj.data[i].email, // Receiver address
                    subject: 'Vote Results', // Subject line
                    text: 'You win', // Plain text body
                    html: '<b>Félicitations ! Vous avez remporté les élections et vous êtes alors le nouveau représentant des étudiants. </b>' // html body
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                })
            }
        }
    })
    res.send('Mail Sent')
})

app.listen(port)