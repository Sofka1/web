import { BrowserRouter, Routes, Route } from "react-router-dom";
import style from './App.css';

import Header from './components/Header/Header';
import Main from './components/Main/Main';
import Services from './components/Services/Services';
import Footer from './components/Footer/Footer';
import OneServices from './components/OneServices/OneServices';
import Registration from './components/Registration/Registration';
import Login from './components/Login/Login';
import BookingPage from './components/BookingPage/BookingPage';
import UserPage from './components/UserPage/UserPage';
import AdminPage from './components/AdminPage/AdminPage'; 
import Articles from './components/Articles/Articles';
const App = () => {
  return (
    <div className={style.app}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/main' element={<Main />} />
          <Route path='/services' element={<Services />} />
          <Route path='/service/:id' element={<OneServices />} />
          <Route path='/registration' element={<Registration />} />
          <Route path='/login' element={<Login />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path='/userPage/:id' element={<UserPage/>}/>
          <Route path='/adminPage/:id' element={<AdminPage/>}/>
          <Route path='/articles/:id' element={<Articles/>}/>
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}
export default App;
