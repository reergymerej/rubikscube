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
    var me = this,
      color = $('#palette').data('color'),
      cube,
      face;

    td = $(td);
    cube = td.data('cube');
    face = td.data('face');

    // Is this a valid color for this cube?
    if (isValid()) {
      td.removeClass('unpainted');
      cube.setColor(color, face);
      this.paint(td, color);

      // Can we figure out any other cubes to paint?
      this.rube.completeColors();
    }

    function isValid() {
      var valid = true,
        matchedCubes,
        i,
        cubeColors = [];

      // Does this cube have another face with
      // the same color or opposite?
      matchedCubes = cube.getFaceByColor(color) || cube.getFaceByColor(color.opposite);
      if (matchedCubes && matchedCubes !== face) {
        valid = false;
      }

      // Does this cube (as to be painted) already exist?
      if (valid) {
        cubeColors = cube.getColors();
        cubeColors.push(color);
        cubeColors.sort();

        // Get all cubes that match the current colors (including proposed).
        matchedCubes = me.rube.getCubesByColor.apply(me.rube, [cube.type].concat(cubeColors));

        // center
        if (cube.type === me.CENTER) {
          valid = matchedCubes.length === 0;

        // edges
        } else if (cube.type === me.EDGE) {
          if (cube.paintedFacesCount === 0) {
            valid = matchedCubes.length < 4;
          } else {
            valid = matchedCubes.length === 0;
          }

        // corners
        } else {
          if (cube.paintedFacesCount === 0) {
            valid = matchedCubes.length < 4;
          } else if (cube.paintedFacesCount === 1) {
            valid = matchedCubes.length < 2;
          } else {
            valid = matchedCubes.length === 0;
          }
        }
      }

      // Make sure this is a valid corner orientation.
      if (valid && cube.type === me.CORNER && cube.paintedFacesCount === 2) {
        valid = me.rube.isValidCorner(cube, color);
      }

      return valid;
    }
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
  },
  Pos: function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  },
  /**
  * Iterate over own properties in an object.
  * @param {Object} obj
  * @param {Function} fn - passed key and value
  */
  forObj: function (obj, fn) {
    var i;
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (fn(i, obj[i]) === false) {
          break;
        }
      }
    }
  },
  /**
  * pop and unshift an array until
  * two elements are found in order
  */
  scrollArrayTo: function (arr, el1, el2) {
    var count = 0,
      index1 = arr.indexOf(el1),
      index2 = arr.indexOf(el2);

    if (index1 !== -1 && index2 !== -1) {
      do {
        count++;
        arr.unshift(a.pop());
        index1 = arr.indexOf(el1);
        index2 = arr.indexOf(el2);
      } while (count < arr.length);
    }
    return arr;
  },

  /**
  * Does an array have these two elements in order, adjacent
  * to each other?
  * This loops around the array so el1 at the end and
  * el2 at the beginning returns true.
  * @param {Array} arr
  * @param el1
  * @param el2
  * @return {Boolean}
  */
  arrayHasPair: function (arr, el1, el2) {
    var hasPair = false,
      index1 = arr.indexOf(el1),
      index2 = arr.indexOf(el2);

    if (index1 !== -1 && index2 !== -1) {
      hasPair = (index2 === index1 + 1
        || (index1 === arr.length - 1 && index2 === 0));
    }

    return hasPair;
  }
};

cube.Color.prototype.toString = function () {
  return this.name;
};
cube.Pos.prototype.toString = function () {
  var xyz = [this.x, this.y, this.z];
  return '(' + xyz.join(', ') + ')';
};

$(function () {
  cube.init();
});