
import React from 'react';
import styles from './Piece.module.css';
import pieceRed from '../../../../resources/images/checker-red.svg';
import pieceBlack from '../../../../resources/images/checker-black.svg';
import ModelPiece from '../../../../model/piece';
import ModelBoard from '../../../../model/board';

const Piece = React.memo((props) => {
    return (
        <img
            className={styles.Piece}
            style={{
                top: props.y + 'px',
                left: props.x + 'px',
                width: (props.boardSize / ModelBoard.DIM) + 'px',
                height: (props.boardSize / ModelBoard.DIM) + 'px',
                zIndex: props.onTop ? '1' : 'unset'
            }}
            alt=""
            src={getImageFromType(props.type)}
            draggable="false"
        />
    );
});

function getImageFromType(type) {
    switch (type) {
        case ModelPiece.TYPE.RED:
            return pieceRed;
        case ModelPiece.TYPE.BLACK:
            return pieceBlack;
        default:
            return null;
    }
}

export default Piece;