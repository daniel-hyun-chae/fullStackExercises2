const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const Person = require('./models/person')
const { response } = require('express')

//*note: the execution order of middleware is same as the order they are loded

// When a HTTP GET request is received, it first checks if build directory has corresponding page. If so, the static page is responsed.
app.use(express.static('build'))

// json middleware, JSON is parsed into javascript object
// it should be among the first middleware, otherwise req.body does not exist
app.use(express.json())

// middleware to allow cross domain request
app.use(cors())

// log requests details
morgan.token('post', (req, res) => JSON.stringify(req.body) === '{}' ? '' : JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))

// define error handler
const errorHandler = (err, req, res, next) => {
    console.error(err.message)
    
    //cast error is caused by invalid object id for Mongo
    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id'})
    // validation error is caused by mongoose validation failure. e.g. post request violates mongoose schema
    } else if (err.name === 'ValidationError'){
        return res.status(400).send({ error: err.message})
    }

    //all other errors are passed to the default express error handler
    next(err)
}

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    const person = new Person({
        ...body
    })
    person
        .save()
        .then(savedPerson => savedPerson.toJSON())
        .then(formattedPerson => res.json(formattedPerson))
        .catch(err => next(err))
})

app.get('/api/persons', (req, res, next) => {
    Person.find({})
    .then(persons => res.json(persons))
    .catch(err => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    console.log(id)
    Person.findById(id)
        .then(person => {
            if(person){
                res.json(person)
            } 
            // mongoDB returns null if there is no matching person, handle it. 404 not found
            else {
                response.status(404).end()
        }
        })
        // if next is called with prameter, the execution will continue to the error handler middleware.
        // if it is called without parameter, it goes to the next route or middleware
        .catch(error => next(error)
        )
})

app.put('/api/persons/:id', (req, res, next) => {
    const person = req.body

    Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query'})
    
    // in default, originl person is returned. with option {new: true}, the updated person is returned
    .then(updatedPerson => {
        res.json(updatedPerson)
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findByIdAndRemove(id)
    .then(result => {
        // 204: no content. It handles both deleting existing note and non-existing note from DB.
        res.status(204).end()
    })
    .catch(err => next(err))
})

app.get('/api/info', (req, res, next) => {
    Person.find({})
    .then(persons => res.send(`Phonebook has info for ${persons.length} people
    ${new Date()}`))
    .catch(err => next(err))
})

// it must be last loaded middleware
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})