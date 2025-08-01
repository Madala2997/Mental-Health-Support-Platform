#Mental Health Support Platform

A comprehensive mental health support platform designed specifically for students, providing a safe space for emotional well-being, peer support, and professional counseling.

## 🌟 Features

### Core Modules
- **User Authentication**: Secure login/signup with Google OAuth integration
- **Resource Hub**: Curated mental health articles, videos, and self-help guides
- **Anonymous Journaling**: Safe space to share feelings and experiences
- **Peer Support Forum**: Community discussions on various mental health topics
- **Professional Chat**: Connect with verified counselors and peer mentors
- **Mood Tracker**: Daily mood logging with analytics and trend visualization
- **Admin Dashboard**: Content moderation and user management

### Enhanced Features
- Real-time chat with Socket.IO
- Responsive design for all devices
- Anonymous posting options
- Content moderation system
- Mood analytics and insights
- Emergency support integration ready
- Secure and private environment

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO
- **Authentication**: JWT, Google OAuth 2.0
- **Deployment**: Render (Production Ready)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Google OAuth credentials

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Mental-Health-Support-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the following variables:
   ```env
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<secure-random-string>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   PORT=3000
   NODE_ENV=production
   
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
Mental-Health-Support-Platform/
├── models/           # MongoDB schemas
│   ├── User.js
│   ├── Resource.js
│   ├── Journal.js
│   ├── Forum.js
│   ├── Chat.js
│   └── Mood.js
├── routes/           # API routes
│   ├── auth.js
│   ├── resources.js
│   ├── journal.js
│   ├── forum.js
│   ├── chat.js
│   ├── mood.js
│   └── admin.js
├── middleware/       # Custom middleware
│   └── auth.js
├── public/           # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js         # Main server file
├── package.json
├── .env.example
└── README.md
```

## 🔐 Authentication

### Regular Authentication
- Email/password registration and login
- JWT token-based authentication
- Role-based access control (Student, Counselor, Admin)

### Google OAuth Integration
- One-click Google sign-in
- Secure token verification
- Automatic account creation

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get single resource
- `POST /api/resources` - Create resource (Admin only)
- `POST /api/resources/:id/like` - Like/unlike resource

### Journal
- `GET /api/journal` - Get public journal entries
- `GET /api/journal/my-entries` - Get user's entries
- `POST /api/journal` - Create journal entry
- `POST /api/journal/:id/react` - React to entry
- `POST /api/journal/:id/comment` - Comment on entry

### Forum
- `GET /api/forum` - Get forum posts
- `GET /api/forum/:id` - Get single post
- `POST /api/forum` - Create forum post
- `POST /api/forum/:id/reply` - Reply to post
- `POST /api/forum/:id/upvote` - Upvote post

### Mood Tracker
- `GET /api/mood` - Get mood history
- `GET /api/mood/analytics` - Get mood analytics
- `POST /api/mood` - Log daily mood
- `GET /api/mood/today` - Get today's mood

### Chat
- `GET /api/chat` - Get user's chats
- `GET /api/chat/:id` - Get single chat
- `POST /api/chat/counselor` - Start counselor chat
- `POST /api/chat/:id/message` - Send message

### Admin
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/reported` - Get reported content

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Environment variable protection

## 🎨 UI/UX Features

- Modern, clean design
- Responsive layout for all devices
- Intuitive navigation
- Accessibility considerations
- Dark/light theme support ready
- Smooth animations and transitions
- Mobile-first approach

## 🚀 Deployment

### Render Deployment
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic builds

### Environment Variables for Production
```env
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<secure-random-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NODE_ENV=production
PORT=3000
SESSION_SECRET=<secure-session-secret>
```

## 👥 User Roles

### Student
- Access all resources
- Create journal entries
- Participate in forums
- Chat with counselors and peers
- Track mood

### Counselor
- All student features
- Receive chat requests
- Provide professional support
- Access to counselor resources

### Admin
- All user features
- User management
- Content moderation
- Analytics dashboard
- Resource management

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```

### Code Structure Guidelines
- Follow MVC architecture
- Use async/await for asynchronous operations
- Implement proper error handling
- Add input validation for all endpoints
- Use meaningful variable and function names

## 📈 Analytics & Monitoring

- User engagement tracking
- Mood trend analysis
- Resource popularity metrics
- Chat session analytics
- Content moderation statistics

## 🆘 Support Features

- Anonymous posting options
- Content reporting system
- Automated moderation
- Emergency helpline integration ready
- Crisis intervention protocols

## 🔮 Future Enhancements

- AI-powered emotion detection
- Mindfulness meditation toolkit
- Gamification elements
- Mobile app development
- Advanced analytics dashboard
- Multi-language support
- Offline mode capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- Mental health professionals who provided guidance
- Students who shared their experiences
- Open source community for tools and libraries
- Educational institutions supporting mental health initiatives

---

