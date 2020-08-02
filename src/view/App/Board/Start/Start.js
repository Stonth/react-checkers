import React from 'react';
import styles from './Start.module.css';

function Start(props) {
    return (
        <div className={styles.Start}>
            <p className={styles.title}>React Checkers</p>
            <div className={styles.buttons} style={{
                flexDirection: props.isLayoutVertical ? 'column' : 'row'
            }}>
                <button onClick={() => props.mouseClickDifficulty(0.4)}>Easy</button>
                <button onClick={() => props.mouseClickDifficulty(0.7)}>Medium</button>
                <button onClick={() => props.mouseClickDifficulty(1)}>Hard</button>
            </div>
        </div>
    );
}

export default Start;