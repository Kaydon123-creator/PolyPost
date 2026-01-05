import { ModalContext, DispatchContext, StateContext } from '../contexts/context';
import { useContext } from 'react';
import { Action } from '../utils/constants';

function LoginButton() {
    const setModal = useContext(ModalContext);
    const { pseudo } = useContext(StateContext);
    const dispatch = useContext(DispatchContext);

    const handleClick = () => {
        !pseudo ? setModal(true) : (() => { dispatch({ type: Action.LOGOUT }); })();
    };

    return (
        <div>
            <span>{!pseudo ? "(Anonyme)" : pseudo} </span>
            <button onClick={handleClick}>
                {!pseudo ? "Se connecter" : "Déconnexion"}
            </button>
        </div>
    );
}

export default LoginButton;
