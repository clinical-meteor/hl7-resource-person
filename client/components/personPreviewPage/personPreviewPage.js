
Router.map(function(){
  this.route('personPreviewPage', {
    path: '/person/:id',
    template: 'personPreviewPage',
    data: function () {
      return Persons.findOne({_id: this.params.id});
    },
    onAfterAction: function(){
      Template.appLayout.layout();
    }
  });
});


Template.personPreviewPage.rendered = function(){
  Template.appLayout.layout();
};



Template.personPreviewPage.events({
  "click .listButton": function(event, template){
    Router.go('/list/persons');
  },
  "click .imageGridButton": function(event, template){
    Router.go('/grid/persons');
  },
  "click .tableButton": function(event, template){
    Router.go('/table/persons');
  },
  "click .indexButton": function(event, template){
    Router.go('/list/persons');
  },
  "click .personId": function(){
    Router.go('/upsert/person/' + this._id);
  }
});
