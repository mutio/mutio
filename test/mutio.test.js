
var sample_csv;

$.ajax({
  url: 'sample-input.csv',
  success: function(data){
    sample_csv = data;
  },
  async: false
});

var M = new Mutio()
M.parseCSV(sample_csv)

describe("The CSV parser", function(){

  it("should populate the csv private var", function(){
    expect(M.csv).not.toBeNull()
  })

})

describe("The original set of data", function(){

  it("should be retrievable in full", function(){
    expect(M.original().length).toBe(10)
  })

  it("should be retrievable by row", function(){

    var asExpected = {
      country: "Comoros",
      email: "dpatterson@gigashots.gov",
      first_name: "dorothy",
      id: "1",
      ip_address: "230.68.162.110",
      last_name: "patterson",
      subscribed: "false",
    }
    expect(M.original(0)).toBe(asExpected)

    asExpected = {
      country: "Chad",
      email: "ejames@thoughtstorm.org",
      first_name: "chuck",
      id: "6",
      ip_address: "79.12.207.108",
      last_name: "norris",
      subscribed: "true",
    }
    expect(M.original(9)).toBe(asExpected)

    asExpected = {
      country: "Mozambique",
      email: "jwood@jatri.org",
      first_name: "jimmy",
      id: "10",
      ip_address: "146.138.186.12",
      last_name: "wood",
      subscribed: "false",
    }
    expect(M.original(9)).toBe(asExpected)

  })

})

describe("The modified set of data", function(){

  it("should be retrievable in full", function(){
    expect(M.modified().length).toBe(10)
  })

  it("should be retrievable by row", function(){

    var asExpected = {
      country: "Comoros",
      email: "dpatterson@gigashots.gov",
      first_name: "Dorothy",
      id: "1",
      ip_address: "230.68.162.110",
      last_name: "Patterson",
      subscribed: "no",
      'First Name Length': 7
    }
    expect(M.modified(0)).toBe(asExpected)

    asExpected = {
      country: "Chad",
      email: "ejames@thoughtstorm.org",
      first_name: "Chuck",
      id: "6",
      ip_address: "79.12.207.108",
      last_name: "Norris",
      subscribed: "yes",
      'First Name Length': 5
    }
    expect(M.modified(9)).toBe(asExpected)

    asExpected = {
      country: "Mozambique",
      email: "jwood@jatri.org",
      first_name: "Jimmy",
      id: "10",
      ip_address: "146.138.186.12",
      last_name: "Wood",
      subscribed: "no",
      'First Name Length': 5
    }
    expect(M.modified(9)).toBe(asExpected)

  })

  it("should be retrievable by output filter", function(){

    expect(M.modified({output:'Chuck\'s Family'}).length).toBe(3);

  })

})
