# URL Shortener

A modern web application for shortening URLs with analytics and user management.

Login  email: intern@dacoid.com, password: Test123
Click on the table of shortened URL to view Charts

## Features

- 🔗 URL shortening with custom aliases
- 📊 Analytics dashboard with click tracking
- 📱 QR code generation for shortened URLs
- 👤 User authentication (Register/Login)
- 📈 Click analytics by date, device, and browser
- 🎨 Modern and responsive UI
- 🔒 Secure authentication with JWT

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Recharts for analytics visualization
- QRCode.react for QR code generation
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Mongoose for database operations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/raunak123455/Url-shortner.git
cd Url-shortner
```

2. Install dependencies for both client and server:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory:
```env
JWT_SECRET=your_super_secret_key_123
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

4. Start the development servers:
```bash
# Start the backend server
cd server
npm start

# Start the frontend development server
cd client
npm start
```

The application will be available at:
- Frontend: https://url-shortner-theta-sage.vercel.app/


## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### URL Management
- `POST /api/urls` - Create a new short URL
- `GET /api/urls` - Get all URLs for authenticated user
- `GET /api/urls/:id/analytics` - Get analytics for a specific URL
- `GET /:shortUrl` - Redirect to original URL

## Project Structure

```
Url-shortner/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # React components
│       ├── App.js         # Main application component
│       └── index.js       # Entry point
├── server/                # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
└── README.md              # Project documentation
```

## Features in Detail

### URL Shortening
- Convert long URLs into short, shareable links
- Option to create custom aliases
- Set expiration dates for URLs

### Analytics Dashboard
- Track total clicks
- View clicks by date
- Analyze device and browser usage
- Generate QR codes for easy
