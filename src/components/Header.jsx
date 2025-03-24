'use client';

import Link from 'next/link';
import { Camera, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-3 px-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Replace with your actual logo */}
          <div className="h-8 w-8 bg-violet-600 rounded-full flex items-center justify-center">
            <Camera className="text-white" size={16} />
          </div>
          <span className="ml-2 font-medium text-gray-800">KoC PhotoShare</span>
        </div>
        
        <Link href="/login" className="flex items-center text-sm font-medium text-gray-700 hover:text-violet-600">
          <User size={18} className="mr-1" />
          Login
        </Link>
      </div>
    </header>
  );
};

export default Header;