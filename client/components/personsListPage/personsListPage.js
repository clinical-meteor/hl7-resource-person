Session.setDefault( 'personSearchFilter', '' );
Session.setDefault( 'tableLimit', 20 );
Session.setDefault( 'paginationCount', 1 );
Session.setDefault( 'selectedPagination', 0 );
Session.setDefault( 'skipCount', 0 );



//------------------------------------------------------------------------------
// ROUTING

Router.route( '/list/persons/', {
  name: 'personsListPage',
  template: 'personsListPage',
  data: function () {
    return Persons.find();
  }
});


//------------------------------------------------------------------------------
// TEMPLATE INPUTS

Template.personsListPage.events( {
  'click .addRecordIcon': function () {
    Router.go( '/insert/person' );
  },
  'click .personItem': function () {
    Router.go( '/view/person/' + this._id );
  },
  // use keyup to implement dynamic filtering
  // keyup is preferred to keypress because of end-of-line issues
  'keyup #personSearchInput': function () {
    Session.set( 'personSearchFilter', $( '#personSearchInput' ).val() );
  }
} );


//------------------------------------------------------------------------------
// TEMPLATE OUTPUTS


var OFFSCREEN_CLASS = 'off-screen';
var EVENTS = 'webkitTransitionEnd oTransitionEnd transitionEnd msTransitionEnd transitionend';

Template.personsListPage.rendered = function () {
  console.log( 'trying to update layout...' );

  Template.appLayout.delayedLayout( 20 );
};


Template.personsListPage.helpers( {
  hasNoContent: function () {
    if ( Persons.find()
      .count() === 0 ) {
      return true;
    } else {
      return false;
    }
  },
  personsList: function () {
    Session.set( 'receivedData', new Date() );

    Template.appLayout.delayedLayout( 20 );

    return Persons.find( {
      'profile.fullName': {
        $regex: Session.get( 'personSearchFilter' ),
        $options: 'i'
      }
    } );
  }
} );
