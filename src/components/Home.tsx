import { useUser } from "../context/AuthContext";

const Home = () => {
    const {user, setUser} = useUser();

    function handleLogout(){
        setUser(null);
    }

    return (
        <div className="home">
            { user && <p>{user}</p> }
            <button onClick={handleLogout}>odhlásit</button>
            llll
            bbbb
            pppp
        </div>
    );
}
 
export default Home;