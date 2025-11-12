import React from 'react';

export default function SeasonAveragesTable({ stats }) {
  if (!Array.isArray(stats) || stats.length === 0) return <div>No stats to show.</div>;

  const seasonAvg = stats[0]; // Season averages returns one row per player

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Season Averages</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Games</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>PTS</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>REB</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>AST</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>MIN</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>FG%</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>3P%</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{seasonAvg.games_played || seasonAvg.games || '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{seasonAvg.pts || '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{seasonAvg.reb || '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{seasonAvg.ast || '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{seasonAvg.min || '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{seasonAvg.fg_pct ? (seasonAvg.fg_pct * 100).toFixed(1) + '%' : '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{seasonAvg.fg3_pct ? (seasonAvg.fg3_pct * 100).toFixed(1) + '%' : '-'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}