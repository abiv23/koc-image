'use client';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white py-4 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto flex justify-center items-center">
        <p className="text-sm text-gray-500">
          © {currentYear} BIV LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;