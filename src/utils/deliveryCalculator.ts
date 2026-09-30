import { CartItem, CustomerOrderDetails, RestaurantInfo } from '../types';

export const STORE_LOCATION = {
  name: "ELLER'S BURGUER",
  address: "Rua Antônio Ovídeo Ferreira, 375 - Perequê Mirim, Caraguatatuba - SP",
  lat: -23.70897,
  lng: -45.43798,
  ratePerKm: 1.5, // R$ 1,50 por km
  minFeeBelow2Km: 5.0, // Taxa mínima abaixo de 2 km: R$ 5,00
};

// Known neighborhoods in Caraguatatuba with route distance (in km) from store at Perequê Mirim
export const CARAGUA_NEIGHBORHOODS: { name: string; distanceKm: number }[] = [
  { name: "Perequê Mirim (Próximo à loja)", distanceKm: 1.0 },
  { name: "Pegorelli", distanceKm: 2.0 },
  { name: "Travessão", distanceKm: 2.5 },
  { name: "Barranco Alto", distanceKm: 3.5 },
  { name: "Porto Novo", distanceKm: 4.5 },
  { name: "Morro do Algodão", distanceKm: 5.8 },
  { name: "Pontal Santamarina", distanceKm: 6.8 },
  { name: "Praia das Palmeiras", distanceKm: 7.5 },
  { name: "Jardim Britânia", distanceKm: 8.8 },
  { name: "Tinga", distanceKm: 9.5 },
  { name: "Indaiá", distanceKm: 10.5 },
  { name: "Jaraguazinho", distanceKm: 11.0 },
  { name: "Jardim Jaqueira", distanceKm: 11.5 },
  { name: "Poiares", distanceKm: 11.8 },
  { name: "Estrela D'Alva", distanceKm: 12.0 },
  { name: "Centro de Caraguatatuba", distanceKm: 12.8 },
  { name: "Prainha", distanceKm: 14.8 },
  { name: "Martim de Sá", distanceKm: 15.8 },
  { name: "Capricórnio", distanceKm: 21.5 },
  { name: "Massaguaçu", distanceKm: 23.5 },
  { name: "Cocanha", distanceKm: 26.0 },
  { name: "Mococa", distanceKm: 28.5 },
  { name: "Tabatinga", distanceKm: 31.0 }
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Calculate delivery fee: R$ 1,50 per km with minimum fee of R$ 5,00 for distances under 2 km
export function calculateDeliveryFee(
  distanceKm: number,
  ratePerKm: number = 1.5,
  minFeeBelow2Km: number = 5.0
): number {
  if (distanceKm <= 0) return 0;
  const roundedKm = Math.round(distanceKm * 10) / 10;
  if (roundedKm < 2.0) {
    return minFeeBelow2Km; // Taxa fixa mínima de R$ 5,00 abaixo de 2 km
  }
  const fee = Math.max(minFeeBelow2Km, roundedKm * ratePerKm);
  return Math.round(fee * 100) / 100;
}

// Haversine formula with road tortuosity factor (~1.3x) for coastal city driving routes
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  
  // Real driving factor in Caraguatatuba (coastal highways & local streets)
  const drivingDistance = straightDistance * 1.32;
  return Math.max(1.0, Math.round(drivingDistance * 10) / 10);
}

// Attempt client-side geocoding via OpenStreetMap Nominatim for Caraguatatuba addresses
export async function geocodeCaraguatubaAddress(address: string): Promise<number | null> {
  try {
    const fullQuery = `${address}, Caraguatatuba, SP, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      fullQuery
    )}&limit=1&countrycodes=br`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'pt-BR',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      const destLat = parseFloat(data[0].lat);
      const destLon = parseFloat(data[0].lon);
      return calculateDistanceKm(
        STORE_LOCATION.lat,
        STORE_LOCATION.lng,
        destLat,
        destLon
      );
    }
    return null;
  } catch {
    return null;
  }
}

// Format the final WhatsApp checkout message
export function buildWhatsAppOrderMessage(
  restaurant: RestaurantInfo,
  cartItems: CartItem[],
  orderDetails: CustomerOrderDetails,
  subtotal: number,
  total: number
): string {
  const isDelivery = orderDetails.deliveryType === 'delivery';

  let msg = `🍔 *NOVO PEDIDO - ${restaurant.name.toUpperCase()}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Customer info
  msg += `👤 *Cliente:* ${orderDetails.customerName.trim() || 'Não informado'}\n`;
  msg += `📱 *Telefone:* ${orderDetails.customerPhone.trim() || 'Não informado'}\n`;
  msg += `📍 *Modalidade:* ${isDelivery ? '🚀 ENTREGA (DELIVERY)' : '🛍️ RETIRADA NO BALCÃO'}\n\n`;

  // Items
  msg += `📋 *ITENS DO PEDIDO:*\n`;
  cartItems.forEach((item, index) => {
    msg += `\n*${index + 1}. ${item.quantity}x ${item.product.name}* (${formatCurrency(item.itemPriceTotal)})\n`;
    
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      msg += `   ➕ *Adicionais:*\n`;
      item.selectedAddons.forEach((addon) => {
        msg += `      • ${addon.name} (+${formatCurrency(addon.price)})\n`;
      });
    }

    if (item.observation && item.observation.trim().length > 0) {
      msg += `   📝 *Obs:* _${item.observation.trim()}_\n`;
    }
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;

  // Delivery / Address Details
  if (isDelivery) {
    msg += `🛵 *DADOS DE ENTREGA:*\n`;
    msg += `• *Endereço:* ${orderDetails.street.trim()}, Nº ${orderDetails.number.trim()}\n`;
    msg += `• *Bairro:* ${orderDetails.neighborhood.trim()} - Caraguatatuba\n`;
    if (orderDetails.complement && orderDetails.complement.trim()) {
      msg += `• *Complemento:* ${orderDetails.complement.trim()}\n`;
    }
    if (orderDetails.reference && orderDetails.reference.trim()) {
      msg += `• *Ponto de Ref:* ${orderDetails.reference.trim()}\n`;
    }
    const distanceRule = orderDetails.distanceKm < 2.0
      ? 'Taxa mínima R$ 5,00 para < 2 km'
      : 'R$ 1,50/km';
    msg += `• *Distância da Loja:* ~${orderDetails.distanceKm.toFixed(1)} km (${distanceRule})\n`;
    msg += `• *Origem:* ${restaurant.address.street}, ${restaurant.address.number}\n`;
    msg += `• *Previsão:* ${restaurant.deliveryTime}\n\n`;
  } else {
    msg += `🏢 *RETIRADA NO LOCAL:*\n`;
    msg += `• *Endereço da Loja:* ${restaurant.address.street}, ${restaurant.address.number} - ${restaurant.address.neighborhood}\n`;
    msg += `• *Previsão de Retirada:* ${restaurant.pickupTime}\n\n`;
  }

  // Payment
  msg += `💳 *FORMA DE PAGAMENTO:*\n`;
  const paymentName =
    restaurant.paymentMethods.find((p) => p.id === orderDetails.paymentMethod)?.name ||
    orderDetails.paymentMethod;
  msg += `• *Método:* ${paymentName}\n`;

  if (orderDetails.paymentMethod === 'dinheiro' && orderDetails.cashChangeFor) {
    msg += `• *Troco para:* ${orderDetails.cashChangeFor}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *RESUMO DE VALORES:*\n`;
  msg += `• Subtotal dos itens: ${formatCurrency(subtotal)}\n`;
  if (isDelivery) {
    const feeLabel = orderDetails.distanceKm < 2.0
      ? `Taxa mínima (< 2 km)`
      : `Taxa de entrega (${orderDetails.distanceKm.toFixed(1)} km)`;
    msg += `• ${feeLabel}: ${formatCurrency(orderDetails.deliveryFee)}\n`;
  } else {
    msg += `• Taxa de entrega: GRÁTIS (Retirada)\n`;
  }
  msg += `• *TOTAL DO PEDIDO: ${formatCurrency(total)}*\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Por favor, confirmem o recebimento do pedido e o tempo estimado! Obrigado! 😋`;

  return msg;
}

export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  // Strip non-digits from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  // Format with country code 55 (Brazil)
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedText}`;
}
