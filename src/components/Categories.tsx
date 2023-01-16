import { useState, useEffect } from "react";
import { useUser } from "../context/AuthContext";
import { db } from "../setup/firebase";

import '../css/categories.css';
import { collection, deleteDoc, doc, onSnapshot, query, setDoc } from "firebase/firestore";
import Category from "./Category";

export interface CategoryData {
    id: string,
    name: string,
}

const Categories = () => {
    const { user } = useUser();

    const [loading, setLoading] = useState<boolean>(false);
    const [addingCategory, setAddingCategory] = useState<boolean>(false);

    const [categoryData, setCategoryData] = useState<{name:string} | null>(null);
    const [addingError, setAddingError] = useState<string | null>(null);

    const [categories, setCategories] = useState<Array<CategoryData>|null>(null)

    const handleSubmitCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if(categoryData && categoryData.name) {
            const today = new Date();
            const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const unique = Date.now();

            await setDoc(doc(db, `users/${user}/categories/${date + "-" + unique}`), categoryData)
                .then(() => {
                    setAddingError(null);
                    setAddingCategory(false);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setAddingError("Při ukládání došlo k chybě");
                });
        } else {
            setAddingError("Vyplňte název kategorie");
            setLoading(false);
        }
    }

    useEffect(() => {
        const q = query(collection(db, `users/${user}/categories`));
        const unsub = onSnapshot(q, (querySnapshot) => {
            let categoryList: Array<CategoryData> | null = [];
            querySnapshot.forEach((doc) => {
                const newCategory = {
                    id: doc.id,
                    name: doc.data().name,
                }
                categoryList ? categoryList.push(newCategory) : categoryList = [newCategory];
            });
            setCategories(categoryList);
        });

        return () => {
            unsub()
        }
    }, [])

    return (
        <div className="categories">
            {loading
                ? <h1 className="basic-loading">Načítání...</h1>
                : <>
                    <div className = "categories-content">
                        {addingCategory === false
                            ? <button onClick={() => setAddingCategory(true)} className="add-category-btn">Přidat kategorii</button>
                            : <form onSubmit={handleSubmitCategory} className="basic-form add-category-form">
                                <button className="basic-form-close" onClick={() => {
                                    setAddingError(null);
                                    setAddingCategory(false);
                                }}></button>

                                <h3>Přidat kategorii</h3>
                                <label>název</label>
                                <input id="name" type="text" placeholder="název kategorie" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategoryData({ name: e.target.value })} />
                                <button type="submit" >přidat</button>
                                {addingError && <p className="basic-form-error">{addingError}</p>}
                            </form>
                        }
                        <div className="categories-categories">
                            {categories && categories.map((arg) => {
                                return (
                                    <Category key={arg.id} data={arg} />
                                )
                            })}
                        </div>
                    </div>
                </>
            }
        </div>
    );
}

export default Categories;