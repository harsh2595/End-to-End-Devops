const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchData = async (endpoint) => {
  const res = await fetch(`${API_URL}${endpoint}`);
  return res.json();
};
