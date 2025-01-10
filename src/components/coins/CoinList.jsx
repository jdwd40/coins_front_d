import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchCoins, initializeCoins } from '../../features/coins/coinSlice';
import { logout } from '../../features/auth/authSlice';
import { useDarkMode } from '../../context/DarkModeContext';

export default function CoinList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { coins, status } = useSelector((state) => state.coins);
  const { user, token } = useSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [localCoins, setLocalCoins] = useState([]);

  // Initialize socket connection and handle real-time updates
  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to price updates');
    });

    socket.on('prices-updated', (updatedCoins) => {
      setLocalCoins(updatedCoins);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const initializeData = async () => {
      // First try to fetch coins
      const result = await dispatch(fetchCoins()).unwrap();
      
      // If no coins exist, initialize them
      if (!result || result.length === 0) {
        await dispatch(initializeCoins());
        dispatch(fetchCoins());
      }
    };

    initializeData();
  }, [dispatch]);

  // Update local coins when redux state changes
  useEffect(() => {
    if (coins.length > 0) {
      setLocalCoins(coins);
    }
  }, [coins]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatMarketCap = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return formatNumber(num);
  };

  const getTrendIcon = (currentPrice, previousPrice) => {
    if (!previousPrice) return '→';
    if (currentPrice > previousPrice) return '↑';
    if (currentPrice < previousPrice) return '↓';
    return '→';
  };

  const getTrendColor = (currentPrice, previousPrice) => {
    if (!previousPrice) return '';
    if (currentPrice > previousPrice) return 'text-green-500 dark:text-green-400';
    if (currentPrice < previousPrice) return 'text-red-500 dark:text-red-400';
    return '';
  };

  const handleCoinClick = (symbol) => {
    navigate(`/coin/${symbol}`);
  };

  if (status === 'loading' && localCoins.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-2xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Fantasy Crypto Exchange
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`hidden sm:block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Welcome, {user?.name}!
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '🌞' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Welcome Message */}
          <div className="sm:hidden mb-4">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Welcome, {user?.name}!
            </p>
          </div>

          {/* Coins Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Coin
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trend
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    24h Change
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th scope="col" className="hidden md:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Volume (24h)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {localCoins.map((coin) => (
                  <tr 
                    key={coin.symbol} 
                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} cursor-pointer`}
                    onClick={() => handleCoinClick(coin.symbol)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {coin.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${formatNumber(coin.currentPrice)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getTrendColor(coin.currentPrice, coin.previousPrice)}`}>
                      {getTrendIcon(coin.currentPrice, coin.previousPrice)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      coin.priceChange24h >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {coin.priceChange24h > 0 ? '+' : ''}{formatNumber(coin.priceChange24h)}%
                    </td>
                    <td className={`hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatMarketCap(coin.marketCap)}
                    </td>
                    <td className={`hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatMarketCap(coin.volume24h)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
