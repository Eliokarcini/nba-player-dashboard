import React, { useState } from 'react';

const API_BASE = 'http://localhost:5001/api/players';

export default function PlayerSearch() {
  const [name, setName] = useState('');
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!name) return alert('Please enter a player name');
    setLoading(true);
    setPlayer(null);

    try {
      const res = await fetch(`${API_BASE}/search?name=${encodeURIComponent(name)}`);
      const json = await res.json();
      if (!json.response || json.response.length === 0) {
        alert('No player found. Try "Curry", "Durant", "Jokic", etc.');
        return;
      }
      
      const playerData = json.response[0];
      setPlayer(playerData);
    } catch (err) {
      console.error(err);
      alert('Search failed - please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏀 NBA Player Finder</h1>
        <p style={styles.subtitle}>Search for any NBA player and view their profile</p>
      </div>

      <div style={styles.searchContainer}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter player name (e.g., Stephen Curry, Kevin Durant, Giannis...)"
          style={styles.searchInput}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch} 
          style={loading ? styles.searchButtonLoading : styles.searchButton}
          disabled={loading}
        >
          {loading ? '🔍 Searching...' : '🔍 Search Player'}
        </button>
      </div>

      {player && (
        <div style={styles.playerCard}>
          <div style={styles.playerHeader}>
            <h2 style={styles.playerName}>
              {player.first_name} {player.last_name}
              {player.jersey_number && <span style={styles.jersey}>#{player.jersey_number}</span>}
            </h2>
            {player.team && (
              <div style={styles.teamBadge}>
                {player.team.abbreviation} • {player.team.city} {player.team.name}
              </div>
            )}
          </div>

          <div style={styles.playerInfo}>
            <div style={styles.infoSection}>
              <h3 style={styles.sectionTitle}>Player Details</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Position:</span>
                  <span style={styles.infoValue}>{player.position}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Height:</span>
                  <span style={styles.infoValue}>{player.height || 'N/A'}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Weight:</span>
                  <span style={styles.infoValue}>{player.weight ? `${player.weight} lbs` : 'N/A'}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Country:</span>
                  <span style={styles.infoValue}>{player.country || 'N/A'}</span>
                </div>
              </div>
            </div>

            {(player.college || player.draft_year) && (
              <div style={styles.infoSection}>
                <h3 style={styles.sectionTitle}>Background</h3>
                {player.college && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>College:</span>
                    <span style={styles.infoValue}>{player.college}</span>
                  </div>
                )}
                {player.draft_year && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Draft:</span>
                    <span style={styles.infoValue}>
                      {player.draft_year} • Round {player.draft_round} • Pick {player.draft_number}
                    </span>
                  </div>
                )}
              </div>
            )}

            {player.team && (
              <div style={styles.infoSection}>
                <h3 style={styles.sectionTitle}>Team Information</h3>
                <div style={styles.teamInfo}>
                  <div style={styles.teamItem}>
                    <span style={styles.infoLabel}>Full Name:</span>
                    <span style={styles.infoValue}>{player.team.full_name}</span>
                  </div>
                  <div style={styles.teamItem}>
                    <span style={styles.infoLabel}>Conference:</span>
                    <span style={styles.infoValue}>{player.team.conference}</span>
                  </div>
                  <div style={styles.teamItem}>
                    <span style={styles.infoLabel}>Division:</span>
                    <span style={styles.infoValue}>{player.team.division}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!player && !loading && (
        <div style={styles.tips}>
          <h3>💡 Try searching for:</h3>
          <div style={styles.examples}>
            <span style={styles.example}>Stephen Curry</span>
            <span style={styles.example}>Kevin Durant</span>
            <span style={styles.example}>Giannis Antetokounmpo</span>
            <span style={styles.example}>Luka Doncic</span>
            <span style={styles.example}>Jayson Tatum</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    color: '#1d428a',
    fontSize: '2.5rem',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem'
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    justifyContent: 'center'
  },
  searchInput: {
    padding: '12px 16px',
    width: '400px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  searchInputFocus: {
    borderColor: '#1d428a'
  },
  searchButton: {
    padding: '12px 24px',
    backgroundColor: '#1d428a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  searchButtonLoading: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'not-allowed'
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0'
  },
  playerHeader: {
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '20px',
    marginBottom: '25px'
  },
  playerName: {
    color: '#1d428a',
    fontSize: '2rem',
    margin: '0 0 10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  jersey: {
    backgroundColor: '#1d428a',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  teamBadge: {
    backgroundColor: '#c8102e',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    display: 'inline-block'
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  infoSection: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  sectionTitle: {
    color: '#1d428a',
    margin: '0 0 15px 0',
    fontSize: '1.3rem'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  teamItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#495057',
    minWidth: '120px'
  },
  infoValue: {
    color: '#212529',
    fontWeight: '500'
  },
  teamInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tips: {
    textAlign: 'center',
    marginTop: '40px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  examples: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '15px'
  },
  example: {
    backgroundColor: '#e9ecef',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#495057'
  }
}; 
