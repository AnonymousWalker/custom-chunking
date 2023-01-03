const express = require('express')
const accessor = require('./src/ProjectAccessor')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send("Index")
})

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})