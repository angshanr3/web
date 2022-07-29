import React, { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom';
//import { SidebarData } from './SidebarData';
import './Navbar.css';
//import { IconContext } from 'react-icons';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      
        <div className='navbar'>
          <Link to='#' className='menu-bars'>
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          
          <ul className='nav-menu-items' onClick={showSidebar}>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars'>
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            
            <h2 className='menu-text' >Menu</h2>
            <li className='nav-text'><Link to="/">PSH 開線輔助決策系統</Link></li>
            <li className='nav-text'><Link to="/rundata">PSH Run Data 輔助決策系統</Link></li>
            <li className='nav-text'><Link to="/predict">PSH VM 輔助決策系統</Link></li>
          </ul>
        </nav>
    </>
  );
}

export default Navbar;
