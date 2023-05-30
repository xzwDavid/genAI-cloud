import React from "react";

import "./HelpPage.css";

interface Props {
    
}

const HelpPage = React.forwardRef<HTMLDivElement, Props>((props, ref)=> {
    return (
        <div ref={ref} id="help" className="help_page">

        </div>
    );
})

export default HelpPage;