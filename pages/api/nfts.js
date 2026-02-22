export default async function handler(req, res) {
  const { address } = req.query;
  try {
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=base&limit=12`,
      { headers: { 'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY } }
    );
    const data = await response.json();
    res.status(200).json(data.result || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
}
