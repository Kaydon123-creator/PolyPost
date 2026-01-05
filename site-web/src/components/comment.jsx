import { useParams } from "react-router";
import "../assets/css/components/comment.css";
import ReactionContainer from "../components/reactionContainer";
import { useState, useContext } from "react";
import { StateContext } from "../contexts/context";
import { downvoteComment, upvoteComment } from "../utils/post.http";

function Comment({ comment, onClick }) {
    const { postId } = useParams();
    const { pseudo } = useContext(StateContext);

    const {
        author,
        content,
        reactions,
        date,
        id,
    } = comment;

    const [shownReaction, setShownReaction] = useState(reactions);

    const dateObject = new Date(date);
    const dateAffiche = dateObject.toLocaleString("fr-CA", {
        dateStyle: "long",
        timeStyle: "short",
    });

    async function reactComment(reactEffect) {
        await reactEffect(postId, id);
    }

    function upvote() {
        reactComment(upvoteComment);
        setShownReaction(shownReaction + 1);
    }

    function downvote() {
        reactComment(downvoteComment);
        setShownReaction(shownReaction - 1);
    }

    return (
        <div className="comment" >
            <section className="comment-info">
                <p className="comment-author">{author}</p>
                <p className="comment-date">{dateAffiche}</p>
            </section>
            <p className="comment-content">{content}</p>
            <ReactionContainer
                upvoteCallback={upvote}
                downvoteCallback={downvote}
                reactions={shownReaction}
            />
            {
                pseudo === author ?
                <button className="delete-button" onClick={onClick}>
                    <img src="../trash.svg" className="delete-icon" />
                </button>
                : <></>
            }
        </div>
    );
}

export default Comment;
