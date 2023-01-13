import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useUser } from "../context/AuthContext";
import { db } from "../setup/firebase";
import { Data } from "./Home";

const Post: React.FC<{ data: Data }> = ({data}) => {
    const {user} = useUser();

    const [editing, setEditing] = useState<boolean>(false);
    const [editedData, setEditedData] = useState<Data>(data);
    const [editingError, setEditingError] = useState<string|null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const deletePost = async () => {
        setLoading(true);
        await deleteDoc(doc(db, `users/${user}/posts`, data.id))
            .then(() => {
                setLoading(false);
                alert("Příspěvek smazán");
            })
            .catch(() => {
                setLoading(false);
                setEditingError("Při mazání příspěvku došlo k chybě");
            });
    }

    const updatePost = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        const docRef = doc(db, `users/${user}/posts`, data.id);
        await updateDoc(docRef, {
            date: editedData.date,
            time: editedData.time,
            lang: editedData.lang,
            score: editedData.score,
            desc: editedData.desc,
        })
            .then(() => {
                setLoading(false);
                alert("Příspěvek upraven");
            })
            .catch(() => {
                setLoading(false);
                setEditingError("Při upravovaní příspěvku došlo k chybě");
            });
    }

    const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedData({...editedData, [e.target.id]: e.target.value});
    }

    return (
        <div className="posts-post">
            {loading
                ? <h1 className="posts-post-loading">Načítání...</h1>
                : <>
                    {editing
                        ? <form className="basic-form posts-post-editing" onSubmit={updatePost}>
                            <button className="basic-form-close" onClick={() => {
                                    setEditingError(null);
                                    setEditedData(data);
                                    setEditing(false);
                                }}></button>

                            <h3>Upravit záznam</h3>
                            <label>datum</label>
                            <input id="date" type="date" placeholder="2.5.2022" onChange={handleInputChange} value={editedData.date} />
                            <label>strávený čas (v hodinách)</label>
                            <input id="time" type="number" step="any" placeholder="2.5" onChange={handleInputChange} value={editedData.time}/>
                            <label>programovací jazyk</label>
                            <input id="lang" type="text" placeholder="python" onChange={handleInputChange} value={editedData.lang}/>
                            <label>hodnocení (z 5)</label>
                            <input id="score" type="number" step="any" placeholder="3.2" onChange={handleInputChange} value={editedData.score}/>
                            <label>popis</label>
                            <textarea id="desc" placeholder="popis" onChange={handleInputChange} value={editedData.desc}></textarea>
                            <button type="submit" >uložit</button>
                            <p className="posts-post-delete" onClick={deletePost}>smazat</p>
                            {editingError && <p className="basic-form-error">{editingError}</p> }
                        </form> : <>
                            <button className="posts-post-edit" onClick={() => setEditing(true)}>...</button>
                            <p>{data.date}</p>
                            {data.time && <p>Strávený čas: {data.time}</p>}
                            {data.lang && <p>Programovací jazyk: {data.lang}</p>}
                            <p>{data.desc}</p>
                            <p>{data.score}</p>
                        </>
                    }
                </>
            }
        </div>
    );
}
 
export default Post;