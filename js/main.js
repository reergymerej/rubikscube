var cube = {
  init: function () {
    this.createPalette();
    this.buildRubiksCube();
    this.buildRubiksCubeView();
  },
  // RED: { name: 'red', r: 255, g: 0, b: 0 },
  // ORANGE: { name: 'orange', r: 255, g: 125, b: 0 },
  // WHITE: { name: 'white', r: 255, g: 255, b: 255 },
  // YELLOW: { name: 'yellow', r: 255, g: 235, b: 0 },
  // BLUE: { name: 'blue', r: 0, g: 0, b: 255 },
  // GREEN: { name: 'green', r: 68, g: 165, b: 0 },
  CENTER: 'center',
  EDGE: 'edge',
  CORNER: 'corner',
  N: 'north',
  E: 'east',
  W: 'west',
  S: 'south',
  F: 'front',
  B: 'back',
  palette: [
    { name: 'red', opposite: 'orange', r: 255, g: 0, b: 0 },
    { name: 'orange', opposite: 'red', r: 255, g: 125, b: 0 },
    { name: 'white', opposite: 'yellow', r: 255, g: 255, b: 255 },
    { name: 'yellow', opposite: 'white', r: 255, g: 235, b: 0 },
    { name: 'blue', opposite: 'green', r: 0, g: 0, b: 255 },
    { name: 'green', opposite: 'blue', r: 68, g: 165, b: 0 }
  ],
  createPalette: function () {
    var me = this,
      table = $('<table/>'),
      row = $('<tr/>'),
      cell;

    $.each(this.palette, function (i, color) {
      color = new me.Color(color);
      cell = $('<td/>').appendTo(row);
      me.paint(cell, color);
    });
    table.append(row);
    $('#palette').append(table);
    $('#palette td').click(function () {
      me.selectPaletteColor(this);
    });
    this.selectPaletteColor($('#palette td')[0]);
  },
  paint: function (element, color) {
    if (!(element instanceof $)) {
      element = $(element);
    }
    element
      .css('background-color', 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')')
      .data('color', color);
  },
  selectPaletteColor: function (td) {
    $('#palette td').removeClass('active');
    $(td).addClass('active');
    this.setBrushColor($(td).data('color'));
  },
  setBrushColor: function (color) {
    this.paint($('#palette'), color);
  },
  buildRubiksCube: function () {
    this.rube = new cube.Rube();
  },
  rube: undefined,
  buildRubiksCubeView: function () {
    var me = this,
      table = $('<table/>'),
      tr,
      td,
      xMin = 3,
      xMax = 5,
      yMin = 6,
      yMax = 8,
      row,
      column,
      map = {
        x: [3, 2, 1, 1, 1, 1, 1, 2, 3, 3, 3, 3],
        y: [3, 3, 3, 3, 2, 1, 1, 1, 1],
        z: [1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 2, 1]
      },
      position,
      cube;

    function getZ(x, y) {
      var z = null;

      switch (y) {
      case 0:
      case 1:
      case 2:
        z = y + 1;
        break;
      case 6:
        z = y - 3;
        break;
      case 7:
        z = y - 5;
        break;
      case 8:
        z = y - 7;
        break;
      default:
        z = map.z[x];
      }
      return z;
    }

    function getFace(x, y) {
      var face;
      if (x < 3) {
        face = me.B;
      } else if (x < 6) {
        face = me.W;
      } else if (x > 8) {
        face = me.E;
      } else if (y < 3) {
        face = me.N;
      } else if (y < 6) {
        face = me.F;
      } else {
        face = me.S;
      }

      return face;
    }

    for (row = 0; row < map.y.length; row++) {
      tr = $('<tr/>');
      for (column = 0; column < map.x.length; column++) {
        td = $('<td/>');
        if ((row >= xMin && row <= xMax) || (column >= yMin && column <= yMax)) {
          td.addClass('unpainted');
          position = new me.Pos(map.x[column], map.y[row], getZ(column, row));
          td.html(position.toString());
          td.data({
            position: position,
            cube: me.rube.getCube(position),
            face: getFace(column, row)
          });
        } else {
          td.addClass('hidden');
        }
        tr.append(td);
      }
      table.append(tr);
    }
    $('#cube').append(table);
    $('#cube td').click(function () {
      if (!$(this).hasClass('hidden')) {
        me.paintCube(this);
      }
    });
  },
  paintCube: function (td) {
    var color = $('#palette').data('color'),
      cube,
      face;

    td = $(td);
    cube = td.data('cube');
    face = td.data('face');

    // Is this a valid color for this cube?
    console.log('painting cube ' + cube);

    if (isValid()) {
      td.removeClass('unpainted');
      cube.setColor(color, face);
      this.paint(td, color);
    }

    function isValid() {
      var valid = true,
        matchedCube;

      // Does this cube have another face with
      // the same color or opposite?
      matchedCube = cube.getFaceByColor(color) || cube.getFaceByColor(color.opposite);
      if (matchedCube && matchedCube !== face) {
        valid = false;
      }

      return valid;
    }
  },
  Pos: function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  },
  Cube: function (type, position) {
    var me = this;

    if (!this.validateType(type)) {
      console.error('invalid type', type);
    }

    // Depending on the type, this will have 1-3 faces.
    // Use the position to determine what faces it has.
    this.faces = {};
    createFaces('x', cube.W, cube.E);
    createFaces('y', cube.S, cube.N);
    createFaces('z', cube.B, cube.F);

    this.type = type;
    this.position = position;

    function createFaces(axis, low, high) {
      var face;
      if (position[axis] === 1) {
        face = low;
      } else if (position[axis] === 3) {
        face = high;
      }

      if (face) {
        me.faces[face] = undefined;
      }
    }
  },
  Rube: function () {
    this.build();
    // console.debug('corners');
    // cube.describeCubes(this.getCorners());
    // console.debug('edges');
    // cube.describeCubes(this.getEdges());
    // console.debug('centers');
    // cube.describeCubes(this.getCenters());
  },
  describeCubes: function (cubes) {
    $.each(cubes, function (i, cube) {
      console.log('\n' + (i + 1) + ' --------------\n' + cube);
    });
  },
  findInView: function (cube, face) {
    var viewCube;
    $('td', '#cube').not('.hidden').each(function (index, td) {
      td = $(td);
      if (td.data('cube') === cube && td.data('face') === face) {
        viewCube = td;
      }
    });
    return viewCube;
  },
  /**
  * @param {Object}
  */
  Color: function (config) {
    this.r = config.r;
    this.g = config.g;
    this.b = config.b;
    this.name = config.name;
    this.opposite = config.opposite;
  }
};

cube.Color.prototype.toString = function () {
  return this.name;
};
cube.Pos.prototype.toString = function () {
  var xyz = [this.x, this.y, this.z];
  return '(' + xyz.join(', ') + ')';
};
cube.Cube.prototype.setColor = function (color, face) {
  var me = this;
  this.faces[face] = color;
  cube.paint(cube.findInView(this, face), color);
};
cube.Cube.prototype.getFaceByColor = function (color) {
  var i,
    colorName;
  if (color instanceof cube.Color) {
    colorName = color.name;
  } else {
    colorName = color;
  }

  for (i in this.faces) {
    if (this.faces.hasOwnProperty(i)) {
      if (this.faces[i] && this.faces[i].name === colorName) {
        return i;
      }
    }
  }
};
cube.Cube.prototype.validateType = function (type) {
  return type === cube.CENTER
    || type === cube.EDGE
    || type === cube.CORNER;
};
cube.Cube.prototype.toString = function () {
  var s = 'position: ' + this.position + '\n',
    i;
  s += 'type: ' + this.type + '\n';

  for (i in this.faces) {
    if (this.faces.hasOwnProperty(i)) {
      s += i + ': ' + this.faces[i] + '\n';
    }
  }
  return s;
};
cube.Rube.prototype.build = function () {
  var x, y, z,
    cubes = [],
    position;
  for (x = 1; x <= 3; x++) {
    for (y = 1; y <= 3; y++) {
      for (z = 1; z <= 3; z++) {
        if (!(x === 2 && y === 2 && z === 2)) {
          position = new cube.Pos(x, y, z);
          cubes.push(new cube.Cube(getType(position), position));
        }
      }
    }
  }
  this.cubes = cubes;
  function getType(p) {
    var type;
    if (isCorner(p)) {
      type = cube.CORNER;
    } else if (isCenter(p)) {
      type = cube.CENTER;
    } else {
      type = cube.EDGE;
    }
    return type;
  }
  function isCenter(p) {
    var middleAxis1,
      i;
    for (i in p) {
      if (p.hasOwnProperty(i)) {
        if (p[i] === 2) {
          if (!middleAxis1) {
            middleAxis1 = i;
          } else {
            return true;
          }
        }
      }
    }
    return false;
  }
  function isCorner(p) {
    return p.x !== 2 && p.y !== 2 && p.z !== 2;
  }
};
cube.Rube.prototype.getCubesOfType = function (type) {
  var cubes = [];
  $.each(this.cubes, function (index, c) {
    if (c.type === type) {
      cubes.push(c);
    }
  });
  return cubes;
};
cube.Rube.prototype.getCorners = function () {
  return this.getCubesOfType(cube.CORNER);
};
cube.Rube.prototype.getEdges = function () {
  return this.getCubesOfType(cube.EDGE);
};
cube.Rube.prototype.getCenters = function () {
  return this.getCubesOfType(cube.CENTER);
};
cube.Rube.prototype.getCube = function (position) {
  var cube;
  $.each(this.cubes, function (i, c) {
    if (c.position.x === position.x
        && c.position.y === position.y
        && c.position.z === position.z) {
      cube = c;
      return false;
    }
  });
  return cube;
};
cube.Rube.prototype.getCubeByColor = function ()
$(function () {
  cube.init();
});