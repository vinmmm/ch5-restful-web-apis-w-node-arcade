var express = require('express')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , logger = require('morgan')
  , methodOverride = require('method-override')
  , errorHandler = require('errorhandler')
  , mongoose = require('mongoose')
  , _v2 = require('./modules/arcadedataservice_v2')
  , _v1 = require('./modules/arcadedataservice_v1')
  , CacheControl = require("express-cache-control")
  , fs = require('fs')
  , Grid = require('gridfs-stream')
  , expressPaginate = require('express-paginate')
  , mongoosePaginate = require('mongoose-paginate');
  
    

var app = express();
var url = require('url');
var cache = new CacheControl().middleware;

// all environments
app.set('port', process.env.PORT || 9100);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(methodOverride());
app.use(expressPaginate.middleware(10,100)); 
app.use(bodyParser());

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}


mongoose.connect('mongodb://localhost/arcades');
var mongodb = mongoose.connection;

var arcadeSchema = new mongoose.Schema({
	primaryarcadename: {type: String, index: {unique: true}},
	venuename: String,
	location: String,
	firstname: String,
	lastname: String,
	title: String,
	company: String,
	jobtitle: String,
	games: [String],
    otherarcadenames: [String],
	primaryemailaddress: String,
	emailaddresses: [String],
	groups: [String],
});

arcadeSchema.plugin(mongoosePaginate);

var Arcade = mongoose.model('Arcade', arcadeSchema);

app.get('/v1/arcades/', function(request, response) {
	var get_params = url.parse(request.url, true).query;	

	if (Object.keys(get_params).length == 0)
	{		
		_v1.list(Arcade, response);	
	}
	else
	{
		var key = Object.keys(get_params)[0];
		var value = get_params[key];
		
		JSON.stringify(_v2.query_by_arg(Arcade, 
										key, 
										value, 
										response));		
	}
});

app.get('/v1/arcades/:primaryarcadename', function(request, response) {

	console.log(request.url + ' : querying for ' + request.params.number);
	_v1.findByNumber(Arcade, request.params.primaryarcadename, response);	
});

app.post('/v1/arcades/', function(request, response) {
	_v1.update(Arcade, request.body, response)	
});

app.put('/v1/arcades/', function(request, response) {
	_v1.create(Arcade, request.body, response)	
});

app.del('/v1/arcades/:primaryarcadename', function(request, response) {
    _v1.remove(Arcade, request.params.primaryarcadename, response);
});

//version 2 default routing

app.get('/arcades/:primaryarcadename', function(request, response) {

	console.log(request.url + ' : querying for ' + request.params.number);
	_v2.findByNumber(Arcade, request.params.primaryarcadename, response);	
});

app.post('/arcades/', function(request, response) {
	_v2.update(Arcade, request.body, response)	
});

app.put('/arcades/', function(request, response) {
	_v2.create(Arcade, request.body, response)	
});

app.del('/arcades/:primaryarcadename', function(request, response) {
    _v2.remove(Arcade, request.params.primaryarcadename, response);
});

app.get('/arcadess/:primaryarcadename/image', function(request, response){
	var gfs = Grid(mongodb.db, mongoose.mongo);
	_v2.getImage(gfs, request.params.primaryarcadename, response);

})

app.post('/arcades/:primaryarcadename/image', function(request, response){
	var gfs = Grid(mongodb.db, mongoose.mongo);
	_v2.updateImage(gfs, request, response);
})

app.del('/arcades/:primaryarcadename/image', function(request, response){
		var gfs = Grid(mongodb.db, mongoose.mongo);
		_v2.deleteImage(gfs, mongodb.db, request.params.primaryarcadename, response);
})

app.get('/arcades', cache('minutes',1), function(request, response) {
	var get_params = url.parse(request.url, true).query;
	console.log('redirecting to /v2/arcades');
	response.writeHead(302, {'Location' : '/v2/arcades/'});
	response.end('Version 2 is found at URI /v2/arcades/ ');	
	
});


app.get('/arcades/:primaryarcadename',  function(request, response) {

	console.log(request.url + ' : querying for ' + request.params.number);
	_v2.findByNumber(Arcade, request.params.primaryarcadename, response);	
});



//version 2 explicit routing

app.get('/v2/arcades', cache('minutes',1), function(request, response) {
	var get_params = url.parse(request.url, true).query;	
	
	if (Object.keys(get_params).length == 0)
	{		
		_v2.paginate(Arcade, request, response);
	}
	else
	{		
		if (get_params['limit'] != null || get_params['page'] !=null)
		{
			_v2.paginate(Arcade, request, response);
		}
		else
		{
			var key = Object.keys(get_params)[0];
			var value = get_params[key];
			
			_v2.query_by_arg(Arcade, 
											key, 
											value, 
											response);
		}
	}
});


app.get('/v2/arcades/:primaryarcadename/image', function(request, response){
	var gfs = Grid(mongodb.db, mongoose.mongo);
	_v2.getImage(gfs, request.params.primaryarcadename, response);

})


app.post('/v2/arcades/:primaryarcadename/image', function(request, response){
	var gfs = Grid(mongodb.db, mongoose.mongo);
	_v2.updateImage(gfs, request, response);
})


app.del('/v2/arcades/:primaryarcadename/image', function(request, response){
		var gfs = Grid(mongodb.db, mongoose.mongo);
		_v2.deleteImage(gfs, mongodb.db, request.params.primaryarcadename, response);
})

	
app.get('/v2/arcades/:primaryarcadename', function(request, response) {

	console.log(request.url + ' : querying for ' + request.params.number);
	_v2.findByNumber(Arcade, request.params.primaryarcadename, response);	
});

app.post('/v2/arcades/', function(request, response) {
	_v2.update(Arcade, request.body, response)	
});

app.put('/v2/arcades/', function(request, response) {
	_v2.create(Arcade, request.body, response)	
});

app.del('/v2/arcades/:primaryarcadename', function(request, response) {
    _v2.remove(Arcade, request.params.primaryarcadename, response);
});


function toArcade(body)
{
	return new Arcade(
			{
				venuename: body.venuename,
				location: body.location,
				firstname: body.firstname,
				lastname: body.lastname,
				title: body.title,
				company: body.company,
				jobtitle: body.jobtitle,
				games: body.games,
				primaryarcadename: body.primaryarcadename,
				otherarcadenames: body.otherarcadenames,
				primaryemailaddress: body.primaryemailaddress,
				emailaddresses: body.emailaddresses,
				groups: body.groups


			});
}

console.log('Running at port ' + app.get('port'));
http.createServer(app).listen(app.get('port'));