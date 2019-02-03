import { CardText, CardTitle } from 'material-ui/Card';
import { Tab, Tabs } from 'material-ui/Tabs';
import { GlassCard, VerticalCanvas } from 'meteor/clinical:glass-ui';

import Glass from './Glass';
//import GlassCard from './GlassCard';
import PersonDetail from './PersonDetail';
import PersonsTable from './PersonsTable';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
//import { VerticalCanvas } from './VerticalCanvas';

// import { Persons } from '../lib/Persons';
import { Session } from 'meteor/session';

let defaultPerson = {
  index: 2,
  id: '',
  username: '',
  email: '',
  given: '',
  family: '',
  gender: ''
};
Session.setDefault('personFormData', defaultPerson);
Session.setDefault('personSearchFilter', '');

export class PersonsPage extends React.Component {
  getMeteorData() {
    let data = {
      style: {
        opacity: Session.get('globalOpacity'),
        tab: {
          borderBottom: '1px solid lightgray',
          borderRight: 'none'
        }
      },
      tabIndex: Session.get('personPageTabIndex'),
      person: defaultPerson,
      personSearchFilter: '',
      currentPerson: null
    };

    if (Session.get('personFormData')) {
      data.person = Session.get('personFormData');
    }
    if (Session.get('personSearchFilter')) {
      data.personSearchFilter = Session.get('personSearchFilter');
    }
    if (Session.get("selectedPerson")) {
      data.currentPerson = Session.get("selectedPerson");
    }

    data.style = Glass.blur(data.style);
    data.style.appbar = Glass.darkroom(data.style.appbar);
    data.style.tab = Glass.darkroom(data.style.tab);

    if(process.env.NODE_ENV === "test") console.log("PersonsPage[data]", data);
    return data;
  }

  handleTabChange(index){
    Session.set('personPageTabIndex', index);
  }

  onNewTab(){
    Session.set('selectedPerson', false);
    Session.set('personUpsert', false);
  }

  render() {
    console.log('React.version: ' + React.version);
    return (
      <div id="personsPage">
        <VerticalCanvas>
          <GlassCard height="auto">
            <CardTitle
              title="Persons"
            />
            <CardText>
              <Tabs id='personsPageTabs' default value={this.data.tabIndex} onChange={this.handleTabChange} initialSelectedIndex={1}>
                 <Tab className="newPersonTab" label='New' style={this.data.style.tab} onActive={ this.onNewTab } value={0}>
                   <PersonDetail id='newPerson' />
                 </Tab>
                 <Tab className="personListTab" label='Persons' onActive={this.handleActive} style={this.data.style.tab} value={1}>
                   <PersonsTable showBarcodes={true} showAvatars={true} />
                 </Tab>
                 <Tab className="personDetailTab" label='Detail' onActive={this.handleActive} style={this.data.style.tab} value={2}>
                   <PersonDetail id='personDetails' currentPerson={this.data.currentPerson} />
                 </Tab>
             </Tabs>


            </CardText>
          </GlassCard>
        </VerticalCanvas>
      </div>
    );
  }
}



ReactMixin(PersonsPage.prototype, ReactMeteorData);

export default PersonsPage;