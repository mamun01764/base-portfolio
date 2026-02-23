export default async function handler(req, res) {
  const { address } = req.query;
  try {
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}?chain=base&limit=20`,
      { headers: { 'X-API-Key': process.env.MORALIS_API_KEY } }
    );
    const data = await response.json();
    res.status(200).json(data.result || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
