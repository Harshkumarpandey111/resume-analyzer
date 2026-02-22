import { useState, useEffect } from 'react';
import { getAllJobs } from '../api';

export default function Jobs() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    getAllJobs()
      .then(res => setJobs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.requiredSkills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const typeColor = (type) => ({
    Remote: { bg: 'rgba(110,231,183,0.1)', color: '#6ee7b7', border: 'rgba(110,231,183,0.2)' },
    Hybrid: { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
    Onsite: { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
  }[type] || { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'rgba(255,255,255,0.1)' });

  return (
    <div className="page fade-in">
      <h1 className="page-title">Open Positions</h1>
      <p className="page-sub">
        {jobs.length} jobs available — upload your resume to see your match score
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '28px', zIndex: 1 }}>
        <span style={{
          position: 'absolute', left: '16px', top: '50%',
          transform: 'translateY(-50%)', fontSize: '16px'
        }}>🔍</span>
        <input
          className="input"
          placeholder="Search by title, company or skill..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '44px' }}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => <div key={i} className="card pulsing" style={{ height: '80px' }} />)}
        </div>
      )}

      {/* Jobs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(job => {
          const tc = typeColor(job.type);
          return (
            <div key={job._id} className="card" style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '20px 24px',
              transition: 'all 0.2s ease', cursor: 'default'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '14px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '22px', flexShrink: 0
                }}>🏢</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#e2e8f0', marginBottom: '4px' }}>
                    {job.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>{job.company}</span>
                    <span>·</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px',
                      fontWeight: '600', background: tc.bg, color: tc.color,
                      border: `1px solid ${tc.border}`
                    }}>{job.type}</span>
                    <span>·</span>
                    <span style={{ color: '#6ee7b7', fontWeight: '600' }}>{job.salary}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '380px', justifyContent: 'flex-end' }}>
                {job.requiredSkills?.slice(0, 5).map(s => (
                  <span key={s} className="badge badge-blue" style={{ fontSize: '11px' }}>{s}</span>
                ))}
                {job.requiredSkills?.length > 5 && (
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#475569', fontSize: '11px' }}>
                    +{job.requiredSkills.length - 5}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#64748b' }}>No jobs found</div>
          <div style={{ fontSize: '14px', marginTop: '6px' }}>Try a different search term</div>
        </div>
      )}
    </div>
  );
}