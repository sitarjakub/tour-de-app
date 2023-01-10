import { useNavigate, useState } from "react";
import { useUser } from "../context/AuthContext";

interface PostData = {
    date?: string,
    time?: string,
    lang?: string,
    score?: string,
    desc?: string,
}

const Home = () => {
    const {user, setUser} = useUser();
    const navigate = useNavigate();
    
    const [addingPost, setAddingPost] = useState<boolean>(false);
    const [postData, setPostData] = useState<PostData>();

    function handleLogout(){
        setUser(null);
        navigate("/login");
    }

    const handleInputChange = (e) => {
        setPostData(prev => {prev, [e.target.id]: e.target.value});
    }
    
    const handleSubmitPost = (e) => {
        e.preventDefault();
    }

    return (
        <div className="home">
            <header>
                { user && <p>{user}</p> }
                <button onClick={handleLogout}>odhlásit</button>
            </header>
            <div className="home-content">
                {addingPost
                    ? <button onClick={() => setAddingPost(true}>Přidat záznam</button>
                    : <form onSubmit={handleSubmitPost}>
                        <label>datum</label>
                        <input id="date" type="date" placeholder="datum" onChange={handleInputChange}/>
                        <label>strávený čas</label>
                        <input id="time" type="text" placeholder="strávený čas"onChange={handleInputChange}/>
                        <label>programovací jazyk</label>
                        <input id="lang" type="text" placeholder="programovací jazyk" onChange={handleInputChange}/>
                        <label>hodnocení</label>
                        <input id="score" type="text" placeholder="hodnocení" onChange={handleInputChange}/>
                        <label>popis</label>
                        <textarea id="desc" type="text" placeholder="popis" onChange={handleInputChange}></textarea>
                    </form>
                }
                <Posts />
            </div>
        </div>
    );
}
 
export default Home;
