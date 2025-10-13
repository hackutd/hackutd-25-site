import LogoContext from '@/lib/context/logo';
import { useDelayUnmount } from '@/lib/hooks';
import clsx from 'clsx';
import 'firebase/compat/storage';
import Image from 'next/image';
import { useContext, useState } from 'react';
import { Sponsor } from '@/pages/admin/sponsors';

const mountedStyle = { animation: 'inAnimation 250ms ease-in' };
const unmountedStyle = {
  animation: 'outAnimation 270ms ease-out',
  animationFillMode: 'forwards',
};

/**
 * Keynote Speaker card for landing page.
 */
export default function SponsorCard(props: Sponsor) {
  const [hovering, setHovering] = useState(false);

  const { setCurrentHoveredLogo, currentHoveredLogo } = useContext(LogoContext);

  return (
    <div
      className={clsx(
        `my-4 flex justify-center items-center hover:scale-110 hover:duration-300 duration-500 opacity-100`,
        {
          ['opacity-30']: currentHoveredLogo.length !== 0 && currentHoveredLogo !== props.reference,
        },
      )}
      onTouchStart={() => {
        if (currentHoveredLogo === props.reference) {
          setCurrentHoveredLogo('');
        } else {
          setCurrentHoveredLogo(props.reference);
        }
      }}
      onMouseOver={() => {
        setCurrentHoveredLogo(props.reference);
        setHovering(true);
      }}
      onMouseOut={() => {
        setCurrentHoveredLogo('');
        setHovering(false);
      }}
    >
      <a
        href={props.link.startsWith('http') ? props.link : `https://${props.link}`}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          'bg-white p-4 rounded-lg overflow-hidden flex items-center justify-center',
          {
            ['w-[250px] h-[150px]']: props.tier !== 'title',
            ['w-[300px] h-[150px]']: props.tier === 'title',
          },
        )}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          <Image
            alt={`Sponsor Image ${props.reference}`}
            src={props.reference}
            width={props.tier === 'title' ? 260 : 200}
            height={props.tier === 'title' ? 120 : 120}
            objectFit="contain"
            className="object-contain max-w-full max-h-full"
          />
        </div>
      </a>
    </div>
  );
}
