/*
      ooo
      ooo
      ooo
yyygggwwwbbb 
yyygggwwwbbb
yyygggwwwbbb
      rrr
      rrr
      rrr
*/

cube.Rube = function () {
  this.build();
  // console.debug('corners');
  // cube.describeCubes(this.getCorners());
  // console.debug('edges');
  // cube.describeCubes(this.getEdges());
  // console.debug('centers');
  // cube.describeCubes(this.getCenters());
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
/**
* @param {String} type
* @return {Cube[]}
*/
cube.Rube.prototype.getCubesOfType = function (type) {
  var cubes = [];
  if (!type) {
    cubes = this.cubes;
  } else {
    $.each(this.cubes, function (index, c) {
      if (c.type === type) {
        cubes.push(c);
      }
    });
  }
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
// Finish painting cubes based on what's already painted.
cube.Rube.prototype.completeColors = function () {
  var cubes = [];
  // paint any center cubes
  cubes = this.getCubesOfType(cube.CENTER);
};
/**
* @param {String} cubeType
* @param {Color} color1
* @param {Color} [color2]
* @param {Color} [color3]
* @return {Cube[]}
*/
cube.Rube.prototype.getCubesByColor = function (cubeType, color1, color2, color3) {
  var cubes = this.getCubesOfType(cubeType),
    cubesWithColors = [],
    matchesAll = false,
    i,
    j;

  for (i = 0; i < cubes.length; i++) {
    matchesAll = false;
    for (j = 1; j < arguments.length; j++) {
      if (arguments[j]) {
        matchesAll = cubes[i].getFaceByColor(arguments[j]);
        if (!matchesAll) {
          break;
        }
      }
    }
    if (matchesAll) {
      cubesWithColors.push(cubes[i]);
    }
  }

  return cubesWithColors;
};
// described clockwise
cube.Rube.prototype.CORNERS = [
  ['white', 'blue', 'red'],
  ['white', 'orange', 'blue'],
  ['white', 'green', 'orange'],
  ['white', 'red', 'green'],
  ['yellow', 'orange', 'green'],
  ['yellow', 'blue', 'orange'],
  ['yellow', 'red', 'blue'],
  ['yellow', 'green', 'red']
];

/**
* Check to see if this corner would be valid if we added
* this missing color.
*/
cube.Rube.prototype.isValidCorner = function (cube, color) {
  var colors = cube.getClockwiseColors(),
    isValid = false;

  $.each(colors, function (i, clr) {
    clr = clr || color;
    colors[i] = clr.name;
  });
  console.log('Here is the proposed corner', colors);
  // Is this a valid corner color sequence?
  while (colors[0] !== 'white' && colors[0] !== 'yellow') {
    colors.unshift(colors.pop());
  }

  $.each(this.CORNERS, function (i, corners) {
    if (corners[0] === colors[0] && corners[1] === colors[1] && corners[2] === colors[2]) {
      isValid = true;
      return false;
    }
  });

  return isValid;
};