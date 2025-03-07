"use client";

import Link from 'next/link';
import { FaTwitter, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold trumpify text-[var(--gold)]">PRESIDENTIAL ROAST</h3>
            <p className="mt-2 text-gray-400 text-sm">
              The most tremendous roasts in the history of roasting, maybe ever!
            </p>
          </div>
          
          <div className="flex gap-8">
            <div>
              <h4 className="text-lg font-bold mb-2">Links</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#roast-form" className="text-gray-400 hover:text-white transition-colors">
                    Get Roasted
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-2">Connect</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://twitter.com/presidential-roast" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#1DA1F2] transition-colors"
                >
                  <FaTwitter size={24} />
                </a>
                <a 
                  href="https://github.com/theantideather/presidential-roast" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaGithub size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Presidential Roast. All rights reserved.
          </p>
          <p className="mt-1">
            This is a parody website not affiliated with any political figure. For entertainment purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
} 