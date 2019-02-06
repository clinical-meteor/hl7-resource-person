

import PersonsPage from './client/react/PersonsPage';
import PersonsTable from './client/react/PersonsTable';
import PersonDetail from './client/react/PersonDetail';
import PersonsDirectory from './client/react/PersonsDirectory';

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
  PersonsTable,
  PersonsDirectory,
  PersonDetail
};


