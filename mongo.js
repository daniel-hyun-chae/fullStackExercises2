const mongoose = require('mongoose')

const argumentLength = process.argv.length

if (argumentLength !== 3 && argumentLength !== 5) {
    console.log('Please provide right arguments')
    process.exit()
}

const password = process.argv[2]
const url = `mongodb+srv://danielchae:${password}@cluster0.qucek.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = new mongoose.model('Person', personSchema)

if (argumentLength === 3) {
    Person.find({}).then(persons => {
        console.log('phonebook:')
        persons.forEach(person => console.log(`${person.name} ${person.number}`))
        mongoose.connection.close()
    })
}

if (argumentLength === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name,
        number
    })

    person.save().then(result => {
        console.log(`Added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}