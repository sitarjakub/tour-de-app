import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../setup/firebase";

import '../css/register.css';
import { useUser } from "../context/AuthContext";

interface User{
    email?: string,
    password?: string,
    confirmpassword?: string
}

const Login = () => {
    const[data, setData] = useState<User>({});
    const[error, setError] = useState<string | null>(null);
    const[loading, setLoading] = useState<boolean>(false);
    const {setUser} = useUser();

    const navigate = useNavigate();

    function handleRegister(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setLoading(true);
        if(data.email && data.password && data.confirmpassword){   
            if(data.password == data.confirmpassword)    {
                createUserWithEmailAndPassword(auth, data.email, data.password)
                .then((userCredential) => {
                    setUser(userCredential.user.uid);
                    navigate('/');
                })
                .catch((err) => {
                    if(err.code === "auth/wrong-email" || err.code === "auth/user-not-found"){
                        setError("Špatné přihlašovací údaje");
                    }else{
                        setError("Chyba serveru");
                    }
                    if (err.code == "auth/email-already-in-use"){
                        setError("Email je již zaregistrovaný");
                    }
                    if (err.code == "auth/weak-password"){
                        setError("Heslo je příliš krátké, musí mít alespoň 6 znaků");
                    }
                });
            } 
            else{
                setError("Hesla se neshodují :((");
            }    

                

                
        }else{
            setError("Vyplňte všechny pole, prosím");
        }
        setLoading(false);
    }

    function changeData(e:React.ChangeEvent<HTMLInputElement>){
        setData({...data, [e.target.id]: e.target.value});
    }

    return (
        <div className="register">
            <h2>REGISTRACE</h2>
            <form onSubmit={handleRegister}>
                <label>email</label>
                <input id="email" type="email" onChange={changeData} />
                <label>heslo</label>
                <input id="password" type="password" onChange={changeData} />
                <label>potvrďte heslo</label>
                <input id="confirmpassword" type="password" onChange={changeData} />

                <button type="submit" disabled={loading}>Registrovat se</button>
            </form>
            <p className="register-login-paragraph">Máte účet? <Link to={'/login'}>přihlášení</Link> </p>

            {error && <p className="register-error">{error}</p> }
            {loading && <p className="register-loading">Loading...</p> }
        </div>
    );
}
 
export default Login;