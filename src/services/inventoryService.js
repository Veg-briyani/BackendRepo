const fetchSalesData = async (bookId) => {
  try {
    const response = await axios.get(`${INVENTORY_API}/sales`, {
      params: { bookId }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch sales data');
  }
}; 