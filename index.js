const express = require('express')

// create a port to listen on
const app = express()
const PORT = process.env.PORT || 4000

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.send('We are live now!')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
