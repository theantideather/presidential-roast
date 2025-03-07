import Link from 'next/link';
import { FaTwitter, FaGithub, FaDiscord, FaWallet, FaStar, FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8 border-t-4 border-[var(--maga-red)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span className="trumpify text-[var(--maga-red)]">PRESIDENTIAL</span>
              <span className="trumpify text-[var(--gold)]">ROAST</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 font-bold">
              The MOST TREMENDOUS roasting site EVER CREATED! BELIEVE ME! 👐 
              Get your SAD ideas, TERRIBLE resumes, or FAKE NEWS Twitter roasted BIGLY!
            </p>
            <div className="flex items-center">
              <div className="bg-[var(--gold)] text-black rounded-lg px-2 py-1 text-xs font-bold inline-flex items-center mr-2">
                <FaStar className="mr-1" /> TOP RATED
              </div>
              <div className="bg-green-600 text-white rounded-lg px-2 py-1 text-xs font-bold">
                EXECUTIVE ORDER APPROVED
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 trumpify text-[var(--maga-red)]">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-[var(--maga-red)] font-bold flex items-center">
                  <span className="mr-1">👉</span> HOME
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-[var(--maga-red)] font-bold flex items-center">
                  <span className="mr-1">👉</span> HOW IT WORKS
                </Link>
              </li>
              <li>
                <Link href="#roast-form" className="text-gray-600 dark:text-gray-400 hover:text-[var(--maga-red)] font-bold flex items-center">
                  <span className="mr-1">👉</span> GET ROASTED NOW
                </Link>
              </li>
              <li>
                <Link href="https://phantom.app/" target="_blank" className="text-gray-600 dark:text-gray-400 hover:text-[var(--maga-red)] font-bold flex items-center">
                  <span className="mr-1">👉</span> GET PHANTOM WALLET
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 trumpify text-[var(--maga-red)]">FOLLOW US</h3>
            <div className="flex space-x-4 mb-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-2xl text-[#1DA1F2] hover:opacity-80 transition-opacity">
                <FaTwitter />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-2xl text-gray-700 dark:text-gray-300 hover:opacity-80 transition-opacity">
                <FaGithub />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-2xl text-[#5865F2] hover:opacity-80 transition-opacity">
                <FaDiscord />
              </a>
              <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-2xl text-purple-500 hover:opacity-80 transition-opacity">
                <FaWallet />
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold text-sm">
              Join the MOVEMENT! Follow us for the GREATEST updates!
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center">
          <div className="mb-4 inline-block presidential-gradient p-3 rounded-lg">
            <h4 className="text-xl font-bold text-black trumpify">MAKE ROASTING GREAT AGAIN!</h4>
          </div>
          
          <p className="mb-4 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <span className="mr-2">Built with</span>
            <FaHeart className="text-[var(--maga-red)] mx-1" />
            <span className="mx-1">by</span>
            <a 
              href="https://x.com/omg14doteth?s=21" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold hover:text-[var(--maga-red)] transition-colors flex items-center"
            >
              theantideather
              <FaTwitter className="ml-1 text-[#1DA1F2]" />
            </a>
          </p>
          
          <p className="mb-2 text-gray-600 dark:text-gray-400 text-sm">
            This site is a parody and not affiliated with any political figure or government entity.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Presidential Roast. All rights reserved. THE BEST RIGHTS! NOBODY HAS BETTER RIGHTS THAN WE DO!
          </p>
        </div>
      </div>
    </footer>
  );
} 