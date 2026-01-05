import { DispatchContext, ModalContext } from '../contexts/context';
import { useContext } from 'react';
import { Action } from '../utils/constants';
import '../assets/css/components/loginComponent.css';

const LoginComponent = () => {
    const dispatch = useContext(DispatchContext);
    const setModal = useContext(ModalContext);

    const changePseudo = async (formData) => {
        const pseudo = formData.get('pseudo');
        dispatch({
            type: Action.LOGIN,
            pseudo: pseudo,
        });
        setModal(false);
    };

    return (
        <form action={changePseudo} id="login">
            <h3>Veuillez entrer un nom d'utilisateur</h3>
            <input type="text" name="pseudo" />
            <button type="submit">Se connecter</button>
            <button type="button" id="close" onClick={() => setModal(false)}>X</button>
        </form>
    );
};

export default LoginComponent;
