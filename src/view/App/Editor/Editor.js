import React from 'react';
import styles from './Editor.module.css';

function Editor(props) {

    return (
        <div className={styles.Editor}>
            <button
                style={{visibility: props.showBack ? 'unset' : 'hidden'}}
                onClick={props.clickBack}
            >&#8592;</button>
            <button
                style={{visibility: props.showCheck ? 'unset' : 'hidden'}}
                onClick={props.clickCheck}
            >&#10003;</button>
        </div>
    );
}

export default Editor;