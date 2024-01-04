/*
(c) 2022 Louis. D. Nel

WARNING:
NOTE: THIS CODE WILL NOT RUN UNTIL YOU
ENTER YOUR OWN openweathermap.org APP_ID KEY

NOTE: You need to install the npm modules by executing >npm install
before running this server

Simple express server re-serving data from openweathermap.org
To test:
http://localhost:3000
or
http://localhost:3000/weather?city=Ottawa
to just set JSON response. (Note it is helpful to add a JSON formatter extension, like JSON Formatter, to your Chrome browser for viewing just JSON data.)
*/
const express = require('express') //express framework

const http = require('http')
const PORT = process.env.PORT || 3000 //allow environment variable to possible set PORT

/*YOU NEED AN APP ID KEY TO RUN THIS CODE
  GET ONE BY SIGNING UP AT openweathermap.org
*/
//let API_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' //<== YOUR API KEY HERE

const app = express()
const routes = ['/', '/mytunes', '/mytunes.html', '/index.html'];

// Use a loop to apply the same handler to all routes
routes.forEach(route => {
  app.get(route, (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
  });
});

//Middleware
app.use(express.static(__dirname + '/public')) //static server

//Routes
app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})

app.get('/songs', (request, response) => {
  console.log(request.path)
  let songTitle = request.query.title
  let titleWithPlusSigns = songTitle.trim().replace(/\s/g, '+')
  console.log('titleWithPlusSigns: ' + titleWithPlusSigns)

  console.log('query: ' + JSON.stringify(request.query))
  if(!songTitle) {
    //send json response to client using response.json() feature
    //of express
    response.json({message: 'Please enter Song Title'})
    return
  }

//http://itunes.apple.com/search?term=Body+And+Soul&&entity=musicTrack&limit=3
  const options = {
    "method": "GET",
    "hostname": "itunes.apple.com",
    "port": null,
    "path": `/search?term=${titleWithPlusSigns}&entity=musicTrack&limit=20`,
    "headers": {
      "useQueryString": true
    }
  }
  //create the actual http request and set up
  //its handlers
  http.request(options, function(apiResponse) {
    let songData = ''
    apiResponse.on('data', function(chunk) {
      songData += chunk
    })
    apiResponse.on('end', function() {
      response.contentType('application/json').json(JSON.parse(songData))
    })
  }).end() //important to end the request
           //to actually send the message
})

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT}`)
    console.log(`To Test:`)
    console.log(`http://localhost:3000`)
  }
})
