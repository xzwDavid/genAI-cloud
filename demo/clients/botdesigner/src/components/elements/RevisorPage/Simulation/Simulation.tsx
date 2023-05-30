import React, { createRef, useRef, MutableRefObject } from "react";
import ResponseController from "../../../../libs/api/ResponseController";
import StyleCacher from "../../../../utils/StyleCacher";
import FolderTabBtn from "../../FolderTabBtn/FolderTabBtn";
import MessageStacker, { MessageStackHandle } from "../../MessageStacker/MessageStacker";
import PushBtn from "../../PushBtn/PushBtn";

import "./Simulation.css";

interface ISimulation {
    
}

/** Simulation section */
const Simulation : React.FC<ISimulation> = (props)=> {
    let tabbtnRefs  = new Array<HTMLElement>();
    let tabRefs     = new Array<StyleCacher>();
    let msgStackerRef = useRef() as MutableRefObject<MessageStackHandle>;
    
    let textareaRef = createRef<HTMLTextAreaElement>();
    let sendBtnRef  = useRef<HTMLButtonElement>();

    /** Set the active tab based on title (lowercase) matching ID */
    function setActiveTab(title: string) {
        tabbtnRefs.forEach(elem => {
            const inputTag = elem?.children[0] as HTMLInputElement;
            const spanTag = elem?.children[1] as HTMLSpanElement;

            if (spanTag && spanTag.innerHTML === title) {
                inputTag.checked = true;
            } else if (spanTag && spanTag.innerHTML !== title) {
                inputTag.checked = false;
            }
        });

        tabRefs.forEach(obj => {
            if (obj && obj.elem.id === title.toLowerCase()) {
                obj.restoreDisplay();
            } else if (obj) {
                obj.elem.style.display = "none";
            }
        });
    }

    /** Handle key down events in textarea */
    const handleInputKeyDown = ((e:any) => {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
            sendBtnRef.current!.click();
        }
    });


    
    return (
        <div className="simulation">
            <div className="tabbtn_wrapper">
                <FolderTabBtn ref={(elem: HTMLInputElement)=> {
                        tabbtnRefs.push(elem);
                        const inputTag = elem?.children[0] as HTMLInputElement;
                        if (inputTag) inputTag.checked = true; // force init starter
                    }} title="Conversation Simulator" clickEvent={setActiveTab}
                />

                {/* <FolderTabBtn ref={(elem: HTMLInputElement)=> {
                        tabbtnRefs.push(elem);
                    }} title="Dashboard" clickEvent={setActiveTab}
                /> */}
            </div>

            <div className="tab_wrapper">

                <div ref={(elem: HTMLDivElement) => {
                        tabRefs.push(new StyleCacher(elem));
                    }} id="conversation simulator" className="tab conversation"
                >
                    
                    <MessageStacker ref={msgStackerRef} />
                    <div className="typer_section">
                        <textarea ref={textareaRef} className="convex" 
                            placeholder="Your response..." onKeyDown={handleInputKeyDown}
                        />
                        <PushBtn ref={(el: HTMLButtonElement) => {sendBtnRef.current = el}} 
                            title={"Send"} iconName={"send"} 
                            style={
                                {
                                    "color": "black", 
                                    "borderColor": "var(--inactive-border-black)"
                                }
                            }
                            clickEvent={()=> {
                                msgStackerRef.current!.appendMsgJSON(textareaRef.current?.value, false);
                                let inputCache = textareaRef.current!.value;
                                textareaRef.current!.value = "";

                                ResponseController.getConvResponse(inputCache).then((data: any) => {
                                    msgStackerRef.current!.appendMsgJSON(data.content, true, inputCache);
                                });   
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Simulation;




