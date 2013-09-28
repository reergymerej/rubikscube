cube.Cube = function (type, position) {
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
  this.allFacesPainted = false;
  this.paintedFacesCount = 0;

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
};
cube.Cube.prototype.setColor = function (color, face) {
  var me = this;

  this.faces[face] = color;
  me.paintedFacesCount = 0;
  cube.forObj(this.faces, function (face, color) {
    if (color) {
      me.paintedFacesCount++;
    }
  });

  if (this.type === cube.EDGE) {
    this.allFacesPainted = me.paintedFacesCount === 2;
  } else if (this.type === cube.CORNER) {
    this.allFacesPainted = me.paintedFacesCount === 3;
  } else {
    this.allFacesPainted = me.paintedFacesCount === 1;
  }

  cube.paint(cube.findInView(this, face), color);
};
/**
* @return {Color[]}
*/
cube.Cube.prototype.getColors = function () {
  var colors = [];
  cube.forObj(this.faces, function (face, color) {
    if (color) {
      colors.push(color);
    }
  });
  return colors;
};
/**
* @param {Color} color
* @return {String[]}
*/
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

/**
* For corners, return the colors in a clockwise order.
* @return {Colors[]}
*/
cube.Cube.prototype.getClockwiseColors = function () {
  var colors = [undefined, undefined, undefined],
    south = ['front', 'east', 'back', 'west'],
    north = ['front', 'west', 'back', 'east'],
    pole = this.position.y === 1 ? south : north;

  if (this.type !== cube.CORNER) {
    return;
  }
  // What faces does this cube have?
  cube.forObj(this.faces, function (face, color) {
    colors[pole.indexOf(face) + 1] = color;
  });
  return colors;
};