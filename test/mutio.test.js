
describe("The CSV parser", function() {

  var M = new Mutio();

  beforeEach(function(done) {
    // Load the sample data and parse it
    $.get('sample-input.csv', function(csv){
      M.parseCSV(csv);
      done();
    });
  });

  it("should populate the csv private var", function(){
    console.log(M.csv);
    expect(M.csv).not.toBe({});
  });

});
