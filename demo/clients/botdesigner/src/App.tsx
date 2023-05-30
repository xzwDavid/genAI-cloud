import React, { createRef, useRef } from 'react';
import './App.css';

import RevisorPage from './components/elements/RevisorPage/RevisorPage';
import StyleCacher from './utils/StyleCacher';
import Utility from './utils/Utility';
import HelpPage from './components/elements/HelpPage/HelpPage';
import PushBtn from './components/elements/PushBtn/PushBtn';

let tabRefs = new Array<StyleCacher>();
let navbtnRefs = new Array<HTMLElement>();

function App() {
    return (
        <div className="App">
            <Navbar />
            <RevisorPage ref={(elem: HTMLDivElement )=>{
                    tabRefs.push(new StyleCacher(elem));
                }} 
            />
            <HelpPage ref={(elem: HTMLDivElement)=> {
                    tabRefs.push(new StyleCacher(elem));
                    elem.style.display = "none";
                }}
            />
        </div>
    );
}

export default App;








// ==============================
// Navbar Component
// ==============================
interface INavbar {

}

/** Set active tab based on "tab ID" */
function setActiveTab(title: string) {
    navbtnRefs.forEach((element: HTMLElement) => {
        if (title === Utility.getToplevelText(element)) {
            element.classList.add("convex");
            element.style.color = "var(--highlight-blue)";
        } else {
            element.classList.remove("convex");
            element.style.color = "black";
        }
    });

    tabRefs.forEach((cache: StyleCacher)=> {
        if (title.toLowerCase() === cache.elem.id)
            cache.restoreDisplay();
        else
            cache.elem.style.display = "none";
    });
}


const Navbar : React.FC<INavbar> = () => {
    return (
        <nav id="infobar" className='navbar'>
            {/* <Navbtn ref={(btn: HTMLButtonElement)=>{
                navbtnRefs.push(btn);
                btn.click();
            }}
                title={'Revisor'} iconName={"design_services"} 
                clickEvent={setActiveTab} /> */}

            <PushBtn title="New Project" iconName="add"/>
            <PushBtn title="Open Project" iconName="folder_open"/>
            <PushBtn title="Save" iconName="save" outlined={true}/>
            
        </nav>
    );
}







// ==============================
// Navbtn Component
// ==============================
interface INavbtn {
    title: string,
    iconName: string,
    outlined?: boolean,
    clickEvent?: Function
}

const Navbtn = React.forwardRef<HTMLButtonElement, INavbtn>((props, ref) => {

    return (
        <button ref={ref} className={"navbtn"} onClick={()=> {
            props.clickEvent && props.clickEvent(props.title);
        }}>
            <i className={
                (props.outlined) ? "material-symbols-outlined" : "material-icons"
            }>
                {props.iconName}
            </i>
            {props.title}
        </button>
    );
})