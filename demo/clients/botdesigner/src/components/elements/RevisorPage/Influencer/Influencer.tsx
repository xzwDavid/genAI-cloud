import React, { createRef, CSSProperties, useImperativeHandle, useRef, useState, useCallback } from "react";
import ResponseController from "../../../../libs/api/ResponseController";
import Bulletin from "../../Bulletin/Bulletin";
import PushBtn from "../../PushBtn/PushBtn";
import ToggleBtn from "../../ToggleBtn/ToggleBtn";

import "./Influencer.css";


interface IEditorLog {
    /** the username for the log */
    username: string,
    /** Intesity for creativity */
    intensity: number,
    /** Original generated gesponse */
    original: string
    /** Edited response */
    edited: string,
    /** Difference between original and edited */
    difference: string,
    /** The response that will be used in the future */
    newResponse: string,
    style?: CSSProperties
    clickEvent?: Function,
}

export const EditorLog = React.forwardRef<HTMLDivElement, IEditorLog>((props, ref) => {

    const defaultProfilePicURL = "https://thirteen-seven-workout-diary.s3.amazonaws.com/profile_pictures/goldie-smiling.png";

    var bgcolor = "", color = "", iconName = "";

    function getBgColor(factor: number) {
        return `rgb(110, 140, ${135 + factor * 30})`
    }

    switch (Number(props.intensity)) {
        case 4:
            bgcolor = getBgColor(4);
            color = "black";
            iconName = "check";
            break;
        case 3:
            bgcolor = getBgColor(3);
            color = "black";
            iconName = "check";
            break;
        case 2:
            bgcolor = getBgColor(2);
            color = "black";
            iconName = "check";
            break;
        case 1:
            bgcolor = getBgColor(1);
            color = "black";
            iconName = "check";
            break;
        default:
            bgcolor = getBgColor(0);
            color = "black";
            iconName = "check";
            break;
    }

    const [divheight, setDivheight] = useState("70px");
    let orgRespRef  = createRef<HTMLParagraphElement>();
    let modRespRef  = createRef<HTMLParagraphElement>();
    let diffRef     = createRef<HTMLParagraphElement>();
    let t1 = 0, t2 = 0;

    return (
        <div ref={ref} className="editorLog"
        style={{"backgroundColor": bgcolor, "color": color, "minHeight": divheight}}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
            e.preventDefault();
            
        }} onMouseDown={()=> {
            t1 = new Date().getTime()
        }} onMouseUp={()=>{
            t2 = new Date().getTime()
            if (t2-t1 < 300) {
                if (divheight === "70px") {
                    setDivheight(orgRespRef.current!.clientHeight +
                                 modRespRef.current!.clientHeight +
                                 diffRef.current!.clientHeight +
                                200 + "px");
                } else {
                    setDivheight("70px");
                }
            }
        }}>
            <img alt="profile_pic" src={defaultProfilePicURL} />
            <div className="details_container">
                <h1>
                    <b>Moderator: </b> 
                    <span>{props.username}</span>
                </h1>
                <h1>
                    <b>AI's New Response: </b>
                    <span>{props.newResponse}</span>
                </h1>
                <h1>
                    <b>Original Generated Response:</b>
                    <p ref={orgRespRef}>{props.original}</p>
                </h1>
                <h1>
                    <b>Your Modified Response:</b>
                    <p ref={modRespRef}>{props.edited}</p>
                </h1>
                <h1>
                    <b>Explanation of difference:</b>
                    <p ref={diffRef}>{props.difference}</p>
                </h1>
            </div>
            <i className={"material-icons"}>{iconName}</i>
        </div>
    );
})










export interface InfluencerHandle {
    /** self reference */
    self: HTMLDivElement,
    /** append a log item */
    appendLog: Function
}

interface IInfluencer {
    
}

const Influencer = React.forwardRef<InfluencerHandle, IInfluencer>((props, ref)=> {
    /** Self reference */
    let self = useRef<HTMLDivElement>(null);
    /** File input reference */
    let fInputRef = useRef<HTMLInputElement>(null);

    function handleChooseFile() {
        fInputRef.current!.click();
    }

    const [prompts, setPrompts] = useState(""); // can only take one now

    async function handlePostFile() {
        var data = new FormData()
        if (fInputRef.current!.files) 
            data.append('files', fInputRef.current!.files[0])
        const res = await ResponseController.postPDFprompt(data);
        setPrompts(res.content)
    }

    const [logJSONs, setLogJSONs] = useState<any>([]);

    let appendLog = useCallback(
        async (orig: string, modi: string, diff: string, newRes: string, intensity: number) => {
            setLogJSONs( (obj: any) => [...obj, {orig, modi, diff, newRes, intensity}] );
    }, []);

    
    useImperativeHandle(ref, ()=> {
        return {
            self: self.current!,
            appendLog: appendLog
        }
    }, []);


    return (
        <div ref={self} className="influencer">
            <div className="topbar">
                <div className="toolbar">
                    <input ref={fInputRef} type="file" id="prompt_file" 
                        name="pdf_file" style={ {display: "none"} }
                        onChange={handlePostFile}
                    />
                    <PushBtn title={"Upload PDF Prompt"} iconName={"upload_file"} 
                        style={{"color": "black"}} clickEvent={handleChooseFile}
                    />
                </div>
                <div className="userinfo_container">
                    <span>Hello, librarian_amy</span>
                    <PushBtn title={"Log Out"} iconName={""} 
                        style={{"color": "black"}}
                    />
                </div>
            </div>
            <Bulletin header="Prompts" msg={prompts}/>
            <div id="dashboard" className="dashboard">
                <span>Modification History</span>
                <div className="editor_log_container">
                    {
                        logJSONs && logJSONs.map((elem: any, idx: number)=> {
                            return (
                            <EditorLog key={idx} username={"librarian_amy"} 
                                intensity={elem.intensity} original={elem.orig} 
                                edited={elem.modi} difference={elem.diff} 
                                newResponse={elem.newRes} 
                            />);
                        })
                    }
                </div>
            </div>
        </div>
    );
});

export default Influencer;












