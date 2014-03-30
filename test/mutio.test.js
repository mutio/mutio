
var sample_csv;

$.ajax({
  url: 'sample-input.csv',
  success: function(data){
    sample_csv = data;
  },
  async: false
});

var M = new Mutio()
M.configure({
  name: "Welcome Data",
  validations: [],
  transforms: [
    M.rename({
      "first_name":"First Name",
      "last_name":"Last Name",
    }),
    M.titlecase("first_name"),
    M.titlecase("last_name"),
    M.create("First Name Length", function(r){
      return r["first_name"].length;
    }),
    M.alter("subscribed", function(r){
      return (r["subscribed"] == "true") ? "yes" : "no" ;
    }),
  ],
  outputs: [
    {
      name: "All",
      filter: function(r){
        return true;
      }
    },
    {
      name: "Chuck\'s Family",
      filter: function(r){
        return r["last_name"] == "Norris";
      }
    }
  ]
});
M.parseCSV(sample_csv)


describe("The CSV parser", function(){

  it("should populate the csv private var", function(){
    expect(M.csv).not.toBeNull()
  })

})

// ORIGINAL
describe("The original set of data", function(){

  it("should be retrievable in full", function(){
    expect(M.original().length).toBe(10)
  })

  it("should be retrievable by row", function(){

    var asExpected = {
      id: "1",
      first_name: "dorothy",
      last_name: "patterson",
      email: "dpatterson@gigashots.gov",
      country: "Comoros",
      ip_address: "230.68.162.110",
      subscribed: "false",
    }
    expect(M.original(0)).toEqual(asExpected)

    asExpected = {
      id: "6",
      first_name: "chuck",
      last_name: "norris",
      email: "ejames@thoughtstorm.org",
      country: "Chad",
      ip_address: "79.12.207.108",
      subscribed: "true",
    }
    expect(M.original(5)).toEqual(asExpected)

    asExpected = {
      id: "10",
      first_name: "jimmy",
      last_name: "wood",
      email: "jwood@jatri.org",
      country: "Mozambique",
      ip_address: "146.138.186.12",
      subscribed: "false",
    }
    expect(M.original(9)).toEqual(asExpected)

  })

})

// MODIFIED
describe("The modified set of data", function(){

  it("should be retrievable in full", function(){
    expect(M.modified().length).toBe(10)
  })

  it("should be retrievable by row", function(){

    var asExpected = {
      id: "1",
      first_name: "Dorothy",
      last_name: "Patterson",
      country: "Comoros",
      email: "dpatterson@gigashots.gov",
      ip_address: "230.68.162.110",
      subscribed: "no",
      'First Name Length': 7
    }
    expect(M.modified(0)).toEqual(asExpected)

    asExpected = {
      id: "6",
      first_name: "Chuck",
      last_name: "Norris",
      email: "ejames@thoughtstorm.org",
      country: "Chad",
      ip_address: "79.12.207.108",
      subscribed: "yes",
      'First Name Length': 5
    }
    expect(M.modified(5)).toEqual(asExpected)

    asExpected = {
      id: "10",
      first_name: "Jimmy",
      last_name: "Wood",
      email: "jwood@jatri.org",
      country: "Mozambique",
      ip_address: "146.138.186.12",
      subscribed: "no",
      'First Name Length': 5
    }
    expect(M.modified(9)).toEqual(asExpected)

  })

  it("should be retrievable by output filter", function(){

    expect(M.modified({output:'Chuck\'s Family'}).length).toBe(3);

  })

})
