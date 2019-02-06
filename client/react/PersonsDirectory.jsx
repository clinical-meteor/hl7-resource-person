import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import { HTTP } from 'meteor/http';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { Table } from 'react-bootstrap';
import { Session } from 'meteor/session';
import { has, get } from 'lodash';
import { TableNoData } from 'meteor/clinical:glass-ui'


flattenPerson = function(person){
  let result = {
    _id: person._id,
    id: person.id,
    active: true,
    name: '',
    relation: '',
    email: '',
    phone: ''
    // gender: person.gender,
    // name: '',
    // mrn: '',
    // birthDate: '',
    // photo: "/thumbnail-blank.png",
    // initials: 'abc'
  };

  // there's an off-by-1 error between momment() and Date() that we want
  // to account for when converting back to a string
  // result.birthDate = moment(person.birthDate).add(1, 'days').format("YYYY-MM-DD")
  // result.photo = get(person, 'photo[0].url', '');
  // result.mrn = get(person, 'identifier[0].value', '');

  if(has(person, 'name[0].text')){
    result.name = get(person, 'name[0].text');    
  } else {
    result.name = get(person, 'name[0].given[0]') + ' ' + get(person, 'name[0].family[0]');
  }

  var telecom = get(person, 'telecom')
  telecom.forEach(function(teleco){
    switch (teleco.system) {
      case 'email':
        result.email = teleco.value;
        break;
      case 'phone':
        result.phone = teleco.value;
        break;
      default:
        break;
    }  
  })

  return result;
}

export class PersonsDirectory extends React.Component {
  constructor(props) {
    super(props);
  }
  getMeteorData() {
    let data = {
      style: {
        hideOnPhone: {
          visibility: 'visible',
          display: 'table'
        },
        cellHideOnPhone: {
          visibility: 'visible',
          display: 'table',
          paddingTop: '16px',
          maxWidth: '120px'
        },
        cell: {
          paddingTop: '16px'
        },
        avatar: {
          // color: rgb(255, 255, 255);
          backgroundColor: 'rgb(188, 188, 188)',
          userSelect: 'none',
          borderRadius: '2px',
          height: '40px',
          width: '40px'
        }
      },
      selected: [],
      persons: []
    };

    let query = {};
    let options = {};

    // number of items in the table should be set globally
    if (get(Meteor, 'settings.public.defaults.paginationLimit')) {
      options.limit = get(Meteor, 'settings.public.defaults.paginationLimit');
    }
    // but can be over-ridden by props being more explicit
    if(this.props.limit){
      options.limit = this.props.limit;      
    }

    if(this.props.data){
      // console.log('this.props.data', this.props.data);

      if(this.props.data.length > 0){              
        this.props.data.forEach(function(person){
          data.persons.push(flattenPerson(person));
        });  
      }
    } else {
      data.persons = Persons.find().map(function(person){
        return flattenPerson(person);
      });
    }


    if (Session.get('appWidth') < 768) {
      data.style.hideOnPhone.visibility = 'hidden';
      data.style.hideOnPhone.display = 'none';
      data.style.cellHideOnPhone.visibility = 'hidden';
      data.style.cellHideOnPhone.display = 'none';
    } else {
      data.style.hideOnPhone.visibility = 'visible';
      data.style.hideOnPhone.display = 'table-cell';
      data.style.cellHideOnPhone.visibility = 'visible';
      data.style.cellHideOnPhone.display = 'table-cell';
    }

    // console.log("PersonsDirectory[data]", data);
    return data;
  }
  imgError(avatarId) {
    this.refs[avatarId].src = Meteor.absoluteUrl() + 'noAvatar.png';
  }
  rowClick(id){
    Session.set('personsUpsert', false);
    Session.set('selectedPerson', id);
    Session.set('personPageTabIndex', 2);
  }
  renderRowAvatarHeader(){
    if (get(Meteor, 'settings.public.defaults.avatars') && (this.props.showAvatars === true)) {
      return (
        <th className='avatar'>photo</th>
      );
    }
  }
  renderRowAvatar(person, avatarStyle){
    //console.log('renderRowAvatar', person, avatarStyle)
    
    if (get(Meteor, 'settings.public.defaults.avatars') && (this.props.showAvatars === true)) {
      return (
        <td className='avatar'>
          <img src={person.photo} ref={person._id} onError={ this.imgError.bind(this, person._id) } style={avatarStyle}/>
        </td>
      );
    }
  }
  renderSendButtonHeader(){
    if (this.props.showSendButton === true) {
      return (
        <th className='sendButton' style={this.data.style.hideOnPhone}></th>
      );
    }
  }
  renderSendButton(person, avatarStyle){
    if (this.props.showSendButton === true) {
      return (
        <td className='sendButton' style={this.data.style.hideOnPhone}>
          <FlatButton label="send" onClick={this.onSend.bind('this', this.data.persons[i]._id)}/>
        </td>
      );
    }
  }
  onSend(id){
    let person = Persons.findOne({_id: id});

    console.log("PersonsDirectory.onSend()", person);

    var httpEndpoint = "http://localhost:8080";
    if (get(Meteor, 'settings.public.interfaces.default.channel.endpoint')) {
      httpEndpoint = get(Meteor, 'settings.public.interfaces.default.channel.endpoint');
    }
    HTTP.post(httpEndpoint + '/Person', {
      data: person
    }, function(error, result){
      if (error) {
        console.log("error", error);
      }
      if (result) {
        console.log("result", result);
      }
    });
  }
  selectPersonRow(personId){
    if(typeof(this.props.onRowClick) === "function"){
      this.props.onRowClick(personId);
    }
  }
  render () {
    let tableRows = [];
    let footer;

    if(this.data.persons.length === 0){
      footer = <TableNoData noDataPadding={ this.props.noDataPadding } />
    } else {
      for (var i = 0; i < this.data.persons.length; i++) {
        tableRows.push(
          <tr key={i} className="personRow" style={{cursor: "pointer"}} onClick={this.selectPersonRow.bind(this, this.data.persons[i].id )} >
  
            { this.renderRowAvatar(this.data.persons[i], this.data.style.avatar) }
  
            <td className='name' onClick={ this.rowClick.bind('this', this.data.persons[i]._id)} style={this.data.style.cell}>{this.data.persons[i].name }</td>
            <td className='relation' onClick={ this.rowClick.bind('this', this.data.persons[i]._id)} style={this.data.style.cell}>{this.data.persons[i].relation }</td>
            <td className='email' onClick={ this.rowClick.bind('this', this.data.persons[i]._id)} style={this.data.style.cell}>{this.data.persons[i].email }</td>
            <td className='phone' onClick={ this.rowClick.bind('this', this.data.persons[i]._id)} style={this.data.style.cell}>{this.data.persons[i].phone }</td>

            {/* <td className='gender' onClick={ this.rowClick.bind('this', this.data.persons[i]._id)} style={this.data.style.cell}>{this.data.persons[i].gender}</td>
            <td className='birthDate' onClick={ this.rowClick.bind('this', this.data.persons[i]._id)} style={{minWidth: '100px', paddingTop: '16px'}}>{this.data.persons[i].birthDate }</td>
            <td className='isActive' onClick={ this.rowClick.bind('this', this.data.persons[i]._id)} style={this.data.style.cellHideOnPhone}>{this.data.persons[i].active}</td>
            <td className='mrn' style={this.data.style.cellHideOnPhone}>{this.data.persons[i].mrn}</td> */}
            {/* <td className='id' onClick={ this.rowClick.bind('this', this.data.persons[i].id)} style={this.data.style.cellHideOnPhone}><span className="barcode">{this.data.persons[i].id}</span></td>             */}

              { this.renderSendButton(this.data.persons[i], this.data.style.avatar) }
          </tr>
        );
      }
    }
    


    return(
      <div>
        <Table id='personsTable' hover >
          <thead>
            <tr>
              { this.renderRowAvatarHeader() }

              <th className='name'>Name</th>
              <th className='relation'>Relation</th>
              <th className='email'>Email</th>
              <th className='phone'>Phone</th>
              {/* <th className='birthdate' style={{minWidth: '100px'}}>birthdate</th>
              <th className='isActive' style={this.data.style.hideOnPhone}>active</th>
              <th className='mrn' style={this.data.style.hideOnPhone}>mrn</th> */}
              {/* <th className='id' style={this.data.style.hideOnPhone}>_id</th> */}
              
              { this.renderSendButtonHeader() }
            </tr>
          </thead>
          <tbody>
            { tableRows }
          </tbody>
        </Table>
        { footer }
      </div>
    );
  }
}


ReactMixin(PersonsDirectory.prototype, ReactMeteorData);
export default PersonsDirectory;