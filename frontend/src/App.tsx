import JudyPage from './pages/JudyPage';
import { Routes, Route } from 'react-router-dom'
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import IntroLoader from './components/layout/IntroLoader'
import WhatsAppButton from './components/layout/WhatsAppButton'

// Eagerly loaded — critical path
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/login/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import MembershipPage from './pages/membership/MembershipPage'

// Lazy loaded — not needed on first paint
const PortfolioPage = lazy(() => import('./pages/portfolio/PortfolioPage'))
const ProjectDetailPage = lazy(() => import('./pages/portfolio/ProjectDetailPage'))
const BlogPage = lazy(() => import('./pages/blog/BlogPage'))
const BlogPostDetailPage = lazy(() => import('./pages/blog/BlogPostDetailPage'))
const ServicesPage = lazy(() => import('./pages/services/ServicesPage'))
const ShopPage = lazy(() => import('./pages/shop/ShopPage'))
const HobbiesPage = lazy(() => import('./pages/hobbies/HobbiesPage'))
const PhotographyPage = lazy(() => import('./pages/hobbies/PhotographyPage'))
const CookingPage = lazy(() => import('./pages/hobbies/CookingPage'))
const ArcadePage = lazy(() => import('./pages/hobbies/ArcadePage'))
const ContactPage = lazy(() => import('./pages/contact/ContactPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const UpgradePage = lazy(() => import('./pages/checkout/UpgradePage'))
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))

// Lazy loaded — heavy AI widget
const AetshChatWidget = lazy(() => import('./components/aetsh69/AetshChatWidget'))
const DonationWidget = lazy(() => import('./components/donation/DonationWidget'))
const CartDrawer = lazy(() => import('./components/shop/CartDrawer'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-rust border-t-transparent animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <IntroLoader />
      <motion.div 
        className="min-h-screen flex flex-col" 
        style={{ backgroundColor: '#161614', color: '#F2EFE9' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Header />
        <main className="flex-1">
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/portfolio" element={<PortfolioPage/>} />
              <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/hobbies" element={<HobbiesPage />}/>
              <Route path="/photography" element={<PhotographyPage />} />
              <Route path="/cooking" element={<CookingPage />}/>
              <Route path="/arcade" element={<ArcadePage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/contact" element={<ContactPage />}/>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/Judy" element={<JudyPage />} />
  <Route path="/judy" element={<JudyPage />} />
</Routes>
          </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <Suspense fallback={null}>
          <AetshChatWidget />
        </Suspense>
        <Suspense fallback={null}>
          <DonationWidget />
        </Suspense>
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
        <WhatsAppButton />
      </motion.div>
    </>
  )
}
