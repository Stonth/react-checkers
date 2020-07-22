import React from 'react';
import styles from './Board.module.css';
import Space from './Space/Space';
import Piece from './Piece/Piece';
import ModelBoard from '../../../model/board'

function Board(props) {
    let isSpaceWhite = true;
    let spaces = props.board.grid.map((row, y) => {
        isSpaceWhite = !isSpaceWhite;
        return row.map((piece, x) => {
            isSpaceWhite = !isSpaceWhite;
            const colorStyle = isSpaceWhite ? styles.white : styles.black;
            return (
                <span
                    className={[styles.spaceContainer, colorStyle].join(' ')}
                    style={{
                        width: (props.boardSize / ModelBoard.DIM) + 'px',
                        height: (props.boardSize / ModelBoard.DIM) + 'px'
                    }}
                    onMouseDown={(e) => props.mouseDownSpace(x, y, e)}
                    onMouseMove={(e) => props.mouseMoveSpace(x, y, e)}
                    onMouseLeave={(e) => props.mouseLeaveSpace(x, y, e)}
                    onMouseEnter={(e) => props.mouseEnterSpace(x, y, e)}
                    onMouseUp={(e) => props.mouseUpSpace(x, y, e)}
                >
                    <Space
                        isHighlighted={props.highlightedSpace && props.highlightedSpace.x === x && props.highlightedSpace.y === y}
                        piece={piece}
                        boardSize={props.boardSize}
                        mouseDown={(e) => props.mouseDownSpace(x, y, e)}
                        mouseMove={(e) => props.mouseMoveSpace(x, y, e)}
                        mouseLeave={(e) => props.mouseLeaveSpace(x, y, e)}
                        mouseEnter={(e) => props.mouseEnterSpace(x, y, e)}
                        mouseUp={(e) => props.mouseUpSpace(x, y, e)}
                        key={'s' + x + ',' + y}
                    />
                </span>
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
            width: props.boardSize + 'px',
            height: props.boardSize + 'px'
        }}>
            {spaces}
            {pieces}
        </div>
    );
}

export default Board;