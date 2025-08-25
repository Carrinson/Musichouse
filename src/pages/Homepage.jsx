import { Link } from "react-router-dom";

function Homepage(){
    return(
        <>
            <div className="bg-img">

            </div>
            <div className="title">
                <div className="home-btn">
                    <button>
                        Sign-UP!
                    </button>
                    <button>
                        <Link className="nav-link" to="/browse" >Use Us!</Link>
                    
                    </button>
                </div>

            </div>
        </>
    )
 }
 export default Homepage;