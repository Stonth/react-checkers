import BoardState from '../model/board-state';
import Piece from '../model/piece';
import Action from '../model/action';

self.addEventListener("message", function (event) {
    const boardState = new BoardState(event.data.boardState.board, event.data.boardState.turn);

    this.postMessage(minimax(boardState, 5, event.data.difficulty));
});

function heuristic(boardState) {
    let x = 0;
    for (let i = 0; i < boardState.board.pieces.length; i++) {
        const piece = boardState.board.pieces[i];
        if (piece) {
            switch (piece.type) {
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

function shuffle(array) {
    const temp = [];
    while (array.length > 0) {
        temp.push(array.splice(Math.floor(Math.random() * array.length), 1)[0]);
    }
    array.push(...temp);
}

function minimax(boardState, depth, difficulty) {
    const children = boardState.getActions(boardState.turn);
    let actions = [];
    shuffle(children);
    if (boardState.turn == BoardState.TURN.Red) {
        let value = -Infinity;
        for (const child of children) {
            const childValue = minimaxHelper(boardState.nextState(child), 0, depth, -Infinity, Infinity);
            let ind = 0;
            while (ind < actions.length && childValue > actions[ind].value) {
                ind++;
            }
            actions.splice(ind, 0, {
                value: childValue,
                action: child
            });
        }
    } else {
        let value = Infinity;
        for (const child of children) {
            const childValue = minimaxHelper(boardState.nextState(child), 0, depth, -Infinity, Infinity);
            let ind = 0;
            while (ind < actions.length && childValue < actions[ind].value) {
                ind++;
            }
            actions.splice(ind, 0, {
                value: childValue,
                action: child
            });
        }
    }

    const index = Math.min(Math.floor(actions.length * (1 - (Math.random() * (1 - difficulty)))), actions.length - 1);
    return actions[index].action;
}

function minimaxHelper(boardState, depth, maxDepth, a, b) {
    if (depth == maxDepth || boardState.getWinner() !== null) {
        return heuristic(boardState);
    }
    const children = boardState.getActions(boardState.turn);
    shuffle(children);

    let value;
    if (boardState.board.turn == BoardState.TURN.Red) {
        value = -Infinity;
        for (const child of children) {
            const childBoard = boardState.nextState(child);
            const nextLevel = minimaxHelper(childBoard, depth + 1, maxDepth, a, b);
            if (nextLevel > value) {
                value = nextLevel;
            }
            if (value > a) {
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
            if (nextLevel < value) {
                value = nextLevel;
            }
            if (value < beta) {
                b = value;
            }
            if (a >= b) {
                break;
            }
        }
    }
    return value;
}