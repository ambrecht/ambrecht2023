import React from 'react';

export type SecondaryFooterContent = {
  copyright: string;
  links: { href: string; label: string }[];
};

type SecondFooterProps = {
  content: SecondaryFooterContent;
};

const SecondFooter: React.FC<SecondFooterProps> = ({ content }) => {
  return (
    <footer className="border-t border-gray-600 bg-black text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm">
          <p>{content.copyright}</p>
        </div>
        <div className="flex space-x-6 text-sm">
          {content.links.map((link) => (
            <a key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default SecondFooter;
