
function MutioCtrl($scope) {

  var M = null;

  require(["mutio"], function(){
    M = new Mutio();
    $scope.config();
  });

  $scope.config = function() {
    $scope.config = {
      name: "Welcome Data",
      validations: [],
      transforms: [
        M.rename({
          "column1":"First Name",
          "column2":"Last Name",
        }),
        M.titlecase("column1"),
        M.titlecase("column2"),
        M.create("First Name Length", function(r){
          r["column1"].length;
        }),
        M.alter("column2", function(r){
          return (r["column2"] == "") ? "Empty!" : r["column2"] ;
        })
      ],
      outputs: [
        {
          name: "All",
          filter: function(r){
            return r["Optout Email"] == "TRUE";
          }
        },
        {
          name: "Chuck\"s Family",
          filter: function(r){
            return r["column2"] == "Norris";
          }
        }
      ]
    };
  }

  function readFile(input, config) {

    if (input.files && input.files[0] && input.files[0].name.match(/csv$/)) {
      var FR = new FileReader();
      FR.onload = function(e) {

        // Locate performance issues?
        // http://stackoverflow.com/a/12408593
        $scope.csv = $.parse(e.target.result, {
          delimiter: ",",
          header: true,
          dynamicTyping: false
        });

        $scope.csv.count = function(f) {
          return this.results.rows.filter(f).length;
        }

        var stats = "";
        stats += "Total: "+$scope.csv.results.rows.length+"\n";
        for (var i in config.outputs) {
          output = config.outputs[i];
          stats += output.name+": "+$scope.csv.count(output.filter)+"\n";
        }
        $("#count").text(stats);

      };
      FR.readAsText( input.files[0] );

    } else {
      // Notify our user of unsupported file
      alert("Only files of type .csv are supported currently.");
      // Clear our file field
      $(input).replaceWith($(input).clone(true));
    }
  }

  $scope.csv = null;

  $scope.fileChanged = function() {
    readFile($("#input_file")[0], $scope.config);
  }
  $scope.download = function() {

    var config = $scope.config;
    var csv = $scope.csv;

    // Compile all our data
    var header = processHeader(csv.results.fields, config.transforms);

    for (var i in config.outputs) {
      var output = config.outputs[i];
      var rows = csv.results.rows.filter(output.filter);

      var data = csvRowToString(header);
      for (var j in rows) {
        var processedRow = processRow(rows[j], config.transforms);
        data += csvRowToString(processedRow);
      }
      // Reduce array to string and provide CSV download to user
      csvFromString(data, output.name);
    }
  }
}
