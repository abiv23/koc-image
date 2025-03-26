'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, User, Upload, Image as ImageIcon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const isLoggedIn = status === 'authenticated';

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <header className="bg-white shadow-sm py-3 px-4 z-10 relative">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 bg-violet-600 rounded-full flex items-center justify-center">
              <Camera className="text-white" size={16} />
            </div>
            <span className="ml-2 font-medium text-gray-800">KoC PhotoShare</span>
          </Link>
          
          {/* Navigation Links - Only show when logged in, now without Account */}
          {isLoggedIn && (
            <nav className="hidden md:flex ml-8 space-x-1">
              <Link 
                href="/upload" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/upload') 
                    ? 'bg-violet-100 text-violet-700' 
                    : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
                }`}
              >
                Upload
              </Link>
              <Link 
                href="/images" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/images') 
                    ? 'bg-violet-100 text-violet-700' 
                    : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
                }`}
              >
                Photos
              </Link>
            </nav>
          )}
        </div>
        
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-violet-600 focus:outline-none"
            >
              <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center mr-2">
                <User className="text-violet-600" size={16} />
              </div>
              <span className="mr-1">{session?.user?.name || 'User'}</span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                {/* Account link now appears in dropdown for all screen sizes */}
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 flex items-center">
                  <Settings className="mr-2" size={16} />
                  Account Settings
                </Link>
                
                {/* Show mobile nav links in dropdown for small screens */}
                <div className="md:hidden">
                  <Link href="/upload" className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 flex items-center">
                    <Upload className="mr-2" size={16} />
                    Upload
                  </Link>
                  <Link href="/images" className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 flex items-center">
                    <ImageIcon className="mr-2" size={16} />
                    Photos
                  </Link>
                </div>
                <hr className="my-1 border-gray-200" />
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 flex items-center"
                >
                  <LogOut className="mr-2" size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="flex items-center text-sm font-medium text-gray-700 hover:text-violet-600">
            <User size={18} className="mr-1" />
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;