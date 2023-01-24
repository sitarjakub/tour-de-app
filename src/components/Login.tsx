import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../setup/firebase";

import '../css/login.css';
import { useUser } from "../context/AuthContext";

export interface User{
    email?: string,
    password?: string
}

const Login = () => {
    const[data, setData] = useState<User>({});
    const[error, setError] = useState<string | null>(null);
    const[loading, setLoading] = useState<boolean>(false);
    const {setUser} = useUser();

    const navigate = useNavigate();

    function handleLogin(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setLoading(true);
        if(data.email && data.password){            
            signInWithEmailAndPassword(auth, data.email, data.password)
                .then((userCredential) => {
                    setUser(userCredential.user.uid);
                    navigate('/');
                })
                .catch((err) => {
                    if(err.code === "auth/wrong-password" || err.code === "auth/user-not-found"){
                        setError("Špatné přihlašovací údaje");
                    }else{
                        setError("Chyba serveru");
                    }
                });
        }else{
            setError("Vyplňte všechny pole, prosím");
        }
        setLoading(false);
    }

    function changeData(e:React.ChangeEvent<HTMLInputElement>){
        setData({...data, [e.target.id]: e.target.value});
    }

    return (
        <div className="login">
            <h2>PŘIHLÁŠENÍ</h2>
            <form onSubmit={handleLogin}>
                <label>email</label>
                <input id="email" type="email" onChange={changeData} />
                <label>heslo</label>
                <input id="password" type="password" onChange={changeData} />

                <button type="submit" disabled={loading}>Přihlásit</button>
            </form>
            <p className="login-register-paragraph">Nemáte ještě účet? <Link to={'/register'}>registrace</Link> </p>

            {error && <p className="login-error">{error}</p> }
            {loading && <p className="login-loading">Loading...</p> }
        </div>
    );
}
 
export default Login;