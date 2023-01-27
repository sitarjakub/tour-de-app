import { collection, doc, getDoc, onSnapshot, query, setDoc } from "firebase/firestore";
import {useEffect, useState} from "react";
import { useUser } from "../context/AuthContext";

import '../css/friends.css';
import { db } from "../setup/firebase";
import Friend from "./Friend";

export interface FriendsData {
    id: string,
    from: string,
    to: string,
    accepted: boolean,
    username?: string|null,
    date: string,
}

const Friends = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const [addingFriend, setAddingFriend] = useState<boolean>(false);
    const [friendsId, setFriendsId] = useState<string | null>();
    const [addingError, setAddingError] = useState<string | null>(null);

    const [friends, setFriends] = useState<Array<FriendsData>>([]);
    const [friendReqs, setFriendReqs] = useState<Array<FriendsData>>([]);

    const {user} = useUser();

    const handleAddFriend = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if(friendsId){
            const today = new Date();
            const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const reqData = {
                date: date,
                from: user,
                to: friendsId,
                accepted: false,
            }

            await setDoc(doc(db, `users/${friendsId}/friends/${user}`), reqData)
                .then(async () => {
                    await setDoc(doc(db, `users/${user}/friends/${friendsId}`), reqData)
                        .then(() => {
                            setAddingError(null);
                            setAddingFriend(false);
                            setLoading(false);
                        })
                        .catch((err) => {
                            console.log(err);
                            setAddingError("Při přidávání došlo k chybě");
                        });
                })
                .catch((err) => {
                    console.log(err);
                    setAddingError("Při přidávání došlo k chybě");
                });
        }else{
            setAddingError("Vyplňte ID");
            setLoading(false);
        }
    }

    useEffect(() => {
        const q = query(collection(db, `users/${user}/friends`));
        const unsub = onSnapshot(q, (querySnapshot) => {
            let friendsList:Array<FriendsData> = [];
            let friendReqsList:Array<FriendsData> = [];

            querySnapshot.forEach(async (dcmt) => {
                    const newFriend = {
                        id: dcmt.id,
                        from: dcmt.data().from,
                        to: dcmt.data().to,
                        accepted: dcmt.data().accepted,
                        date: dcmt.data().date,
                    }                
    
                    if(newFriend.accepted === false && newFriend.from !== user) friendReqsList.push(newFriend);
                    if(newFriend.accepted === true) friendsList.push(newFriend);
            });
            setFriendReqs(friendReqsList);
            setFriends(friendsList);
        })
        
        return () => {
            unsub()
        }
    }, []);

    

    return (
        <div className="friends">
            {loading
                ? <h1 className="basic-loading">Načítání...</h1>
                : <>
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
                                {addingError && <p className="basic-form-error">{addingError}</p> }
                            </form>
                        }

                        <div className="friends-friends">
                            {friendReqs.length > 0 && friendReqs.map(arg => {
                                return(
                                    <Friend data={arg} req={true} key={arg.id} />
                                );
                            })}

                            {friends.length > 0  && friends.map(arg => {                                
                                return(
                                    <Friend data={arg} req={false} key={arg.id} />
                                );
                            })}
                        </div>
                    </div>
            </>}
        </div>
    );
}
 
export default Friends;