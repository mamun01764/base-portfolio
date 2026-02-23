export default async function handler(req, res) {
  const { address } = req.query;
  try {
    const [nativeRes, tokenRes] = await Promise.all([
      fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=base`,
        { headers: { 'X-API-Key': process.env.MORALIS_API_KEY } }
      ),
      fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=base`,
        { headers: { 'X-API-Key': process.env.MORALIS_API_KEY } }
      )
    ]);
    const native = await nativeRes.json();
    const tokens = await tokenRes.json();
    
    const ethBalance = {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: (parseInt(native.balance) / 1e18).toFixed(6)
    };
    
    const result = [ethBalance, ...(tokens.result || [])];
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
}
