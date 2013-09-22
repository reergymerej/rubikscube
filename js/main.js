var cube = {
  init: function () {
    this.createPalette();
    this.buildRubiksCube();
    this.buildRubiksCubeView();
  },
  RED: { r: 255, g: 0, b: 0 },
  ORANGE: { r: 255, g: 125, b: 0 },
  WHITE: { r: 255, g: 255, b: 255 },
  YELLOW: { r: 255, g: 235, b: 0 },
  BLUE: { r: 0, g: 0, b: 255 },
  GREEN: { r: 68, g: 165, b: 0 },
  CENTER: 'center',
  EDGE: 'edge',
  CORNER: 'corner',
  createPalette: function () {
    var me = this,
      palette = [this.RED, this.WHITE, this.BLUE, this.ORANGE, this.YELLOW, this.GREEN],
      table = $('<table/>'),
      row = $('<tr/>'),
      cell;
    $.each(palette, function (i, color) {
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
      i,
      j,
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

    for (i = 0; i < map.y.length; i++) {
      tr = $('<tr/>');
      for (j = 0; j < map.x.length; j++) {
        td = $('<td/>');
        if ((i >= xMin && i <= xMax) || (j >= yMin && j <= yMax)) {
          td.addClass('unpainted');
          position = new me.Pos(map.x[j], map.y[i], getZ(j, i));
          td.html(position.toString());
          td.data('position', position);
          cube = me.rube.getCube(position);
          // bind this square to the actual cube
          td.data('cube', cube);
          cube.bindView(td);
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
    $(td)
      .removeClass('unpainted')
      .data('cube')
      .setColor($('#palette').data('color'));
  },
  Pos: function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  },
  Cube: function (type, position) {
    if (!this.validateType(type)) {
      console.error('invalid type', type);
    }
    this.type = type;
    this.position = position;
    this.views = [];
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
  }
};
cube.Pos.prototype.toString = function () {
  var xyz = [this.x, this.y, this.z];
  return '(' + xyz.join(', ') + ')';
};
cube.Cube.prototype.setColor = function (color) {
  var me = this;
  this.color = color;
  $.each(this.views, function (i, view) {
    cube.paint(view, me.color);
  });
};
cube.Cube.prototype.validateType = function (type) {
  return type === cube.CENTER
    || type === cube.EDGE
    || type === cube.CORNER;
};
cube.Cube.prototype.toString = function () {
  var s = 'position: ' + this.position + '\n';
  s += 'type: ' + this.type + '\n';
  s += 'color: ' + this.color + '\n';
  s += 'has view: ' + (this.view !== undefined);
  return s;
};
cube.Cube.prototype.bindView = function (jQ) {
  this.views.push(jQ);
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
$(function () {
  cube.init();
});