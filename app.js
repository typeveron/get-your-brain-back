const express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', (req,res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.use((req, res, next) => {
	res.send('Sorry, page not found.');
});

console.log('Server started');

app.listen(3000);

