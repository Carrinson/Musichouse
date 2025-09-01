import { Link } from "react-router-dom";
function Navbar() {

  return (
    <>
    
        <nav className="navbar">
            <div className="logo">
                <h2>Bumper</h2>
            </div>
            <div className="links">
                <ul className="nav-links">
                    <Link className="nav-link" to="/" >Home</Link >
                    <Link className="nav-link"  to="/browse" >Browse</Link >
                    <Link className="nav-link"  to="/stats" >Stats</Link >
                    <Link className="nav-link"  to="/login" >Account</Link >
                </ul>
            </div>
        </nav>
    
    </>
  );
}
export default Navbar;