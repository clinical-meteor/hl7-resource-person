
// create the object using our BaseModel
Person = BaseModel.extend();


//Assign a collection so the object knows how to perform CRUD operations
Person.prototype._collection = Persons;

// // Create a persistent data store for addresses to be stored.
// // HL7.Resources.Patients = new Mongo.Collection('HL7.Resources.Patients');

if(typeof Persons === 'undefined'){
  if(Package['clinical:autopublish']){
    Persons = new Mongo.Collection('Persons');
  } else {
    Persons = new Mongo.Collection('Persons', {connection: null});
  }
}


//Add the transform to the collection since Meteor.users is pre-defined by the accounts package
Persons._transform = function (document) {
  return new Person(document);
};



PersonSchema = new SimpleSchema({
  "resourceType" : {
    type: String,
    defaultValue: "Person"
  },
  "identifier" : {
    optional: true,
    type: [ IdentifierSchema ]
  },
  "name" : {
    optional: true,
    type: [ HumanNameSchema ]
  },
  "telecom" : {
    optional: true,
    type: [ ContactPointSchema ]
  },
  "gender" : {
    optional: true,
    type: Code
  },
  "birthDate" : {
    optional: true,
    type: Date
  },
  "address" : {
    optional: true,
    type: [ AddressSchema ]
  },
  "photo" : {
    optional: true,
    type: AttachmentSchema
  },
  "managingOrganization" : {
    optional: true,
    type: ReferenceSchema
  },
  "active" : {
    optional: true,
    type: Boolean
  },
  "link.$.target" : {
    optional: true,
    type: ReferenceSchema
  },
  "link.$.assurance" : {
    optional: true,
    type: Code
  }
});
Persons.attachSchema(PersonSchema);
