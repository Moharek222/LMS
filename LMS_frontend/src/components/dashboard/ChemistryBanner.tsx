import React from 'react';

interface ChemistryBannerProps {
  bannerSrc?: string;
  altText?: string;
  quote?: string;
}

export const ChemistryBanner: React.FC<ChemistryBannerProps> = ({
  bannerSrc = '/banner.png',
  altText = 'منصة الصادق في الكيمياء - الأستاذ في الكيمياء',
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg border border-slate-800 bg-[#091523]">
      <img
        src={bannerSrc}
        alt={altText}
        className="w-full h-28 sm:h-36 md:h-40 object-cover object-center rounded-2xl sm:rounded-3xl"
      />
    </div>
  );
};

export default ChemistryBanner;
