import { createContext, MutableRefObject } from "react";
import { InfluencerHandle } from "../components/elements/RevisorPage/Influencer/Influencer";

interface IRevisor {
    InfluencerRefff: MutableRefObject<InfluencerHandle>
}

/** Context hook for accessing Revisor section */
export const RevisorCtx = createContext<IRevisor>({} as IRevisor);