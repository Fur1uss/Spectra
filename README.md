# 👻 Spectra

<div align="center">
  <img src="public/ghost.webp" alt="Spectra Logo" width="200"/>
  
  **A Modern Paranormal Case Reporting Platform**
  
  [![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
  [![React Router](https://img.shields.io/badge/React_Router-7.9-CA4245?logo=reactrouter)](https://reactrouter.com/)
</div>

---

## 📖 About

**Spectra** is a centralized platform for reporting and exploring paranormal cases from around the world. Whether it's ghosts, UFO sightings, cryptozoology, parapsychology, or unexplained mysteries, Spectra provides a space for users to document and share their extraordinary experiences.

Built for the Spanish-speaking community with a modern, responsive interface, Spectra combines cutting-edge web technologies to deliver a fast and engaging user experience.

---

## ✨ Features

- 🔐 **Secure Authentication** - User registration and login with bcrypt password hashing
- 📝 **Case Reporting** - Multi-step form for submitting detailed paranormal case reports
- 📷 **Multimedia Support** - Upload images, videos, and audio files for your cases
- 🗺️ **Location Tracking** - Interactive map integration with Leaflet for case locations
- 🏷️ **Case Categories** - Organized by type: UFOlogy, Cryptozoology, Paranormal Entities, Poltergeist Activity, and more
- 💬 **Community Engagement** - Comment system for discussion and collaboration
- 👤 **User Profiles** - Personalized profiles to manage your cases
- 🔍 **Case Discovery** - Browse and search through reported cases
- ⚡ **Real-time Updates** - Fast and responsive with React 19 and Vite 7

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **Vite 7** - Lightning-fast build tool and dev server
- **React Router v7** - Client-side routing and navigation
- **GSAP** - Advanced animations
- **Leaflet** - Interactive maps for location visualization
- **React Icons** - Comprehensive icon library
- **Fuse.js** - Fuzzy search functionality

### Backend & Database
- **Supabase** - PostgreSQL database and authentication
- **Supabase Storage** - File storage for multimedia content

### Security
- **bcryptjs** - Password hashing (10 salt rounds)

### Development Tools
- **ESLint** - Code quality and consistency
- **pnpm** - Fast and efficient package manager

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Supabase account** for database and storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fur1uss/Spectra.git
   cd Spectra
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint to check code quality |

---

## 🏗️ Project Structure

```
Spectra/
├── public/                 # Static assets
│   ├── ghost.webp         # Logo and branding
│   └── ...
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── NavBar/        # Navigation bar
│   │   ├── UploadStepper/ # Multi-step case upload form
│   │   ├── LoginForm/     # Login component
│   │   ├── MediaViewer/   # Multimedia display
│   │   ├── LocationSelector/ # Location picker
│   │   └── ...
│   ├── pages/             # Page-level components
│   │   ├── LandingPage/   # Home page
│   │   ├── Login/         # Login page
│   │   ├── Hub/           # Case listing
│   │   ├── Upload/        # Case upload page
│   │   ├── ViewCase/      # Individual case view
│   │   └── Profile/       # User profile
│   ├── context/           # React context providers
│   │   └── AuthContext.jsx # Global authentication state
│   ├── utils/             # Utility functions
│   │   ├── auth.js        # Authentication logic
│   │   ├── supabase.js    # Supabase client
│   │   ├── uploadHandler.js # File upload logic
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── App.jsx            # Route definitions
│   └── main.jsx           # Application entry point
├── .github/
│   ├── DATABASE.md        # Database schema documentation
│   └── copilot-instructions.md
├── ROUTER_GUIDE.md        # React Router setup guide
├── package.json
└── vite.config.js
```

---

## 🎯 Key Features Explained

### Multi-Step Case Upload

The case upload process is divided into 4 intuitive steps:

1. **Case Details** - Select case type and date/time of occurrence
2. **Location** - Specify country, region, and exact address
3. **Description** - Detailed narrative (minimum 50 characters)
4. **Multimedia** - Upload supporting evidence (images, videos, audio)

**File Restrictions:**
- Images (JPG, PNG, WebP, GIF): Unlimited
- Videos (MP4, WebM, MOV): Maximum 1 per case
- Audio (MP3, WAV, M4A, AAC): Maximum 2 per case

### Authentication System

- **Secure Registration** - Passwords hashed with bcrypt (10 salt rounds)
- **Session Management** - LocalStorage with cross-tab synchronization
- **Protected Routes** - Automatic redirect to login for unauthorized access
- **User Data** - Stored securely in Supabase PostgreSQL database

### Database Architecture

Spectra uses a relational database with the following key tables:

- **User** - User accounts and profiles
- **Case** - Paranormal case reports
- **Case_Type** - Categorization (UFOlogy, Cryptozoology, etc.)
- **Location** - Geographic data for cases
- **Files** - References to uploaded multimedia
- **Comment** - User discussions on cases

For detailed schema documentation, see [DATABASE.md](.github/DATABASE.md).

---

## 🗺️ Routing

React Router v7 manages all navigation:

| Route | Component | Description | NavBar |
|-------|-----------|-------------|--------|
| `/` | LandingPage | Home page | ✅ |
| `/login` | LoginPage | User login | ❌ |
| `/registration` | RegistrationPage | New user signup | ❌ |
| `/main` | Main | Main dashboard | ✅ |
| `/hub` | Hub | Browse all cases | ✅ |
| `/upload` | UploadStepper | Submit new case | ✅ |
| `/profile` | ProfilePage | User profile | ✅ |
| `/case/:caseId` | ViewCase | Individual case details | ✅ |

For more routing details, see [ROUTER_GUIDE.md](ROUTER_GUIDE.md).

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

---

## 🎨 Design System

- **Typography**:
  - Primary: Figtree (300-900 weight range)
  - Display: Major Mono Display
  - Accent: Bayon
  
- **Color Scheme**: Dark theme optimized for paranormal content
- **Responsive Design**: Mobile-first approach
- **Animations**: GSAP for smooth, professional transitions

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style (ESLint configuration)
- Use pure JavaScript/JSX (no TypeScript)
- Unused component variables (capitalized) are ignored by ESLint
- Test your changes before submitting
- Update documentation when adding new features

---

## 📚 Documentation

- **[Database Schema](.github/DATABASE.md)** - Complete database documentation with tables, relationships, and queries
- **[Router Guide](ROUTER_GUIDE.md)** - React Router v7 configuration and usage
- **[Copilot Instructions](.github/copilot-instructions.md)** - AI coding assistant guidelines

---

## 🐛 Known Issues & Future Enhancements

### Current Status
- ✅ User authentication and registration
- ✅ Case upload with multimedia support
- ✅ Database schema fully implemented
- ⏳ Comment system (database ready, UI in progress)
- ⏳ Case visualization improvements
- ⏳ Advanced search and filtering

### Planned Features
- 🔜 Social features (likes, shares, follows)
- 🔜 Advanced analytics and statistics
- 🔜 Email notifications
- 🔜 Mobile app (React Native)
- 🔜 AI-powered case categorization
- 🔜 Multi-language support (English, Portuguese)

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👥 Team

Built with 👻 by the Spectra development team.

---

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Contact the development team

---

<div align="center">
  <p><strong>Spectra</strong> - Documenting the Unexplained</p>
  <p>Made with React 19, Vite 7, and a passion for the paranormal 🌙</p>
</div>
