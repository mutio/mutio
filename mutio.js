
function Mutio() {
  this.config = {};
  this.csv = {};
}

Mutio.prototype.configure = function(config) {
  this.config = config;
}

Mutio.prototype.titlecase = function(field) {
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

Mutio.prototype.create = function(field, value) {
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

Mutio.prototype.alter = function(field, value) {
  return {
    description: "Alter value for field: "+field,
    alterRow: function(row) {
      row[field] = value(row);
      return row;
    }
  }
}

Mutio.prototype.rename = function(map) {
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

Mutio.prototype.parseCSV = function(csv) {
  // Locate performance issues?
  // http://stackoverflow.com/a/12408593
  this.csv = $.parse(csv, {
    delimiter: ",",
    header: true,
    dynamicTyping: false
  });
}

Mutio.prototype.processHeader = function(row, transforms) {
  for (var i in transforms) {
    t = transforms[i];
    if (t.alterHeader) {
      row = t.alterHeader(row);
    }
  }
  return row;
}

Mutio.prototype.processRow = function(row, transforms) {
  for (var i in transforms) {
    t = transforms[i];
    if (t.alterRow) {
      row = t.alterRow(row);
    }
  }
  return row;
}

Mutio.prototype.csvRowToString = function(row) {
  return Object.keys(row)
  .map(function(key){
    return row[key];
  })
  .reduce(function(p, n){
    return p + "," + n;
  }) + "\n";
};

Mutio.prototype.generateOutputs = function() {
  var outputs = [];
  // Compile all our data
  var header = this.processHeader(this.csv.results.fields, this.config.transforms);
  // Generate CSV string for each config item
  for (var i in this.config.outputs) {
    var output = this.config.outputs[i];
    var rows = this.csv.results.rows.filter(output.filter);

    var data = this.csvRowToString(header);
    for (var j in rows) {
      var processedRow = this.processRow(rows[j], this.config.transforms);
      data += this.csvRowToString(processedRow);
    }
    outputs.push({name: output.name, csv: data});
  }
  return outputs;
}

Mutio.prototype.counts = function(config) {
  var counts = [];
  var that = this;
  var count = function(f) {
    return that.csv.results.rows.filter(f).length;
  }
  counts.push({name:'Total', count: this.csv.results.rows.length});
  for (var i in this.config.outputs) {
    output = this.config.outputs[i];
    counts.push({name:output.name, count:count(output.filter)});
  }
  return counts;
}
