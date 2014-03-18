
function Mutio() {
  this.config = {};
  this._original = {};
  this._modified = {};
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
  this._original = $.parse(csv, {
    delimiter: ",",
    header: true,
    dynamicTyping: false
  });

  // Build our modified data on load
  this.transform();
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
  var new_row = this.clone(row);
  for (var i in transforms) {
    t = transforms[i];
    if (t.alterRow) {
      new_row = t.alterRow(new_row);
    }
  }
  return new_row;
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
  var header = this.processHeader(this._original.results.fields, this.config.transforms);
  // Generate CSV string for each config item
  for (var i in this.config.outputs) {
    var output = this.config.outputs[i];
    var rows = this._original.results.rows.filter(output.filter);

    var data = this._originalRowToString(header);
    for (var j in rows) {
      var processedRow = this.processRow(rows[j], this.config.transforms);
      data += this._originalRowToString(processedRow);
    }
    outputs.push({name: output.name, csv: data});
  }
  return outputs;
}

Mutio.prototype.transform = function() {
  // Compile all our data
  var fields = this.processHeader(this._original.results.fields, this.config.transforms);
  // Generate CSV string for each config item
  var original = this._original.results.rows;
  var rows = [];
  for (var i in original) {
    var processedRow = this.processRow(original[i], this.config.transforms);
    rows.push(processedRow);
  }
  this._modified = {
    fields: fields,
    rows: rows
  };
}

Mutio.prototype.counts = function(config) {
  var counts = [];
  var that = this;
  var count = function(f) {
    return that.csv.results.rows.filter(f).length;
  }
  counts.push({name:'Total', count: this._original.results.rows.length});
  for (var i in this.config.outputs) {
    output = this.config.outputs[i];
    counts.push({name:output.name, count:count(output.filter)});
  }
  return counts;
}




/* RESTful API */

/**
 * GET actions for original data set
 * @param   {mixed} index (optional) The index for a particular row
 * @return  {mixed} An array of row objects, or a single row object
 */
Mutio.prototype.original = function (index) {
  return (this.isInt(index)) ? this._original.results.rows[index] : this._original.results.rows;
}

/**
 * GET actions for modified data set
 * @param   {mixed} index (optional) The index for a particular row
 * @return  {mixed} An array of row objects, or a single row object
 */
Mutio.prototype.modified = function (args) {
  if (this.isInt(args)) {
    return this._modified.rows[args];
  } else if (args instanceof Object && args.output) {
      var filter = this.outputConfig(args.output).filter;
      return this._modified.rows.filter(filter);
  } else {
    return this._modified.rows;
  }
}

/**
 * Find output config by name
 * @param  {String} name The name of the desired output config
 * @return {Object} Output config
 */
Mutio.prototype.outputConfig = function(name) {
  var outputs = this.config.outputs;
  return outputs.filter(function(o){ return o.name == name; })[0];
}


/* Utilities */

/**
 * Checks if the value is of an int type
 * @param  {mixed}  value
 * @return {Boolean}
 */
Mutio.prototype.isInt = function(value) {
   return !isNaN(value) && parseInt(value) == value;
}

/**
 * Shallow copy clone of an object
 * @param  {Object} obj
 * @return {Object}
 */
Mutio.prototype.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}
