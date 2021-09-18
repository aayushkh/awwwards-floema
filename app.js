const express = require('express')
const app = express()
const path = require('path')
const port = 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')   // Sets the Template Engine

app.get('/', async (req, res) => {
  res.render('pages/home')
})

app.get('/about', async (req, res) => {
  res.render('pages/about')
})

app.get('/collection', (req, res) => {
  res.render('pages/collection')
})

app.get('/detail/:uid', async (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
