import React, { ReactElement, Suspense, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { RevisorCtx } from "../../../hooks/RevisorCtx";
import ResponseController from "../../../libs/api/ResponseController";
import PushBtn from "../PushBtn/PushBtn";

import "./MessageStacker.css";


// =========================================================
// Message Stacker
// =========================================================
interface IMessageStacker {
    // appendLog: Function
}


/** MessageStacker forwared references' interface */
export interface MessageStackHandle {
    /** self reference to message stacker */
    self: HTMLDivElement,
    /** method to append to message json (for adding to massage stacker) */
    appendMsgJSON: Function
}


/** A class for building a container for the messages 
 * @yields 
 * - a refernece to the whole container
 * - a function for appending messages
 */
const MessageStacker = React.forwardRef<MessageStackHandle, IMessageStacker>((props, ref) => {
    /** self reference to MessageStacker */
    let self = useRef<HTMLDivElement>(null);
    let modiferRef = useRef() as React.MutableRefObject<ModifierHandler>;
    /** for scrolling to bottom */
    const bottomRef = useRef<any>(null);

    useImperativeHandle(ref, ()=> {
        return {
            self: self.current!, 
            appendMsgJSON: appendMsgJSON,
        };
    }, []);


    const [msgs, setMsgs] = useState<any>([]);


    let appendMsgJSON = React.useCallback(async (msg: string, isBot: Boolean, target_input: any) => {
        if (msg === "") return;
        
        if (isBot === false) {
            setMsgs((obj: any) => (
                [
                    ...obj,
                    {msg: msg, isBot: isBot},
                    {msg: "", isBot: true}
                ]
            ));
        } else {
            setMsgs((msg: any) => msg.filter((prop:any, index: number) => prop.msg !== ""));
            setMsgs((obj: any) => (
                [
                    ...obj,
                    {msg: msg, isBot: isBot, target_input}
                ]
            ));
        }
    },[]);


    const modifyHandler = (msg: string, target_input: any)=> {
        modiferRef.current!.toggleDisplay();
        modiferRef.current!.setPrevUserIn(target_input);
        modiferRef.current!.setOrigResp(msg);
    }
    
    useEffect(() => { // scroll to bottom once msg added
        bottomRef.current!.scrollIntoView({behavior: 'smooth'});
    }, [msgs]);

    return (
        <>
            <div ref={self} className="message_stacker">
                <div className="container">
                    {
                        msgs && msgs.map((obj: any, idx: number) => {
                            return <Message 
                                        msg={obj.msg} target_input={obj.target_input}
                                        isBot={obj.isBot} key={idx} 
                                        clickEvent={()=>modifyHandler(obj.msg, obj.target_input)}
                                        canModify={idx === msgs.length-1}
                                    />
                        })
                    }
                    <div ref={bottomRef}></div>
                </div>
            </div>
            <Modifier ref={modiferRef}/>
        </>
    );
})

export default MessageStacker;








// ==============================
// Message
// ==============================
interface IMessage {
    msg: string
    target_input?: string,
    isBot?: Boolean,
    canModify?: boolean
    clickEvent?: Function,
}

export const Message = React.forwardRef<HTMLElement, IMessage>(({target_input, msg, isBot, canModify=true, clickEvent, }, ref) => {
    let self = React.useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => {
        return self.current!
    }, []);

    const iconName  = (isBot) ? "smart_toy" : "person";
    const bgColor   = (isBot) ? "var(--champaign-orange)" : "var(--soft-blue)";
    const justify   = (isBot) ? "left" : "right";

    const [stage, setStage] = useState('TYPING');
    useEffect(() => {
        setStage("TYPING");
        if (msg) setStage("DONE")
    }, [msg]);

    return (
        <div ref={self} className="message" style={{"justifyContent": justify}}>
            {(isBot) ? (
                <React.Fragment>
                    <i className="material-icons">{iconName}</i>
                        <span style={{"backgroundColor": bgColor}}>
                            {stage === "TYPING" ? 
                                <div className="typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div> : 
                                msg
                            }
                        </span>
                        {
                            canModify && stage !== "TYPING" && <button onClick={(e: React.MouseEvent<HTMLElement>)=> {
                                clickEvent && clickEvent(target_input)
                            }}>Modify</button>
                        }
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <span style={{"backgroundColor": bgColor}}>{msg}</span>
                    <i className="material-icons">{iconName}</i>
                </React.Fragment>
            )}
        </div>
    );
})






// ==============================
// Modifer Popup
// ==============================

interface IModifier {
    // appendLog: Function
}

/** ModifierHandler forwared references' interface */
export interface ModifierHandler {
    self:           HTMLDivElement,
    toggleDisplay:  Function,
    setPrevUserIn:  Function,
    setOrigResp:    Function,
    setDiffResp:    Function,
    setNewResp:     Function
}

export const Modifier = React.forwardRef<ModifierHandler, IModifier>((props, ref) => {
    let self = useRef<HTMLDivElement>(null);

    const [display, setDisplay]       = useState<string>("none");
    const [prevUserIn, setPrevUserIn] = useState<string>("");
    const [origResp, setOrigResp]     = useState<string>("");
    let editAreaRef = useRef<HTMLTextAreaElement>(null);
    let sliderRef = useRef<HTMLInputElement>(null);
    const [diffResp, setDiffResp] = useState<string>("");
    const [newResp, setNewResp]   = useState<string>("");
    
    useImperativeHandle(ref, ()=> {
        return {
            self: self.current!, 
            toggleDisplay:  toggleDisplay,
            setPrevUserIn:  setPrevUserIn,
            setOrigResp:    setOrigResp,
            setDiffResp:    setDiffResp,
            setNewResp:     setNewResp
        };
    }, []);

    function toggleDisplay() {
        setDisplay(display === "none" ? "flex" : "none");
        setDiffResp("");
        setNewResp("");
        editAreaRef.current!.value = "";
    }

    async function analyzeHandler() {
        let diffResp = await ResponseController.getDiffResponse(origResp, editAreaRef.current!.value);
        setDiffResp(diffResp["content"]);
        let changeResp = await ResponseController.getHowToChange(origResp, editAreaRef.current!.value);
        setNewResp(changeResp["content"]);
    }

    async function makeModification() {
        if (newResp === "") {
            alert("Analyze First!");
            return;
        }
        ResponseController.makeChange(prevUserIn, origResp, newResp);
        toggleDisplay();
    }

    const revisorCtx = useContext(RevisorCtx);

    return (
        <div ref={self} className="modifier" style={{"display": display}}>
            <div className="modifer_stack">
                <div className="modifier_section">
                    <h3>Targeted User Input</h3>
                    <span>{prevUserIn}</span>
                </div>
                <div style={
                    {
                        display: "flex",
                        flexDirection: "row",
                        height: "auto"
                    }
                }>
                    <div className="modifier_section" style={{width: "50%", height: "100%"}}>
                        <h3>Orignal Generated Response</h3>
                        <span>{origResp}</span>
                    </div>
                    <div className="modifier_section" style={{width: "50%", height: "100%"}}>
                        <h3>Enter Your Edited Response</h3>
                        <textarea ref={editAreaRef}></textarea>
                    </div>
                </div>
                
                
                <ul>
                    <input ref={sliderRef} type="range" min={0} max={4} defaultValue={0} />
                    <PushBtn title={"Analysize"} iconName={"check"} style={{backgroundColor: "transparent", "color": "black", margin: "0 10px"}} clickEvent={analyzeHandler} />
                </ul>
                <div className="modifier_section">
                    <h3>Difference between Original and Edited</h3>
                    <span>{diffResp}</span>
                </div>
                <div className="modifier_section">
                    <h3>New Response AI Discovered</h3>
                    <span>{newResp}</span>
                </div>
                <ul>
                    <PushBtn title={"Confirm"} iconName={"check"} style={{backgroundColor: "var(--soft-blue)", "color": "white", margin: "0 10px"}} clickEvent={()=> {
                        revisorCtx.InfluencerRefff.current.appendLog(
                            origResp,
                            editAreaRef.current!.value,
                            diffResp,
                            newResp,
                            sliderRef.current!.value // TODO
                        );
                        makeModification && makeModification();
                    }} />
                    <PushBtn title={"Discard"} iconName={"close"} style={{"color": "black"}} clickEvent={toggleDisplay} />
                </ul>
            </div>
        </div>
    );
});