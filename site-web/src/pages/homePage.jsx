import { useContext, useState, useEffect } from 'react';
import { DispatchContext, StateContext } from '../contexts/context';
import { getAllPosts, publishPost } from '../utils/post.http';
import PreviewPost from '../components/previewPost';
import NewPost from '../components/newPost';
import '../assets/css/pages/homePage.css';
import { Action } from '../utils/constants';

const HomePage = () => {
    const { title, content, category, pseudo } = useContext(StateContext);
    const [posts, setPosts] = useState([]);
    const isLoggedIn = !!pseudo;
    const dispatch = useContext(DispatchContext);

    async function loadPosts() {
        setPosts(await getAllPosts());
    }

    async function sendPost() {
        const res = await publishPost(title, content, pseudo, category);
        if (!res) return;
        loadPosts();

        dispatch({ type: Action.RESET_NEW_POST });
    }

    useEffect(() => {
        loadPosts();
    }, []);

    return (
        <div id="post-list">
            {
                posts.map((post) => {
                    return (<PreviewPost
                        key={post.id}
                        title={post.title}
                        author={post.author}
                        category={post.category}
                        date={post.date}
                        count={post.commentCount}
                        id={post.id}
                    />);
                })
            }
            { isLoggedIn ?
            ( <NewPost sendPost={sendPost}/> ) :
            ( <h3>Veuillez vous connecter pour publier</h3>) 
            }
        </div>
    );
};

export default HomePage;
