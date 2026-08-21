// *********************
// Role of the component: Classical hero component on home page
// Name of the component: Hero.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Hero />
// Input parameters: no input parameters
// Output: Classical hero component with two columns on desktop and one column on smaller devices
// *********************

import React from "react";
import ProductPhotoWidget from "./ProductPhotoWidget";

const Hero = () => {
  return (
    <div className="relative z-[101] w-full bg-transparent py-16 max-md:py-10">
      <div className="mx-auto flex max-w-screen-2xl flex-col px-10">
        <div className="grid grid-cols-2 items-start gap-12 max-lg:grid-cols-1">
        <div className="flex flex-col gap-y-5 text-left">
          <h1 className="text-5xl text-black font-bold mb-3 max-xl:text-4xl max-md:text-3xl">
            Professional Dental Supplies. Trusted Quality. Delivered to You.
          </h1>
          <p className="text-black max-sm:text-sm">
            At <strong>Aiden Store</strong>, we provide high-quality dental products,
            materials, instruments, and selected cosmetic supplies for professionals
            and individuals. Our goal is to make your shopping experience simple,
            secure, and reliable, with carefully selected products and dependable delivery.
          </p>
        </div>
        <div dir="rtl" className="flex flex-col gap-y-5 text-right text-black">
          <h2 className="text-4xl font-bold max-xl:text-3xl max-md:text-2xl">
            مستلزمات طب الأسنان باحترافية. جودة تثق بها. تصلك أينما كنت.
          </h2>
          <p className="text-lg leading-7 max-md:text-base">
            في <strong>Aiden Store</strong>، نوفر مجموعة من منتجات ومستلزمات طب الأسنان
            عالية الجودة، بما في ذلك المواد السنية، الأدوات والمعدات، بالإضافة إلى مجموعة
            مختارة من منتجات التجميل، لتلبية احتياجات الأطباء والمهنيين والأفراد.
            <br /><br />
            نسعى إلى توفير تجربة تسوق سهلة، آمنة وموثوقة، من خلال منتجات مختارة بعناية،
            وخدمة توصيل موثوقة، لضمان وصول طلباتك إليك بكل أمان.
          </p>
        </div>
        </div>
        <ProductPhotoWidget />
      </div>
    </div>
  );
};

export default Hero;
