"use client";

import { parseOptions, VariantPrices } from "@/lib/product-variants";

type VariantPriceEditorProps = {
  size: string | null | undefined;
  variantPrices: VariantPrices | null | undefined;
  onChange: (size: string, variantPrices: VariantPrices) => void;
};

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"];

const VariantPriceEditor = ({ size, variantPrices, onChange }: VariantPriceEditorProps) => {
  const options = parseOptions(size);
  const prices = variantPrices || {};
  const addOption = (option: string) => {
    const trimmed = option.trim();
    if (!trimmed || options.includes(trimmed)) return;
    onChange([...options, trimmed].join(", "), { ...prices, [trimmed]: 0 });
  };
  const removeOption = (option: string) => {
    const nextPrices = { ...prices };
    delete nextPrices[option];
    onChange(options.filter((item) => item !== option).join(", "), nextPrices);
  };
  const updatePrice = (option: string, value: string) =>
    onChange(size || "", { ...prices, [option]: Math.max(0, Number(value) || 0) });

  return (
    <div className="mt-2 max-w-xl space-y-3 rounded border border-gray-300 p-3">
      <p className="text-sm font-semibold">Optional prices by size or piece</p>
      <div className="flex flex-wrap gap-2">
        {SIZE_PRESETS.map((option) => <button key={option} type="button" className="btn btn-sm btn-outline" onClick={() => addOption(option)} disabled={options.includes(option)}>{option}</button>)}
      </div>
      <div className="flex gap-2">
        <input id="custom-variant" className="input input-bordered input-sm" placeholder="Piece or other option" />
        <button type="button" className="btn btn-sm btn-primary" onClick={() => { const input = document.getElementById("custom-variant") as HTMLInputElement; addOption(input.value); input.value = ""; }}>Add</button>
      </div>
      {options.map((option) => <div className="flex items-center gap-2" key={option}>
        <span className="w-20 font-medium">{option}</span>
        <input type="number" min="0" step="1" className="input input-bordered input-sm w-36" value={prices[option] ?? ""} placeholder="Price" onChange={(event) => updatePrice(option, event.target.value)} />
        <button type="button" className="btn btn-sm btn-error" onClick={() => removeOption(option)}>Delete</button>
      </div>)}
      <p className="text-xs text-gray-500">For litres and kilograms, leave the option price empty or use the base product price.</p>
    </div>
  );
};

export default VariantPriceEditor;