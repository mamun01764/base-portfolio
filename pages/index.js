import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [address, setAddress] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');

  const fetchData = async () => {
    if (!address) return alert('Please enter a wallet address');
    setLoading(true);
    try {
      const [tokenRes, txRes, nftRes] = await Promise.all([
        fetch(`/api/tokens?address=${address}`),
        fetch(`/api/transactions?address=${address}`),
        fetch(`/api/nfts?address=${address}`)
      ]);
      setPortfolio(await tokenRes.json());
      setTransactions(await txRes.json());
      setNfts(await nftRes.json());
    } catch (err) {
      alert('Error fetching data');
    }
    setLoading(false);
  };

  const formatBalance = (balance, decimals) => {
    if (!balance) return '0';
    const num = parseInt(balance) / Math.pow(10, decimals || 18);
    if (num > 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num > 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(4);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
      <Head><title>Base Portfolio Tracker</title></Head>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2rem', color: '#0052ff', marginBottom: '8px' }}>⬡ Base Portfolio</h1>
        <p style={{ color: '#888', marginBottom: '30px' }}>Track your Base chain assets</p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '14px' }}
          />
          <button
            onClick={fetchData}
            style={{ padding: '12px 24px', background: '#0052ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {portfolio && (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {['portfolio', 'transactions', 'nfts'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: activeTab === tab ? '#0052ff' : '#1a1a1a', color: '#fff', textTransform: 'capitalize' }}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'portfolio' && (
              <div>
                <h2 style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>TOKEN BALANCES</h2>
                {portfolio.map((token, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#111', borderRadius: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{token.symbol}</div>
                      <div style={{ color: '#888', fontSize: '12px' }}>{token.name}</div>
                    </div>
                    <div style={{ color: '#0052ff', textAlign: 'right' }}>
                      {token.symbol === 'ETH' 
                        ? parseFloat(token.balance).toFixed(6)
                        : formatBalance(token.balance, token.decimals)
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <h2 style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>RECENT TRANSACTIONS</h2>
                {transactions.slice(0, 20).map((tx, i) => (
                  <div key={i} style={{ padding: '15px', background: '#111', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#0052ff' }}>{tx.hash?.slice(0, 20)}...</span>
                      <span style={{ color: tx.from_address?.toLowerCase() === address.toLowerCase() ? '#ff4444' : '#44ff88' }}>
                        {tx.from_address?.toLowerCase() === address.toLowerCase() ? 'OUT' : 'IN'}
                      </span>
                    </div>
                    <div style={{ color: '#888', marginTop: '4px' }}>{new Date(tx.block_timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'nfts' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {nfts.slice(0, 12).map((nft, i) => (
                  <div key={i} style={{ background: '#111', borderRadius: '8px', padding: '15px', textAlign: 'center' }}>
                    {nft.normalized_metadata?.image ? (
                      <img src={nft.normalized_metadata.image} alt={nft.name} style={{ width: '100%', borderRadius: '6px', marginBottom: '8px' }} onError={e => e.target.style.display='none'} />
                    ) : (
                      <div style={{ height: '100px', background: '#222', borderRadius: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
                    )}
                    <div style={{ fontSize: '12px' }}>{nft.name || 'Unknown NFT'}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>#{nft.token_id?.slice(0, 8)}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
