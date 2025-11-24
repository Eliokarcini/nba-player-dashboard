import React from 'react';

export default function PlayerStatsTable({ stats }) {
  if (!Array.isArray(stats) || stats.length === 0) return <div>No stats to show.</div>;

  const rows = stats.map((item) => {
    const statObj = item.statistics?.[0] || item;
    const gameDate = item.game?.date || '';
    return {
      gameDate,
      pts: statObj.points ?? statObj.pts ?? '-',
      reb: statObj.totReb ?? statObj.reb ?? '-',
      ast: statObj.assists ?? statObj.ast ?? '-',
      min: statObj.min ?? '-'
    };
  });

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 16 }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>Date</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>PTS</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>REB</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>AST</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>MIN</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.gameDate ? new Date(r.gameDate).toLocaleDateString() : '-'}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.pts}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.reb}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.ast}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.min}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
