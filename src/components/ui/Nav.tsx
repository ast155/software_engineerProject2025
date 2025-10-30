"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { signIn, signOut, useSession, getProviders } from 'next-auth/react';

const Nav = () => {
  const isUserLoggedIn = true;

  type Provider = { id: string; name: string };
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const [toggleDropdown, setToggleDropdown] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = (await getProviders()) as Record<string, Provider> | null;
        setProviders(response);
      } catch (err) {
        console.error('Error fetching providers', err);
      }
    };

    fetchProviders();
  }, []);

  return (
    <nav className="flex items-center justify-between w-full pt-5 pb-3 pr-4 sm:pt-8 sm:pr-8">
      {/* Logo */}
      <Link href='/' className="flex gap-2 items-center">
        <Image 
          src="/next.svg" 
          alt="Logo" 
          width={120} 
          height={24} 
          className="object-contain"
          priority
        />
        <p className="logo_text font-cursive text-4xl bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400 bg-clip-text text-transparent leading-none tracking-tight">
          EVENT PLANNER
        </p>
      </Link>

      {/* Desktop navigation */}
      <div className="sm:flex hidden items-center gap-3 md:gap-5">
        {isUserLoggedIn ? (
          <>
            {/* Planner / Account buttons */}
            <Link
              href="/create-prompt"
              className='rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-sm'>
              Planner
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="outline_btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Account
            </button>

            {/* Log In / Sign Up buttons */}
            <Link href="/login">
              <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white">
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white">
                Sign Up
              </button>
            </Link>
          </>
        ) : (
          <>
            {providers &&
              Object.values(providers).map((provider) => (
                <button
                  type="button"
                  key={provider.id}
                  onClick={() => signIn(provider.id)}
                  className="black_btn"
                >
                  Sign in with {provider.name}
                </button>
              ))}
          </>
        )}
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden flex relative">
        {isUserLoggedIn ? (
          <div className="flex">
            <button
              type="button"
              onClick={() => setToggleDropdown((prev) => !prev)}
              className="p-0 bg-transparent border-0"
              aria-expanded={toggleDropdown}
              aria-label="Profile menu"
            >
              <Image
                src="/next.svg"
                width={37}
                height={37}
                className="rounded-full"
                alt="profile"
              />
            </button>

            {toggleDropdown && (
              <div className="dropdown">
                <Link href="/profile" className="dropdown_link" onClick={() => setToggleDropdown(false)}>Profile</Link>
                <Link href="/create-prompt" className="dropdown_link" onClick={() => setToggleDropdown(false)}>Planner</Link>
                <Link href="/login" className="dropdown_link" onClick={() => setToggleDropdown(false)}>Log In</Link>
                <Link href="/signup" className="dropdown_link" onClick={() => setToggleDropdown(false)}>Sign Up</Link>
                <button
                  type="button"
                  onClick={() => { setToggleDropdown(false); signOut(); }}
                  className="mt-5 w-full black_btn"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex">
            {providers &&
              Object.values(providers).map((provider) => (
                <button
                  type="button"
                  key={provider.id}
                  onClick={() => signIn(provider.id)}
                  className="black_btn"
                >
                  Sign in with {provider.name}
                </button>
              ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
