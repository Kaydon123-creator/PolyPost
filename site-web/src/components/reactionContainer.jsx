import "../assets/css/components/reactionContainer.css";
import { useContext } from "react";
import { StateContext } from "../contexts/context";

function ReactionContainer({ upvoteCallback, downvoteCallback, reactions }) {

    const { pseudo } = useContext(StateContext);

    if (!pseudo) {
        return (<></>);
    }

    return (
        <div className="reactions-container">
            <span className="reactions">{reactions}</span>
            <button className="reaction-up" onClick={() => { upvoteCallback(); }}>&uarr;</button>
            <button className="reaction-down" onClick={() => { downvoteCallback(); }}>&darr;</button>
        </div>
    );
}

export default ReactionContainer;
