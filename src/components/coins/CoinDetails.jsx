import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { io } from 'socket.io-client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useDarkMode } from '../../context/DarkModeContext';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CoinDetails() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const { darkMode } = useDarkMode();
  const coins = useSelector((state) => state.coins.coins);
  const token = useSelector((state) => state.auth.token);
  const [currentCoin, setCurrentCoin] = useState(coins.find(c => c.symbol === symbol));
  
  const [priceHistory, setPriceHistory] = useState([]);
  const [timeframe, setTimeframe] = useState('1m');
  const [isLoading, setIsLoading] = useState(true);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to real-time updates');
    });

    socket.on('prices-updated', (updatedCoins) => {
      const updatedCoin = updatedCoins.find(c => c.symbol === symbol);
      if (updatedCoin) {
        setCurrentCoin(updatedCoin);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, symbol]);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/price-history/${symbol}/${timeframe}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setPriceHistory(response.data);
      } catch (error) {
        console.error('Error fetching price history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol && token) {
      fetchPriceHistory();
      // Set up polling for frequent updates
      const interval = setInterval(fetchPriceHistory, 1000); // Update every second
      return () => clearInterval(interval);
    }
  }, [symbol, timeframe, token]);

  // Update current coin when coins array changes
  useEffect(() => {
    const updatedCoin = coins.find(c => c.symbol === symbol);
    if (updatedCoin) {
      setCurrentCoin(updatedCoin);
    }
  }, [coins, symbol]);

  if (!currentCoin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-2xl text-gray-600 dark:text-gray-300">Coin not found</div>
      </div>
    );
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return formatNumber(num);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const chartData = {
    labels: priceHistory.map(item => formatTimestamp(item.timestamp)),
    datasets: [
      {
        label: 'Price (USD)',
        data: priceHistory.map(item => item.price),
        fill: false,
        borderColor: darkMode ? '#6366f1' : '#4f46e5',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
        hoverPointRadius: 5,
      },
      {
        label: 'Volume',
        data: priceHistory.map(item => item.volume),
        fill: true,
        borderColor: darkMode ? '#9333ea' : '#7c3aed',
        backgroundColor: darkMode ? 'rgba(147, 51, 234, 0.1)' : 'rgba(124, 58, 237, 0.1)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 1,
        hoverPointRadius: 3,
        yAxisID: 'volume'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // Disable animations for smoother updates
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            if (context.datasetIndex === 0) {
              return `Price: $${formatNumber(context.raw)}`;
            }
            return `Volume: ${formatLargeNumber(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151',
          callback: (value) => `$${formatNumber(value)}`
        }
      },
      volume: {
        position: 'right',
        grid: {
          display: false
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151',
          callback: (value) => formatLargeNumber(value)
        }
      }
    }
  };

  const StatCard = ({ title, value, additional }) => (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      {additional && (
        <p className={`mt-2 text-sm ${
          additional.startsWith('+') 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {additional}
        </p>
      )}
    </div>
  );

  const TimeframeButton = ({ value, label }) => (
    <button
      onClick={() => setTimeframe(value)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        timeframe === value
          ? 'bg-indigo-600 text-white'
          : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-75`
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentCoin.name} ({currentCoin.symbol})
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Price and Description */}
          <div className={`mb-8 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${formatNumber(currentCoin.currentPrice)}
                </h2>
                <p className={`mt-1 text-lg ${
                  currentCoin.priceChange24h >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {currentCoin.priceChange24h > 0 ? '+' : ''}{formatNumber(currentCoin.priceChange24h)}%
                </p>
              </div>
            </div>
            <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentCoin.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Market Cap" 
              value={`$${formatLargeNumber(currentCoin.marketCap)}`}
            />
            <StatCard 
              title="24h Volume" 
              value={`$${formatLargeNumber(currentCoin.volume24h)}`}
            />
            <StatCard 
              title="Circulating Supply" 
              value={formatLargeNumber(currentCoin.circulatingSupply)}
              additional={`${currentCoin.symbol}`}
            />
          </div>

          {/* Price Chart */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Price History
              </h2>
              <div className="flex space-x-2">
                <TimeframeButton value="1m" label="1M" />
                <TimeframeButton value="3m" label="3M" />
                <TimeframeButton value="5m" label="5M" />
                <TimeframeButton value="10m" label="10M" />
              </div>
            </div>
            {isLoading && priceHistory.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
              </div>
            ) : (
              <div className="h-[400px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
