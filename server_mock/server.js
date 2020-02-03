const express = require('express')
const upload = require('./upload')
const fs = require('fs')
const cors = require('cors')

const server = express()

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
}

server.use(cors(corsOptions))

server.post('/upload', upload)
server.get('/download', (req, res) => {
	var file = fs.createReadStream('TPR.pdf')
	file.pipe(res);
})

server.listen(7000, () => {
  console.log('Server started!')
})