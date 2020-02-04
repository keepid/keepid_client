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
server.get('/get-file-information', (req, res) => {
	res.json([{
	    documentId: '1',
	    documentName: 'doc1',
	    uploadDate: '01/01/2020',
	    uploader: 'You',
	  },
	  {
	    documentId: '2',
	    documentName: 'doc2',
	    uploadDate: '01/02/2020',
	    uploader: 'You',
	  },
	  {
	    documentId: '3',
	    documentName: 'doc3',
	    uploadDate: '01/03/2020',
	    uploader: 'You',
	  }]);
})

server.listen(7000, () => {
  console.log('Server started!')
})