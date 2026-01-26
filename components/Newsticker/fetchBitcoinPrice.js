export const fetchBitcoinPrice = async () => {
  try {
    const response = await fetch('/api/bitcoin-price', { cache: 'no-store' });
    const data = await response.json();
    return data.price ?? null; // USD price from server proxy
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    // Handle the error appropriately
    return null; // Return null or a default value if there's an error
  }
};
