import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/AuthContext";
import { db } from "../setup/firebase";

import '../css/home.css';

interface Category {
    id: string,
    name: string,
}

const Categories = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [addingCategory, setAddingCategory] = useState<boolean>(false);
    const [editingCategories, setEditingCategories] = useState<Array<Category> | null>(null);

    const [categoryData, setCategoryData] = useState<{name:string} | null>(null);
    const [addingError, setAddingError] = useState<string | null>(null);

    const [categories, setCategories] = useState<Array<Category>|null>(null)

    function handleLogout() {
        setUser(null);
        navigate("/login");
    }

    const handleSubmitCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (categoryData?.name) {
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
                    setAddingError("P�i ukl�d�n� do�lo k chyb�");
                });
        } else {
            setAddingError("Vypl�te n�zev kategorie");
            setLoading(false);
        }
    }

    const handleEditCategory = async (id:string) => {
        setLoading(true);
        await deleteDoc(doc(db, `users/${user}/categories`, id))
            .then(() => {
                setLoading(false);
                alert("P��sp�vek smaz�n");
            })
            .catch(() => {
                setLoading(false);
                alert("P�i maz�n� p��sp�vku do�lo k chyb�");
            });
    }

    const handleDeleteCategory = async () => {

    }

    useEffect(() => {
        const q = query(collection(db, `users/${user}/categories`));
        const unsub = onSnapshot(q, (querySnapshot) => {
            let categoryList: Array<Category> | null = [];
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
            {loading === false
                ? <h1 className="basic-loading">Na��t�n�...</h1>
                : <>
                    <header>
                        <button onClick={handleLogout} className="sign-out-btn">odhl�sit</button>
                    </header>
                    <div className = "categories-content">
                        {addingCategory === false
                            ? <button onClick={() => setAddingPost(true)} className="add-category-btn">P�idat kategorii</button>
                            : <form onSubmit={handleSubmitCategory} className="basic-form add-category-form">
                                <button className="basic-form-close" onClick={() => {
                                    setAddingError(null);
                                    setAddingPost(false);
                                }}></button>

                                <h3>P�idat kategorii</h3>
                                <label>n�zev</label>
                                <input id="name" type="text" placeholder="n�zev kategorie" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategoryData({ name: e.target.value })} />
                                <button type="submit" >p�idat</button>
                                {addingError && <p className="basic-form-error">{addingError}</p>}
                            </form>
                        }
                        {categories && categories.map((arg) => {
                            return (
                                <div className="categories-category" key={arg.id}>
                                    {editingCategories.includes(arg.id) ? <input/> : < h5 > { arg.name }</h5>}
                                    <div className="categories-category-btns">
                                        <button className="categories-category-edit" onClick={() => setEditingCategories(prev => [...prev, arg.id])}>edit</button>
                                        <button className="categories-category-delete" onClick={() => handleDeleteCategory(arg.id)}>delete</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            }
        </div>
    );
}

export default Categories;