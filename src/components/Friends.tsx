import {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/AuthContext";

import '../css/friends.css';

const Friends = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const [addingFriend, setAddingFriend] = useState<boolean>(false);
    const [friendsId, setFriendsId] = useState<string | null>();
    const [addingError, setAddingError] = useState<string | null>(null);

    const {user, setUser} = useUser();
    const navigate = useNavigate();

    function handleLogout() {
        setUser(null);
        navigate("/login");
    }

    const handleAddFriend = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }

    return (
        <div className="friends">
            {loading
                ? <h1 className="basic-loading">Načítání...</h1>
                : <>
                    <header>
                        <Link to={"/"}>Domů</Link>
                        <Link to={"/friends"}>Přátelé</Link>
                        <button onClick={handleLogout} className="sign-out-btn">odhlásit</button>
                    </header>
                    <div className="friends-content">
                        {addingFriend === false
                            ? <button onClick={() => setAddingFriend(true)} className="add-friend-btn">Přidat přítele</button>
                            : <form  onSubmit={handleAddFriend} className="basic-form add-friend-form">
                                <button className="basic-form-close" onClick={() => {
                                    setAddingError(null);
                                    setAddingFriend(false);
                                }}></button>

                                <h3>Přidat přítele</h3>
                                <p>Vaše id: <strong>{user}</strong></p>
                                <label>ID vašeho přítele</label>
                                <input type="text" placeholder="ID druhého programátora" onChange={(e:React.ChangeEvent<HTMLInputElement>) => setFriendsId(e.target.value)} />
                                <button type="submit">Odeslat žádost</button>
                            </form>
                        }
                    </div>
            </>}
        </div>
    );
}
 
export default Friends;