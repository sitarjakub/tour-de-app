import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useUser } from "../context/AuthContext";
import { db } from "../setup/firebase";
import { Data } from "./Home";

const Post: React.FC<{ data: Data }> = ({data}) => {
    const {user} = useUser();
    const [loading, setLoading] = useState<boolean>(false);

    const [categories, setCategories] = useState<Array<string>>([]);

    const [editing, setEditing] = useState<boolean>(false);
    const [editedData, setEditedData] = useState<Data>(data);
    const [editingError, setEditingError] = useState<string|null>(null);

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
            category: editedData.category,
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

    const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLTextAreaElement>|React.ChangeEvent<HTMLSelectElement>) => {
        setEditedData({...editedData, [e.target.id]: e.target.value});
    }

    const handleCheckboxChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const currentCategories = editedData?.category;

        if(!currentCategories){
            setEditedData({...editedData, category: e.target.id})
        }else{
            let currentCategoriesList = currentCategories.split(',');
            if(currentCategories.includes(e.target.id)){
                currentCategoriesList = currentCategoriesList.filter(element => element !== e.target.id);
                setEditedData({...editedData, category: currentCategoriesList.join()});
            }else{
                currentCategoriesList.push(e.target.id);
                setEditedData({...editedData, category: currentCategoriesList.join()});
            }
        }
    }

    useEffect(() => {
        async function getCategories() {
            const querySnapshot = await getDocs(collection(db, `users/${user}/categories`));
            const categoriesList:Array<string> = [];
            querySnapshot.forEach((doc) => {                
                categoriesList.push(doc.data().name);
            });
            setCategories(categoriesList);
        }
        getCategories();
    }, [])

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
                            {(categories.length > 0 || data.category) && <>
                                <label>kategorie</label>
                                {categories.length > 0 && <>
                                    {data.category && data.category.split(',').map((arg, i) => {
                                        if(!categories.includes(arg)){
                                            return(
                                                <div key={i}>
                                                    <input id={arg} type="checkbox" value={arg} onChange={handleCheckboxChange} checked />
                                                    <label htmlFor={arg}>{arg}</label>
                                                </div>
                                            )
                                        }
                                    })}
                                </>}
                                {categories.map((arg, i) => {
                                    return(
                                        <div key={i}>
                                            <input id={arg} type="checkbox" value={arg} onChange={handleCheckboxChange} checked={data.category?.split(',').includes(arg)} />
                                            <label htmlFor={arg}>{arg}</label>
                                        </div>
                                    );
                                })}
                            </>}
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
                            {data.friend && <p>Další programátor: {data.friend}</p>}
                            {data.category && <p>Kategorie: {data.category}</p>}
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