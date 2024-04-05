
import express from 'express'
const app =  express();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.static('dist'))

app.get('/api/v1/jokes', (req, res) => {
    let jokes = [
        {
          "id": 1,
          "joke": "Why don't scientists trust atoms? Because they make up everything."
        },
        {
          "id": 2,
          "joke": "I told my wife she was drawing her eyebrows too high. She looked surprised."
        },
        {
          "id": 3,
          "joke": "Parallel lines have so much in common. It's a shame they'll never meet."
        },
        {
          "id": 4,
          "joke": "I'm reading a book on anti-gravity. It's impossible to put down!"
        },
        {
          "id": 5,
          "joke": "I told my computer I needed a break and now it won't stop sending me vacation ads."
        }
      ]
      
  res.send(jokes)
})

app.get('/about', (req, res) => {
  res.send('Hello Mr. Uday')
})

const port = 3000;

app.listen(port,() => {
    console.log(`Example app listening on port http://localhost:${port}`)
})