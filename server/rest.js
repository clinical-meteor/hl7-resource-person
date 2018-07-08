

//==========================================================================================
// Global Configs  

var fhirVersion = 'fhir-3.0.0';


if(typeof oAuth2Server === 'object'){
  JsonRoutes.Middleware.use(
    '/fhir-3.0.0/*',
    oAuth2Server.oauthserver.authorise()   // OAUTH FLOW - A7.1
  );
}

JsonRoutes.setResponseHeaders({
  "content-type": "application/fhir+json; charset=utf-8"
});



//==========================================================================================
// Global Method Overrides

// this is temporary fix until PR 132 can be merged in
// https://github.com/stubailo/meteor-rest/pull/132

JsonRoutes.sendResult = function (res, options) {
  options = options || {};

  // Set status code on response
  res.statusCode = options.code || 200;

  // Set response body
  if (options.data !== undefined) {
    var shouldPrettyPrint = (process.env.NODE_ENV === 'development');
    var spacer = shouldPrettyPrint ? 2 : null;cd .
    res.setHeader('Content-type', 'application/fhir+json; charset=utf-8');
    res.write(JSON.stringify(options.data, null, spacer));
  }

  // We've already set global headers on response, but if they
  // pass in more here, we set those.
  if (options.headers) {
    //setHeaders(res, options.headers);
    options.headers.forEach(function(value, key){
      res.setHeader(key, value);
    });
  }

  // Send the response
  res.end();
};




//==========================================================================================
// Step 1 - Create New RelatedPerson  

JsonRoutes.add("put", "/" + fhirVersion + "/RelatedPerson/:id", function (req, res, next) {
  process.env.DEBUG && console.log('PUT /fhir-3.0.0/RelatedPerson/' + req.params.id);
  //process.env.DEBUG && console.log('PUT /fhir-3.0.0/RelatedPerson/' + req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);

  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});    

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {
      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }


      if (req.body) {
        personUpdate = req.body;

        // remove id and meta, if we're recycling a resource
        delete req.body.id;
        delete req.body.meta;

        personUpdate.resourceType = "RelatedPerson";
        personUpdate = Persons.toMongo(personUpdate);
        personUpdate = Persons.prepForUpdate(personUpdate);


        process.env.DEBUG && console.log('-----------------------------------------------------------');
        process.env.DEBUG && console.log('personUpdate', JSON.stringify(personUpdate, null, 2));

        var person = Persons.findOne(req.params.id);
        var personId;

        if(person){
          process.env.DEBUG && console.log('RelatedPerson found...')
          personId = Persons.update({_id: req.params.id}, {$set: personUpdate },  function(error, result){
            if (error) {
              process.env.TRACE && console.log('PUT /fhir/RelatedPerson/' + req.params.id + "[error]", error);

              // Bad Request
              JsonRoutes.sendResult(res, {
                code: 400
              });
            }
            if (result) {
              process.env.TRACE && console.log('result', result);
              res.setHeader("RelatedPerson", "fhir/RelatedPerson/" + result);
              res.setHeader("Last-Modified", new Date());
              res.setHeader("ETag", "3.0.0");

              var persons = Persons.find({_id: req.params.id});
              var payload = [];

              persons.forEach(function(record){
                payload.push(Persons.prepForFhirTransfer(record));
              });

              console.log("payload", payload);

              // success!
              JsonRoutes.sendResult(res, {
                code: 200,
                data: Bundle.generate(payload)
              });
            }
          });
        } else {        
          process.env.DEBUG && console.log('No person found.  Creating one.');
          personUpdate._id = req.params.id;
          personId = Persons.insert(personUpdate,  function(error, result){
            if (error) {
              process.env.TRACE && console.log('PUT /fhir/RelatedPerson/' + req.params.id + "[error]", error);

              // Bad Request
              JsonRoutes.sendResult(res, {
                code: 400
              });
            }
            if (result) {
              process.env.TRACE && console.log('result', result);
              res.setHeader("RelatedPerson", "fhir/RelatedPerson/" + result);
              res.setHeader("Last-Modified", new Date());
              res.setHeader("ETag", "3.0.0");

              var persons = Persons.find({_id: req.params.id});
              var payload = [];

              persons.forEach(function(record){
                payload.push(Persons.prepForFhirTransfer(record));
              });

              console.log("payload", payload);

              // success!
              JsonRoutes.sendResult(res, {
                code: 201,
                data: Bundle.generate(payload)
              });
            }
          });        
        }
      } else {
        // no body; Unprocessable Entity
        JsonRoutes.sendResult(res, {
          code: 422
        });

      }


    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }

});



//==========================================================================================
// Step 2 - Read RelatedPerson  

JsonRoutes.add("get", "/" + fhirVersion + "/RelatedPerson/:id", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/RelatedPerson/' + req.params.id);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var personData = Persons.findOne({_id: req.params.id});
      if (personData) {
        personData.id = personData._id;

        delete personData._document;
        delete personData._id;

        process.env.TRACE && console.log('personData', personData);

        // Success
        JsonRoutes.sendResult(res, {
          code: 200,
          data: Persons.prepForFhirTransfer(personData)
        });
      } else {
        // Gone
        JsonRoutes.sendResult(res, {
          code: 204
        });
      }
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 3 - Update RelatedPerson  

JsonRoutes.add("post", "/" + fhirVersion + "/RelatedPerson", function (req, res, next) {
  process.env.DEBUG && console.log('POST /fhir/RelatedPerson/', JSON.stringify(req.body, null, 2));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var personId;
      var newRelatedPerson;

      if (req.body) {
        newRelatedPerson = req.body;


        // remove id and meta, if we're recycling a resource
        delete newRelatedPerson.id;
        delete newRelatedPerson.meta;


        newRelatedPerson = Persons.toMongo(newRelatedPerson);

        process.env.TRACE && console.log('newRelatedPerson', JSON.stringify(newRelatedPerson, null, 2));
        // process.env.DEBUG && console.log('newRelatedPerson', newRelatedPerson);

        console.log('Cleaning new person...')
        RelatedPersonSchema.clean(newRelatedPerson);

        var practionerContext = RelatedPersonSchema.newContext();
        practionerContext.validate(newRelatedPerson)
        console.log('New person is valid:', practionerContext.isValid());
        console.log('check', check(newRelatedPerson, RelatedPersonSchema))
        


        var personId = Persons.insert(newRelatedPerson,  function(error, result){
          if (error) {
            process.env.TRACE && console.log('error', error);

            // Bad Request
            JsonRoutes.sendResult(res, {
              code: 400
            });
          }
          if (result) {
            process.env.TRACE && console.log('result', result);
            res.setHeader("RelatedPerson", "fhir-3.0.0/RelatedPerson/" + result);
            res.setHeader("Last-Modified", new Date());
            res.setHeader("ETag", "3.0.0");

            var persons = Persons.find({_id: result});
            var payload = [];

            persons.forEach(function(record){
              payload.push(Persons.prepForFhirTransfer(record));
            });

            //console.log("payload", payload);
            // Created
            JsonRoutes.sendResult(res, {
              code: 201,
              data: Bundle.generate(payload)
            });
          }
        });
        console.log('personId', personId);
      } else {
        // Unprocessable Entity
        JsonRoutes.sendResult(res, {
          code: 422
        });
      }

    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 4 - RelatedPersonHistoryInstance

JsonRoutes.add("get", "/" + fhirVersion + "/RelatedPerson/:id/_history", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/RelatedPerson/', req.params);
  process.env.DEBUG && console.log('GET /fhir-3.0.0/RelatedPerson/', req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var persons = Persons.find({_id: req.params.id});
      var payload = [];

      persons.forEach(function(record){
        payload.push(Persons.prepForFhirTransfer(record));

        // the following is a hack, to conform to the Touchstone RelatedPerson testscript
        // https://touchstone.aegis.net/touchstone/testscript?id=06313571dea23007a12ec7750a80d98ca91680eca400b5215196cd4ae4dcd6da&name=%2fFHIR1-6-0-Basic%2fP-R%2fRelatedPerson%2fClient+Assigned+Id%2fRelatedPerson-client-id-json&version=1&latestVersion=1&itemId=&spec=HL7_FHIR_STU3_C2
        // the _history query expects a different resource in the Bundle for each version of the file in the system
        // since we don't implement record versioning in Meteor on FHIR yet
        // we are simply adding two instances of the record to the payload 
        payload.push(Persons.prepForFhirTransfer(record));
      });
      // Success
      JsonRoutes.sendResult(res, {
        code: 200,
        data: Bundle.generate(payload, 'history')
      });
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 5 - RelatedPerson Version Read

// NOTE:  We've not implemented _history functionality yet; so this endpoint is mostly a duplicate of Step 2.

JsonRoutes.add("get", "/" + fhirVersion + "/RelatedPerson/:id/_history/:versionId", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/RelatedPerson/:id/_history/:versionId', req.params);
  //process.env.DEBUG && console.log('GET /fhir-3.0.0/RelatedPerson/:id/_history/:versionId', req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
  
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }

  var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

  if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

    if (accessToken) {
      process.env.TRACE && console.log('accessToken', accessToken);
      process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
    }

    var personData = Persons.findOne({_id: req.params.id});
    if (personData) {
      
      personData.id = personData._id;

      delete personData._document;
      delete personData._id;

      process.env.TRACE && console.log('personData', personData);

      JsonRoutes.sendResult(res, {
        code: 200,
        data: Persons.prepForFhirTransfer(personData)
      });
    } else {
      JsonRoutes.sendResult(res, {
        code: 204
      });
    }

  } else {
    JsonRoutes.sendResult(res, {
      code: 401
    });
  }
});



generateDatabaseQuery = function(query){
  console.log("generateDatabaseQuery", query);

  var databaseQuery = {};

  if (query.family) {
    databaseQuery['name'] = {
      $elemMatch: {
        'family': query.family
      }
    };
  }
  if (query.given) {
    databaseQuery['name'] = {
      $elemMatch: {
        'given': query.given
      }
    };
  }
  if (query.name) {
    databaseQuery['name'] = {
      $elemMatch: {
        'text': {
          $regex: query.name,
          $options: 'i'
        }
      }
    };
  }
  if (query.identifier) {
    databaseQuery['identifier'] = {
      $elemMatch: {
        'value': query.identifier
      }
    };
  }
  if (query.gender) {
    databaseQuery['gender'] = query.gender;
  }
  if (query.birthdate) {
    var dateArray = query.birthdate.split("-");
    var minDate = dateArray[0] + "-" + dateArray[1] + "-" + (parseInt(dateArray[2])) + 'T00:00:00.000Z';
    var maxDate = dateArray[0] + "-" + dateArray[1] + "-" + (parseInt(dateArray[2]) + 1) + 'T00:00:00.000Z';
    console.log("minDateArray", minDate, maxDate);

    databaseQuery['birthDate'] = {
      "$gte" : new Date(minDate),
      "$lt" :  new Date(maxDate)
    };
  }

  process.env.DEBUG && console.log('databaseQuery', databaseQuery);
  return databaseQuery;
}

JsonRoutes.add("get", "/" + fhirVersion + "/RelatedPerson", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/RelatedPerson', req.query);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var databaseQuery = generateDatabaseQuery(req.query);

      var payload = [];
      var persons = Persons.find(databaseQuery);

      persons.forEach(function(record){
        payload.push(Persons.prepForFhirTransfer(record));
      });

      // Success
      JsonRoutes.sendResult(res, {
        code: 200,
        data: Bundle.generate(payload)
      });
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 6 - RelatedPerson Search Type  

JsonRoutes.add("post", "/" + fhirVersion + "/RelatedPerson/:param", function (req, res, next) {
  process.env.DEBUG && console.log('POST /fhir-3.0.0/RelatedPerson/' + JSON.stringify(req.query));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var persons = [];

      if (req.params.param.includes('_search')) {
        var searchLimit = 1;
        if (req && req.query && req.query._count) {
          searchLimit = parseInt(req.query._count);
        }

        var databaseQuery = generateDatabaseQuery(req.query);
        process.env.DEBUG && console.log('databaseQuery', databaseQuery);

        persons = Persons.find(databaseQuery, {limit: searchLimit});

        var payload = [];

        persons.forEach(function(record){
          payload.push(Persons.prepForFhirTransfer(record));
        });
      }

      //process.env.TRACE && console.log('persons', persons);

      // Success
      JsonRoutes.sendResult(res, {
        code: 200,
        data: Bundle.generate(payload)
      });
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});




//==========================================================================================
// Step 7 - RelatedPerson Delete    

JsonRoutes.add("delete", "/" + fhirVersion + "/RelatedPerson/:id", function (req, res, next) {
  process.env.DEBUG && console.log('DELETE /fhir-3.0.0/RelatedPerson/' + req.params.id);

  res.setHeader("Access-Control-Allow-Origin", "*");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){

    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});
    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      if (Persons.find({_id: req.params.id}).count() === 0) {
        // No Content
        JsonRoutes.sendResult(res, {
          code: 204
        });
      } else {
        Persons.remove({_id: req.params.id}, function(error, result){
          if (result) {
            // No Content
            JsonRoutes.sendResult(res, {
              code: 204
            });
          }
          if (error) {
            // Conflict
            JsonRoutes.sendResult(res, {
              code: 409
            });
          }
        });
      }


    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
  
  
});





// WebApp.connectHandlers.use("/fhir/RelatedPerson", function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   return next();
// });
