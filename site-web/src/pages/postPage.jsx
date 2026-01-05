import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useContext } from "react";
import { getPost, upvotePost, downvotePost, deletePost, deleteComment, addComment } from "../utils/post.http";
import Comment from "../components/comment";
import "../assets/css/pages/postPage.css";
import ReactionContainer from "../components/reactionContainer";
import { StateContext } from "../contexts/context";
import NewComment from "../components/newComment";

const PostPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState();
    const [reactions, setReactions] = useState(0);
    const { pseudo } = useContext(StateContext);
    const navigate = useNavigate();

    async function loadPost() {
        setPost(await getPost(postId));
    }

    useEffect(() => {
        loadPost();
    }, [])

    useEffect(() => { 
        if (post) {
            setReactions(post.reactions);
        }
    }, [post]);

    let dateAffiche;
    if (post) {
        const dateObject = new Date(post.date);
        dateAffiche = dateObject.toLocaleString("fr-CA", {
            dateStyle: "long",
            timeStyle: "short",
        });
    }

    function upvote() {
        reactPost(upvotePost);
    }

    function downvote() {
        reactPost(downvotePost);
    }

    async function reactPost(reactionEffect) {
        await reactionEffect(postId);
        loadPost();
    }

    async function deleteAction() { 
        await deletePost(postId, post.author);
    }

    async function removeComment(id) {
        await deleteComment(postId, id, pseudo);
    }

    async function sendComment(content) {
        await addComment(postId, content, pseudo);
        loadPost();
    }

    return (
        post ?
            <>
                <div className="post-container">
                    <section className="post-info">
                        <p className="post-author">{post.author}</p>
                        <p className="post-category">{post.category}</p>
                        <p className="post-date">{dateAffiche}</p>
                    </section>
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-content">{post.content}</p>
                    { pseudo === post.author ?
                        <button className="delete-button" onClick={deleteAction}>
                            <img src="../trash.svg" className="delete-icon" />
                        </button>
                        : <></>
                    }
                    <ReactionContainer
                        upvoteCallback={upvote}
                        downvoteCallback={downvote}
                        reactions={reactions}
                    />
                </div>
                <section className="comments-container">
                    <h3>Commentaires : </h3>
                    <div className="comment-list">
                        {
                            post.comments.map((comment) => {
                                return (<Comment
                                    comment={comment}
                                    onClick={() => removeComment(comment.id)}
                                    key={comment.id}
                                />);
                            })
                        }
                    </div>
                    {
                        pseudo ?
                        <NewComment sendComment={sendComment} />
                        : <></>
                    }
                </section>
            </>
            : <></>
    );
};

export default PostPage;
