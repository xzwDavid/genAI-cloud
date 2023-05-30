import React, { CSSProperties } from "react";

import "./PushBtn.css";

interface IPushBtn {
    /** Title for the button */
    title:      string,
    /** Specified an icon name for displaying */
    iconName:   string,
    /** If true, used outlined icon */
    outlined?:  boolean,
    style?: CSSProperties
    clickEvent?: Function,
}

const PushBtn = React.forwardRef<HTMLButtonElement, IPushBtn>((props, ref) => {
    //alert(props.title)
    return (
        <button ref={ref} className="pushbtn" style={props.style ? props.style : {}}
            onClick={()=> {
                props.clickEvent && props.clickEvent(props.title);
            }}
        >
            <i className={(props.outlined) ? "material-symbols-outlined" : "material-icons"}>
                {props.iconName}
            </i>
            {props.title}
        </button>
    );
})

export default PushBtn;