import { Routes, Route, Navigate, Link } from 'react-router-dom';

import './css/index.css';

import Home from './components/Home';
import Login from './components/Login';
import { useUser } from './context/AuthContext';
import Friends from './components/Friends';
import Categories from './components/Categories';
import Register from './components/Register';
import { useState } from 'react';
import DeleteAcc from './components/DeleteAcc';

function App() {
  const {setUser} = useUser();
  const [displaySidebar, setDisplaySidebar] = useState<boolean>(false);

  function RequireAuth({children}:{children:JSX.Element}):JSX.Element {
    const {user, setUser} = useUser();
    return user ?
      <>
        <header>
            <Link to={"/"}>Domů</Link>
            <Link to={"/friends"}>Přátelé</Link>
            <Link to={"/categories"}>Kategorie</Link>
            <button onClick={() => {
              setUser(null);
            }} className="sign-out-btn">odhlásit</button>
            <div className='header-menu' onClick={() => setDisplaySidebar(prev => !prev)}></div>
        </header>

        {displaySidebar
          && <div className="sidebar">
            <Link to={"/"} onClick={() => setDisplaySidebar(false)}>Domů</Link>
            <Link to={"/friends"} onClick={() => setDisplaySidebar(false)}>Přátelé</Link>
            <Link to={"/categories"} onClick={() => setDisplaySidebar(false)}>Kategorie</Link>
            <a onClick={() => {
              setUser(null);
            }}>Odhlásit</a>
          </div>
        }

        {children}
      </> : <Navigate to="/login"/>;
  };

  return (
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<RequireAuth><Home /></RequireAuth>} />
          <Route path='/friends' element={<RequireAuth><Friends /></RequireAuth>} />
          <Route path='/categories' element={<RequireAuth><Categories /></RequireAuth>} />
          <Route path='/delete' element={<RequireAuth><DeleteAcc /></RequireAuth>} />
        </Routes>
  );
}

export default App;
