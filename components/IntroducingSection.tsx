// *********************
// Role of the component: IntroducingSection with the Aiden Store introduction
// Name of the component: IntroducingSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <IntroducingSection />
// Input parameters: no input parameters
// Output: Section with the Aiden Store introduction and button
// *********************

import Image from "next/image";
import React from "react";

const benefits = [
  { slot: "G1", name: "On Assume La Responsabilite De Changer, Retourner Et Reglement Du Prix", icon: "/G1.png" },
  { slot: "G2", name: "Payment A La Livraison", icon: "/G2.png" },
  { slot: "G3", name: "Livraison Disponible 58 Wilaya", icon: "/G3.png" },
  { slot: "G4", name: "Qualite Professionnelle", icon: "/G4.png" },
  { slot: "G5", name: "Resultat Esthetique Parfait", icon: "/G5.png" },
  { slot: "G6", name: "Disponible En Plusieurs Teintes", icon: "/G6.png" },
];

const IntroducingSection = () => {
  return (
    <div className="bg-transparent py-10 pt-12">
      <div className="text-center flex flex-col gap-y-5 items-center">
        <h2 className="text-black text-8xl font-extrabold text-center mb-2 max-md:text-6xl max-[480px]:text-4xl">
          INTRODUCING <span className="text-black">AIDEN</span><span className="text-blue-600"> STORE</span>
        </h2>
        <div>
          <p className="text-black text-center text-2xl font-semibold max-md:text-xl max-[480px]:text-base">
            Professional Dental Supplies.
          </p>
          <p className="text-black text-center text-2xl font-semibold max-md:text-xl max-[480px]:text-base">
            Trusted Quality. Delivered to You.
          </p>
          <div className="mt-4 grid w-full max-w-6xl grid-cols-6 items-start gap-4 px-2 max-md:gap-2 max-[480px]:gap-1">
            {benefits.map((benefit) => (
              <div key={benefit.slot} aria-label={benefit.name} title={benefit.name} className="flex min-w-0 flex-col items-center text-center transition-transform hover:scale-105">
                <Image src={benefit.icon} alt={benefit.name} width={112} height={112} className="h-24 w-24 shrink-0 object-contain max-md:h-20 max-md:w-20 max-[480px]:h-16 max-[480px]:w-16" />
                <span className="mt-2 flex min-h-12 items-start justify-center text-sm font-semibold leading-tight text-black max-md:min-h-10 max-md:text-xs max-[480px]:min-h-8 max-[480px]:text-[0.65rem]">{benefit.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroducingSection;
