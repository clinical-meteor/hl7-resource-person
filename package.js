Package.describe({
  name: 'clinical:hl7-resource-person',
  version: '1.0.1',
  summary: 'HL7 FHIR Resource - Person',
  git: 'https://github.com/clinical-meteor/hl7-resource-person',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.3');

  api.use('meteor-platform');
  api.use('mongo');
  api.use('aldeed:simple-schema@1.3.3');
  api.use('aldeed:collection2@2.3.3');
  api.use('clinical:hl7-resource-datatypes@0.2.0');
  api.use('simple:json-routes@2.1.0');
  api.use('prime8consulting:meteor-oauth2-server@0.0.2');

  api.addFiles('lib/hl7-resource-person.js', ['client', 'server']);
  api.addFiles('server/rest.js', 'server');
  api.addFiles('server/initialize.js', 'server');

    api.use('clinical:base-model@1.3.1');
    api.use('clinical:router@2.0.17');
    api.addFiles('client/components/personUpsertPage/personUpsertPage.html', ['client']);
    api.addFiles('client/components/personUpsertPage/personUpsertPage.js', ['client']);
    api.addFiles('client/components/personUpsertPage/personUpsertPage.less', ['client']);

    api.addFiles('client/components/personsTablePage/personsTablePage.html', ['client']);
    api.addFiles('client/components/personsTablePage/personsTablePage.js', ['client']);
    api.addFiles('client/components/personsTablePage/personsTablePage.less', ['client']);
    api.addFiles('client/components/personsTablePage/jquery.tablesorter.js', ['client']);

    api.addFiles('client/components/personPreviewPage/personPreviewPage.html', ['client']);
    api.addFiles('client/components/personPreviewPage/personPreviewPage.js', ['client']);
    api.addFiles('client/components/personPreviewPage/personPreviewPage.less', ['client']);

    api.addFiles('client/components/personsListPage/personsListPage.html', ['client']);
    api.addFiles('client/components/personsListPage/personsListPage.js', ['client']);
    api.addFiles('client/components/personsListPage/personsListPage.less', ['client']);

  api.export('Person');
  api.export('Persons');
});

// Package.onTest(function (api) {
//   api.use('tinytest');
//   api.use('clinical:hl7-resource-person');
// });
