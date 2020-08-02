import React from 'react';
import NativeListener from 'react-native-listener';
import styles from './Board.module.css';
import Space from './Space/Space';
import Piece from './Piece/Piece';
import End from './End/End';
import Start from './Start/Start';
import ModelBoard from '../../../model/board'

function Board(props) {
    let isSpaceWhite = true;
    let spaces = props.board.grid.map((row, y) => {
        isSpaceWhite = !isSpaceWhite;
        return row.map((piece, x) => {
            isSpaceWhite = !isSpaceWhite;
            const colorStyle = isSpaceWhite ? styles.white : styles.black;
            return (
                <NativeListener 
                onMouseDown={e => props.mouseDownSpace(x, y, e)}
                onMouseMove={e => props.mouseMoveSpace(x, y, e)}
                onMouseLeave={e => props.mouseLeaveSpace(x, y, e)}
                onMouseEnter={e => props.mouseEnterSpace(x, y, e)}
                onMouseUp={e => props.mouseUpSpace(x, y, e)}

                onTouchStart={e => props.touchStartSpace(x, y, e)}
                onTouchEnd={e => props.touchEndSpace(x, y, e)}
                onTouchMove={e => props.touchMoveSpace(x, y, e)}>
                    <span
                        className={[styles.spaceContainer, colorStyle].join(' ')}
                        style={{
                            width: (props.boardSize / ModelBoard.DIM) + 'px',
                            height: (props.boardSize / ModelBoard.DIM) + 'px'
                        }}
                    >
                        <Space
                            isHighlighted={props.highlightedSpace && props.highlightedSpace.x === x && props.highlightedSpace.y === y}
                            piece={piece}
                            boardSize={props.boardSize}

                            key={'s' + x + ',' + y}
                        />
                    </span>
                </NativeListener>
            );
        });
    });

    let pieces = props.pieces.map((piece) => {
        return <Piece
            type={piece.type}
            x={piece.x}
            y={piece.y}
            onTop={piece.onTop}
            boardSize={props.boardSize}
            key={piece.id}
        />;
    });

    return (
        <div className={styles.Board} style={{
            cursor: props.cursor,
            flexBasis: props.boardSize + 'px',
            minWidth: props.boardSize + 'px',
            minHeight: props.boardSize + 'px',
            width: props.boardSize + 'px',
            height: props.boardSize + 'px'
        }}>
            {spaces}
            {pieces}
            {
                props.winner !== null ? 
                    <End
                        winner={props.winner}
                        mouseClickEndPlay={props.mouseClickEndPlay}
                        mouseClickEndMenu={props.mouseClickEndMenu}
                        isLayoutVertical={props.isLayoutVertical}
                    />
                : null
            }
            {
                !props.started ? 
                    <Start 
                        mouseClickDifficulty={props.mouseClickDifficulty}
                        isLayoutVertical={props.isLayoutVertical}
                    />
                : null
            }
        </div>
    );
}

export default Board;