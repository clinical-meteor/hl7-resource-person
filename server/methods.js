

Meteor.methods({
  createPerson:function(personObject){
    check(personObject, Object);

    if (process.env.NODE_ENV === 'test') {
      console.log('-----------------------------------------');
      console.log('Creating Person...');
      Persons.insert(personObject, function(error, result){
        if (error) {
          console.log(error);
          if (typeof HipaaLogger === 'object') {
            HipaaLogger.logEvent({
              eventType: "error",
              userId: Meteor.userId(),
              userName: Meteor.user().fullName(),
              collectionName: "Persons"
            });
          }
        }
        if (result) {
          console.log('Person created: ' + result);
          if (typeof HipaaLogger === 'object') {
            HipaaLogger.logEvent({
              eventType: "create",
              userId: Meteor.userId(),
              userName: Meteor.user().fullName(),
              collectionName: "Persons"
            });
          }
        }
      });
    } else {
      console.log('This command can only be run in a test environment.');
      console.log('Try setting NODE_ENV=test');
    }
  },
  initializePerson:function(){
    if (Persons.find().count() === 0) {
      console.log('-----------------------------------------');
      console.log('No records found in Persons collection.  Lets create some...');

      var defaultPerson = {
        'name' : [
          {
            'text' : 'Jane Doe',
            'resourceType' : 'HumanName'
          }
        ],
        'active' : true,
        'gender' : 'female',
        'identifier' : [
          {
            'use' : 'usual',
            'type' : {
              text: 'Medical record number',
              'coding' : [
                {
                  'system' : 'http://hl7.org/fhir/v2/0203',
                  'code' : 'MR'
                }
              ]
            },
            'system' : 'urn:oid:1.2.36.146.595.217.0.1',
            'value' : '123',
            'period' : {}
          }
        ],
        'birthdate' : new Date(1970, 1, 25),
        'resourceType' : 'Person'
      };

      Meteor.call('createPerson', defaultPerson);
    } else {
      console.log('Persons already exist.  Skipping.');
    }
  },
  dropPersons: function(query){
    console.log('-----------------------------------------');
    console.log('Dropping persons... ');

    check(query, Match.Maybe(Object));

    Persons.remove({});
  }
});
