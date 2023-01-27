import { deleteUser, signInWithEmailAndPassword } from "firebase/auth";
import {useState} from "react";
import { useNavigate } from "react-router";
import { useUser } from "../context/AuthContext";
import { auth, db } from "../setup/firebase";
import { User } from "./Login";

import '../css/delete.css';

const DeleteAcc = () => {
    const {setUser} = useUser();

    const [credentials, setCredentials] = useState<User>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string|null>(null);

    const navigate = useNavigate();

    const changeLoggingData = (e:React.ChangeEvent<HTMLInputElement>) =>{
        setCredentials({...credentials, [e.target.id]: e.target.value})
    }

    const deleteAcc = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if(credentials.email && credentials.password){            
            signInWithEmailAndPassword(auth, credentials.email, credentials.password)
                .then(async (userCredential) => {
                    const userRef = userCredential.user;
                    deleteUser(userRef).then(() => {
                        setUser(null);
                        setLoading(false);
                        navigate("/login");
                      }).catch((err) => {
                        console.log(err);
                        
                        setLoading(false);
                        setError("Chyba serveru")
                      });
                })
                .catch((err) => {
                    console.log(err);
                    
                    if(err.code === "auth/wrong-password" || err.code === "auth/user-not-found"){
                        setLoading(false);
                        setError("Špatné přihlašovací údaje");
                    }else{
                        setLoading(false);
                        setError("Chyba serveru");
                    }
                });
        }else{
            setLoading(false);
            setError("Vyplňte všechny pole, prosím");
        }
    }

    return (
        <div className="deleteAcc">
            {loading
                ? <p className="basic-loading">Loading...</p>
                : <form onSubmit={deleteAcc} className="basic-form">
                    <label>email</label>
                    <input id="email" type="email" placeholder="email" onChange={changeLoggingData} />
                    <label>heslo</label>
                    <input id="password" type="password" placeholder="heslo" onChange={changeLoggingData} />
                    <button type="submit">Potvrdit</button>
                    {error && <p className="basic-error">{error}</p> }
            </form>}
        </div>
    );
}
 
export default DeleteAcc;