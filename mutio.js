
function Mutio() {}

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
