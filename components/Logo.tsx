import Link from 'next/link';
import Image from 'next/image';
import LogoImage from '../public/logo.svg'; // Replace with the actual path to your logo image

export default function Logo() {
  return (
    <div className="col-span-2">
      <Link href="/start" passHref>
        <Image
          src={LogoImage}
          alt="Logo"
          className="block object-contain min-h-[5rem]"
        />
      </Link>
    </div>
  );
}
