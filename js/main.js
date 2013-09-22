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
  GREEN: { r: 0, g: 255, b: 0 },
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

  },
  cube: undefined,
  buildRubiksCubeView: function () {
    var me = this,
      table = $('<table/>'),
      tr,
      td,
      rows = 9,
      cols = 12,
      xMin = 3,
      xMax = 5,
      yMin = 6,
      yMax = 8,
      i,
      j;

      for (i = 0; i < rows; i++) {
        tr = $('<tr/>');
        for (j = 0; j < cols; j++) {
          td = $('<td/>');
          if ((i >= xMin && i <= xMax) || (j >= yMin && j <= yMax)) {
            td.addClass('unpainted');
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
    $(td).removeClass('unpainted');
    this.paint(td, $('#palette').data('color')); 
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
  },
  Rube: function () {
    this.build();
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
  this.color = color;
};
cube.Cube.prototype.validateType = function (type) {
  return type === cube.CENTER 
    || type === cube.EDGE
    || type === cube.CORNER;
};
cube.Cube.prototype.toString = function () {
  var s = 'position: ' + this.position + '\n';
  s += 'type: ' + this.type + '\n';
  s += 'color: ' + this.color;
  return s;
};
cube.Rube.prototype.build = function () {
  var x, y, z,
    cubes = [],
    position;

  for (x = 1; x <= 3; x++) {
    for (y = 1; y <= 3; y++) {
      for (z = 1; z <= 3; z++) {
        position = new cube.Pos(x, y, z);
        cubes.push(new cube.Cube(this.getType(position), position))
      }
    }
  }

  this.cubes = cubes;
};
cube.Rube.prototype.getType = function (p) {
  if (isCorner()) {
    return cube.CORNER;
  } else if (isCenter()) {
    return cube.CENTER;
  } else {
    return cube.EDGE;
  }

  function isCenter () {
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

  function isCorner () {
    return p.x !== 2 && p.y !== 2 && p.z !== 2;
  }
};
cube.Rube.prototype.getCorners = function () {
  var corners = [];
  $.each(this.cubes, function (index, c) {
    if (c.type === cube.CORNER) {
      corners.push(c);
    }
  });
  return corners;
};

$(function () {
  cube.init();
});