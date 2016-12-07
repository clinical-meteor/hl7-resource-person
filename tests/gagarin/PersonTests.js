describe('clinical:hl7-resources-person', function () {
  var server = meteor();
  var client = browser(server);

  it('Persons should exist on the client', function () {
    return client.execute(function () {
      expect(Persons).to.exist;
    });
  });

  it('Persons should exist on the server', function () {
    return server.execute(function () {
      expect(Persons).to.exist;
    });
  });

});
