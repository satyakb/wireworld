var grid = [];
var isPaused = true;
var colorMap = ['black', 'blue', 'red', 'yellow'];

const EMPTY = 0;
const HEAD = 1;
const TAIL = 2;
const CONDUCTOR = 3;

/********************* Default Evaluation Functions **************************/
function empty($tile, numNeighbors) {
  if ($tile.data('color') === EMPTY) return EMPTY;
}

function head($tile, numNeighbors) {
  if ($tile.data('color') === HEAD) return TAIL;
}

function tail($tile, numNeighbors) {
  if ($tile.data('color') === TAIL) return CONDUCTOR;
}

function conductor($tile, numNeighbors) {
  if ($tile.data('color') === CONDUCTOR) {
    if (numNeighbors === 1 || numNeighbors === 2) return HEAD;
  }
}

var fns = [
  empty,
  head,
  tail,
  conductor,
];
/*****************************************************************************/


$(function() {
  var X = 5;
  var Y = 10;

  var $app = $('#app');
  $app.append(createGrid(X, Y))

  $play = $("<button>", {text: 'Play'});
  $pause = $("<button>", {text: 'Pause'});
  $tick = $("<button>", {text: 'Tick'});

  $play.click(function() {
    isPaused = false;
  });
  $pause.click(function() {
    isPaused = true;
  });
  $tick.click(function() {
    loop();
  });

  $app.append($play);
  $app.append($pause);
  $app.append($tick);

  setInterval(function() {
    if (isPaused) return;
    loop();
  }, 500);

});

function loop() {
  // Capture new state of grid
  var tmpGrid = [];

  // Calculate new state
  for (var i = 0; i < grid.length; i++) {
    var row = [];

    for (var j = 0; j < grid[0].length; j++) {
      var $tile = grid[i][j];
      var numNeighbors = checkNeighbors(i, j);
      var changed = false;

      for (var k = 0; k < fns.length; k++) {
        var newColor = fns[k]($tile, numNeighbors);
        if (newColor) {
          row.push(newColor);
          changed = true;
          break;
        }
      }

      if (!changed) row.push($tile.data('color'));
    }

    tmpGrid.push(row);
  }

  // Update grid state
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[0].length; j++) {
      updateTile(grid[i][j], tmpGrid[i][j]);
    }
  }
}

function updateTile($tile, color) {
  $tile.data('color', color);
  $tile.css('background-color', colorMap[color]);
}

function createGrid(x, y) {
  var count = 0;
  var $grid = $("<div>", {class: 'grid'});
  for (var i = 0; i < x; i++) {
    var row = [];
    var $row = $("<div>", {class: 'tile-row', id: 'row-' + i});
    for (var j = 0; j < y; j++) {
      $tile = createTileWithId(count++);
      $row.append($tile);
      row.push($tile);
    }
    grid.push(row);
    $grid.append($row);
  }
  return $grid;
}

function createTileWithId(id) {
  var $tile = $("<div>", {class: 'tile', id: 'tile-' + id});
  $tile.data('num', id);
  $tile.data('color', EMPTY);
  $tile.css('background-color', colorMap[0]);

  $tile.click(function(){
    var num = $tile.data('num');
    var color = $tile.data('color');

    var newColor = (color + 1) % colorMap.length;
    updateTile($tile, newColor);
  });

  return $tile;
}

function checkNeighbors(i, j) {
  var num = 0;

  var top = Math.max(i - 1, 0);
  var bottom = Math.min(i + 1, grid.length - 1);
  var left = Math.max(j - 1, 0);
  var right = Math.min(j + 1, grid[0].length - 1);

  if (grid[top][j].data('color') === 1) num++;
  if (grid[top][right].data('color') === 1) num++;
  if (grid[i][right].data('color') === 1) num++;
  if (grid[bottom][right].data('color') === 1) num++;
  if (grid[bottom][j].data('color') === 1) num++;
  if (grid[bottom][left].data('color') === 1) num++;
  if (grid[i][left].data('color') === 1) num++;
  if (grid[top][left].data('color') === 1) num++;

  return num;
}

