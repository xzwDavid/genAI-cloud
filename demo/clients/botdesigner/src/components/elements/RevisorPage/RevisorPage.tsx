import React, { useRef } from "react";
import { RevisorCtx } from "../../../hooks/RevisorCtx";
import Influencer, { InfluencerHandle } from "./Influencer/Influencer";

import "./RevisorPage.css";
import Simulation from "./Simulation/Simulation";

interface IRevisorPage {
    
}

const RevisorPage = React.forwardRef<HTMLDivElement, IRevisorPage>((props, ref)=> {
    let influencerRef = useRef() as React.MutableRefObject<InfluencerHandle>;

    return (
        <RevisorCtx.Provider value={{InfluencerRefff: influencerRef}}>

        <div ref={ref} id="revisor" className="revisor_page">
            <div className="hor_shelf">
                <Simulation />
                <Influencer ref={influencerRef}/>
            </div>
        </div>
        </RevisorCtx.Provider>
    );
})

export default RevisorPage;