import React from "react";

import "./Toggle.css";

interface Props {
    title: string
}

const Toggle : React.FC<Props> = ({title})=> {
    return (
        <div className="toggle">
            <span className="toggle_label">{title}</span>
            <div className="toggler_input_wrapper">
                <input type="checkbox"/>
                <span className="slider"></span>
            </div>
        </div>
    );
}

export default Toggle;