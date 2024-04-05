require('dotenv').config()

const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/about', (req, res) => {
  res.send('Hello Mr. Uday')
})

app.listen(process.env.port, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})