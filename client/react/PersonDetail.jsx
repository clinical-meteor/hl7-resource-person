import { CardActions, CardText } from 'material-ui/Card';
import { get, has, set } from 'lodash';
// import { insertPerson, removePersonById, updatePerson } from '/imports/ui/workflows/persons/methods';
// import { insertPerson, removePersonById, updatePerson } from 'meteor/clinical:hl7-resource-person';
import { insertPerson, removePersonById, updatePerson } from 'meteor/clinical:hl7-resource-person';


import { Bert } from 'meteor/clinical:alert';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import TextField from 'material-ui/TextField';

import { Persons } from '../../lib/Persons';
import { Session } from 'meteor/session';


let defaultPerson = {
  "resourceType" : "Person",
  "name" : [{
    "text" : "",
    "resourceType" : "HumanName"
  }],
  "active" : true,
  "gender" : "",
  "birthDate" : '',
  "photo" : [{
    url: ""
  }],
  identifier: [{
    "use": "usual",
    "type": {
      "coding": [
        {
          "system": "http://hl7.org/fhir/v2/0203",
          "code": "MR"
        }
      ]
    },
    "value": ""
  }],
  "test" : false
};


Session.setDefault('personUpsert', false);
Session.setDefault('selectedPerson', false);

export default class PersonDetail extends React.Component {
  getMeteorData() {
    let data = {
      personId: false,
      person: defaultPerson
    };

    if (Session.get('personUpsert')) {
      data.person = Session.get('personUpsert');
    } else {
      if (Session.get('selectedPerson')) {
        data.personId = Session.get('selectedPerson');
        console.log("selectedPerson", Session.get('selectedPerson'));

        let selectedPerson = Persons.findOne({_id: Session.get('selectedPerson')});
        console.log("selectedPerson", selectedPerson);

        if (selectedPerson) {
          data.person = selectedPerson;

          if (typeof selectedPerson.birthDate === "object") {
            data.person.birthDate = moment(selectedPerson.birthDate).add(1, 'day').format("YYYY-MM-DD");
          }
        }
      } else {
        data.person = defaultPerson;
      }
    }

    if(process.env.NODE_ENV === "test") console.log("PersonDetail[data]", data);
    return data;
  }

  render() {
    return (
      <div id={this.props.id} className="personDetail">
        <CardText>
          <TextField
            id='nameInput'
            ref='name'
            name='name'
            floatingLabelText='name'
            value={ get(this, 'data.person.name[0].text', '')}
            onChange={ this.changeState.bind(this, 'name')}
            fullWidth
            /><br/>
          <TextField
            id='genderInput'
            ref='gender'
            name='gender'
            floatingLabelText='gender'
            hintText='male | female | other | indeterminate | unknown'
            value={ get(this, 'data.person.gender', '')}
            onChange={ this.changeState.bind(this, 'gender')}
            fullWidth
            /><br/>
          <TextField
            id='birthdateInput'
            ref='birthdate'
            name='birthdate'
            floatingLabelText='birthdate'
            hintText='YYYY-MM-DD'
            value={ get(this, 'data.person.birthDate', '')}
            onChange={ this.changeState.bind(this, 'birthDate')}
            fullWidth
            /><br/>
          <TextField
            id='photoInput'
            ref='photo'
            name='photo'
            floatingLabelText='photo'
            value={ get(this, 'data.person.photo[0].url', '')}
            onChange={ this.changeState.bind(this, 'photo')}
            floatingLabelFixed={false}
            fullWidth
            /><br/>
          <TextField
            id='mrnInput'
            ref='mrn'
            name='mrn'
            floatingLabelText='medical record number'
            value={ get(this, 'data.person.identifier[0].value', '')}
            onChange={ this.changeState.bind(this, 'mrn')}
            fullWidth
            /><br/>
        </CardText>
        <CardActions>
          { this.determineButtons(this.data.personId) }
        </CardActions>
      </div>
    );
  }
  determineButtons(personId){
    if (personId) {
      return (
        <div>
          <RaisedButton id='savePersonButton' className='savePersonButton' label="Save" primary={true} onClick={this.handleSaveButton.bind(this)} style={{marginRight: '20px'}} />
          <RaisedButton label="Delete" onClick={this.handleDeleteButton.bind(this)} />
        </div>
      );
    } else {
      return(
        <RaisedButton id='savePersonButton'  className='savePersonButton' label="Save" primary={true} onClick={this.handleSaveButton.bind(this)} />
      );
    }
  }

  changeState(field, event, value){
    let personUpdate;

    if(process.env.TRACE) console.log("personDetail.changeState", field, event, value);

    // by default, assume there's no other data and we're creating a new person
    if (Session.get('personUpsert')) {
      personUpdate = Session.get('personUpsert');
    } else {
      personUpdate = defaultPerson;
    }



    // if there's an existing person, use them
    if (Session.get('selectedPerson')) {
      personUpdate = this.data.person;
    }

    switch (field) {
      case "name":
        personUpdate.name[0].text = value;
        break;
      case "gender":
        personUpdate.gender = value.toLowerCase();
        break;
      case "birthDate":
        personUpdate.birthDate = value;
        break;
      case "photo":
        personUpdate.photo[0].url = value;
        break;
      case "mrn":
        personUpdate.identifier[0].value = value;
        break;
      default:

    }
    // personUpdate[field] = value;
    process.env.TRACE && console.log("personUpdate", personUpdate);

    Session.set('personUpsert', personUpdate);
  }


  // this could be a mixin
  handleSaveButton(){
    if(process.env.NODE_ENV === "test") console.log('handleSaveButton()');
    let personUpdate = Session.get('personUpsert', personUpdate);


    if (personUpdate.birthDate) {
      personUpdate.birthDate = new Date(personUpdate.birthDate);
    }
    if(process.env.NODE_ENV === "test") console.log("personUpdate", personUpdate);

    if (Session.get('selectedPerson')) {
      if(process.env.NODE_ENV === "test") console.log("Updating person...");

      delete personUpdate._id;

      // not sure why we're having to respecify this; fix for a bug elsewhere
      personUpdate.resourceType = 'Person';

      Persons.update({_id: Session.get('selectedPerson')}, {$set: personUpdate }, function(error, result){
        if (error) {
          if(process.env.NODE_ENV === "test") console.log("Persons.insert[error]", error);
          Bert.alert(error.reason, 'danger');
        }
        if (result) {
          HipaaLogger.logEvent({eventType: "update", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Persons", recordId: Session.get('selectedPerson')});
          // Session.set('personUpdate', defaultPerson);
          Session.set('personUpsert', false);
          Session.set('selectedPerson', false);
          Session.set('personPageTabIndex', 1);
          Bert.alert('Person added!', 'success');
        }
      });
    } else {
      if(process.env.NODE_ENV === "test") console.log("Creating a new person...", personUpdate);

      Persons.insert(personUpdate, function(error, result) {
        if (error) {
          if(process.env.NODE_ENV === "test")  console.log('Persons.insert[error]', error);
          Bert.alert(error.reason, 'danger');
        }
        if (result) {
          HipaaLogger.logEvent({eventType: "create", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Persons", recordId: result});
          Session.set('personPageTabIndex', 1);
          Session.set('selectedPerson', false);
          Session.set('personUpsert', false);
          Bert.alert('Person added!', 'success');
        }
      });
    }
  }

  handleCancelButton(){
    Session.set('personPageTabIndex', 1);
  }

  handleDeleteButton(){
    Persons.remove({_id: Session.get('selectedPerson')}, function(error, result){
      if (error) {
        if(process.env.NODE_ENV === "test") console.log('Persons.insert[error]', error);
        Bert.alert(error.reason, 'danger');
      }
      if (result) {
        HipaaLogger.logEvent({eventType: "delete", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Persons", recordId: Session.get('selectedPerson')});
        // Session.set('personUpdate', defaultPerson);
        Session.set('personUpsert', false);
        Session.set('personPageTabIndex', 1);
        Session.set('selectedPerson', false);
        Bert.alert('Person removed!', 'success');
      }
    });
  }
}


ReactMixin(PersonDetail.prototype, ReactMeteorData);
