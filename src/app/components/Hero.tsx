import Link from 'next/link';
import { FaLightbulb, FaFileUpload, FaTwitter, FaBitcoin, FaFire } from 'react-icons/fa';

export default function Hero() {
  return (
    <div className="relative overflow-hidden trump-gradient py-12">
      {/* Background overlay */}
      <div className="absolute inset-0 z-0 opacity-10 bg-repeat" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      
      <div className="relative z-10 px-4 py-10 md:py-16 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="huge-text trumpify mb-6 trump-glow-text">
              GET YOUR IDEAS <span className="text-[var(--maga-red)]">ROASTED</span> BY 
              <br />
              <span className="text-[var(--gold)]">THE GREATEST PRESIDENT</span>
              <br />
              <span className="text-[var(--maga-red)]">OF ALL TIME!</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 font-bold">
              TREMENDOUS roasts. THE BEST roasts. BELIEVE ME! 👐
              <br />
              Upload your SAD resume or FAILING Twitter and get BIGLY rewards!
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link 
                href="#roast-form" 
                className="trump-btn wiggle-on-hover flex items-center"
              >
                <FaFire className="mr-2" />
                ROAST ME NOW!
              </Link>
              
              <Link 
                href="#how-it-works" 
                className="px-6 py-3 border-2 border-[var(--gold)] bg-white text-[var(--maga-red)] font-bold rounded-lg hover:bg-[var(--gold)] hover:text-black transition-colors flex items-center"
              >
                <FaBitcoin className="mr-2" />
                GET FREE TOKENS
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="gold-border rounded-lg overflow-hidden">
              <iframe 
                src="https://giphy.com/embed/26ufj77mgPHLDHgWY" 
                width="100%" 
                height="319" 
                style={{ maxWidth: '480px' }}
                frameBorder="0" 
                className="giphy-embed" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow border-t-4 border-[var(--maga-red)]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--maga-red)] text-white rounded-full mb-4">
              <FaLightbulb className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2 trumpify">YUUGE IDEAS</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Your startup idea is probably SAD and LOW ENERGY! Submit it for a TREMENDOUS roast - SO MUCH WINNING!
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow border-t-4 border-[var(--maga-red)]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--maga-red)] text-white rounded-full mb-4">
              <FaFileUpload className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2 trumpify">SAD RESUMES</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Many people say your resume is a DISASTER! Get it ROASTED by the BEST ROASTER in the HISTORY of roasting!
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow border-t-4 border-[var(--maga-red)]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--maga-red)] text-white rounded-full mb-4">
              <FaTwitter className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2 trumpify">FAKE NEWS TWITTER</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Your Twitter is FAILING and BORING! Let us roast it BIGLY and earn FANTASTIC crypto rewards!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 