'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, User, Upload, Image as ImageIcon, Settings, LogOut, ChevronDown, Shield, Play } from 'lucide-react';
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
    signOut({ redirect: false }).then(() => {
      window.location.href = '/';
    });
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <header className="bg-[#003DA5] shadow-md py-3 px-4 z-10 relative border-b-2 border-[#FFD100]">
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
          {/* {isLoggedIn && (
            <nav className="hidden md:flex ml-8 space-x-4">
              <Link 
                href="/upload" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/upload') 
                    ? 'bg-white/20 text-[#FFD100] font-semibold' 
                    : 'text-white hover:text-[#FFD100]'
                }`}
              >
                <span className="flex items-center">
                  <Upload className="mr-1.5 h-4 w-4" />
                  Upload
                </span>
              </Link>
              <Link 
                href="/images" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/images') 
                    ? 'bg-white/20 text-[#FFD100] font-semibold' 
                    : 'text-white hover:text-[#FFD100]'
                }`}
              >
                <span className="flex items-center">
                  <ImageIcon className="mr-1.5 h-4 w-4" />
                  Photos
                </span>
              </Link>
              <Link 
                href="/slideshow" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/slideshow') 
                    ? 'bg-white/20 text-[#FFD100] font-semibold' 
                    : 'text-white hover:text-[#FFD100]'
                }`}
              >
                <span className="flex items-center">
                  <Camera className="mr-1.5 h-4 w-4" />
                  Slideshow
                </span>
              </Link> */}
              {isLoggedIn && (
                <nav className="hidden md:flex ml-8 space-x-4">
                  <Link 
                    href="/upload" 
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/upload') 
                        ? 'bg-white/20 text-[#FFD100] font-semibold' 
                        : 'text-white hover:text-[#FFD100]'
                    }`}
                  >
                    <span className="flex items-center">
                      <Upload className="mr-1.5 h-4 w-4" />
                      Upload
                    </span>
                  </Link>
                  <Link 
                    href="/images" 
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/images') 
                        ? 'bg-white/20 text-[#FFD100] font-semibold' 
                        : 'text-white hover:text-[#FFD100]'
                    }`}
                  >
                    <span className="flex items-center">
                      <ImageIcon className="mr-1.5 h-4 w-4" />
                      Photos
                    </span>
                  </Link>
                  <Link 
                    href="/slideshows" 
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/slideshows') 
                        ? 'bg-white/20 text-[#FFD100] font-semibold' 
                        : 'text-white hover:text-[#FFD100]'
                    }`}
                  >
                    <span className="flex items-center">
                      <Play className="mr-1.5 h-4 w-4" />
                      Slideshows
                    </span>
                  </Link>
                  <Link 
                    href="/slideshow" 
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/slideshow') 
                        ? 'bg-white/20 text-[#FFD100] font-semibold' 
                        : 'text-white hover:text-[#FFD100]'
                    }`}
                  >
                    <span className="flex items-center">
                      <Camera className="mr-1.5 h-4 w-4" />
                      Slideshow
                    </span>
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      href="/admin/approved-emails" 
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                        pathname.startsWith('/admin') 
                          ? 'bg-[#FFD100]/90 text-[#003DA5] font-semibold' 
                          : 'text-white hover:text-[#FFD100]'
                      }`}
                    >
                      <Shield className="mr-1.5 h-4 w-4" /> 
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
              className="flex items-center text-sm font-medium text-white hover:text-[#FFD100] focus:outline-none"
            >
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                <User className="text-white" size={16} />
              </div>
              <span className="mr-1">{session?.user?.name || 'User'}</span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#003DA5]/5 hover:text-[#003DA5] flex items-center">
                  <Settings className="mr-2" size={16} />
                  Account Settings
                </Link>
                
                {isAdmin && (
                  <Link href="/admin/approved-emails" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#D80000]/5 hover:text-[#D80000] flex items-center">
                    <Shield className="mr-2" size={16} />
                    Admin Panel
                  </Link>
                )}
                
                <div className="md:hidden">
                  <Link href="/upload" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#003DA5]/5 hover:text-[#003DA5] flex items-center">
                    <Upload className="mr-2" size={16} />
                    Upload
                  </Link>
                  <Link href="/images" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#003DA5]/5 hover:text-[#003DA5] flex items-center">
                    <ImageIcon className="mr-2" size={16} />
                    Photos
                  </Link>
                  <Link href="/slideshow" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#003DA5]/5 hover:text-[#003DA5] flex items-center">
                    <ImageIcon className="mr-2" size={16} />
                    Slideshow
                  </Link>
                </div>
                
                <hr className="my-1 border-gray-200" />
                
                <a 
                  href="#" 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#D80000]/5 hover:text-[#D80000] flex items-center"
                >
                  <LogOut className="mr-2" size={16} />
                  Logout
                </a>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="flex items-center text-sm font-medium text-white hover:text-[#FFD100]">
            <User size={18} className="mr-1" />
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;