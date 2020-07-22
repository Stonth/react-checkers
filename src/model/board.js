import Piece from './piece'

/*
    An object representing a board.
*/
const Board = function (board) {
    
    // A 2D array of pieces.
    this.grid = null;

    // List of pieces.
    this.pieces = null;

    // The piece counter. Used to assign unique ids.
    this.pieceCounter = 0;

    if (board) {
        this.setFrom(board);
    } else {
        this.setGridDefault();
    }
};

/*
    Clones the grid and pieces of another board.
*/
Board.prototype.setFrom = function (board) {
    this.grid = [];
    for (let i = 0; i < Board.DIM; i++) {
        this.grid[i] = [...board.grid[i]];
    }
    this.pieces = board.pieces.map((piece) => {
        if (!piece) {
            return null;
        }
        return piece.clone();
    });
    this.pieceCounter = board.pieceCounter;
};

/*
    Create a default grid.
*/
Board.prototype.setGridDefault = function (board) {
    this.grid = [];
    for (let y = 0; y < Board.DIM; y++) {
        this.grid[y] = [];
        for (let x = 0; x < Board.DIM; x++) {
            this.grid[y][x] = null;
        }
    }

    this.pieces = [];

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < Board.DIM; x++) {
            if ((x + y) % 2 === 0) {
                this.addPiece(Piece.TYPE.BLACK, x, y);
            }
        }
    }
    for (let y = 5; y < 8; y++) {
        for (let x = 0; x < Board.DIM; x++) {
            if ((x + y) % 2 === 0) {
                this.addPiece(Piece.TYPE.RED, x, y);
            }
        }
    }
};

Board.prototype.addPiece = function (type, x, y) {
    if (this.pieceCounter > this.pieces.length) {
        throw Error('Cannot add pieces after a piece has been removed.');
    }

    const id = this.pieceCounter++;
    this.pieces[id] = new Piece(type, id, {x, y});
    this.grid[y][x] = id;
};

Board.prototype.removePiece = function (x, y) {
    const id = this.grid[y][x];
    this.grid[y][x] = null;
    this.pieces[id] = null;
};

Board.prototype.spaceContainsRed = function(x, y) {
    if (!this.spaceContainsPiece(x, y)) {
        return false;
    }

    return this.getPieceFromPosition(x, y).isRed();
};

Board.prototype.spaceContainsBlack = function(x, y) {
    if (!this.spaceContainsPiece(x, y)) {
        return false;
    }

    return !this.getPieceFromPosition(x, y).isRed();
};

Board.prototype.spaceContainsPiece = function (x, y) {
    return this.grid[y][x] !== null;
};

Board.prototype.applyMove = function (move) {
    const id = this.grid[move.from.y][move.from.x];
    this.grid[move.from.y][move.from.x] = null;
    this.grid[move.to.y][move.to.x] = id;
    this.getPieceFromID(id).position = {x: move.to.x, y: move.to.y};
    
    if (Math.abs(move.to.x - move.from.x) >= 2) {
        this.removePiece(move.from.x + Math.sign(move.to.x - move.from.x), move.from.y + Math.sign(move.to.y - move.from.y));
    }
};

Board.prototype.getPieceFromPosition = function (x, y) {
    if (!this.spaceContainsPiece(x, y)) {
        return null;
    }

    return this.pieces[this.grid[y][x]];
};

Board.prototype.getPieceFromID = function (id) {
    return this.pieces[id] || null;
};

/*
    Print the board.
*/
Board.prototype.printBoard = function () {
    let str = ' ';
    for (let x = 0; x < Board.DIM; x++) {
        str += ' ' + x;
    }
    for (let y = 0; y < Board.DIM; y++) {
        str += '\n' + y;
        for (let x = 0; x < Board.DIM; x++) {
            if (this.grid[y][x] != null) {
                str += ' ' + this.grid[y][x].toString();
            } else {
                str += '  '
            }
        }
    }

    return str;
};

Board.DIM = 8;

export default Board;