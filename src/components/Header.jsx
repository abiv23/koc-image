'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, User, Upload, Image as ImageIcon, Settings, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const Header = () => {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const isLoggedIn = status === 'authenticated';
  const isAdmin = session?.user?.isAdmin === true;

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

  const handleLogout = (e) => {
    e.preventDefault();
    console.log("Logout clicked");
    signOut({ redirect: false }).then(() => {
      window.location.href = '/';
    });
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <header className="bg-kocBlue shadow-sm py-3 px-4 z-10 relative border-b-2 border-kocGold">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            {/* Using your logo at /images/logo.webp */}
            <Image
              src="/images/logo.webp"
              alt="KoC PhotoShare Logo"
              width={300}
              height={300}
              className="rounded-full"
            />
          </Link>
          
          {/* Navigation Links - Only show when logged in */}
          {isLoggedIn && (
            <nav className="hidden md:flex ml-8 space-x-1">
              <Link 
                href="/upload" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/upload') 
                    ? 'bg-kocBlue/10 text-kocBlue' 
                    : 'text-gray-600 hover:text-kocBlue hover:bg-kocBlue/5'
                }`}
              >
                Upload
              </Link>
              <Link 
                href="/images" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/images') 
                    ? 'bg-kocBlue/10 text-kocBlue' 
                    : 'text-gray-600 hover:text-kocBlue hover:bg-kocBlue/5'
                }`}
              >
                Photos
              </Link>
              <Link 
                href="/slideshow" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/slideshow') 
                    ? 'bg-kocBlue/10 text-kocBlue' 
                    : 'text-gray-600 hover:text-kocBlue hover:bg-kocBlue/5'
                }`}
              >
                Slideshow
              </Link>
              
              {isAdmin && (
                <Link 
                  href="/admin/approved-emails" 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                    pathname.startsWith('/admin') 
                      ? 'bg-kocRed/10 text-kocRed' 
                      : 'text-gray-600 hover:text-kocRed hover:bg-kocRed/5'
                  }`}
                >
                  <Shield size={16} className="mr-1" /> 
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>
        
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-kocBlue focus:outline-none"
            >
              <div className="h-8 w-8 bg-kocBlue/10 rounded-full flex items-center justify-center mr-2">
                <User className="text-kocBlue" size={16} />
              </div>
              <span className="mr-1">{session?.user?.name || 'User'}</span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-kocBlue/5 hover:text-kocBlue flex items-center">
                  <Settings className="mr-2" size={16} />
                  Account Settings
                </Link>
                
                {isAdmin && (
                  <Link href="/admin/approved-emails" className="block px-4 py-2 text-sm text-gray-700 hover:bg-kocRed/5 hover:text-kocRed flex items-center">
                    <Shield className="mr-2" size={16} />
                    Admin Panel
                  </Link>
                )}
                
                <div className="md:hidden">
                  <Link href="/upload" className="block px-4 py-2 text-sm text-gray-700 hover:bg-kocBlue/5 hover:text-kocBlue flex items-center">
                    <Upload className="mr-2" size={16} />
                    Upload
                  </Link>
                  <Link href="/images" className="block px-4 py-2 text-sm text-gray-700 hover:bg-kocBlue/5 hover:text-kocBlue flex items-center">
                    <ImageIcon className="mr-2" size={16} />
                    Photos
                  </Link>
                  <Link href="/slideshow" className="block px-4 py-2 text-sm text-gray-700 hover:bg-kocBlue/5 hover:text-kocBlue flex items-center">
                    <ImageIcon className="mr-2" size={16} />
                    Slideshow
                  </Link>
                </div>
                
                <hr className="my-1 border-gray-200" />
                
                <a 
                  href="#" 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-kocRed/5 hover:text-kocRed flex items-center"
                >
                  <LogOut className="mr-2" size={16} />
                  Logout
                </a>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="flex items-center text-sm font-medium text-gray-700 hover:text-kocBlue">
            <User size={18} className="mr-1" />
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;