import React, { useImperativeHandle } from "react";

import "./FolderTabBtn.css";

interface IFolderTabBtn {
    title: string,
    clickEvent?: Function,
}

/** A folder-like button for switching tab */
const FolderTabBtn = React.forwardRef<HTMLElement, IFolderTabBtn>(({title, clickEvent}, ref) => {
    let self = React.useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => {
        return self.current!
    }, []);

    return (
        <div ref={self} className="folder_tabbtn_wrapper">
            <input type="checkbox" onClick={() => clickEvent && clickEvent(title)}/>
            <span className="folder_tabbtn_label">{title}</span>
        </div>
    );
})

export default FolderTabBtn;