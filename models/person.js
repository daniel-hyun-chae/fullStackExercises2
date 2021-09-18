// import environment variables defined in .env file
require('dotenv').config()
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const uri = process.env.MONGODB_URI

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(result => console.log('connected to MongoDB'))
  .catch(error => console.log('error connecting to MongoDB: ', error.message))

// defines personSchema using mongoose.Schema
const personSchema = mongoose.Schema({
  // if standard validator provided by mongoose does not suffice, custom validator can be defined
  name: {
    type: String,
    required: true,
    unique: true,
    minLength: 3
  },
  number: {
    type: String,
    required: true,
    minLength: 8
  }
})
personSchema.plugin(uniqueValidator)

// middleware. some fields are modified before it is converted to json
personSchema.set('toJSON', {
  transform: (doc, returnDoc) => {
    returnDoc.id = returnDoc._id.toString()
    delete returnDoc._id
    delete returnDoc.__v
  }
})

// export Person model created from personSchema
module.exports = mongoose.model('Person', personSchema)