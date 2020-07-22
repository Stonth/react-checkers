const Piece = function (type, id, position) {
    // The type of the piece.
    this.type = type;

    // The id of the piece.
    this.id = id;

    // The position in the grid.
    this.position = position;
};

Piece.prototype.clone = function () {
    return new Piece(this.type, this.id, {x: this.position.x, y: this.position.y});
};

/*
    toString override.
*/
Piece.prototype.toString = function () {
    switch (this.type) {
        case Piece.TYPE.RED:
            return 'r';
        case Piece.TYPE.RED_KING:
            return 'R';
        case Piece.TYPE.BLACK:
            return 'b';
        case Piece.TYPE.BLACK_KING:
            return 'B';
        default:
            return '?';
    }
};

Piece.prototype.isRed = function () {
    return this.type === Piece.TYPE.RED || this.type === Piece.TYPE.RED_KING;
};

Piece.prototype.isKing = function () {
    return this.type === Piece.TYPE.RED_KING || this.type === Piece.TYPE.BLACK_KING;
};

Piece.TYPE = {
    RED: 1,
    RED_KING: 2,
    BLACK: 3,
    BLACK_KING: 4
};

export default Piece;