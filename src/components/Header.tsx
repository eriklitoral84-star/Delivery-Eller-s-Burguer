import React from 'react';
import { ShoppingBag, Clock, Phone, MapPin, Calculator, Info, ChevronRight } from 'lucide-react';
import { RestaurantInfo } from '../types';
import { formatCurrency } from '../utils/deliveryCalculator';
import { getStoreStatus } from '../utils/storeStatus';

interface HeaderProps {
  restaurant: RestaurantInfo;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenInfo: () => void;
  onOpenCalculator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  restaurant,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenInfo,
  onOpenCalculator,
}) => {
  const status = getStoreStatus();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-all shadow-xs">
      {/* 1. Top Horizontal Info Strip: organized, horizontal, and fully informative */}
      <div className="bg-zinc-950 text-zinc-200 border-b border-zinc-800 text-[11px] sm:text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* Left group: Status & Horários in horizontal row */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Status indicator */}
            <button
              type="button"
              onClick={onOpenInfo}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer bg-zinc-900 border border-zinc-700 hover:border-zinc-500"
              title="Clique para ver detalhes do atendimento"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'
                }`}
              />
              <span className={status.isOpen ? 'text-emerald-400' : 'text-zinc-300'}>
                {status.statusLabel}
              </span>
            </button>

            {/* Operating hours */}
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>
                <strong className="text-white font-semibold">Segunda a Sábado:</strong> 18:00 às 23:30
              </span>
              <span className="text-zinc-500 hidden sm:inline">(Domingo: Fechado)</span>
            </div>
          </div>

          {/* Right group: Delivery & WhatsApp in horizontal row */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-zinc-300">
            <button
              onClick={onOpenCalculator}
              className="hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Simular taxa de entrega para seu endereço"
            >
              <Calculator className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="hidden sm:inline">Entrega:</span>
              <span className="text-white font-medium">R$ 1,50/km</span>
            </button>

            <span className="text-zinc-700 hidden sm:inline" aria-hidden="true">|</span>

            <a
              href={`https://wa.me/55${restaurant.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
              title="Falar no WhatsApp oficial"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-400">{restaurant.whatsappFormatted}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Horizontal Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand identity: Logo + Name + Tag in clean horizontal alignment */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="/"
            className="flex items-center gap-3 group shrink-0"
            title="Eller's Burguer - Início"
          >
            <img
              src="/logo.svg"
              alt={restaurant.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform bg-black border-2 border-red-500/50 p-0.5 shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg sm:text-xl text-zinc-950 tracking-tight leading-none group-hover:text-orange-600 transition-colors">
                {restaurant.name}
              </span>
              <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase font-sans mt-0.5">
                Hamburgueria Artesanal & Smash
              </span>
            </div>
          </a>

          {/* Quick Info Modal Trigger (Location pill) */}
          <button
            onClick={onOpenInfo}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-zinc-200/80 rounded-full text-xs text-zinc-700 font-medium transition-colors cursor-pointer border border-zinc-200"
            title="Ver localização e dados da loja"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>Perequê Mirim, Caraguatatuba</span>
          </button>
        </div>

        {/* Center / Navigation Links (Clean & Horizontal) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <a
            href="#cardapio"
            className="hover:text-orange-600 transition-colors font-semibold"
          >
            Cardápio
          </a>
          <button
            onClick={onOpenCalculator}
            className="hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Calculator className="w-4 h-4 text-orange-500" />
            <span>Taxa de Entrega</span>
          </button>
          <button
            onClick={onOpenInfo}
            className="hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Info className="w-4 h-4 text-zinc-400" />
            <span>Sobre & Horários</span>
          </button>
        </nav>

        {/* Right Actions: Quick Calculator & Cart Sacola */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenCalculator}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 text-zinc-700 hover:text-orange-600 bg-zinc-100 hover:bg-orange-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-zinc-200"
            title="Calcular Taxa de Entrega"
          >
            <Calculator className="w-4 h-4 text-orange-500" />
            <span>Frete</span>
          </button>

          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            aria-label="Abrir carrinho de compras"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-zinc-950 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="hidden sm:inline">
                {cartCount === 0 ? 'Sacola' : 'Ver Pedido'}
              </span>
              <span className="text-orange-200 hidden sm:inline">·</span>
              <span className="font-mono tabular-nums">
                {cartCount === 0 ? 'R$ 0,00' : formatCurrency(cartTotal)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
