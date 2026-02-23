export default async function handler(req, res) {
  const { address } = req.query;
  try {
    const [nativeRes, tokenRes] = await Promise.all([
      fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=base`,
        { headers: { 'X-API-Key': process.env.MORALIS_API_KEY } }
      ),
      fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=base&limit=50`,
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
    
    console.log('Moralis tokens response:', JSON.stringify(tokens));
    
    const result = [ethBalance, ...(tokens.result || tokens || [])];
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
