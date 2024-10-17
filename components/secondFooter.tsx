import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-600 bg-black text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm">
          <p>
            © 2019-2024{' '}
            <a
              href="https://www.ambrecht.com"
              className="text-white hover:underline"
            >
              Ambrecht LLC
            </a>
            . All Rights Reserved.
          </p>
        </div>
        <div className="flex space-x-6 text-sm">
          <a href="/contact" className="hover:underline">
            Kontakt
          </a>
          <a href="/impressum" className="hover:underline">
            Impressum
          </a>
          <a href="/datenschutz" className="hover:underline">
            Datenschutz
          </a>
        </div>
      </div>
    </footer>
  );
}
