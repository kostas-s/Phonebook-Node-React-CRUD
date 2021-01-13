const { json } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(express.static('build'))

app.use(cors())
//WITHOUT THIS, request.body WON'T WORK
app.use(express.json())

//LOGGING MIDDLEWARE WITH REQUEST BODY. ONLY FOR DEV PURPOSES ON LOCALHOST, NEVER DO THIS IN PRODUCTION!
morgan.token('request-body', function (req, res) { return JSON.stringify(req['body']) })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))


let persons = [
    {
        id: 1,
        name: "Louis Armstrong",
        number: "111-111111"
    },
    {
        id: 2,
        name: "Django Reinhardt",
        number: "999-999999"
    },
    {
        id: 3,
        name: "Ella Fitzgerald",
        number: "555-55555"
    }
]

const getEntriesCount = () => {
    return persons.length
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    const name = body.name
    const number = body.number
    if (!body || !name || !number) {
        return response.status(404).json({error:"Missing name and/or number in body"})
    } else {
        if (persons.find(person => person.name.toLowerCase() === name.toLowerCase())){
            return response.status(404).json({error:"Name exists in phonebook"})
        }
        const id = Math.floor(Math.random()*10000000000)
        const newPerson = {name:name, number:number, id:id}
        persons = persons.concat(newPerson)
        return response.json(newPerson)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    
    if (person) {
        persons = persons.filter(p => p !== person)
        return response.status(204).end()
    } else {
        return response.status(404).end()
    }
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        return response.json(person)
    } else {
        return response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    return response.send(`<p>Phonebook has info for ${getEntriesCount()} people</p>` +
     `<p>${new Date()}</p>`)
})

app.get('/api/persons', (request, response) => {
    return response.json(persons)
})

app.put('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const selectedPerson = persons.find(person => person.id === id)
    const newPerson = request.body
    newPerson.id = id
    if (selectedPerson && newPerson.name && newPerson.number){
        persons = persons.map(person => person.id === id ? newPerson : person)
        return response.json(newPerson)
    } else {
        return response.status(404).end()
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`)
})