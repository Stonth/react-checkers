import BoardState from '../model/board-state';
import Piece from '../model/piece';
import Action from '../model/action';

self.addEventListener("message", function (event) {
    const boardState = new BoardState(event.data.boardState.board, event.data.boardState.turn);

    this.postMessage(minimax(boardState, 5));
});

function heuristic(boardState) {
    let x = 0;
    for (let i = 0; i < boardState.board.pieces.length; i++) {
        const piece = boardState.board.pieces[i];
        if (piece) {
            switch (piece) {
                case Piece.TYPE.RED:
                    x += 1;
                break;
                case Piece.TYPE.RED_KING:
                    x += 2;
                break;
                case Piece.TYPE.BLACK:
                    x -= 1;
                break;
                case Piece.TYPE.BLACK_KING:
                    x -= 2;
                break;
                default:
            }
        }
    }
    return x;
}

function minimax(boardState, depth) {
    let children = boardState.getActions(boardState.turn);
    let bestAction = null;
    // TODO: Shuffle children
    if (boardState.board.turn == BoardState.TURN.Red) {
        let value = -Infinity;
        for (const child of children) {
            const childValue = minimaxHelper(boardState.nextState(child), 0, depth, -Infinity, Infinity);
            if (childValue > value || bestAction === null) {
                value = childValue;
                bestAction = child;
            }
        }
    } else {
        let value = Infinity;
        for (const child of children) {
            const action = new Action(child);
            const childValue = minimaxHelper(boardState.nextState(child), 0, depth, -Infinity, Infinity);
            if (childValue < value || bestAction === null) {
                value = childValue;
                bestAction = child;
            }
        }
    }

    return bestAction;
}

function minimaxHelper(boardState, depth, maxDepth, a, b) {
    if (depth == maxDepth || boardState.getWinner() !== null) {
        return heuristic(boardState);
    }
    let children = boardState.getActions(boardState.turn);
    // TODO: Shuffle children

    let value;
    if (boardState.board.turn == BoardState.TURN.Red) {
        value = -Infinity;
        for (const child of children) {
            const childBoard = boardState.nextState(child);
            const nextLevel = minimaxHelper(childBoard, depth + 1, maxDepth, a, b);
            if (value < nextLevel) {
                value = nextLevel;
            }
            if (a < value) {
                a = value;
            }
            if (a >= b) {
                break;
            }
        }
    } else {
        value = Infinity;
        for (const child of children) {
            const childBoard = boardState.nextState(child);
            const nextLevel = minimaxHelper(childBoard, depth + 1, maxDepth, a, b);
            if (value < nextLevel) {
                value = nextLevel;
            }
            if (b > value) {
                a = value;
            }
            if (a >= b) {
                break;
            }
        }
    }
    return value;
}