Session.setDefault('personReadOnly', true);


Router.map(function () {
  this.route('newPersonRoute', {
    path: '/insert/person',
    template: 'personUpsertPage',
    onAfterAction: function () {
      Session.set('personReadOnly', false);
    }
  });

});
Router.route('/upsert/person/:id', {
  name: 'upsertPersonRoute',
  template: 'personUpsertPage',
  data: function () {
    return Persons.findOne(this.params.id);
  },
  onAfterAction: function () {
    Session.set('personReadOnly', false);
  }
});
Router.route('/view/person/:id', {
  name: 'viewPersonRoute',
  template: 'personUpsertPage',
  data: function () {
    return Persons.findOne(this.params.id);
  },
  onAfterAction: function () {
    Session.set('personReadOnly', true);
  }
});


//-------------------------------------------------------------


Template.personUpsertPage.rendered = function () {
  Template.appLayout.layout();
};


Template.personUpsertPage.helpers({
  getName: function(){
    return this.name[0].text;
  },
  getEmailAddress: function () {
    if (this.telecom && this.telecom[0] && (this.telecom[0].system === "email")) {
      return this.telecom[0].value;
    } else {
      return "";
    }
  },
  isNewPerson: function () {
    if (this._id) {
      return false;
    } else {
      return true;
    }
  },
  isReadOnly: function () {
    if (Session.get('personReadOnly')) {
      return 'readonly';
    }
  },
  getPersonId: function () {
    if (this._id) {
      return this._id;
    } else {
      return '---';
    }
  }
});

Template.personUpsertPage.events({
  'click #removeUserButton': function () {
    Persons.remove(this._id, function (error, result) {
      if (error) {
        console.log("error", error);
      };
      if (result) {
        Router.go('/list/persons');
      }
    });
  },
  'click #saveUserButton': function () {
    //console.log( 'this', this );

    Template.personUpsertPage.savePerson(this);
    Session.set('personReadOnly', true);
  },
  'click .barcode': function () {
    // TODO:  refactor to Session.toggle('personReadOnly')
    if (Session.equals('personReadOnly', true)) {
      Session.set('personReadOnly', false);
    } else {
      Session.set('personReadOnly', true);
      console.log('Locking the person...');
      Template.personUpsertPage.savePerson(this);
    }
  },
  'click #lockPersonButton': function () {
    //console.log( 'click #lockPersonButton' );

    if (Session.equals('personReadOnly', true)) {
      Session.set('personReadOnly', false);
    } else {
      Session.set('personReadOnly', true);
    }
  },
  'click #personListButton': function (event, template) {
    Router.go('/list/persons');
  },
  'click .imageGridButton': function (event, template) {
    Router.go('/grid/persons');
  },
  'click .tableButton': function (event, template) {
    Router.go('/table/persons');
  },
  'click #previewPersonButton': function () {
    Router.go('/customer/' + this._id);
  },
  'click #upsertPersonButton': function () {
    console.log('creating new Persons...');
    Template.personUpsertPage.savePerson(this);
  }
});


Template.personUpsertPage.savePerson = function (person) {
  // TODO:  add validation functions

  if (person._id) {
    var personOptions = {
      personname: $('#personnameInput').val(),
      emails: [{
        address: $('#personEmailInput').val()
      }],
      profile: {
        fullName: $('#personFullNameInput').val(),
        avatar: $('#personAvatarInput').val(),
        description: $('#personDescriptionInput').val()
      }
    };

    Persons.update({
      _id: person._id
    }, {
      $set: personOptions
    }, function (error, result) {
      if (error) console.log(error);
      Router.go('/view/person/' + person._id);
    });

    if (person.emails[0].address !== $('#personEmailInput')
      .val()) {
      var options = {
        personId: person._id,
        email: $('#personEmailInput')
          .val()
      };
      Meteor.call('updateEmail', options);
    }


  } else {
    var personOptions = {
      personname: $('#personnameInput').val(),
      email: $('#personEmailInput').val(),
      profile: {
        fullName: $('#personFullNameInput').val(),
        avatar: $('#personAvatarInput').val(),
        description: $('#personDescriptionInput').val()
      }
    };
    //console.log( 'personOptions', personOptions );

    personOptions.password = $('#personnameInput')
      .val();
    Meteor.call('addUser', personOptions, function (error, result) {
      if (error) {
        console.log('error', error);
      }
      if (result) {
        console.log('result', result);
        Router.go('/view/person/' + result);
      }
    });

  }
};
