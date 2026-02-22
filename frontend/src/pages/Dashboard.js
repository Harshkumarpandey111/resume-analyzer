import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { uploadResume, getMyResume } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user }                = useAuth();
  const [resume, setResume]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setResume(null);
    setFetching(true);
    getMyResume()
      .then(res => setResume(res.data))
      .catch(err => { if (err.response?.status !== 404) console.error(err); })
      .finally(() => setFetching(false));
  }, []);

  const onDrop = async (files) => {
    if (!files[0]) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', files[0]);
    try {
      await uploadResume(formData);
      const full = await getMyResume();
      setResume(full.data);
      toast.success('✅ Resume analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Upload failed');
    }
    setLoading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'text/plain': []
    },
    maxFiles: 1
  });

  const scoreColor = (s) => s >= 70 ? '#6ee7b7' : s >= 40 ? '#fbbf24' : '#f87171';
  const scoreBg    = (s) => s >= 70 ? 'rgba(110,231,183,0.1)' : s >= 40 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';

  return (
    <div className="page fade-in">

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <span style={{
            padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
            background: 'rgba(110,231,183,0.1)', color: '#6ee7b7',
            border: '1px solid rgba(110,231,183,0.2)', letterSpacing: '1px'
          }}>AI POWERED</span>
        </div>
        <p className="page-sub">Upload your resume to get instant skill analysis and job match scores</p>
      </div>

      {/* Upload Zone */}
      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? '#6ee7b7' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: '20px', padding: '52px 20px', textAlign: 'center',
        cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '28px',
        background: isDragActive
          ? 'rgba(110,231,183,0.05)'
          : 'rgba(255,255,255,0.02)',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        position: 'relative', zIndex: 1,
        boxShadow: isDragActive ? '0 0 40px rgba(110,231,183,0.1)' : 'none'
      }}>
        <input {...getInputProps()} disabled={loading} />

        <div style={{ fontSize: '48px', marginBottom: '16px', lineHeight: 1 }}>
          {loading ? <span className="spinning">⚙️</span>
           : isDragActive ? '📂' : '📄'}
        </div>

        <div style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: '700',
          fontSize: '18px', marginBottom: '8px', color: '#e2e8f0'
        }}>
          {loading ? 'Analyzing with AI...'
           : isDragActive ? 'Drop it here!'
           : resume ? 'Upload new resume to re-analyze'
           : 'Drop your resume here'}
        </div>

        <div style={{ color: '#475569', fontSize: '13px', marginBottom: '16px' }}>
          PDF, Word (.docx), or TXT · Max 5MB
        </div>

        {!loading && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
            background: 'rgba(110,231,183,0.1)', color: '#6ee7b7',
            border: '1px solid rgba(110,231,183,0.2)'
          }}>
            📁 Browse Files
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {fetching && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {[1,2,3].map(i => (
            <div key={i} className="card pulsing" style={{ height: '100px' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!fetching && !resume && (
        <div className="card" style={{ textAlign: 'center', padding: '60px', marginTop: '8px' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>🎯</div>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '22px',
            fontWeight: '700', marginBottom: '10px', color: '#e2e8f0'
          }}>Ready to analyze</h3>
          <p style={{ color: '#475569', fontSize: '15px', maxWidth: '360px', margin: '0 auto' }}>
            Upload your resume above to discover your skills and see how you match against real job listings
          </p>
        </div>
      )}

      {/* Results */}
      {!fetching && resume && (
        <div className="fade-in">

          {/* Stats */}
          <div className="grid-3" style={{ marginBottom: '24px' }}>
            {[
              { icon: '🎯', label: 'Skills Found',  value: resume.extractedSkills?.length || 0, color: '#6ee7b7' },
              { icon: '💼', label: 'Jobs Matched',  value: resume.matchResults?.length || 0,    color: '#60a5fa' },
              { icon: '⭐', label: 'Best Match',
                value: resume.matchResults?.length
                  ? Math.max(...resume.matchResults.map(m => m.score)) + '%'
                  : '0%',
                color: '#fbbf24'
              },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
                <div style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '32px',
                  fontWeight: '800', color, marginBottom: '4px'
                }}>{value}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: '700' }}>
                ✅ Skills Detected
              </h3>
              <span style={{ fontSize: '12px', color: '#475569' }}>from {resume.fileName}</span>
            </div>

            {resume.extractedSkills?.length > 0 ? (
              <div>
                {resume.extractedSkills.map(skill => (
                  <span key={skill} className="badge badge-green">{skill}</span>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '20px', borderRadius: '12px',
                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                color: '#fbbf24', fontSize: '14px'
              }}>
                ⚠️ No tech skills detected. Make sure your resume mentions technologies like React, Python, Docker etc.
              </div>
            )}
          </div>

          {/* Job Matches */}
          <div className="card">
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>
              💼 Job Match Results
            </h3>

            {resume.matchResults?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...resume.matchResults]
                  .sort((a, b) => b.score - a.score)
                  .map((match, i) => {
                    const job   = match.jobId;
                    const score = match.score;
                    const color = scoreColor(score);
                    const bg    = scoreBg(score);

                    return (
                      <div key={i} style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '14px', padding: '18px 20px',
                        border: `1px solid ${score >= 70 ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'border-color 0.2s'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '3px', color: '#e2e8f0' }}>
                              {job?.title || 'Job Position'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#475569' }}>
                              {job?.company} · {job?.type} · {job?.salary}
                            </div>
                          </div>
                          <div style={{
                            padding: '6px 14px', borderRadius: '10px',
                            background: bg, color, fontWeight: '800',
                            fontSize: '18px', border: `1px solid ${color}33`
                          }}>
                            {score}%
                          </div>
                        </div>

                        <div className="progress-track">
                          <div className="progress-fill" style={{
                            width: `${score}%`,
                            background: score >= 70
                              ? 'linear-gradient(90deg, #6ee7b7, #3b82f6)'
                              : score >= 40
                              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                              : 'linear-gradient(90deg, #f87171, #ef4444)',
                            boxShadow: `0 0 8px ${color}66`
                          }} />
                        </div>

                        {match.missingSkills?.length > 0 && (
                          <div style={{ marginTop: '10px', fontSize: '12px' }}>
                            <span style={{ color: '#475569', marginRight: '6px' }}>Missing:</span>
                            {match.missingSkills.slice(0, 5).map(s => (
                              <span key={s} className="badge badge-red" style={{ fontSize: '11px' }}>{s}</span>
                            ))}
                            {match.missingSkills.length > 5 && (
                              <span style={{ color: '#475569', fontSize: '11px', marginLeft: '4px' }}>
                                +{match.missingSkills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {match.missingSkills?.length === 0 && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6ee7b7' }}>
                            🎉 Perfect match — you have all required skills!
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
                <div style={{ fontSize: '15px' }}>No jobs in database yet</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>Ask an admin to post some jobs first!</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}