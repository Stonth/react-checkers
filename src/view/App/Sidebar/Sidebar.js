import React from 'react';
import styles from './Sidebar.module.css';

function Sidebar(props) {
    return (
        <div
            className={[styles.Sidebar, props.isHorizontal ? styles.horizontal : styles.vertical].join(' ')}
            style={{
                width: props.boardSize + 'px',
                height: props.boardSize + 'px',
                maxWidth: props.isHorizontal ? null : (250 - 32) + 'px',
                maxHeight: props.isHorizontal ? (150 - 32) + 'px': null
            }}
        >
            <div className={[styles.segment, styles.seg0].join(' ')}>
                <span className={styles.title}>
                    React Checkers
                </span>
                <span className={styles.name}>
                    By David Fine
                </span>
            </div>
            <div className={[styles.segment, styles.seg1, props.showEditor ? styles.show : styles.hide].join(' ')}>
            <button
                style={{
                    fontSize: '24px'
                }}
                onClick={props.clickBack}
            >&#8592;</button>
            <button
                style={{
                    fontSize: '16px'
                }}
                onClick={props.clickCheck}
            >&#10003;</button>
            </div>

            <div className={[styles.segment, styles.seg2, props.loading ? styles.show : styles.hide].join(' ')}>
                <div className={styles.loading}>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;