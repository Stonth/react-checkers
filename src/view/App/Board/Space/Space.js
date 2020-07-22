import React from 'react';
import styles from './Space.module.css';
import ModelBoard from '../../../../model/board';

const Space = React.memo((props) => {
    const classes = [styles.Space];
    if (props.isHighlighted) {
        classes.push(styles.highlight);
    }
    return (
        <span className={classes.join(' ')} style={{
            width: (props.boardSize / ModelBoard.DIM) + 'px',
            height: (props.boardSize / ModelBoard.DIM) + 'px'
        }}>
        </span>
    );
});

export default Space;