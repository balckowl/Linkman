import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="bg-[#37AB9D]">
        <div className="container mx-auto flex justify-between h-[30px] items-center">
            <h1><Link to="/" className="text-white font-bold">Linkman</Link></h1>
            <nav>
                <ul className="flex">
                    <li><Link to="/usage" className="text-white">Usage</Link></li>
                </ul>
            </nav>
        </div>
    </header>
  )
}

export default Header