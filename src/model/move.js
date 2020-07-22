/*
    A movement of a piece from one space to another.
*/
const Move = function (to, from) {
    // The destination of the move.
    this.to = to;

    // The source of the move.
    this.from = from;
};

Move.prototype.same = function (other) {
    return other.to.x === this.to.x &&
        other.from.x === this.from.x &&
        other.to.y === this.to.y &&
        other.from.y === this.from.y;
};

export default Move;