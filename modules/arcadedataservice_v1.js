exports.remove = function (model, _primaryarcadename, response) {
	console.log('Deleting arcade with primary number: ' 
			+ _primaryarcadename);	
	model.findOne({primaryarcadename: _primaryarcadename}, function(error, data) {
		if (error) {
			console.log(error);
			if (response != null) {
				response.writeHead(500, {'Content-Type' : 'text/plain'});			
				response.end('Internal server error');
			}
			return;
		} else {	
			if (!data) {
				console.log('not found');				
				if (response != null)
				{
					response.writeHead(404, {'Content-Type' : 'text/plain'});			
					response.end('Not Found');
				}
				return;
			} else {	
				data.remove(function(error){
					if (!error) {
						data.remove();						
											
					}
					else {
						console.log(error);
					}
				});				
				
				if (response != null){
					response.send('Deleted');	
				}				
				return;
			}
		}		
	});	
}

exports.update = function (model, requestBody, response) {
	
	var primarynumber = requestBody.primaryarcadename;
	model.findOne({primaryarcadename: primarynumber}, function(error, data) {
		if (error) {
			console.log(error);
			if (response != null) {
				response.writeHead(500, {'Content-Type' : 'text/plain'});			
				response.end('Internal server error');
			}
			return;
		} else {
			var arcade = toArcade(requestBody, model);
			if (!data) {
				console.log('Arcade with primary number: ' + primarynumber + 
						' does not exist. The arcade will be created.');				
				
				arcade.save(function(error) {
					if (!error)
					arcade.save();
				});
				
				if (response != null) {
					response.end('Created');
				}
				return;
			}
			//poulate the document with the updated values
			
			data.firstname = arcade.firstname;
			data.lastname = arcade.lastname;
			data.title = arcade.title;
			data.company = arcade.company;
			data.jobtitle = arcade.jobtitle;
			data.primaryarcadename = arcade.primaryarcadename;
			data.otherarcadenames = arcade.otherarcadenames;
			data.emailaddresses = arcade.emailaddresses;
			data.primaryemailaddress = arcade.primaryemailaddress;
			data.groups = arcade.groups;
			
			data.save(function (error) {
				if (!error) {
					console.log('Successfully updated arcade with primary number: '+ primarynumber);
					data.save();
				} else {
					console.log('error on save');
				}
			});
			if (response != null) {
				response.send('Updated');
			}
		}
	});
};

exports.create = function (model, requestBody, response) {
	var arcade = toArcade(requestBody, model);
	var primarynumber = requestBody.primaryarcadename;
	arcade.save(function(error) {
		
		if (!error) {			
				arcade.save();				
		} else {			
			console.log('Checking if arcade saving failed due to already existing primary number:' + primarynumber);
			model.findOne({primaryarcadename: primarynumber}, function(error, data) {
				if (error) {
					console.log(error);
					if (response != null) {						
						response.writeHead(500, {'Content-Type' : 'text/plain'});			
						response.end('Internal server error');
					}					
					return;
				} else {					
					var arcade = toArcade(requestBody, model);
					if (!data) {						
						console.log('The arcade does not exist. It will be created');						
						arcade.save(function(error) {
							if (!error) {
								arcade.save();
							} else {
								console.log(error);
							}							
						});
						
						if (response != null) {
							response.writeHead(201, {'Content-Type' : 'text/plain'});
							response.end('Created');
						}
						return;
					} else {					
						console.log('Updating arcade with primary arcade number:' + primarynumber);
						data.firstname = arcade.firstname;
						data.lastname = arcade.lastname;
						data.title = arcade.title;
						data.company = arcade.company;
						data.jobtitle = arcade.jobtitle;
						data.primaryarcadename = arcade.primaryarcadename;
						data.otherarcadenames = arcade.otherarcadenames;
						data.emailaddresses = arcade.emailaddresses;
						data.primaryemailaddress = arcade.primaryemailaddress;
						data.groups = arcade.groups;
						
						data.save(function (error) {
							if (!error) {							
								data.save();
								response.end('Updated');
								console.log('Successfully Updated contat with primary arcade number: ' + primarynumber);
							} else {
								console.log('Error while saving arcade with primary arcade number:' + primarynumber);
								console.log(error);
							}
						});
					}
				}
			});	
		}
	});
};

exports.findByNumber = function (model, _primaryarcadename, response) {
	
	model.findOne({primaryarcadename: _primaryarcadename}, function(error, result) {
		if (error) {			
			console.error(error);
			response.writeHead(500, {'Content-Type' : 'text/plain'});			
			response.end('Internal server error');
			return;
		} else {
			if (!result) {
				if (response != null) {
					response.writeHead(404, {'Content-Type' : 'text/plain'});			
					response.end('Not Found');					
				}
				return;
			}
				
			if (response != null){
				response.setHeader('Content-Type', 'application/json');
				response.send(result);				
			}						
		}
	});	
};

exports.list = function (model, response) {
	model.find({}, function(error, result) {
		if (error) {
			console.error(error);
			return null;	
		}
		if (response != null) {
			response.setHeader('content-type', 'application/json');			
			response.end(JSON.stringify(result));
		}
		return JSON.stringify(result);
	});
}

function toArcade(body, Arcade) {	
	
	return new Arcade(
			{
				firstname: body.firstname,
				lastname: body.lastname,
				title: body.title,
				company: body.company,
				jobtitle: body.jobtitle,
				primaryarcadename: body.primaryarcadename,
				primaryemailaddress: body.primaryemailaddress,				
				emailaddresses: body.emailaddresses,
				groups: body.groups,
				otherarcadenames: body.otherarcadenames				
			});
}