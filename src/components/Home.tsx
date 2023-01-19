import { useState, useEffect } from "react";
import { useUser } from "../context/AuthContext";
import { db } from "../setup/firebase";

import '../css/home.css';
import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc } from "firebase/firestore";
import Post from "./Post";
import Bio from "./Bio";

interface PostData {
    date?: string,
    time?: number,
    lang?: string,
    score?: number,
    desc?: string,
    category?: string,
    friend?: string,
}
export interface Data {
    id: string,
    date?: string,
    time?: number,
    lang?: string,
    score?: number,
    desc?: string,
    category?: string,
    friend?: string,
}
export interface Filters {
    dateFrom?: string,
    dateTo?: string,
    time?: number,
    lang?: string,
    scoreFrom?: number,
    scoreTo?: number,
}

const Home = () => {
    const {user} = useUser();
    
    const [loading, setLoading] = useState<boolean>(false);

    const [addingPost, setAddingPost] = useState<boolean>(false);
    const [addingError, setAddingError] = useState<string|null>(null);
    const [postData, setPostData] = useState<PostData>();

    const [posts, setPosts] = useState<Array<Data>>([]);
    const [categories, setCategories] = useState<Array<string>>([]);
    const [friends, setFriends] = useState<Array<string>>([]);

    const [hideFilters, setHideFilters] = useState<boolean>(true);
    const [filters, setFilters] = useState<Filters>({});
    const [sortBy, setSortBy] = useState<"date" | "time" | "lang" | "score">("date");

    const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLTextAreaElement>|React.ChangeEvent<HTMLSelectElement>) => {
        setPostData({...postData, [e.target.id]: e.target.value});
    }

    const handleFiltersChange = (e:React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({...filters, [e.target.id]: e.target.value});
    }

    const handleSortChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
        if(e.target.value === "date"
            || e.target.value === "time"
            || e.target.value === "lang"
            || e.target.value === "score") setSortBy(e.target.value);
    }
    
    const handleSubmitPost = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if(!postData?.score || (postData.score > 0 && postData.score < 5)){
            const today = new Date();
            const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const unique = Date.now();

            if(postData?.category && postData.category === "") setPostData({...postData, category: undefined});
            if(postData?.friend && postData.friend === "") setPostData({...postData, friend: undefined});

            await setDoc(doc(db, `users/${user}/posts/${date+"-"+unique}`), postData)
                .then(() => {
                    setAddingError(null);
                    setAddingPost(false);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setAddingError("Při ukládání došlo k chybě");
                });
        }else{
            setAddingError("Skóre musí být od 0 do 5");
            setLoading(false);
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
        

        async function getFriends() {
            const querySnapshot = await getDocs(collection(db, `users/${user}/friends`));
            const friendsList:Array<string> = [];
            querySnapshot.forEach(async (dcmt) => {
                const friendsId = dcmt.data().from === user ? dcmt.data().to : dcmt.data().from;
                let formatedFriend = friendsId;

                const friendRef = dcmt.data().from === user ? doc(db, "users", dcmt.data().to) : doc(db, "users", dcmt.data().from);
                const friendSnap = await getDoc(friendRef);

                if (friendSnap.exists()) {
                    if(friendSnap.data().username){
                        formatedFriend = friendSnap.data().username + " - " + formatedFriend;
                    }
                }else{
                    console.error("Nepodařilo se načíst kamarádovi data");
                }

                friendsList.push(formatedFriend);
            });
            setFriends(friendsList);
        }
        getFriends();

        const q = query(collection(db, `users/${user}/posts`));
        const unsub = onSnapshot(q, (querySnapshot) => {
            function compare(a:Data, b:Data){
                if(!b){
                    return 1;
                }
                if(!a){
                    return -1;
                }

                if(a[sortBy] && b[sortBy]){
                    if(a[sortBy]! < b[sortBy]!) return 1;
                    if(a[sortBy]! > b[sortBy]!) return -1;
                    return 0;
                }else{
                    return 0;
                }
            }

            let postList:Array<Data>|null = [];
            querySnapshot.forEach((doc) => {
                const newPost = {
                    id: doc.id,
                    date: doc.data().date,
                    friend: doc.data().friend,
                    category: doc.data().category,
                    lang: doc.data().lang,
                    desc: doc.data().desc,

                    ...doc.data().time
                        ? { time: parseFloat(doc.data().time) }
                        : {},

                    ...doc.data().score
                        ? { score: parseFloat(doc.data().score) }
                        : {}
                }

                let suitsFilters = true;
                if(filters.dateFrom){
                    if(newPost.date < filters.dateFrom) suitsFilters = false;
                }
                if(filters.dateTo){
                    if(newPost.date > filters.dateTo) suitsFilters = false;
                }
                if(filters.time){
                    if(newPost.time !== filters.time) suitsFilters = false;
                }
                if(filters.lang){
                    if(newPost.lang !== filters.lang) suitsFilters = false;
                }
                if(filters.scoreFrom){
                    if(newPost.score && newPost.score < filters.scoreFrom) suitsFilters = false;
                    if(!newPost.score) suitsFilters = false;
                }
                if(filters.scoreTo){
                    if(newPost.score && newPost.score > filters.scoreTo) suitsFilters = false;
                    if(!newPost.score) suitsFilters = false;
                }

                if(suitsFilters) postList ? postList.push(newPost) : postList = [newPost];
            });

            postList.sort( compare );
            setPosts(postList);
        });

        return () => {
            unsub()
        }
    }, [filters, sortBy])

    return (
        <div className="home">
            {loading
                ? <h1 className="basic-loading">Načítání...</h1>
                : <>
                <div className="home-content">
                    <Bio />
                    
                    {addingPost === false
                        ? <button onClick={() => setAddingPost(true)} className="add-post-btn">Přidat záznam</button>
                        : <form onSubmit={handleSubmitPost} className="basic-form add-post-form">
                            <button className="basic-form-close" onClick={() => {
                                setAddingError(null);
                                setAddingPost(false);
                            }}></button>

                            <h3>Přidat záznam</h3>
                            <label>datum</label>
                            <input id="date" type="date" placeholder="2.5.2022" onChange={handleInputChange}/>

                            {friends.length > 0 && <>
                                <label>další programátor</label>
                                <select id="friend" onChange={handleInputChange}>
                                    <option value=""></option>
                                    {friends.map((arg, i) => {
                                        return(
                                            <option value={arg} key={i}>{arg}</option>
                                        );
                                    })}
                                </select>
                            </>}
                            
                            {categories.length > 0 && <>
                                <label>kategorie</label>
                                <select id="category" onChange={handleInputChange}>
                                    <option value=""></option>
                                    {categories.map((arg, i) => {
                                        return(
                                            <option value={arg} key={i}>{arg}</option>
                                        );
                                    })}
                                </select>
                            </>}

                            <label>strávený čas (v hodinách)</label>
                            <input id="time" type="number" step="any" placeholder="2.5" onChange={handleInputChange}/>
                            <label>programovací jazyk</label>
                            <input id="lang" type="text" placeholder="python" onChange={handleInputChange}/>
                             <label>hodnocení (z 5)</label>
                            <input id="score" type="number" step="any" placeholder="3.2" onChange={handleInputChange}/>
                            <label>popis</label>
                            <textarea id="desc" placeholder="popis" onChange={handleInputChange}></textarea>
                            <button type="submit" >přidat</button>
                            {addingError && <p className="basic-form-error">{addingError}</p> }
                        </form>
                    }
                    

                    {posts.length > 0 ? <div className="posts">
                        <>
                            <button
                                className="posts-hide-filters"
                                style={{ backgroundColor: hideFilters ? "#ddd" : "#231676", }}
                                onClick={() => setHideFilters(prev => !prev)
                            }><div style={{ backgroundColor: hideFilters ? "#000" : "#ddd", }}></div></button>
                            {hideFilters === false
                                && <div className="posts-filters">
                                    <h4>Filtrování</h4>

                                    <div className="posts-filters-flex">
                                        <div>
                                            <label>nejstarší datum:</label>
                                            <input type="date" id="dateFrom" placeholder="datum od" onChange={handleFiltersChange} value={filters.dateFrom} />
                                        </div>
                                        <div>
                                            <label>nejnovější datum:</label>
                                            <input type="date" id="dateTo" placeholder="datum do" onChange={handleFiltersChange} value={filters.dateTo} />
                                        </div>

                                        <div>
                                            <label>časový interval:</label>
                                            <input type="number" step="any" id="time" placeholder="strávený čas" onChange={handleFiltersChange}  value={filters.time} />
                                        </div>

                                        <div>
                                            <label>programovací jazyk:</label>
                                            <input type="text" id="lang" placeholder="programovací jazyk" onChange={handleFiltersChange} value={filters.lang} />
                                        </div>

                                        <div>
                                            <label>nejmenší hodnocení:</label>
                                            <input type="number" step="any" id="scoreFrom" placeholder="hodnocení od" onChange={handleFiltersChange} value={filters.scoreFrom} />
                                        </div>
                                        <div>
                                            <label>nejvyšší hodnocení:</label>
                                            <input type="number" step="any" id="scoreTo" placeholder="hodnocení do" onChange={handleFiltersChange} value={filters.scoreTo} />
                                        </div>

                                        <div>
                                            <label>seřadit podle:</label>
                                            <select onChange={handleSortChange} defaultValue={sortBy}>
                                                <option value="date">datumu</option>
                                                <option value="time">stráveného času</option>
                                                <option value="lang">programovacího jazyka</option>
                                                <option value="score">hodnocení</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button onClick={() => {
                                            setFilters({});
                                            setHideFilters(true);
                                        }} className="post-filters-cancel" >Zrušit filtry</button>
                                </div>
                            }
                            {posts.map((arg) => {                                
                                return(
                                    <Post key={arg.id} data={arg} />
                                )
                            })}
                        </>
                    </div>:<p className="home-no-posts">Žádné příspěvky k zobrazení</p>}
                </div>
            </>}
        </div>
    );
}
 
export default Home;
