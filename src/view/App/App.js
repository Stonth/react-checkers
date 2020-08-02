import React, { Component } from 'react';
import Div100vh from 'react-div-100vh';

import styles from './App.module.css';
import Board from './Board/Board';
import Move from '../../model/move';
import Sidebar from './Sidebar/Sidebar';
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

      isLayoutVertical: this.isLayoutVertical(),

      boardState: new ModelBoardState(),

      highlightedSpace: null,

      loading: false,

      editorOpen: false,
      editorCurrentPiece: null,
      editorPossibleActions: null,
      editorCurrentAction: null,
      editorBoards: null,

      started: false,

      difficulty: 0,

      winner: null,

      cursor: 'unset'
    };
  }

  componentDidMount() {
    // Resize listener.
    let resizeTimeout;
    const dimChange = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        const boardSize = this.getBoardSize();
        this.setState({
          boardSize: boardSize,
          isLayoutVertical: this.isLayoutVertical()
        });
        resizeTimeout = null;
      }, 0);
    };
    window.addEventListener('resize', dimChange);

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
    // this.openEditor();
  }

  openEditor() {
    this.setState({
      editorOpen: true,
      editorCurrentPiece: null,
      editorPossibleActions: this.state.boardState.getActions(this.state.boardState.turn),
      editorCurrentAction: [],
      editorBoards: [this.state.boardState.board],
      highlightedSpace: null
    });
  }

  closeEditor() {
    this.setState({
      editorOpen: false
    });
  }

  getBoardSize() {
    let size;
    if (this.isLayoutVertical()) {
      size = document.documentElement.clientWidth;
    } else {
      size = Math.min(document.documentElement.clientWidth - this.getSidebarSize(), document.documentElement.clientHeight)
    }
    return (size / ModelBoard.DIM) * ModelBoard.DIM;
  }

  isLayoutVertical() {
    if (document.documentElement.clientHeight - this.getSidebarSize() > document.documentElement.clientWidth) {
      return true;
    }
    return false;
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
            x: this.state.editorCurrentPiece.mouseX - this.state.editorCurrentPiece.xOffset - this.state.editorCurrentPiece.parentX,
            y: this.state.editorCurrentPiece.mouseY - this.state.editorCurrentPiece.yOffset - this.state.editorCurrentPiece.parentY,
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

  positionInSpace(event) {
    const box = event.currentTarget.getBoundingClientRect();

    if (event.clientX < box.left) {
      return false;
    }
    if (event.clientY < box.top) {
      return false;
    }
    if (event.clientX > box.right) {
      return false;
    }
    if (event.clientY > box.bottom) {
      return false;
    }

    return true;
  }

  positionInPiece(event) {
    if (!this.positionInSpace(event)) {
      return false;
    }

    const spaceSize = this.state.boardSize / 8
    
    const box = event.currentTarget.getBoundingClientRect();

    const r = spaceSize / 2;
    const xOffset = event.clientX - box.x;
    const yOffset = event.clientY - box.y;
    if ((xOffset - r) ** 2 + (yOffset - r) ** 2 > r ** 2) {
      return false;
    }

    return {x: xOffset, y: yOffset};
  }

  positionInSpaceTouch(event, eventX, eventY, targetX, targetY) {
    const box = event.currentTarget.getBoundingClientRect();

    const xLow = box.left + (targetX - eventX) * box.width;
    const yLow = box.top + (targetY - eventY) * box.height;
    const xHigh = box.right + (targetX - eventX) * box.width;
    const yHigh = box.bottom + (targetY - eventY) * box.height;

    if (event.changedTouches[0].clientX < xLow) {
      return false;
    }
    if (event.changedTouches[0].clientY < yLow) {
      return false;
    }
    if (event.changedTouches[0].clientX > xHigh) {
      return false;
    }
    if (event.changedTouches[0].clientY > yHigh) {
      return false;
    }

    return true;
  }

  positionInPieceTouch(event, eventX, eventY, targetX, targetY) {
    if (!this.positionInSpace(event, eventX, eventY, targetX, targetY)) {
      return false;
    }

    const spaceSize = this.state.boardSize / 8
    
    const box = event.currentTarget.getBoundingClientRect();
    const xLow = box.left + (targetX - eventX) * box.width;
    const yLow = box.top + (targetY - eventY) * box.height;

    const r = spaceSize / 2;
    const xOffset = event.changedTouches[0].clientX - xLow;
    const yOffset = event.changedTouches[0].clientY - yLow;
    if ((xOffset - r) ** 2 + (yOffset - r) ** 2 > r ** 2) {
      return false;
    }

    return {x: xOffset, y: yOffset};
  }

  handleSpaceMouseDown(x, y, event) {
    if (this.state.editorOpen && this.getRenderedBoard().spaceContainsRed(x, y)) {
      const offset = this.positionInPiece(event);
      const box = event.currentTarget.parentNode.getBoundingClientRect();
      if (offset) {
        // Make sure the mouse was down inside of the checker.
        this.setState({
          cursor: 'grabbing',
          editorCurrentPiece: {
            x, y,
            xOffset: offset.x, yOffset: offset.y,
            mouseX: event.clientX, mouseY: event.clientY,
            parentX: box.x, parentY: box.y
          }
        });
      }
    }
  }

  handleSpaceTouchStart(x, y, event) {
    event.preventDefault();

    if (this.state.editorOpen && this.getRenderedBoard().spaceContainsRed(x, y)) {
      const offset = this.positionInPieceTouch(event, x, y, x, y);
      const box = event.currentTarget.parentNode.getBoundingClientRect();
      if (offset) {
        // Make sure the mouse was down inside of the checker.
        this.setState({
          cursor: 'grabbing',
          editorCurrentPiece: {
            x, y,
            xOffset: offset.x, yOffset: offset.y,
            mouseX: event.clientX, mouseY: event.clientY,
            parentX: box.x, parentY: box.y
          }
        });
      }
    }
  }

  getSidebarSize() {
    return Math.min(document.documentElement.clientWidth * 0.25, document.documentElement.clientHeight * 0.25);
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

          if (this.positionInPiece(event)) {
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

  handleSpaceTouchMove(x, y, event) {
    event.preventDefault();

    if (this.state.editorOpen && this.state.editorCurrentPiece) {
        this.setState({
          editorCurrentPiece: {
            ...this.state.editorCurrentPiece,
            mouseX: event.changedTouches[0].clientX,
            mouseY: event.changedTouches[0].clientY
          }
        });

        // Check if the player has dragged the piece out of the highlighted space.
        if (this.state.highlightedSpace && !this.positionInPieceTouch(event, x, y, this.state.highlightedSpace.x, this.state.highlightedSpace.y)) {
          this.setState({
            highlightedSpace: null
          });
        }

        let found = false;
        for (let lY = 0; lY < ModelBoard.DIM && !found; lY++) {
          for (let lX = 0; lX < ModelBoard.DIM && !found; lX++) {
            if (this.positionInPieceTouch(event, x, y, lX, lY)) {
              found = true;
              if (this.isMoveValid({ x: lX, y: lY }, { x: this.state.editorCurrentPiece.x, y: this.state.editorCurrentPiece.y })) {
                this.setState({
                  highlightedSpace: {x: lX, y: lY}
                });
              }
            }
          }
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
          editorCurrentPiece: null,
          highlightedSpace: null
        });
      }
    }
  }

  handleSpaceTouchEnd(x, y, event) {
    event.preventDefault();

    if (this.state.editorOpen && this.state.editorCurrentPiece) {
      const from = { x: this.state.editorCurrentPiece.x, y: this.state.editorCurrentPiece.y };

      let found = false;
      let valid = false;
      for (let lY = 0; lY < ModelBoard.DIM && !found; lY++) {
        for (let lX = 0; lX < ModelBoard.DIM && !found; lX++) {
          if (this.positionInPieceTouch(event, x, y, lX, lY)) {
            found = true;
            if (this.isMoveValid({ x: lX, y: lY }, from)) {
              valid = true;
              const move = new Move({ x: lX, y: lY }, from);
              const copy = new ModelBoard(this.getRenderedBoard());
              copy.applyMove(move);
              this.setState({
                editorCurrentPiece: null,
                editorCurrentAction: [...this.state.editorCurrentAction, move],
                editorBoards: [...this.state.editorBoards, copy],

                highlightedSpace: null,

                cursor: 'grab'
              });
            }
          }
        }
      }
      
      if (!valid) {
        this.setState({
          editorCurrentPiece: null,
          highlightedSpace: null
        });
      }
      
    }
  }

  checkWinner(boardState) {
    const winner = boardState.getWinner();
    if (winner !== this.state.winner) {
      this.setState({
        winner,
        loading: false
      });
    }

    return winner !== null;
  }

  handleEditorCheckClick() {
    const boardState = this.state.boardState.nextState(new ModelAction(this.state.editorCurrentAction));

    this.setState({
      boardState,
      loading: true
    });
    this.closeEditor();

    if (!this.checkWinner(boardState)) {
      const worker = new MinimaxWorker();
      worker.postMessage({
        boardState: boardState,
        difficulty: this.state.difficulty
      });
      worker.addEventListener('message', (event) => {
        const boardState = this.state.boardState.nextState(new ModelAction(event.data.moves));
        this.setState({
          boardState: boardState,
          loading: false
        });
        if (!this.checkWinner(boardState)) {
          this.openEditor();
        }
        worker.terminate();
      });
    }
  }

  handleEditorBackClick() {
    this.setState({
      editorCurrentAction: this.state.editorCurrentAction.slice(0, -1),
      editorBoards: this.state.editorBoards.slice(0, -1)
    });
  }

  handleEndPlayClick() {
    // TODO: This causes an error.
    console.log('gh');

    this.setState({
      boardState: new ModelBoardState(),
      winner: null,
      editorOpen: true,
      editorCurrentPiece: null,
      editorPossibleActions: this.state.boardState.getActions(this.state.boardState.turn),
      editorCurrentAction: [],
      editorBoards: [this.state.boardState.board],
      highlightedSpace: null,
      cursor: 'unset'
    });

    this.openEditor();
  }

  handleEndMenuClick() {
    this.setState({
      boardState: new ModelBoardState(),
      winner: null,
      editorOpen: true,
      editorCurrentPiece: null,
      editorPossibleActions: this.state.boardState.getActions(this.state.boardState.turn),
      editorCurrentAction: [],
      editorBoards: [this.state.boardState.board],
      highlightedSpace: null,
      cursor: 'unset',
      started: false
    });
  }

  startGame(difficulty) {
    this.setState({
      difficulty,
      started: true
    });

    this.openEditor();
  }

  render() {

    return (
      <div className={styles.App} style={{
        flexDirection: this.state.isLayoutVertical ? 'column' : 'row'
      }}>
        <Board
          board={this.getRenderedBoard()}
          pieces={this.getRenderedPieces()}
          boardSize={this.state.boardSize}
          
          isLayoutVertical={this.state.isLayoutVertical}

          highlightedSpace={this.state.highlightedSpace}

          mouseDownSpace={(x, y, e) => this.handleSpaceMouseDown(x, y, e)}
          mouseMoveSpace={(x, y, e) => this.handleSpaceMouseMove(x, y, e)}
          mouseEnterSpace={(x, y, e) => this.handleSpaceMouseEnter(x, y, e)}
          mouseLeaveSpace={(x, y, e) => this.handleSpaceMouseLeave(x, y, e)}
          mouseUpSpace={(x, y, e) => this.handleSpaceMouseUp(x, y, e)}

          touchStartSpace={(x, y, e) => this.handleSpaceTouchStart(x, y, e)}
          touchEndSpace={(x, y, e) => this.handleSpaceTouchEnd(x, y, e)}
          touchMoveSpace={(x, y, e) => this.handleSpaceTouchMove(x, y, e)}

          cursor={this.state.cursor}

          started={this.state.started}
          mouseClickDifficulty={(difficulty) => this.startGame(difficulty)}

          mouseClickEndPlay={() => this.handleEndPlayClick()}
          mouseClickEndMenu={() => this.handleEndMenuClick()}
          winner={this.state.winner}
        />
        <Sidebar
          showEditor={this.state.editorOpen && this.state.editorCurrentAction.length > 0}

          isHorizontal={this.state.isLayoutVertical}
          boardSize={this.state.boardSize}

          size={this.getSidebarSize()}

          loading={this.state.loading}

          clickCheck={() => this.handleEditorCheckClick()}
          clickBack={() => this.handleEditorBackClick()}
        />
      </div>
    );
  }
}

export default App;
