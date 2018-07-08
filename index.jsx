

import PersonsPage from './client/react/PersonsPage';
import PersonTable from './client/react/PersonTable';
import PersonDetail from './client/react/PersonDetail';

import { Person, Persons, PersonSchema } from './lib/Persons';

var DynamicRoutes = [{
  'name': 'PersonPage',
  'path': '/persons',
  'component': PersonsPage,
  'requireAuth': true
}];

var SidebarElements = [{
  'primaryText': 'Persons',
  'to': '/persons',
  'href': '/persons'
}];

export { 
  SidebarElements, 
  DynamicRoutes, 

  PersonsPage,
  PersonTable,
  PersonDetail,
  PersonCard
};


