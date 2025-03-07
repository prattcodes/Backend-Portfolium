# Portfolium Backend API

A robust backend API for Portfolium - a developer portfolio platform that allows users to create, manage, and publish their professional portfolios. Built with Node.js and Express.js, it provides secure OAuth authentication, comprehensive portfolio management, and seamless media handling through Cloudflare integration.

## Features

- OAuth authentication with GitHub and Google
- Portfolio management (experiences, projects, blogs)
- Media handling with Cloudflare integration
- Custom subdomain support
- Resume upload and management
- Portfolio publishing system

## System Architecture

### Core Technologies

- Node.js & Express.js
- MongoDB with Mongoose ODM
- Passport.js for OAuth
- Cloudflare for media storage
- JWT for authentication

### Directory Structure

```bash
├── config/           # Configuration files
│   ├── cloudflare.js # Cloudflare integration
│   ├── db.js        # MongoDB connection
│   └── oauth.js      # OAuth strategies
├── middleware/      # Custom middleware
│   └── auth.js      # Authentication middleware
├── models/          # MongoDB models
│   ├── Blog.js
│   ├── Experience.js
│   ├── Portfolio.js
│   ├── Project.js
│   └── User.js
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── media.js     # Media handling
│   ├── portfolio.js # Portfolio management
│   ├── public.js    # Public portfolio access
│   └── publish.js   # Publishing system
├── utils/           # Utility functions
└── app.js          # Main application file
```

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/portfolium-backend.git
   cd portfolium-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy the `.env.example` file to `.env`
   - Update the following variables in your `.env` file:

   ```env
   # Server Configuration
   PORT=5000                    # Application port
   NODE_ENV=development        # Environment (development/production)
   
   # MongoDB Configuration
   MONGO_URI=your_mongodb_uri  # MongoDB connection string (Atlas or local)
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret  # Secure random string for JWT signing
   JWT_EXPIRE=30d              # JWT token expiration time
   
   # GitHub OAuth Configuration
   GITHUB_CLIENT_ID=your_github_client_id           # From GitHub OAuth App
   GITHUB_CLIENT_SECRET=your_github_client_secret   # From GitHub OAuth App
   GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id           # From Google Cloud Console
   GOOGLE_CLIENT_SECRET=your_google_client_secret   # From Google Cloud Console
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   # Cloudflare Configuration
   CLOUDFLARE_ACCOUNT_ID=your_account_id            # Cloudflare account ID
   CLOUDFLARE_API_TOKEN=your_api_token              # Cloudflare API token
   CLOUDFLARE_IMAGES_TOKEN=your_images_token        # Cloudflare Images token (specific for Images API)
   CLOUDFLARE_IMAGES_DELIVERY_URL=your_delivery_url # Cloudflare Images delivery URL
   CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint          # R2 endpoint URL
   CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key      # R2 access key ID
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key  # R2 secret access key
   CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name       # R2 bucket name
   ```

4. Set up external services:
   - Create a MongoDB Atlas cluster or use a local MongoDB instance
   - Set up OAuth applications in GitHub and Google Developer Console
   - Configure Cloudflare R2 and Images for media storage

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Verify the installation:
   - The server should start on <http://localhost:5000>
   - Check the console for successful database connection
   - Test OAuth flows and media upload functionality

## API Endpoints

### Authentication

- `GET /api/auth/github` - Initiate GitHub OAuth flow
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update account settings
- `DELETE /api/auth/me` - Delete account

### Portfolio Management

- `GET /api/portfolio` - Get user's portfolio
- `PUT /api/portfolio` - Update entire portfolio
- `PATCH /api/portfolio` - Update specific sections

#### Experience

- `GET /api/portfolio/experience` - Get experiences
- `POST /api/portfolio/experience` - Add experience
- `PUT /api/portfolio/experience/:id` - Update experience
- `DELETE /api/portfolio/experience/:id` - Delete experience

#### Projects

- `GET /api/portfolio/projects` - Get projects
- `POST /api/portfolio/projects` - Add project
- `PUT /api/portfolio/projects/:id` - Update project
- `DELETE /api/portfolio/projects/:id` - Delete project

#### Blogs

- `GET /api/portfolio/:portfolioId/blogs` - Get blogs for a portfolio
- `POST /api/portfolio/blogs` - Add blog (requires portfolioId in request body)
- `PUT /api/portfolio/blogs/:blogId` - Update blog by blogId
- `DELETE /api/portfolio/blogs/:blogId` - Delete blog by blogId

### Media Management

- `POST /api/media/profile-photo` - Upload profile photo
- `GET /api/media/profile-photo` - Get current user's profile photo
- `DELETE /api/media/profile-photo/:imageId` - Delete profile photo
- `POST /api/media/project/:projectId` - Upload project image
- `DELETE /api/media/project/:projectId/:imageId` - Delete project image
- `POST /api/media/resume` - Upload resume
- `GET /api/media/resume/:key` - Get resume download URL
- `GET /api/media/resume/:userId/resume/:filename` - Directly access resume file
- `DELETE /api/media/resume/:key` - Delete resume

### Publishing

- `GET /api/publish/status` - Get publishing status
- `PUT /api/publish/subdomain` - Update custom subdomain
- `POST /api/publish` - Publish portfolio
- `DELETE /api/publish` - Unpublish portfolio

### Public Access

- `GET /api/public/:subdomain` - Get published portfolio by subdomain

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Start production server
npm start
```

## Error Handling

The API uses a centralized error handling middleware that returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Security

### Authentication & Authorization

- JWT-based authentication with configurable expiration
- Protected routes with middleware authentication
- Role-based access control for admin functions
- Secure session management with express-session

### Data Security

- CORS enabled with configurable origins
- Request validation using express-validator
- Secure password hashing with bcrypt
- MongoDB injection prevention

### File Upload Security

- Secure file uploads with size and type validation
- Cloudflare R2 for secure media storage
- Signed URLs for temporary file access
- File scanning for malware (optional)

### API Security

- Rate limiting for API endpoints
- Request sanitization
- XSS protection
- CSRF protection

### Configuration Security

- Environment variable validation
- Secure secrets management
- Production security best practices
- Regular security audits

## Production Deployment

### Prerequisites

1. Set up MongoDB Atlas cluster:
   - Create a new cluster in your preferred region
   - Configure network access and database user
   - Get the connection string

2. Configure Cloudflare services:
   - Set up Cloudflare R2 bucket for file storage
   - Configure Cloudflare Images for image optimization
   - Generate necessary API tokens and credentials
   - Create separate tokens for Cloudflare Images API

3. Set up OAuth applications:
   - GitHub OAuth App with production callback URLs
   - Google Cloud Console project with OAuth credentials
   - Update callback URLs for production environment

### Deployment Steps

1. Prepare for production:

   ```bash
   # Install dependencies
   npm install --production
   
   # Build assets if needed
   npm run build
   ```

2. Configure production environment:
   - Set NODE_ENV=production
   - Update all callback URLs to production domain
   - Configure production MongoDB connection
   - Set up proper logging and monitoring

3. Deploy to hosting platform:
   - Heroku: Configure Procfile and environment variables
   - AWS: Set up Elastic Beanstalk or EC2 instance
   - Digital Ocean: Configure App Platform or Droplet
   - Vercel: Configure serverless deployment

4. Post-deployment tasks:
   - Set up SSL/TLS certificates
   - Configure domain and DNS settings
   - Set up monitoring and alerting
   - Configure backup strategy

### Monitoring and Maintenance

- Set up application monitoring (e.g., New Relic, DataDog)
- Configure error tracking (e.g., Sentry)
- Set up automated backups for MongoDB
- Implement logging and analytics

### Troubleshooting

- Check application logs for errors
- Verify environment variables
- Ensure database connectivity
- Test OAuth flows in production
- Validate media upload functionality

## License

MIT
