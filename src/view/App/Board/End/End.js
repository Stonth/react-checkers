import React from 'react';
import styles from './End.module.css';
import ModelBoardState from '../../../../model/board-state'

function End(props) {
    let winner;
    if (props.winner === ModelBoardState.TURN.RED) {
        winner = 'Red';
    } else {
        winner = 'Black';
    }

    return (
        <div className={styles.End}>
            <p className={styles.winner}>{winner} wins!</p>
            <div className={styles.buttons} style={{
                flexDirection: props.isLayoutVertical ? 'column' : 'row'
            }}>
            <button onClick={props.mouseClickEndPlay}>Play Again</button>
            <button onClick={props.mouseClickEndMenu}>Menu</button>
            </div>
        </div>
    );
}

export default End;