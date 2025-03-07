import { GeistSans, GeistMono } from 'geist/font';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

export const metadata = {
  title: 'Presidential Roast',
  description: 'Get roasted by the most powerful AI in the world!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {children}
        <ToastContainer position="bottom-right" />
      </body>
    </html>
  );
}
