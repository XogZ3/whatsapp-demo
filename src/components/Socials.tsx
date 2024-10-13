import Link from 'next/link';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';

import { AppConfig } from '@/utils/appConfig';

const socialLinks = [
  {
    id: 'whatsapp',
    icon: FaWhatsapp,
    href: `https://wa.me/?text=${encodeURIComponent(`Check out ${AppConfig.name}: ${AppConfig.url}`)}`,
    ariaLabel: 'Share on WhatsApp',
  },
  // {
  //   id: 'instagram',
  //   icon: FaInstagram,
  //   href: `instagram://message?text=${encodeURIComponent(`Check out ${AppConfig.name}: ${AppConfig.url}`)}`,
  //   ariaLabel: 'Share via Instagram Direct Message',
  // },
  {
    id: 'facebook',
    icon: FaFacebook,
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(AppConfig.url)}`,
    ariaLabel: 'Share on Facebook',
  },
];

export default function Socials() {
  return (
    <div className="flex justify-center space-x-4 py-4">
      {socialLinks.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.ariaLabel}
          className="text-2xl text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <link.icon />
        </Link>
      ))}
    </div>
  );
}
