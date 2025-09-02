import React, { useEffect, useState } from 'react';

// IMPORTANT: DO NOT EDIT THESE VARIABLES.
const CLIENT_ID = '0aff9184d31a40d2b536e1d2778052bb'; 
const REDIRECT_URI = 'https://musicohouse.netlify.app/login';
const SCOPES = 'user-read-private user-read-email user-top-read user-read-currently-playing playlist-modify-public playlist-modify-private user-read-recently-played';
const AUTH_URL = `https://accounts.spotify.com/authorize`;
const TOKEN_URL = `https://accounts.spotify.com/api/token`;

// PKCE utility functions for generating code_verifier and code_challenge
function dec2hex(dec) {
  return ('0' + dec.toString(16)).substr(-2);
}

function generateRandomString(length) {
  const array = new Uint32Array(length / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => dec2hex(dec)).join('');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return base64urlencode(hash);
}

function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier) {
  const hashed = await sha256(codeVerifier);
  return base64urlencode(hashed);
}

// User Content Page component
const UserContentPage = ({ token, onLogout }) => {
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);
  const [totalMinutesListened, setTotalMinutesListened] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('short_term');

  useEffect(() => {
    const fetchContent = async () => {
      if (!token) {
        setError("No access token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch user profile
        const profileResponse = await fetch('https://api.spotify.com/v1/me', { headers });
        if (profileResponse.status === 401) { onLogout(); return; }
        const profileData = await profileResponse.json();
        setUserProfile(profileData);

        const tracksResponse = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=${timeRange}`, { headers });
        if (tracksResponse.status === 401) { onLogout(); return; }
        const tracksData = await tracksResponse.json();
        setTopTracks(tracksData.items);

        const artistsResponse = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=5&time_range=${timeRange}`, { headers });
        if (artistsResponse.status === 401) { onLogout(); return; }
        const artistsData = await artistsResponse.json();
        setTopArtists(artistsData.items);
        
        const currentlyPlayingResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers });
        if (currentlyPlayingResponse.status === 401) { onLogout(); return; }
        if (currentlyPlayingResponse.status === 204) {
          setCurrentlyPlaying(null);
        } else {
          const currentlyPlayingData = await currentlyPlayingResponse.json();
          setCurrentlyPlaying(currentlyPlayingData);
        }

        const recentTracksResponse = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=50`, { headers });
        if (recentTracksResponse.status === 401) { onLogout(); return; }
        const recentTracksData = await recentTracksResponse.json();
        setRecentTracks(recentTracksData.items);

        // Calculate total minutes listened in the last 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const totalMs = recentTracksData.items.reduce((total, item) => {
          const playedAt = new Date(item.played_at).getTime();
          if (playedAt > sevenDaysAgo) {
            return total + item.track.duration_ms;
          }
          return total;
        }, 0);
        setTotalMinutesListened(Math.round(totalMs / 60000));

      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load content. Please check your network or try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [token, onLogout, timeRange]);

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  const getButtonStyles = (range) => {
    const isSelected = timeRange === range;
    return {
      backgroundColor: isSelected ? '#10b981' : '#374151',
      color: isSelected ? '#fff' : '#d1d5db',
      fontWeight: '600',
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
    };
  };

  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '64rem', margin: '0 auto' }}>
        <div className="account-bg">

        </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#fff' }}>Your Spotify Content</h2>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#ef4444', color: '#fff', fontWeight: '600', padding: '0.5rem 1.5rem',
            borderRadius: '9999px', transition: 'all 0.3s ease-in-out', outline: 'none',
            border: 'none', cursor: 'pointer',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
        >
          Logout
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '12rem' }}>
          <svg className="animate-spin" style={{ height: '2.5rem', width: '2.5rem', color: '#4ade80' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p style={{ marginLeft: '1rem', color: '#9ca3af' }}>Loading your content...</p>
        </div>
      )}

      {error && (
        <div style={{ color: '#f87171', textAlign: 'center' }}>
          <p>Error: {error}</p>
          <p>Please check your network connection or try logging in again.</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '64rem', margin: '0 auto' }}>
          {/* User Profile */}
          {userProfile && (
            <div style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src={userProfile.images[0]?.url || 'https://placehold.co/64x64/4B5563/E5E7EB?text=User'} 
                alt="Profile" 
                style={{ width: '4rem', height: '4rem', borderRadius: '50%' }} 
              />
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{userProfile.display_name}</h3>
                <p style={{ color: '#9ca3af' }}>{userProfile.email}</p>
              </div>
            </div>
          )}

          {/* Currently Playing */}
          <div style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#4ade80' }}>Currently Playing</h3>
            {currentlyPlaying && currentlyPlaying.item ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={currentlyPlaying.item.album.images[0]?.url || 'https://placehold.co/64x64/4B5563/E5E7EB?text=No+Image'}
                  alt={currentlyPlaying.item.name}
                  style={{ width: '4rem', height: '4rem', borderRadius: '0.375rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#fff' }}>{currentlyPlaying.item.name}</h4>
                  <p style={{ color: '#9ca3af' }}>{currentlyPlaying.item.artists.map(a => a.name).join(', ')}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#9ca3af' }}>Nothing currently playing.</p>
            )}
          </div>

          {/* Minutes Listened */}
          <div style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h3 className='details'>Minutes Listened (Last 7 Days)</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{totalMinutesListened}</p>
          </div>

          {/* Top Tracks */}
          <div >
            <div >
              <h3 className='details'>Top Tracks</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleTimeRangeChange('short_term')}
                  style={getButtonStyles('short_term')}
                >
                  1 Month
                </button>
                <button
                  onClick={() => handleTimeRangeChange('medium_term')}
                  style={getButtonStyles('medium_term')}
                >
                  6 Months
                </button>
                <button
                  onClick={() => handleTimeRangeChange('long_term')}
                  style={getButtonStyles('long_term')}
                >
                  1 Year
                </button>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: '10px', margin: '0' }}>
              {topTracks.map(track => (
                <li key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#374151', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                  <img
                    src={track.album.images[0]?.url || 'https://placehold.co/48x48/4B5563/E5E7EB?text=No+Image'}
                    alt={track.name}
                    style={{ width: '3rem', height: '3rem', borderRadius: '0.375rem' }}
                  />
                  <div>
                    <p style={{ fontWeight: '600', color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{track.name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{track.artists.map(a => a.name).join(', ')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Artists */}
          <div >
            <h3 className='details'>Top Artists</h3>
            <div className='artist-con'>
              {topArtists.map(artist => (
                <div key={artist.id} >
                  <img
                    src={artist.images[0]?.url || 'https://placehold.co/80x80/4B5563/E5E7EB?text=No+Image'}
                    alt={artist.name}
                    style={{ width: '5rem', height: '5rem', borderRadius: '9999px', marginBottom: '0.5rem' }}
                  />
                  <p style={{ fontWeight: '600', color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>{artist.name}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recently Played */}
          <div>
            <h3 className='details'> Recently Played (Last 50)</h3>
            <ul className='recent-play-ul'>
              {recentTracks.map(item => (
                <li key={item.played_at} className='recent-play-li'>
                  <img
                    src={item.track.album.images[0]?.url || 'https://placehold.co/48x48/4B5563/E5E7EB?text=No+Image'}
                    alt={item.track.name}
                    className='recent-img'
                  />
                  <div>
                    <p className=' recent-details'>{item.track.name}</p>
                    <p className=' recent-details'>{item.track.artists.map(a => a.name).join(', ')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const codeVerifier = window.localStorage.getItem('spotify-code-verifier');

    if (code && codeVerifier) {
      setLoading(true);
      fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: codeVerifier,
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch access token');
        }
        return response.json();
      })
      .then(data => {
        setToken(data.access_token);
        window.localStorage.setItem('spotify-token', data.access_token);
        window.localStorage.removeItem('spotify-code-verifier');
        window.history.replaceState({}, null, REDIRECT_URI);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      const existingToken = window.localStorage.getItem('spotify-token');
      if (existingToken) {
        setToken(existingToken);
      }
    }
  }, []);

  const handleLogin = async () => {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await sha256(codeVerifier);
    
    window.localStorage.setItem('spotify-code-verifier', codeVerifier);

    const authUrl = new URL(AUTH_URL);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('scope', SCOPES);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);

    window.location.href = authUrl.toString();
  };

  const handleLogout = () => {
    setToken('');
    window.localStorage.removeItem('spotify-token');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="animate-spin" style={{ height: '2rem', width: '2rem', color: '#4ade80' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p style={{ marginLeft: '1rem', color: '#9ca3af' }}>Loading...</p>
        </div>
      );
    }
    
    if (token) {
      return (
        <UserContentPage token={token} onLogout={handleLogout} />
      );
    }

    return (
      <div>
        <div className="bg-img_login">
            <img className='bg-img_login' src="/wp4132748-pop-rock-wallpapers.jpg" alt="" />
        </div>
        <div>
          <h1>Bumper</h1>
          <button
            onClick={handleLogin}
          >
            Login with Spotify
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default App;
