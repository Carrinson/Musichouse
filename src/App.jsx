import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
} from "react-bootstrap";
import { useState, useEffect } from "react"
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import Browse from "./pages/Browse";
import Login from "./pages/Login";
import { Links, Routes, Route } from "react-router-dom";

function App() {


  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/login" element={<Login/>} ></Route>
        <Route path="/browse" element={<Browse/>}/>
      </Routes>
    </>
  );
}

export default App;