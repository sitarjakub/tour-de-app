import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useUser } from "../context/AuthContext";
import { db } from "../setup/firebase";
import { CategoryData } from "./Categories";

const Category: React.FC<{ data: CategoryData }> = ({data}) => {
    const {user} = useUser();
    const [loading, setLoading] = useState<boolean>(false);

    const [editing, setEditing] = useState<boolean>(false);
    const [editedData, setEditedData] = useState<CategoryData>(data);

    const handleEditCategory = async () => {
        setLoading(true);
        const docRef = doc(db, `users/${user}/categories`, data.id);
        await updateDoc(docRef, {
            name: editedData.name
        })
            .then(() => {
                setLoading(false);
                setEditing(false);
                alert("Kategorie upravena");
            })
            .catch(() => {
                setLoading(false);
                setEditing(false);
                alert("Při upravování kategorie došlo k chybě");
            });            
    }

    const handleDeleteCategory = async () => {
        const docRef = doc(db, `users/${user}/categories`, data.id);
        await deleteDoc(docRef).then(() => alert("Kategorie smazána"));
    }

    return (
        <div className="categories-category">
            {editing === false
                ? <>
                    <p>{data.name}</p>
                    <div className="categories-category-btns">
                        <button onClick={() => setEditing(true)}>upravit</button>
                        <button onClick={handleDeleteCategory}>odstranit</button>
                    </div>
                </>
                : <>
                    <input type="text" value={editedData.name} onChange={(e) => setEditedData({...editedData, name: e.target.value})} /> 
                    <div className="categories-category-btns">
                        <button onClick={handleEditCategory}>hotovo</button>
                        <button onClick={handleDeleteCategory}>odstranit</button>
                    </div>
                </>}
        </div>
    );
}
 
export default Category;