import Board from './board'
import Action from './action';
import Move from './move';

/*
    Represents the state of the game. Contains a board and a turn.
*/
const BoardState = function (board, turn) {

    // Whose turn it is.
    this.turn = null;

    // The current board.
    this.board = null;

    // Set the board.
    if (!board) {
        this.board = new Board();
    } else {
        this.board = board;
    }

    // Set the turn.
    if (turn === undefined) {
        this.turn = BoardState.TURN.RED;
    } else {
        this.turn = turn;
    }
};

/*
    Get all available actions for a player.
*/
BoardState.prototype.getActions = function (turn) {
    const actions = [];
    for (let y = 0; y < Board.DIM; y++) {
        for (let x = 0; x < Board.DIM; x++) {
            const p = this.board.getPieceFromPosition(x, y);
            if (p) {
                if (turn === BoardState.TURN.RED && p.isRed()) {
                    if (y > 0) {
                        if (x > 0 && !this.board.spaceContainsPiece(x - 1, y - 1)) {
                            actions.push(new Action([new Move({ x: x - 1, y: y - 1 }, { x: x, y: y })]));
                        }
                        if (x < Board.DIM - 1 && !this.board.spaceContainsPiece(x + 1, y - 1)) {
                            actions.push(new Action([new Move({ x: x + 1, y: y - 1 }, { x: x, y: y })]));
                        }
                    }
                    if (p.isKing() && y < Board.DIM - 1) {
                        if (x > 0 && !this.board.spaceContainsPiece(x - 1, y + 1)) {
                            actions.push(new Action([new Move({ x: x - 1, y: y + 1 }, { x: x, y: y })]));
                        }
                        if (x < Board.DIM - 1 && !this.board.spaceContainsPiece(x + 1, y + 1)) {
                            actions.push(new Action([new Move({ x: x + 1, y: y + 1 }, { x: x, y: y })]));
                        }
                    }

                    const moveArray = this.getCaptureActions(x, y, this.board, turn, []);
                    for (let i = 0; i < moveArray.length; i++) {
                        actions.push(new Action(moveArray[i]));
                    }
                } else if (turn === BoardState.TURN.BLACK && !p.isRed()) {
                    if (y < Board.DIM - 1) {
                        if (x > 0 && !this.board.spaceContainsPiece(x - 1, y + 1)) {
                            actions.push(new Action([new Move({ x: x - 1, y: y + 1 }, { x: x, y: y })]));
                        }
                        if (x < Board.DIM - 1 && !this.board.spaceContainsPiece(x + 1, y + 1)) {
                            actions.push(new Action([new Move({ x: x + 1, y: y + 1 }, { x: x, y: y })]));
                        }
                    }
                    if (p.isKing() && y > 0) {
                        if (x > 0 && !this.board.spaceContainsPiece(x - 1, y - 1)) {
                            actions.push(new Action([new Move({ x: x - 1, y: y - 1 }, { x: x, y: y })]));
                        }
                        if (x < Board.DIM - 1 && !this.board.spaceContainsPiece(x + 1, y - 1)) {
                            actions.push(new Action([new Move({ x: x + 1, y: y - 1 }, { x: x, y: y })]));
                        }
                    }

                    const moveArray = this.getCaptureActions(x, y, this.board, turn, []);
                    for (let i = 0; i < moveArray.length; i++) {
                        actions.push(new Action(moveArray[i]));
                    }
                }
            }
        }
    }

    return actions;
};

BoardState.prototype.getCaptureActions = function (x, y, board, turn, currentAction) {
    let actions = [];
    const p = board.getPieceFromPosition(x, y);

    if (turn === BoardState.TURN.RED) {
        if (y > 1) {
            if (x > 1 && !board.spaceContainsPiece(x - 2, y - 2) && board.spaceContainsBlack(x - 1, y - 1)) {
                const copy = new Board(board);
                const move = new Move({ x: x - 2, y: y - 2 }, { x: x, y: y });
                copy.applyMove(move);
                actions.push([...currentAction, move]);
                actions = actions.concat(this.getCaptureActions(x - 2, y - 2, copy, turn, [...currentAction, move]));
            }
            if (x < Board.DIM - 2 && !board.spaceContainsPiece(x + 2, y - 2) && board.spaceContainsBlack(x + 1, y - 1)) {
                const copy = new Board(board);
                const move = new Move({ x: x + 2, y: y - 2 }, { x: x, y: y });
                copy.applyMove(move);
                actions.push([...currentAction, move]);
                actions = actions.concat(this.getCaptureActions(x + 2, y - 2, copy, turn, [...currentAction, move]));
            }
        }
        if (p.isKing() && y < Board.DIM - 2) {
            if (x > 1 && !board.spaceContainsPiece(x - 2, y + 2) && board.spaceContainsBlack(x - 1, y + 1)) {
                const copy = new Board(board);
                const move = new Move({ x: x - 2, y: y + 2 }, { x: x, y: y });
                copy.applyMove(move);
                actions.push([...currentAction, move]);
                actions = actions.concat(this.getCaptureActions(x - 2, y + 2, copy, turn, [...currentAction, move]));
            }
            if (x < Board.DIM - 2 && !board.spaceContainsPiece(x + 2, y + 2) && board.spaceContainsBlack(x + 1, y + 1)) {
                const copy = new Board(board);
                const move = new Move({ x: x + 2, y: y + 2 }, { x: x, y: y });
                copy.applyMove(move);
                actions.push([...currentAction, move]);
                actions = actions.concat(this.getCaptureActions(x + 2, y + 2, copy, turn, [...currentAction, move]));
            }
        }
    } else {
        if (y < Board.DIM - 2) {
            if (x > 1 && !board.spaceContainsPiece(x - 2, y + 2) && board.spaceContainsBlack(x - 1, y + 1)) {
                const copy = new Board(board);
                const move = new Move({ x: x - 2, y: y + 2 }, { x: x, y: y });
                copy.applyMove(move);
                actions.push([...currentAction, move]);
                actions = actions.concat(this.getCaptureActions(x - 2, y + 2, copy, turn, [...currentAction, move]));
            }
            if (x < Board.DIM - 2 && !board.spaceContainsPiece(x + 2, y + 2) && board.spaceContainsBlack(x + 1, y + 1)) {
                const copy = new Board(board);
                const move = new Move({ x: x + 2, y: y + 2 }, { x: x, y: y });
                copy.applyMove(move);
                actions.push([...currentAction, move]);
                actions = actions.concat(this.getCaptureActions(x + 2, y + 2, copy, turn, [...currentAction, move]));
            }
        }
        if (p.isKing() && y > 1) {
            if (x > 1 && !board.spaceContainsPiece(x - 2, y - 2) && board.spaceContainsBlack(x - 1, y - 1)) {
                const copy = new Board(board);
                const move = new Move({ x: x - 2, y: y - 2 }, { x: x, y: y });
                copy.applyMove(move);
                actions.push([...currentAction, move]);
                actions = actions.concat(this.getCaptureActions(x - 2, y - 2, copy, turn, [...currentAction, move]));
            }
            if (x < Board.DIM - 2 && !board.spaceContainsPiece(x + 2, y - 2) && board.spaceContainsBlack(x + 1, y - 1)) {
                const copy = new Board(board);
                const move = new Move({ x: x + 2, y: y - 2 }, { x: x, y: y });
                copy.applyMove(move);
                actions.push([...currentAction, move]);
                actions = actions.concat(this.getCaptureActions(x + 2, y - 2, copy, turn, [...currentAction, move]));
            }
        }
    }
    return actions;
};


BoardState.TURN = {
    RED: 0,
    BLACK: 1
};

export default BoardState;