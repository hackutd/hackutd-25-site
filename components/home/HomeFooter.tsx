import React, { useState } from 'react';
import Link from 'next/link';
import { RequestHelper } from '@/lib/request-helper';

export default function HomeFooter() {
  const [userEmail, setUserEmail] = useState<string>('');
  const handleSubmitEmail = async (userEmail: string) => {
    const res = await RequestHelper.post<{ userEmail: string }, unknown>(
      '/api/email',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        userEmail,
      },
    );
    if (res.status === 200) {
      alert('Your email has been added to our mailing list');
    } else {
      alert('Something is wrong... please try again later');
    }
  };

  return (
    <section
      className="md:text-base text-xs bg-gradient-to-br from-purple-900/95 to-purple-950/95 backdrop-blur-sm border-t border-purple-700/50 py-10 font-dmSans"
      style={{ color: '#EABF73' }}
    >
      <div className="container mx-auto flex flex-wrap justify-between items-start">
        {/* HackUTD Section */}
        <div className="flex-1 p-4">
          <h1 className="font-bold text-2xl">HackPortal</h1>
          <p style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}>
            Contact Us
          </p>

          {/* Social Media Links */}
          <div className="flex space-x-4 mt-4">
            <a href="https://instagram.com/hackutd" target="_blank" rel="noopener noreferrer">
              <img src="/assets/instagram.png" alt="Instagram" className="w-7 h-7" />
            </a>
            <a
              href="https://linkedin.com/company/hackutd"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/assets/linkedin.png" alt="LinkedIn" className="w-6 h-6" />
            </a>
            <a href="mailto:hello@hackutd.co">
              <img src="/assets/gmail.png" alt="Email" className="w-7 h-7" />
            </a>
          </div>
        </div>

        {/* Other Hackathons Section */}
        <div className="flex-1 p-4">
          <h1 className="font-bold text-2xl">Other Hackathons</h1>
          <p
            className="underline mt-1 font-medium"
            style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
          >
            <Link href="https://www.wehackutd.com" passHref>
              WEHack
            </Link>
          </p>
          <p
            className="underline mt-1 font-medium"
            style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
          >
            <Link href="https://hacktx.com" passHref>
              HackTX
            </Link>
          </p>
          <p
            className="underline mt-1 font-medium"
            style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
          >
            <Link href="https://tamuhack.org" passHref>
              TAMUHack
            </Link>
          </p>
          <p
            className="underline mt-1 font-medium"
            style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
          >
            <Link href="https://www.hackuta.org" passHref>
              HackUTA
            </Link>
          </p>
          <p
            className="underline mt-1 font-medium"
            style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
          >
            <Link href="https://www.unthackathon.com" passHref>
              HackUNT
            </Link>
          </p>
          <p
            className="underline mt-1 font-medium"
            style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
          >
            <Link href="https://rowdyhacks.org" passHref>
              RowdyHacks
            </Link>
          </p>
        </div>

        {/* Learn More Section */}
        <div className="flex-1 p-4">
          <h1 className="font-semibold text-xl mb-3">Learn more</h1>
          <div className="font-light">
            <p
              className="mb-2"
              style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
            >
              Check out HackUTD’s{' '}
              <span
                className="font-semibold cursor-pointer underline"
                style={{ textUnderlineOffset: '2px' }}
              >
                <Link href="https://hackutd.co/" target="_blank">
                  organizer website
                </Link>
              </span>
            </p>
            <p className="mb-2">
              Designed by{' '}
              <span
                className="font-semibold"
                style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
              >
                HackUTD
              </span>
            </p>
            <p className="mb-2">
              HackPortal developed with {'<3'}{' '}
              <span
                className="font-semibold"
                style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
              >
                HackUTD{' '}
              </span>
              and{' '}
              <span
                className="font-semibold"
                style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
              >
                ACM Development
              </span>
            </p>
            <Link target="_blank" href="https://github.com/acmutd/hackportal">
              <p
                className="cursor-pointer mb-2 underline"
                style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', textUnderlineOffset: '2px' }}
              >
                Source Code
              </p>
            </Link>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="flex-1 p-4 max-w-sm">
          <h1 className="font-semibold text-xl mb-3">Follow our Newsletter</h1>
          {/* Wrap input and button in a container */}
          <div className="flex flex-col gap-4">
            <input
              className="border-0 rounded p-2 bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/40 focus:outline-none transition-colors"
              style={{ color: '#EABF73' }}
              placeholder="Email"
              type="text"
              name="email"
              id="contact-us"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <button
              onClick={async () => {
                await handleSubmitEmail(userEmail);
              }}
              className="mb-10 md:mb-0 w-full rounded-lg px-6 py-2 bg-purple-600 hover:bg-purple-700 transition-colors border border-purple-500/50"
              style={{ color: '#EABF73' }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
      {/* Copyright Notice */}
      <div className="absolute bottom-0 w-full text-center py-2 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <p style={{ color: '#EABF73' }}>All Copyrights are reserved by HackUTD &lt;3</p>
      </div>
    </section>
  );
}
