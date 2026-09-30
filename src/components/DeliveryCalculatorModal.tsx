import React, { useState, useEffect } from 'react';
import { X, MapPin, Calculator, Navigation, Clock, Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  CARAGUA_NEIGHBORHOODS,
  STORE_LOCATION,
  calculateDeliveryFee,
  formatCurrency,
  geocodeCaraguatubaAddress,
} from '../utils/deliveryCalculator';

interface DeliveryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDistance?: (distanceKm: number, neighborhoodName?: string) => void;
}

export const DeliveryCalculatorModal: React.FC<DeliveryCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyDistance,
}) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(CARAGUA_NEIGHBORHOODS[0].name);
  const [distanceKm, setDistanceKm] = useState<number>(CARAGUA_NEIGHBORHOODS[0].distanceKm);
  const [customAddress, setCustomAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState<'neighborhood' | 'address'>('neighborhood');

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentFee = calculateDeliveryFee(distanceKm, STORE_LOCATION.ratePerKm);

  const handleSelectNeighborhood = (name: string) => {
    setSelectedNeighborhood(name);
    const found = CARAGUA_NEIGHBORHOODS.find((n) => n.name === name);
    if (found) {
      setDistanceKm(found.distanceKm);
      setSearchError('');
    }
  };

  const handleSearchCustomAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const calculatedKm = await geocodeCaraguatubaAddress(customAddress);
      if (calculatedKm !== null && calculatedKm > 0) {
        setDistanceKm(calculatedKm);
      } else {
        setSearchError('Não encontramos esse endereço exato no mapa de Caraguatatuba. Por favor, selecione seu bairro na lista ao lado ou ajuste a quilometragem.');
      }
    } catch {
      setSearchError('Erro ao buscar endereço. Por favor selecione o bairro correspondente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = () => {
    if (onApplyDistance) {
      onApplyDistance(
        distanceKm,
        activeTab === 'neighborhood' ? selectedNeighborhood : customAddress
      );
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calc-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 id="calc-modal-title" className="text-lg font-bold text-zinc-950 font-heading">
                Calculadora de Taxa de Entrega
              </h2>
              <p className="text-xs text-zinc-500">
                R$ 1,50 por km (taxa mínima de R$ 5,00 abaixo de 2 km)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-5">
          {/* Store Origin Info Card */}
          <div className="p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-2xl">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-700">
                <span className="font-bold text-zinc-900">Ponto de Partida da Loja:</span>
                <p className="mt-0.5 text-zinc-600 leading-snug">
                  {STORE_LOCATION.address}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-orange-700">
                  <span>• Preço: R$ 1,50 por km</span>
                  <span>• Taxa mínima: R$ 5,00 (&lt; 2 km)</span>
                  <span>• Tempo: 35 a 50 minutos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('neighborhood')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'neighborhood'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Escolher Bairro de Caraguá
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('address')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'address'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Digitar Rua / Endereço
            </button>
          </div>

          {/* Tab 1: Neighborhood selection */}
          {activeTab === 'neighborhood' && (
            <div>
              <label
                htmlFor="select-neighborhood"
                className="block text-xs font-bold text-zinc-700 mb-2"
              >
                Selecione o bairro de entrega em Caraguatatuba:
              </label>
              <select
                id="select-neighborhood"
                value={selectedNeighborhood}
                onChange={(e) => handleSelectNeighborhood(e.target.value)}
                className="w-full p-3 bg-white border border-zinc-300 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                {CARAGUA_NEIGHBORHOODS.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name} (~{item.distanceKm.toFixed(1)} km)
                  </option>
                ))}
              </select>

              {/* Fast buttons for common neighborhoods */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Bairros populares:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Perequê Mirim (Próximo à loja)', 'Pegorelli', 'Travessão', 'Porto Novo', 'Morro do Algodão', 'Centro de Caraguatatuba'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleSelectNeighborhood(n)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        selectedNeighborhood === n
                          ? 'border-orange-500 bg-orange-50 text-orange-600 font-bold'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      {n.replace(' (Próximo à loja)', '').replace(' de Caraguatatuba', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Custom Address Geocoding */}
          {activeTab === 'address' && (
            <div>
              <form onSubmit={handleSearchCustomAddress} className="space-y-2">
                <label
                  htmlFor="custom-calc-address"
                  className="block text-xs font-bold text-zinc-700"
                >
                  Digite a rua ou ponto de referência em Caraguatatuba:
                </label>
                <div className="flex gap-2">
                  <input
                    id="custom-calc-address"
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="Ex: Av. da Praia, Martim de Sá..."
                    className="flex-1 p-2.5 text-xs sm:text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !customAddress.trim()}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    <span>Calcular</span>
                  </button>
                </div>
              </form>

              {searchError && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>
          )}

          {/* Fine-tune distance slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-600 mb-1.5">
              <span>Ajuste fino da distância percorrida:</span>
              <span className="font-bold text-zinc-900 font-mono">
                {distanceKm.toFixed(1)} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="0.5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>1.0 km (Perequê Mirim)</span>
              <span>15.0 km (Centro/Martim)</span>
              <span>31.0 km (Tabatinga)</span>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 bg-zinc-900 text-white rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Distância calculada:</span>
              <span className="text-sm font-extrabold font-mono text-white">
                ~{distanceKm.toFixed(1)} km
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Regra de cálculo:</span>
              <span className="text-xs font-mono text-zinc-300">
                {distanceKm < 2.0
                  ? 'Distância < 2 km (Taxa mínima R$ 5,00)'
                  : `${distanceKm.toFixed(1)} km × R$ 1,50/km`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-sm font-bold text-zinc-200">
                Valor da Taxa de Entrega:
              </span>
              <span className="text-2xl font-black text-orange-400 font-mono tabular-nums">
                {formatCurrency(currentFee)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Tempo estimado de entrega: 35 a 50 minutos</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-200 bg-white flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
          {onApplyDistance && (
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar ao Pedido</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
