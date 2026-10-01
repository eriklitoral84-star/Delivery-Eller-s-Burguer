import React from 'react';
import { Clock, MapPin, Sparkles, Calculator, CheckCircle2 } from 'lucide-react';
import { RestaurantInfo } from '../types';
import { getStoreStatus } from '../utils/storeStatus';

interface HeroBannerProps {
  restaurant: RestaurantInfo;
  onOpenCalculator: () => void;
  onOpenInfo: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  restaurant,
  onOpenCalculator,
  onOpenInfo,
}) => {
  const status = getStoreStatus();

  return (
    <div className="relative bg-gradient-to-b from-orange-50/70 via-white to-zinc-50/50 border-b border-zinc-200/80 pt-6 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
          {/* Main Hero Content */}
          <div className="max-w-2xl">
            {/* Status Pill with Schedule */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-zinc-200 shadow-2xs mb-3.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                }`}
              />
              <span className={status.isOpen ? 'text-emerald-700 font-bold' : 'text-zinc-700 font-bold'}>
                {status.statusLabel}
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-600 font-medium">
                Seg a Sáb: 18:00 às 23:30
              </span>
              <span className="text-zinc-300 hidden sm:inline">·</span>
              <span className="text-zinc-500 hidden sm:inline">
                Caraguatatuba & São Sebastião - SP
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 font-heading tracking-tight leading-tight">
              Sabor artesanal de verdade, <br className="hidden sm:inline" />
              <span className="text-orange-500">entregue quentinho</span> na sua porta.
            </h1>

            <p className="mt-3.5 text-zinc-600 text-sm sm:text-base leading-relaxed font-sans max-w-xl">
              Smash burgers na crostinha, burgers artesanais, pão brioche dourado na manteiga e batatas hiper crocantes. Peça online e receba rápido!
            </p>

            {/* Badges / Metrics info */}
            <div className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-zinc-600">
              <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Seg a Sáb: 18:00 às 23:30</span>
              </div>
              <span className="text-zinc-300" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                <Calculator className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Taxa: R$ 1,50/km (mín. R$ 5,00)</span>
              </div>
              <span className="text-zinc-300" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onOpenInfo}
                className="flex items-center gap-1 text-zinc-600 hover:text-zinc-950 underline underline-offset-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {restaurant.address.street}, {restaurant.address.number}
                </span>
              </button>
            </div>
          </div>

          {/* Quick interactive widget: Delivery Calculator card */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-xs max-w-sm w-full shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-2xs">
                  <Calculator className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                    Calculadora de Entrega
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Caraguá & São Sebastião
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-md">
                R$ 1,50/km
              </span>
            </div>

            <p className="text-xs text-zinc-600 mb-3.5 leading-relaxed">
              Consulte a taxa exata para seu endereço em Caraguatatuba ou São Sebastião antes de fazer o pedido.
            </p>

            <button
              onClick={onOpenCalculator}
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 active:scale-[0.98] text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Simular Taxa para meu Endereço</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
