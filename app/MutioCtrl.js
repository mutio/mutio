function MutioCtrl($scope) {

  var M = null;

  require(["mutio"], function(){
    M = new Mutio();
    $scope.configure();
  });

  $scope.configure = function() {
    M.config = {
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
    };
    $scope.setDefaultData();
  }

  $scope.setDefaultData = function() {
    $.get('test/sample-input.csv', function(csv){
      M.parseCSV(csv);
      $scope.updateCounts();
    });
  }

  $scope.updateCounts = function() {
    // Display output counts
    var counts = M.counts();
    $("#count").text(counts.reduce(function(p, n){
      return p + n.name + ": " + n.count + "\n";
    }, ''));
  }

  $scope.readFile = function(input) {

    if (input.files && input.files[0] && input.files[0].name.match(/csv$/)) {
      // A CSV has been selected, read and parse it
      var FR = new FileReader();
      FR.onload = function(e) {
        M.parseCSV(e.target.result);
        $scope.updateCounts();
      };
      FR.readAsText(input.files[0]);

    } else {
      // Disallowed file selected
      alert("Only files of type .csv are supported currently.");
      // Clear our file field
      $(input).replaceWith($(input).clone(true));
    }
  }

  function csvDownload(data, filename) {
    filename = filename += ".csv";
    var blob = new Blob([data], {type: "text/csv;charset=utf-8"});
    saveAs(blob, filename);
  };

  $scope.fileChanged = function() {
    $scope.readFile($("#input_file")[0]);
  }

  // Generate outputs and trigger CSV download for each
  $scope.download = function() {
    var outputs = M.generateOutputs();
    outputs.map(function(output){
      csvDownload(output.csv, output.name);
    });
  }
}
