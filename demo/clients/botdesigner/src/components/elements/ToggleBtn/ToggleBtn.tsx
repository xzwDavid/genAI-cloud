import React, { useState, useImperativeHandle } from "react";

import "./ToggleBtn.css";

interface IToggleBtn {
    /** Title for the toggle button */
    title: string,
    /** inactive color when it's not activated */
    inactiveColor?: string
    /** active color when it's activated */
    activeColor?: string,
    clickEvent?: Function

}

/** Button like toggle */
const ToggleBtn = React.forwardRef<HTMLButtonElement, IToggleBtn>(
({title, inactiveColor, activeColor, clickEvent}, ref) => {
    let self = React.useRef<HTMLButtonElement>(null);
    const [active, setActive] = useState(false);

    useImperativeHandle(ref, () => {
        return self.current!
    }, []);

    return (
        <button ref={self} className="togglebtn" onClick={()=> {
                if (!activeColor) activeColor = "var(--highlight-blue)";
            
                setActive(!active);
                if (!active) {
                    self.current!.style.color = activeColor;
                    self.current!.style.borderColor = activeColor;
                    self.current!.style.boxShadow = `0.3px 0.3px 5px ${activeColor}, 
                                                    inset 0.3px 0.3px 5px ${activeColor}`;
                } else {
                    self.current!.style.color = "var(--inactive-border-black)";
                    self.current!.style.borderColor = "var(--inactive-border-black)";
                    self.current!.style.boxShadow = "";
                }

                clickEvent && clickEvent();
            }}
        >
            <i className={(active) ? "material-icons" : "material-symbols-outlined"}>
                fiber_manual_record
            </i>
            {title}
        </button>
    );
})

export default ToggleBtn;