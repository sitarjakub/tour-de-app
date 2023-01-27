import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useUser } from "../context/AuthContext";
import { db } from "../setup/firebase";
import { FriendsData } from "./Friends";

const Friend:React.FC<{ data: FriendsData, req: boolean }> = ({data, req}) => {
    const {user} = useUser();

    const [friendsUsername, setFriendsUsername] = useState<string|null>(null);

    const acceptFriend = async () => {
        const myDocRef = doc(db, `users/${user}/friends`, data.id);
        await updateDoc(myDocRef, {
            accepted: true
        });

        const theirsDocRef = doc(db, `users/${data.id}/friends`, user!);
        await updateDoc(theirsDocRef, {
            accepted: true
        });
    }

    const removeFriend = async () => {
        const myDocRef = doc(db, `users/${user}/friends`, data.id);
        await deleteDoc(myDocRef);

        const theirsDocRef = doc(db, `users/${data.id}/friends`, user!);
        await deleteDoc(theirsDocRef);
    }

    useEffect(() => {
        async function getUsername(){
            const docRef = data.from === user ? doc(db, "users", data.to) : doc(db, "users", data.from);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                if(docSnap.data().username){
                    setFriendsUsername(docSnap.data().username);
                }else{
                    setFriendsUsername(null);
                }
            }else{
                console.error("Nepodařilo se načíst kamarádovi data");
            }
        }

        getUsername();
    }, [])
    
    return (
        <div className="friends-friend">
            {req
                ?<>
                    {friendsUsername && <p>{friendsUsername}</p>}
                    <p>{data.from}</p>
                    <p className="friends-friend-date">{data.date}</p>
                    <div className="friend-reqs-btns">
                        <button onClick={acceptFriend}>potvrdit</button>
                        <button onClick={removeFriend}>odstranit</button>
                    </div>
                </>:<>
                    <p>{data.date}</p>
                    {friendsUsername && <p>{friendsUsername}</p>}
                    {data.from === user ? <p>{data.to}</p> : <p>{data.from}</p>}
                    <button className="friends-friend-remove" onClick={removeFriend}>odstranit přítele</button>
                </>
            }
        </div>
    );
}
 
export default Friend;