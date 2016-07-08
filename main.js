var grid = [];
var isPaused = true;

const X = 10;
const Y = 20;
const EMPTY = 0;
const HEAD = 1;
const TAIL = 2;
const CONDUCTOR = 3;
const COLOR_MAP = ['black', 'blue', 'red', 'yellow'];

/********************* Default Evaluation Functions **************************/
function empty($tile, numNeighbors) {
  if ($tile.data('state') === EMPTY) return EMPTY;
}

function head($tile, numNeighbors) {
  if ($tile.data('state') === HEAD) return TAIL;
}

function tail($tile, numNeighbors) {
  if ($tile.data('state') === TAIL) return CONDUCTOR;
}

function conductor($tile, numNeighbors) {
  if ($tile.data('state') === CONDUCTOR) {
    if (numNeighbors === 1 || numNeighbors === 2) return HEAD;
  }
}

var wireWorldFns = [
  empty,
  head,
  tail,
  conductor,
];

function underpop($tile, numNeighbors) {
  if ($tile.data('state') === HEAD && numNeighbors < 2) return EMPTY;
}

function nextgen($tile, numNeighbors) {
  if ($tile.data('state') === HEAD && (numNeighbors === 2 || numNeighbors === 3)) return HEAD;
}

function overpop($tile, numNeighbors) {
  if ($tile.data('state') === HEAD && numNeighbors > 3) {
    return EMPTY;
  }
}

function repub($tile, numNeighbors) {
  if ($tile.data('state') === EMPTY && numNeighbors === 3) return HEAD;
}

var lifeFns = [
  underpop,
  overpop,
  nextgen,
  repub,
];

var fns = wireWorldFns;
/*****************************************************************************/

// Main
$(function() {
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
  $tick.click(loop);

  $app.append($play);
  $app.append($pause);
  $app.append($tick);

  setInterval(function() {
    if (isPaused) return;
    loop();
  }, 500);

});

/**
 * Function to be called in a loop
 */
function loop() {
  // Capture new state of grid
  var tmpGrid = [];

  // Calculate new state
  for (var i = 0; i < grid.length; i++) {
    var row = [];

    for (var j = 0; j < grid[0].length; j++) {
      var $tile = grid[i][j];
      var numNeighbors = calcNumNeighbors(i, j);
      var changed = false;

      for (var k = 0; k < fns.length; k++) {
        var newColor = fns[k]($tile, numNeighbors);

        // If function has a result, use it
        if (typeof newColor !== 'undefined') {
          row.push(newColor);
          changed = true;
          break;
        }
      }

      // Use old state if none of the supplied functions have any effect
      if (!changed) row.push($tile.data('state'));
    }

    tmpGrid.push(row);
  }

  // Update grid state
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[0].length; j++) {
      updateTile(i, j, tmpGrid[i][j]);
    }
  }
}

/**
 * Creates a grid
 * @param  {int} x    x dimension of grid (number of rows)
 * @param  {int} y    y dimension of grid (number of columns)
 * @return {jQuery}   grid jquery object
 */
function createGrid(x, y) {
  var count = 0;
  var $grid = $("<div>", {class: 'grid'});
  for (var i = 0; i < x; i++) {
    var row = [];
    var $row = $("<div>", {class: 'tile-row', id: 'row-' + i});
    for (var j = 0; j < y; j++) {
      $tile = createTile(i, j, count++);
      $row.append($tile);
      row.push($tile);
    }
    grid.push(row);
    $grid.append($row);
  }
  return $grid;
}

/**
 * Creates a single tile with id
 * @param  {int} x      row index of the tile
 * @param  {int} y      column index of the tile
 * @return {jQuery}     the created tile
 */
function createTile(x, y, num) {
  var $tile = $("<div>", {class: 'tile'});
  $tile.data('num', num);
  $tile.data('state', EMPTY);
  $tile.css('background-color', COLOR_MAP[EMPTY]);

  $tile.click(function(){
    var num = $tile.data('num');
    var color = $tile.data('state');

    var newColor = (color + 1) % COLOR_MAP.length;
    updateTile(x, y, newColor);
  });

  return $tile;
}

/**
 * Changes state of single $tile to state
 * @param  {int} x          row index of the tile
 * @param  {int} y          column index of the tile
 * @param  {int} newState   new state
 */
function updateTile(x, y, newState) {
  var $tile = grid[x][y];
  $tile.data('state', newState);
  $tile.css('background-color', COLOR_MAP[newState]);
}

/**
 * Calculates the number of HEAD neighbors of a tile
 * @param  {int} x row index of the tile
 * @param  {int} y column index of the tile
 * @return {int}   number of HEAD neighbors
 */
function calcNumNeighbors(x, y) {
  var num = 0;

  var top = Math.max(x - 1, 0);
  var bottom = Math.min(x + 1, grid.length - 1);
  var left = Math.max(y - 1, 0);
  var right = Math.min(y + 1, grid[0].length - 1);

  if (grid[top][y].data('state') === HEAD) num++;
  if (grid[top][right].data('state') === HEAD) num++;
  if (grid[x][right].data('state') === HEAD) num++;
  if (grid[bottom][right].data('state') === HEAD) num++;
  if (grid[bottom][y].data('state') === HEAD) num++;
  if (grid[bottom][left].data('state') === HEAD) num++;
  if (grid[x][left].data('state') === HEAD) num++;
  if (grid[top][left].data('state') === HEAD) num++;

  return num;
}
