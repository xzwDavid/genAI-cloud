import React, { useEffect, useState } from "react";

import "./Bulletin.css";

interface IBulletin {
    msg: string,
    header: string,
    clickEvent?: Function,
}

const Bulletin = React.forwardRef<HTMLElement, IBulletin>(({msg, header, clickEvent}, ref) => {
    const [divheight, setDivheight]           = useState("50%");
    const [iconName, setIconName]             = useState("unfold_more");
    const [shouldCollapse, setShouldCollapse] = useState(false);

    useEffect(()=> {
        if (shouldCollapse) {
            setDivheight("8%");
            setIconName("unfold_less");
        } else {
            setDivheight("50%");
            setIconName("unfold_more");
        }
    }, [shouldCollapse]);

    return (
        <div className="bulletin" style={{"maxHeight": divheight}}>
            <div onClick={()=> {
                    setShouldCollapse(!shouldCollapse);
                    clickEvent && clickEvent();
                }}
            >
                <h1>{header}</h1>
                <i className="material-symbols-rounded">{iconName}</i>
            </div>
            <ul>
                <li className=""><Note msg={msg}/>
                </li>
            </ul>
        </div>
    );
})

export default Bulletin;



interface INote {
    msg: string
    clickEvent?: Function
}

export const Note = React.forwardRef<HTMLElement, INote>(({msg, clickEvent}, ref) => {

    return (
        <span className="bulletin_note">
            {msg}
        </span>
    );
});