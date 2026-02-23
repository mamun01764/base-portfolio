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

    // ETH price থেকে USD value
    const priceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const priceData = await priceRes.json();
    const ethPrice = priceData?.ethereum?.usd || 0;

    const ethAmount = parseInt(native.balance) / 1e18;
    const ethBalance = {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: ethAmount.toFixed(6),
      usd_value: (ethAmount * ethPrice).toFixed(2),
      verified: true,
      possible_spam: false
    };

    const tokenList = (tokens.result || tokens || []).map(token => {
      const amount = parseInt(token.balance) / Math.pow(10, token.decimals || 18);
      const usdPrice = token.usd_price || 0;
      return {
        ...token,
        usd_value: (amount * usdPrice).toFixed(2),
        verified: token.verified_contract || false
      };
    });

    // verified আগে, spam পরে
    const sorted = tokenList.sort((a, b) => {
      if (a.possible_spam && !b.possible_spam) return 1;
      if (!a.possible_spam && b.possible_spam) return -1;
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return parseFloat(b.usd_value) - parseFloat(a.usd_value);
    });

    res.status(200).json([ethBalance, ...sorted]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
