function MutioCtrl($scope) {

  var M = null;

  require(["mutio"], function(){
    M = new Mutio();
    $scope.configure();
    $scope.setDefaultData();
  });

  $scope.configure = function() {
    // Bring in textarea value as config
    // @ISSUE might be better to use Angular binding rather than jQuery here
    eval("var config = "+$('#config').val());
    M.configure(config);
  }

  $scope.updateConfig = function() {
    $scope.configure();
    $scope.updateCounts();
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
