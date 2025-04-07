'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-kocBlue text-white py-6 px-4 border-t-4 border-kocGold">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Shield className="text-kocGold mr-2" size={20} />
            <span className="font-medium">Knights of Columbus</span>
            <span className="mx-2 text-blue-300">|</span>
            <span className="text-sm text-blue-100">Arvada Council #14577</span>
          </div>
          
          <div className="text-blue-100 text-sm">
            <p>© {currentYear} Knights of Columbus. All rights reserved.</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-700/50 flex flex-col md:flex-row justify-center md:justify-between items-center text-sm text-blue-100">
          <div className="mb-2 md:mb-0">
            <Link href="https://www.kofc.org" className="hover:text-kocGold transition-colors" target="_blank" rel="noopener noreferrer">
              Knights of Columbus Official Website
            </Link>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="hover:text-kocGold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-kocGold transition-colors">
              Terms of Use
            </Link>
            <Link href="/contact" className="hover:text-kocGold transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;