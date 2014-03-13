
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
          "first_name":"First Name",
          "last_name":"Last Name",
        }),
        M.titlecase("first_name"),
        M.titlecase("last_name"),
        M.create("First Name Length", function(r){
          r["first_name"].length;
        }),
        M.alter("subscribed", function(r){
          return (r["subscribed"] == "true") ? "yes" : "no" ;
        })
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

  function csvDownload(data, filename) {
    filename = filename += ".csv";
    var blob = new Blob([data], {type: "text/csv;charset=utf-8"});
    saveAs(blob, filename);
  };

  $scope.csv = null;

  $scope.fileChanged = function() {
    readFile($("#input_file")[0], $scope.config);
  }
  $scope.download = function() {

    var config = $scope.config;
    var csv = $scope.csv;

    // Compile all our data
    var header = M.processHeader(csv.results.fields, config.transforms);

    for (var i in config.outputs) {
      var output = config.outputs[i];
      var rows = csv.results.rows.filter(output.filter);

      var data = M.csvRowToString(header);
      for (var j in rows) {
        var processedRow = M.processRow(rows[j], config.transforms);
        data += M.csvRowToString(processedRow);
      }
      // Provide CSV as download to user
      csvDownload(data, output.name);
    }
  }
}
