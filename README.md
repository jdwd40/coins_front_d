# Crypto Trading Platform Frontend

A modern, responsive cryptocurrency trading platform built with React, Redux Toolkit, and Socket.IO client. Features real-time price updates, interactive charts, and a beautiful dark/light mode interface.

## Features

- **Real-time Updates**: Live cryptocurrency price and volume updates
- **Interactive Charts**: Price history visualization with Chart.js
- **Dark/Light Mode**: Beautiful theme switching with Tailwind CSS
- **Responsive Design**: Mobile-first approach for all screen sizes
- **State Management**: Efficient state handling with Redux Toolkit
- **User Authentication**: Secure JWT-based auth system
- **WebSocket Integration**: Real-time data streaming with Socket.IO
- **Modern UI**: Built with Tailwind CSS and custom components

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend server running (see server README)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
```

## Environment Variables

- `VITE_API_URL`: Backend API URL

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── auth/      # Authentication components
│   │   ├── coins/     # Cryptocurrency components
│   │   └── common/    # Shared components
│   ├── features/      # Redux slices and logic
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   ├── styles/        # Global styles
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── .env              # Environment variables
└── package.json      # Project dependencies
```

## Available Scripts

```bash
# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run linter
npm run lint
```

## Key Components

### CoinList
- Displays all available cryptocurrencies
- Real-time price updates
- Sorting and filtering options

### CoinDetails
- Detailed view of individual coins
- Interactive price history chart
- Real-time price and volume updates
- Multiple timeframe options (1m, 3m, 5m, 10m)

### Authentication
- User registration
- Login/logout functionality
- Protected routes
- JWT token management

## State Management

Redux Toolkit is used for state management with the following slices:
- `auth`: User authentication state
- `coins`: Cryptocurrency data
- `ui`: UI-related state (theme, loading, etc.)

## Styling

- Tailwind CSS for utility-first styling
- Custom theme configuration
- Dark/light mode support
- Responsive design breakpoints

## WebSocket Integration

Real-time updates are handled through Socket.IO:
- Connection management
- Auto-reconnection
- Event handling for price updates
- Authentication integration

## Error Handling

Comprehensive error handling including:
- API error responses
- Network issues
- Authentication failures
- Loading states

## Performance Optimizations

- React.memo for expensive components
- Debounced API calls
- Optimized re-renders
- Lazy loading of routes
- Efficient WebSocket message handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Best Practices

- Component composition
- Custom hooks for reusable logic
- Proper TypeScript types
- Consistent error handling
- Responsive design patterns
- Performance optimization
- Accessibility standards

## Troubleshooting

Common issues and solutions:
1. **WebSocket Connection Issues**
   - Check backend server status
   - Verify environment variables
   - Check network connectivity

2. **Authentication Problems**
   - Clear local storage
   - Check token expiration
   - Verify API URL

3. **Chart Rendering Issues**
   - Check data format
   - Verify timeframe selection
   - Console for error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email] or create an issue in the repository.
