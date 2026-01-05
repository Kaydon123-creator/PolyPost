import { useState } from "react";

const NewComment = ({ sendComment }) => {
    const [text, setText] = useState("");
    return (
        <>
            <form onSubmit={(e) => {
                e.preventDefault();
                sendComment(text);
                setText("");
                const commentInput = document.getElementById("comment");
                commentInput.value = "";
            }}>
                <label htmlFor="comment"> Ajouter un commentaire : </label>
                <input id="comment" name="comment" onChange={(e) => {
                    setText(e.target.value);
                }} />
                <button type="submit">Envoyer</button>
            </form>
        </>
    );

};

export default NewComment;