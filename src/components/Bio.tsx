import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useUser } from "../context/AuthContext";
import { db } from "../setup/firebase";

const Bio = () => {
    const {user} = useUser();
    const [username, setUsername] = useState<string|null>(null);

    const [editing, setEditing] = useState<boolean>(false);
    const [newUsername, setNewUsername] = useState<string>("");

    const changeUsername = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(user && newUsername && newUsername !== ""){
            await setDoc(doc(db, `users`, user), {
                username: newUsername,
            });
        }

        setEditing(false);
    }

    useEffect(() => {
        if(user){
            const unsub = onSnapshot(doc(db, `users`, user), (doc) => {
                const data = doc.data();
                if(data && data.username){
                    setUsername(data.username);
                    setNewUsername(data.username);
                }else{
                    setUsername(null);
                }
            });

            return() => {
                unsub();
            }
        }
    }, [])

    return (
        <div className="bio">
            {username && editing === false
                ? <div className="bio-view">
                    <p>{username}</p>
                    <button onClick={() => setEditing(true)}><div></div></button>
                </div> : <form onSubmit={changeUsername}>
                    <label>uživatelské jméno</label>
                    <div className="bio-inputs">
                        <input type="text" placeholder="uživatelské jméno" value={newUsername} onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                            setNewUsername(e.target.value)
                        }} />
                        <button type="submit"><div></div></button>
                    </div>
                </form>
            }
            
        </div>
    );
}
 
export default Bio;