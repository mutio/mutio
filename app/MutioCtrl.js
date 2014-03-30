function MutioCtrl($scope) {

  $scope.configure = function() {
    // Bring in textarea value as config
    // @ISSUE might be better to use Angular binding rather than jQuery here
    eval("var config = "+$('#config').val());
    M.configure(config);
  }

  $scope.setDefaultData = function() {

    var conf;
    $.ajax({
      url: 'test/sample-config.txt',
      success: function(data){
        conf = data;
      },
      async: false
    });

    $('#config').val(conf);
    $scope.configure();

    var sample_csv;
    $.ajax({
      url: 'test/sample-input.csv',
      success: function(data){
        sample_csv = data;
      },
      async: false
    });
    M.parseCSV(sample_csv);

  }

  $scope.readFile = function(input) {

    if (input.files && input.files[0] && input.files[0].name.match(/csv$/)) {
      // A CSV has been selected, read and parse it
      var FR = new FileReader();
      FR.onload = function(e) {
        M.parseCSV(e.target.result);
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
  $scope.download = function(name) {

    name = name || null;

    var outputs = M.generateOutputs();

    if (name) {
      var output = outputs.filter(function(o){ return o.name == name; })[0];
      // Download the single output specified
      csvDownload(output.csv, name);
    } else {
      // No output specified, download all
      outputs.map(function(output){
        csvDownload(output.csv, output.name);
      });
    }
  }

  $scope.unsorted = function(obj){
    // Appropriated from http://stackoverflow.com/questions/19287716/skip-ng-repeat-json-ordering-in-angular-js
    return (!obj) ? [] : Object.keys(obj).slice(0,-1) ;
  }

  M = new Mutio();
  $scope.setDefaultData();
  $scope.originalFields = M.originalFields();
  $scope.originalRows = M.original();
  $scope.modifiedFields = M.modifiedFields();
  $scope.modifiedRows = M.modified();
  $scope.outputs = M.counts();

}
