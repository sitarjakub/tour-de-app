import { collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc } from "firebase/firestore";
import {useEffect, useState} from "react";
import { useUser } from "../context/AuthContext";

import '../css/friends.css';
import { db } from "../setup/firebase";

interface FriendsData {
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

    const acceptFriend = async (id:string) => {
        const myDocRef = doc(db, `users/${user}/friends`, id);
        await updateDoc(myDocRef, {
            accepted: true
        });

        const theirsDocRef = doc(db, `users/${id}/friends`, user!);
        await updateDoc(theirsDocRef, {
            accepted: true
        });
    }

    const removeFriend = async (id:string) => {
        const myDocRef = doc(db, `users/${user}/friends`, id);
        await deleteDoc(myDocRef);

        const theirsDocRef = doc(db, `users/${id}/friends`, user!);
        await deleteDoc(theirsDocRef);
    }

    useEffect(() => {

        const q = query(collection(db, `users/${user}/friends`));
        const unsub = onSnapshot(q, (querySnapshot) => {
            let friendsList:Array<FriendsData> = [];
            let friendReqsList:Array<FriendsData> = [];

            querySnapshot.forEach(async (dcmt) => {
                let username:string|null = null;

                const docRef = dcmt.data().from === user ? doc(db, "users", dcmt.data().to) : doc(db, "users", dcmt.data().from);
                const docSnap = await getDoc(docRef).then((res) => {
                    if(res.exists()) {
                        username = res.data().username ? res.data().username : null;
                    }
    
                    const newFriend = {
                        id: dcmt.id,
                        from: dcmt.data().from,
                        to: dcmt.data().to,
                        accepted: dcmt.data().accepted,
                        username: username,
                        date: dcmt.data().date,
                    }                
    
                    if(newFriend.accepted === false && newFriend.from !== user) friendReqsList.push(newFriend);
                    if(newFriend.accepted === true) friendsList.push(newFriend);
                });
            })
            setFriendReqs(friendReqsList);
            setFriends(friendsList);
        });

        return () => {
            unsub()
        }
    }, [])

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
                                    <div className="friends-friend-reqs" key={arg.id}>
                                        {arg.username && <p>{arg.username}</p>}
                                        <p>{arg.from}</p>
                                        <p className="friends-friend-date">{arg.date}</p>
                                        <div className="friend-reqs-btns">
                                            <button onClick={() => {acceptFriend(arg.id)}}>potvrdit</button>
                                            <button onClick={() => {removeFriend(arg.id)}}>odstranit</button>
                                        </div>
                                    </div>
                                );
                            })}

                            {friends.length > 0  && friends.map(arg => {
                                console.log(friends);
                                
                                return(
                                    <div className="friends-friend" key={arg.id}>
                                        <p>{arg.date}</p>
                                        {arg.username && <p>{arg.username}</p>}
                                        {arg.from === user ? <p>{arg.to}</p> : <p>{arg.from}</p>}
                                        <button className="friends-friend-remove" onClick={() => {removeFriend(arg.id)}}>odstranit přítele</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
            </>}
        </div>
    );
}
 
export default Friends;