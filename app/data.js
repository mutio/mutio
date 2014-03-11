
function DataCtrl($scope) {

  function titlecase(field) {
    return {
      description: "Convert "+field+" to titlecase",
      alterRow: function(row) {
        row[field] = row[field].replace(/\w\S*/g, function(txt){
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        return row;
      }
    }
  }

  function create(field, value) {
    return {
      description: "Create new field called "+field,
      alterRow: function(row) {
        row[field] = value(row);
        return row;
      },
      alterHeader: function(row) {
        row.push(field);
        return row;
      }
    }
  }

  function alter(field, value) {
    return {
      description: "Alter value for field: "+field,
      alterRow: function(row) {
        row[field] = value(row);
        return row;
      }
    }
  }

  function rename(map) {
    return {
      description: "Rename column names",
      alterHeader: function(row) {
        Object.keys(map)
          .map(function(old_name){
            var index = row.indexOf(old_name);
            var new_name = map[old_name];
            row[index] = new_name;
          });
        return row;
      }
    }
  }

  function csvFromString(data, filename) {
    filename = filename += ".csv";
    var blob = new Blob([data], {type: "text/csv;charset=utf-8"});
    saveAs(blob, filename);
  };

  function processHeader(row, transforms) {
    for (var i in transforms) {
      t = transforms[i];
      if (t.alterHeader) {
        row = t.alterHeader(row);
      }
    }
    return row;
  }

  function processRow(row, transforms) {
    for (var i in transforms) {
      t = transforms[i];
      if (t.alterRow) {
        row = t.alterRow(row);
      }
    }
    return row;
  }

  function csvRowToString(row) {
    return Object.keys(row)
      .map(function(key){
        return row[key];
      })
      .reduce(function(p, n){
        return p + "," + n;
      }) + "\n";
  };

  $scope.config = {
    name: "Welcome Data",
    validations: [],
    transforms: [
      rename({
        "column1":"First Name",
        "column2":"Last Name",
      }),
      titlecase("column1"),
      titlecase("column2"),
      create("First Name Length", function(r){
        r["column1"].length;
      }),
      alter("column2", function(r){
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
