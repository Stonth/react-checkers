/*
  TODO:
    Refactor possible move code, board generation, and style code to support board of any size.
*/

import React, { Component } from 'react';
import styles from './App.module.css';
import Board from './Board/Board';
import Move from '../../model/move';
import Editor from './Editor/Editor';
import ModelBoard from '../../model/board';
import ModelBoardState from '../../model/board-state';
import ModelAction from '../../model/action';
import MinimaxWorker from '../../workers/minimax.worker';

class App extends Component {

  constructor() {
    super();

    const boardSize = this.getBoardSize();
    this.state = {
      boardSize,

      boardState: new ModelBoardState(),

      highlightedSpace: null,

      editorOpen: false,
      editorCurrentPiece: null,
      editorPossibleActions: null,
      editorCurrentAction: null,
      editorBoards: null,

      cursor: 'unset'
    };
  }

  componentDidMount() {
    // Resize listener.
    let resizeTimeout;
    window.addEventListener('resize', () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        this.setState({
          boardSize: this.getBoardSize()
        });
        resizeTimeout = null;
      }, 100);
    });

    // Add a mouse move listener.
    window.addEventListener('mousemove', event => {
      if (this.state.editorOpen && this.state.editorCurrentPiece) {
        this.setState({
          editorCurrentPiece: {
            ...this.state.editorCurrentPiece,
            mouseX: event.clientX,
            mouseY: event.clientY
          }
        });
      }
    });

    // Open the editor.
    this.openEditor();
  }

  openEditor() {
    this.setState({
      editorOpen: true,
      editorCurrentPiece: null,
      editorPossibleActions: this.state.boardState.getActions(this.state.boardState.turn),
      editorCurrentAction: [],
      editorBoards: [this.state.boardState.board]
    });
  }

  closeEditor() {
    this.setState({
      editorOpen: false
    });
  }

  getBoardSize() {
    let size = Math.floor(Math.min(window.innerWidth, window.innerHeight) / ModelBoard.DIM) * ModelBoard.DIM;
    return size;
  }

  getRenderedBoard() {
    if (this.state.editorOpen) {
      return this.state.editorBoards[this.state.editorBoards.length - 1];
    }
    return this.state.boardState.board;
  }

  getRenderedPieces() {
    let pieces;
    if (this.state.editorOpen) {
      pieces = this.state.editorBoards[this.state.editorBoards.length - 1].pieces;
    } else {
      pieces = this.state.boardState.board.pieces;
    }

    const result = [];
    const unit = this.state.boardSize / ModelBoard.DIM;
    for (const piece of pieces) {
      if (piece) {
        if (this.state.editorCurrentPiece && piece.position.x === this.state.editorCurrentPiece.x && piece.position.y === this.state.editorCurrentPiece.y) {
          result.push({
            type: piece.type,
            x: this.state.editorCurrentPiece.mouseX - this.state.editorCurrentPiece.xOffset,
            y: this.state.editorCurrentPiece.mouseY - this.state.editorCurrentPiece.yOffset,
            id: piece.id,
            onTop: true
          });
        } else {
          result.push({
            type: piece.type,
            x: piece.position.x * unit,
            y: piece.position.y * unit,
            id: piece.id
          });
        }
      }
    }

    return result;
  }

  positionInSpace(xPos, yPos, x, y) {
    const spaceSize = this.state.boardSize / 8
    if (xPos < x * spaceSize) {
      return false;
    }
    if (xPos > (x + 1) * spaceSize) {
      return false;
    }
    if (yPos < y * spaceSize) {
      return false;
    }
    if (yPos > (y + 1) * spaceSize) {
      return false;
    }
    const r = spaceSize / 2;
    const xOffset = xPos - x * spaceSize;
    const yOffset = yPos - y * spaceSize;
    if ((xOffset - r) ** 2 + (yOffset - r) ** 2 > r ** 2) {
      return false;
    }

    return {x: xOffset, y: yOffset};
  }

  handleSpaceMouseDown(x, y, event) {
    if (this.state.editorOpen && this.getRenderedBoard().spaceContainsRed(x, y)) {
      const offset = this.positionInSpace(event.clientX, event.clientY, x, y);
      if (offset) {
        // Make sure the mouse was down inside of the checker.
        this.setState({
          cursor: 'grabbing',
          editorCurrentPiece: {
            x, y, xOffset: offset.x, yOffset: offset.y, mouseX: event.clientX, mouseY: event.clientY
          }
        });
      }
    }
  }

  isMoveValid(to, from) {
    for (const action of this.state.editorPossibleActions) {
      if (action.moves.length === this.state.editorCurrentAction.length + 1) {
        let match = true;
        let ind;
        for (ind = 0; ind < this.state.editorCurrentAction.length && match; ind++) {
          if (!action.moves[ind].same(this.state.editorCurrentAction[ind])) {
            match = false;
          }
        }

        if (match) {
          if (action.moves[ind].same(new Move(to, from))) {
            return true;
          }
        }

      }
    }

    return false;
  }

  handleSpaceMouseMove(x, y, event) {
    if (this.state.editorOpen) {
      if (!this.state.editorCurrentPiece) {
        if (this.getRenderedBoard().spaceContainsRed(x, y)) {
          let cursor = this.state.cursor;

          if (this.positionInSpace(event.clientX, event.clientY, x, y)) {
            cursor = 'grab';
          } else {
            cursor = 'unset';
          }

          if (cursor !== this.state.cursor) {
            this.setState({ cursor });
          }
        }
      }
    }
  }

  handleSpaceMouseEnter(x, y, event) {
    if (this.state.editorOpen && this.state.editorCurrentPiece) {
      if (this.isMoveValid({ x, y }, { x: this.state.editorCurrentPiece.x, y: this.state.editorCurrentPiece.y })) {
        this.setState({
          highlightedSpace: {x, y}
        });
      }
    }
  }

  handleSpaceMouseLeave(x, y, event) {
    if (this.state.editorOpen) {
      if (this.state.editorCurrentPiece) {
        this.setState({
          highlightedSpace: null
        });
      } else if (this.getRenderedBoard().spaceContainsRed(x, y)) {
        this.setState({
          cursor: 'unset'
        })
      }
    }
  }

  handleSpaceMouseUp(x, y, event) {
    if (this.state.editorOpen && this.state.editorCurrentPiece) {
      const from = { x: this.state.editorCurrentPiece.x, y: this.state.editorCurrentPiece.y };
      if (this.isMoveValid({ x, y }, from)) {
        
        const move = new Move({ x, y }, from);
        const copy = new ModelBoard(this.getRenderedBoard());
        copy.applyMove(move);
        this.setState({
          editorCurrentPiece: null,
          editorCurrentAction: [...this.state.editorCurrentAction, move],
          editorBoards: [...this.state.editorBoards, copy],

          highlightedSpace: null,

          cursor: 'grab'
        });
      } else {
        this.setState({
          editorCurrentPiece: null
        });
      }
    }
  }

  handleEditorCheckClick() {
    const boardState = this.state.boardState.nextState(new ModelAction(this.state.editorCurrentAction));

    this.setState({
      boardState
    });
    this.closeEditor();

    const worker = new MinimaxWorker();
    worker.postMessage({
      boardState: boardState
    });
    worker.addEventListener('message', (event) => {
      this.setState({
        boardState: this.state.boardState.nextState(new ModelAction(event.data.moves))
      });
      this.openEditor();
      worker.terminate();
    });
  }

  handleEditorBackClick() {
    this.setState({
      editorCurrentAction: this.state.editorCurrentAction.slice(0, -1),
      editorBoards: this.state.editorBoards.slice(0, -1)
    });
  }

  render() {
    // console.log(this.state);

    return (
      <div className={styles.App}>
        <Board
          board={this.getRenderedBoard()}
          pieces={this.getRenderedPieces()}
          boardSize={this.state.boardSize}
          highlightedSpace={this.state.highlightedSpace}
          mouseDownSpace={(x, y, e) => this.handleSpaceMouseDown(x, y, e)}
          mouseMoveSpace={(x, y, e) => this.handleSpaceMouseMove(x, y, e)}
          mouseEnterSpace={(x, y, e) => this.handleSpaceMouseEnter(x, y, e)}
          mouseLeaveSpace={(x, y, e) => this.handleSpaceMouseLeave(x, y, e)}
          mouseUpSpace={(x, y, e) => this.handleSpaceMouseUp(x, y, e)}
          cursor={this.state.cursor}
        />
        <Editor
          showCheck={this.state.editorOpen && this.state.editorCurrentAction.length > 0}
          showBack={this.state.editorOpen && this.state.editorCurrentAction.length > 0}

          clickCheck={() => this.handleEditorCheckClick()}
          clickBack={() => this.handleEditorBackClick()}
        />
      </div>
    );
  }
}

export default App;
