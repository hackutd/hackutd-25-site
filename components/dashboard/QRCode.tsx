import QRCodeStyling, { Options } from 'qr-code-styling';
import { useEffect, useRef, useState } from 'react';

export interface Props {
  data: string;
  width: number;
  height: number;
  group: string;
}

// TODO: update this
const IMAGE_GROUP_MAPPING = {
  Bird: '/assets/ab-bird.PNG',
  Cat: '/assets/ab-cat.PNG',
  Deer: '/assets/ab-deer.PNG',
  Fox: '/assets/ab-fox.PNG',
};

// TODO: update this
const COLOR_GROUP_MAPPING = {
  Bird: '#E7A65D',
  Cat: '#000000',
  Deer: '#C59E7D',
  Fox: '#8B4513',
};

export default function QRCode({ data, width, height, group }: Props) {
  const [options, setOptions] = useState<Options>({
    width,
    height,
    type: 'svg',
    data,
    image: IMAGE_GROUP_MAPPING[group],
    margin: 10,
    dotsOptions: {
      color: COLOR_GROUP_MAPPING[group],
    },
    imageOptions: {
      hideBackgroundDots: true,
    },
  });
  const [qrCode, setQrCode] = useState<QRCodeStyling>();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setQrCode(new QRCodeStyling(options));
  }, []);

  useEffect(() => {
    if (ref.current) {
      qrCode?.append(ref.current);
    }
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode?.update(options);
  }, [qrCode, options]);

  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      data,
    }));
  }, [qrCode, data]);

  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      image: IMAGE_GROUP_MAPPING[group],
      dotsOptions: {
        color: COLOR_GROUP_MAPPING[group],
      },
    }));
  }, [qrCode, group]);

  return <div ref={ref} />;
}
