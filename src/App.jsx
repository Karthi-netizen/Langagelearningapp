import UseState from "./Hooks/UseState";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Layout from "./Layout";

function App ()
{
  return(
    
    <>
      <Layout/>
      <Routes>
        <Route path="/" element={<Home />}/>
          <Route path="about" element={<About />} />
          
       
      </Routes>
   
    </>
  )
}

export default App;
