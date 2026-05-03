'use client';

import { useAuth } from '@/lib/auth/useAuth';
import FantasyDashboard from '@/components/FantasyDashboard';
import Link from 'next/link';

// Mock fantasy team data
const mockTeam = {
  teamName: 'Velocity Racing',
  totalPoints: 342,
  budgetRemaining: 4.5,
  drivers: [
    { driverNumber: 1, nameAcronym: 'VER', fullName: 'Max Verstappen', teamColour: '#3671C6', cost: 35.5, points: 102 },
    { driverNumber: 16, nameAcronym: 'LEC', fullName: 'Charles Leclerc', teamColour: '#E8002D', cost: 28.0, points: 85 },
    { driverNumber: 55, nameAcronym: 'SAI', fullName: 'Carlos Sainz', teamColour: '#E8002D', cost: 22.5, points: 62 },
    { driverNumber: 81, nameAcronym: 'PIA', fullName: 'Oscar Piastri', teamColour: '#FF8000', cost: 18.0, points: 58 },
    { driverNumber: 4, nameAcronym: 'NOR', fullName: 'Lando Norris', teamColour: '#FF8000', cost: 31.0, points: 78 },
  ],
  constructor: { name: 'McLaren', cost: 35.0, points: 136, colour: '#FF8000' },
  pointsHistory: [18, 42, 58, 76, 92, 108, 124, 142, 168, 192, 218, 236, 258, 276, 298, 312, 328, 342],
};

/**
 * Authentication loading skeleton
 */
function AuthLoadingSkeleton() {
  return (
    <div className="max-w-2xl">
      <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-4">
        {/* Header skeleton */}
        <div className="animate-pulse h-8 w-48 bg-white/[0.1] rounded mb-6" />
        
        {/* Budget skeleton */}
        <div className="animate-pulse h-3 w-32 bg-white/[0.1] rounded mb-2" />
        <div className="animate-pulse h-2 w-full bg-white/[0.1] rounded-full mb-6" />
        
        {/* Roster skeleton */}
        <div className="animate-pulse h-4 w-16 bg-white/[0.1] rounded mb-3" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse w-[140px] h-24 bg-white/[0.05] rounded-lg" />
          ))}
        </div>
        
        {/* Chart skeleton */}
        <div className="animate-pulse h-4 w-32 bg-white/[0.1] rounded mb-3 mt-6" />
        <div className="animate-pulse h-28 w-full bg-white/[0.05] rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Not authenticated prompt
 */
function NotAuthenticatedPrompt() {
  return (
    <div className="max-w-2xl">
      <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-xl p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.05] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-f1-silver"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        
        {/* Title */}
        <h2 className="font-heading text-xl font-bold text-f1-white mb-2">
          Sign in to manage your fantasy team
        </h2>
        
        {/* Description */}
        <p className="text-f1-silver text-sm mb-6">
          Create your team, track your points, and compete with other F1 fans
        </p>
        
        {/* Sign In Button */}
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-f1-red text-white rounded-lg font-medium hover:bg-f1-red/90 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v-4a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3h7a3 3 0 003-3v-4"
            />
          </svg>
          Sign In
        </Link>
      </div>
    </div>
  );
}

/**
 * Fantasy page footer links
 */
function QuickLinks() {
  return (
    <div className="flex gap-4 mt-8">
      <Link
        href="/fantasy/leagues"
        className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] rounded-lg border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
      >
        <svg
          className="w-5 h-5 text-f1-silver"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H8m8 0V9a3 3 0 00-5.356-1.857M17 20v-2a3 3 0 00-5.356-1.857M8 20H3v2a3 3 0 005.356 1.857M8 20v-2a3 3 0 00-5.356-1.857M12 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-f1-white text-sm font-medium">Leagues</span>
      </Link>
      
      <Link
        href="/fantasy/scoring"
        className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] rounded-lg border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
      >
        <svg
          className="w-5 h-5 text-f1-silver"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span className="text-f1-white text-sm font-medium">Scoring</span>
      </Link>
    </div>
  );
}

/**
 * Fantasy F1 League page
 * 
 * Allows users to sign in, manage their fantasy team, view points history,
 * and navigate to leagues and scoring info
 */
export default function FantasyPage() {
  const { user, loading } = useAuth();
  
  // Loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-f1-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-f1-white mb-2">
              FANTASY
            </h1>
            <p className="text-f1-silver">Build and manage your fantasy F1 team</p>
          </header>
          
          {/* Loading skeleton */}
          <AuthLoadingSkeleton />
        </div>
      </div>
    );
  }
  
  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-f1-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-f1-white mb-2">
              FANTASY
            </h1>
            <p className="text-f1-silver">Build and manage your fantasy F1 team</p>
          </header>
          
          {/* Sign in prompt */}
          <NotAuthenticatedPrompt />
        </div>
      </div>
    );
  }
  
  // Authenticated - show dashboard with mock data
  return (
    <div className="min-h-screen bg-f1-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-f1-white mb-2">
            FANTASY
          </h1>
          <p className="text-f1-silver">Build and manage your fantasy F1 team</p>
        </header>
        
        {/* Dashboard */}
        <FantasyDashboard team={mockTeam} />
        
        {/* Quick Links */}
        <QuickLinks />
      </div>
    </div>
  );
}