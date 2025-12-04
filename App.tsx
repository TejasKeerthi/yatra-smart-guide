import React, { useState, useCallback, useEffect, Component, ReactNode } from 'react';
import { Search, MapPin, Sparkles, ArrowRight, Loader2, LogOut, User as UserIcon, Info, Moon, Sun, Plane, Map } from 'lucide-react';
import { AppState, Attraction, GeneratedItinerary } from './types';
import { searchAttractionsInLocation, generateTripItinerary } from './services/geminiService';
import { getItineraryFromCloud } from './services/shareService';
import { AttractionCard } from './components/AttractionCard';
import { AttractionDetailsModal } from './components/AttractionDetailsModal';
import { ItineraryView } from './components/ItineraryView';
import { LoginPage } from './components/LoginPage';
import { logoutUser, subscribeToAuthChanges } from './services/authService';

// --- Hero Slideshow Component ---
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1595053826286-2e5960912c8d?q=80&w=2070&auto=format&fit=crop", // India Gate (Delhi)
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop", // Taj Mahal (Agra)
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2071&auto=format&fit=crop", // Kerala Backwaters
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2067&auto=format&fit=crop", // Hawa Mahal (Jaipur)
  "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=2000&auto=format&fit=crop"   // Golden Temple (Amritsar)
];

const HeroSlideshow: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {HERO_IMAGES.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
        >
          <img 
            src={img} 
            alt="Hero Background" 
            className="w-full h-full object-cover animate-ken-burns"
          />
          {/* Gradients to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/30" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}
    </div>
  );
};

// --- Dynamic Loading Component ---
const LoadingScreen: React.FC<{ messages: string[] }> = ({ messages }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotate messages every 2 seconds
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    // Fake progress bar
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        // Slower progress as it gets higher
        const increment = Math.max(0.5, (100 - prev) / 40);
        return prev + increment;
      });
    }, 100);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
    };
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500 z-10 relative px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-brand-400/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
           <Plane className="text-brand-400 animate-pulse" size={40} />
           <div className="absolute inset-0 border-t-2 border-brand-400 rounded-full animate-spin"></div>
        </div>
      </div>
      
      <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm mb-2 h-10 transition-all duration-300">
        {messages[msgIndex]}
      </h3>
      
      <div className="w-full max-w-xs h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-6">
        <div 
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium tracking-wide">
        Powered by Gemini AI
      </p>
    </div>
  );
};

// Error Boundary Component to prevent white screen crashes
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We encountered an unexpected issue. Please try refreshing the page.
            </p>
            <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded mb-6 overflow-auto text-left text-red-600">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App Logic State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [location, setLocation] = useState('');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [selectedAttractions, setSelectedAttractions] = useState<Attraction[]>([]);
  const [viewingAttraction, setViewingAttraction] = useState<Attraction | null>(null);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);

  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  useEffect(() => {
    // Subscribe to Firebase auth changes
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
      setIsAuthChecking(false);
    });
    
    // Safety timeout
    const checkTimer = setTimeout(() => {
        setIsAuthChecking((current) => {
            if (current) return false;
            return current;
        });
    }, 4000); 

    return () => {
      unsubscribe();
      clearTimeout(checkTimer);
    };
  }, []);

  // Check for shared trip in URL on mount/auth success
  useEffect(() => {
    if (user && appState === AppState.IDLE && !isLoadingShared) {
      const params = new URLSearchParams(window.location.search);
      const tripId = params.get('trip');
      
      if (tripId) {
        loadSharedTrip(tripId);
      }
    }
  }, [user]);

  const loadSharedTrip = async (id: string) => {
    setIsLoadingShared(true);
    try {
      const result = await getItineraryFromCloud(id);
      if (result) {
        setItinerary(result.itinerary);
        setLocation(result.location);
        setAppState(AppState.VIEWING_PLAN);
      } else {
        setError("The shared trip could not be found.");
      }
    } catch (e) {
      setError("Failed to load shared trip.");
    } finally {
      setIsLoadingShared(false);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('trip');
      window.history.replaceState({}, '', url);
    }
  };

  // Handlers
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setAppState(AppState.SEARCHING);
    setError(null);
    try {
      const results = await searchAttractionsInLocation(location);
      setAttractions(results);
      setAppState(AppState.SELECTING);
    } catch (err) {
      setError("Failed to find attractions. Please check your connection or try a different city.");
      setAppState(AppState.IDLE);
    }
  };

  const toggleAttraction = useCallback((attraction: Attraction) => {
    setSelectedAttractions(prev => {
      const exists = prev.find(a => a.id === attraction.id);
      if (exists) {
        return prev.filter(a => a.id !== attraction.id);
      }
      return [...prev, attraction];
    });
  }, []);

  const handleGenerateItinerary = async () => {
    if (selectedAttractions.length === 0) return;

    setAppState(AppState.PLANNING);
    setError(null);
    try {
      const plan = await generateTripItinerary(location, selectedAttractions);
      setItinerary(plan);
      setAppState(AppState.VIEWING_PLAN);
    } catch (err) {
      setError("Failed to create itinerary. AI might be busy, please try again.");
      setAppState(AppState.SELECTING);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setLocation('');
    setAttractions([]);
    setSelectedAttractions([]);
    setItinerary(null);
    setError(null);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    handleReset();
  };

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
  };

  const handleGuestAccess = () => {
    setUser({ uid: 'guest', displayName: 'Guest Traveler', photoURL: null });
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-500" size={40} />
          <p className="text-slate-400 font-medium tracking-wide">INITIALIZING YATRA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onGuestAccess={handleGuestAccess} darkMode={darkMode} toggleTheme={toggleTheme} />;
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-brand-200 selection:text-brand-900 transition-colors duration-500 ${appState === AppState.IDLE ? 'overflow-hidden' : 'bg-slate-50 dark:bg-slate-950'}`}>
      
      {/* Background for IDLE state only */}
      {appState === AppState.IDLE && <HeroSlideshow />}

      {/* Details Modal */}
      {viewingAttraction && (
        <AttractionDetailsModal 
          attraction={viewingAttraction}
          isOpen={!!viewingAttraction}
          onClose={() => setViewingAttraction(null)}
          isSelected={selectedAttractions.some(a => a.id === viewingAttraction.id)}
          onToggle={toggleAttraction}
        />
      )}

      {/* Navbar */}
      <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${appState === AppState.IDLE ? 'bg-transparent py-6' : 'glass-panel border-b border-white/10 dark:border-slate-800 py-3'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
              Y
            </div>
            <span className={`font-bold text-2xl tracking-tight hidden sm:block ${appState === AppState.IDLE ? 'text-white' : 'text-slate-800 dark:text-white'}`}>Yatra</span>
          </div>

          <div className="flex items-center gap-4">
            
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-colors backdrop-blur-md ${appState === AppState.IDLE ? 'bg-white/10 text-white hover:bg-white/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

             <div className={`flex items-center gap-3 pl-4 border-l ${appState === AppState.IDLE ? 'border-white/20' : 'border-slate-200 dark:border-slate-700'}`}>
               <div className="text-right hidden sm:block">
                 <p className={`text-sm font-bold leading-tight ${appState === AppState.IDLE ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{user.displayName || 'Traveler'}</p>
                 <p className={`text-xs ${appState === AppState.IDLE ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                    {user.uid === 'guest' ? 'Guest Access' : 'Pro Member'}
                 </p>
               </div>
               {user.photoURL ? (
                 <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-lg object-cover" />
               ) : (
                 <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-lg text-brand-700 dark:text-brand-400">
                   <UserIcon size={20} />
                 </div>
               )}
               
               <button 
                onClick={handleLogout}
                className={`ml-2 p-2 rounded-lg transition-colors ${appState === AppState.IDLE ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                title="Sign Out"
               >
                 <LogOut size={20} />
               </button>
             </div>
          </div>
        </div>
      </header>

      <main className={`min-h-screen transition-all duration-500 ${appState === AppState.IDLE ? 'flex items-center justify-center px-4' : 'pt-24 px-6 max-w-7xl mx-auto'}`}>
        
        {isLoadingShared && (
          <LoadingScreen messages={["Retrieving trip from the cloud...", "Loading destination map...", "Getting everything ready..."]} />
        )}

        {appState === AppState.IDLE && !isLoadingShared && (
          <div className="relative z-10 w-full max-w-4xl text-center text-white animate-in slide-up fade-in duration-700">
            <div className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
              <Sparkles size={16} className="text-teal-300" />
              <span className="text-sm font-semibold tracking-wide text-teal-50">AI-POWERED LOCAL GUIDE</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tight drop-shadow-2xl">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">Magic</span> <br/>
              Everywhere.
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg">
              Experience the incredible diversity of India. 
              Enter a destination, and let AI craft your perfect journey.
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto relative group">
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-md group-hover:bg-white/40 transition-colors"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 p-2 flex items-center shadow-2xl transition-transform hover:scale-[1.02]">
                <div className="pl-4 text-white/70">
                  <MapPin size={24} />
                </div>
                <input
                  type="text"
                  placeholder="Search by city (e.g. 'Delhi') or category (e.g. 'Museums in Jaipur')"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent border-none text-xl text-white placeholder-white/60 px-4 py-4 focus:ring-0 outline-none font-medium"
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={!location.trim()}
                  className="bg-white text-slate-900 hover:bg-teal-50 px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                >
                  Explore
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-8 mx-auto max-w-md p-4 bg-red-500/20 backdrop-blur-md text-red-100 rounded-xl border border-red-500/30 flex items-center justify-center gap-2">
                <Info size={18} /> {error}
              </div>
            )}
            
            <div className="mt-16 flex justify-center gap-4 text-sm font-medium text-white/50">
               <span>Popular:</span>
               <button onClick={() => setLocation("Goa")} className="hover:text-white underline decoration-teal-400 decoration-2 underline-offset-4">Goa</button>
               <button onClick={() => setLocation("Jaipur")} className="hover:text-white underline decoration-teal-400 decoration-2 underline-offset-4">Jaipur</button>
               <button onClick={() => setLocation("Kerala")} className="hover:text-white underline decoration-teal-400 decoration-2 underline-offset-4">Kerala</button>
            </div>
          </div>
        )}

        {appState === AppState.SEARCHING && (
          <LoadingScreen messages={[
            `Scouting best spots in ${location}...`, 
            "Checking ratings and reviews...", 
            "Filtering for top-rated experiences..."
          ]} />
        )}

        {appState === AppState.SELECTING && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pb-24">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <button onClick={handleReset} className="text-sm text-slate-400 hover:text-brand-600 mb-2 font-medium flex items-center gap-1">
                   &larr; Back to Search
                </button>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Top Attractions in {location}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Select the places you'd like to visit. We'll handle the logistics.
                </p>
              </div>
              <div className="text-sm font-bold bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg text-slate-900 dark:text-slate-200 flex items-center gap-3">
                <span className="w-3 h-3 bg-brand-500 rounded-full animate-pulse"></span>
                <span className="text-brand-600 dark:text-brand-400 text-xl">{selectedAttractions.length}</span> selected
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {attractions.map((attraction, idx) => (
                <AttractionCard
                  key={attraction.id}
                  attraction={attraction}
                  index={idx}
                  isSelected={selectedAttractions.some(a => a.id === attraction.id)}
                  onToggle={toggleAttraction}
                  onViewDetails={setViewingAttraction}
                />
              ))}
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 w-full max-w-sm px-6">
               <button
                  onClick={handleGenerateItinerary}
                  disabled={selectedAttractions.length === 0}
                  className={`
                    w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform
                    ${selectedAttractions.length > 0 
                      ? 'bg-slate-900 dark:bg-brand-600 text-white hover:scale-105 hover:bg-slate-800 dark:hover:bg-brand-700' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed translate-y-20 opacity-0'}
                  `}
               >
                 <Sparkles size={20} className={selectedAttractions.length > 0 ? "text-yellow-400 animate-pulse" : ""} />
                 Create Itinerary
               </button>
            </div>
             {error && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 p-4 bg-red-50 dark:bg-red-900/90 text-red-600 dark:text-white rounded-lg shadow-xl border border-red-100 dark:border-red-800 z-50 animate-in fade-in slide-in-from-top-4">
                {error}
              </div>
            )}
          </div>
        )}

        {appState === AppState.PLANNING && (
          <LoadingScreen messages={[
            "Designing your perfect route...", 
            "Finding hidden gems nearby...", 
            "Locating best local food spots...", 
            "Calculating travel times...", 
            "Checking safety & budget tips...",
            "Finalizing your itinerary..."
          ]} />
        )}

        {appState === AppState.VIEWING_PLAN && itinerary && (
          <ItineraryView 
            itinerary={itinerary} 
            locationName={location}
            onReset={handleReset}
            darkMode={darkMode}
            coordinates={attractions[0]?.coordinates} // Pass first attraction coords for weather
          />
        )}

      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;