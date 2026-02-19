'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export const LeftBar = () => {
  const { t } = useTranslation();
  return (
    <aside className="fixed left-0 top-0 h-screen w-[50%] 5xl:w-[50%] max-w-247 5xl:max-w-full overflow-hidden">
      {/* Background image */}
      <Image
        fill
        priority
        sizes="50vw"
        quality={80}
        placeholder="blur"
        blurDataURL="assets/Rectangle 130.webp"
        src="/assets/Rectangle 130.webp"
        alt=""
        className="object-cover object-[center_10%]"
      />

      <Link href={'/'} className=" flex gap-3 top-10 absolute left-[50%] -translate-x-1/2 pl-10.5 pr-4.75 items-center">
        <div className="flex flex-col max-w-[32px]">
          <Image
            className="max-w-full h-auto w-full"
            width={1000}
            height={1000}
            priority
            src="/assets/Group 1597884980.svg"
            alt=""
          />
        </div>
        <h2 className="text-[32px] mb-0.5 font-semibold leading-[69%] font-ui text-white">Varntix</h2>
      </Link>
      <div className="  absolute bottom-14.75 w-full left-[50%] -translate-x-1/2">
        <h2 className="text-center text-[32px] 4xl:text-[46px] font-semibold font-ui leading-[110%]">
          {t('Digitalassetinvesting')},
          <br /> {t('builtforlongtermwealth')}
        </h2>
        <p className="pt-5 max-w-92.5 w-full mx-auto text-center text-[15px] font-normal font-ui text-white/70">
          {t('Discoverasmarterplatform')} <br /> {t('designedtogrowyourdigitalwealth')}
        </p>
      </div>
    </aside>
  );
};
