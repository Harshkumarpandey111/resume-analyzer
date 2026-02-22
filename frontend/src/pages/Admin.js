import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllJobs, postJob, deleteJob } from '../api';

export default function Admin() {
  const [jobs, setJobs]     = useState([]);
  const [form, setForm]     = useState({ title: '', company: '', requiredSkills: '', salary: '', type: 'Remote' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllJobs().then(res => setJobs(res.data));
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      };
      const res = await postJob(payload);
      setJobs(prev => [res.data.job, ...prev]);
      setForm({ title: '', company: '', requiredSkills: '', salary: '', type: 'Remote' });
      toast.success('✅ Job posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Failed');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('🗑️ Job deleted');
    } catch {
      toast.error('❌ Delete failed');
    }
  };

  const fields = [
    { label: 'Job Title',  key: 'title',   ph: 'Senior React Developer', col: 1 },
    { label: 'Company',    key: 'company', ph: 'TechCorp Inc.',           col: 1 },
    { label: 'Salary',     key: 'salary',  ph: '$100k–$140k',             col: 1 },
  ];

  return (
    <div className="page fade-in">
      <h1 className="page-title">🛡️ Admin Panel</h1>
      <p className="page-sub">Post and manage job listings for the platform</p>

      {/* Post Job Form */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: '700', marginBottom: '24px' }}>
          ➕ Post New Job
        </h3>
        <form onSubmit={handlePost}>
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            {fields.map(({ label, key, ph }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" placeholder={ph}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
              </div>
            ))}
            <div>
              <label className="label">Job Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['Remote', 'Hybrid', 'Onsite'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="label">Required Skills (comma separated)</label>
            <input className="input"
              placeholder="React, TypeScript, Node.js, Docker, AWS"
              value={form.requiredSkills}
              onChange={e => setForm({ ...form, requiredSkills: e.target.value })} required />
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
              💡 Separate each skill with a comma — e.g. React, Node.js, Docker
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ maxWidth: '200px' }}>
            {loading ? <><span className="spinning">⚙️</span> Posting...</> : '+ Post Job'}
          </button>
        </form>
      </div>

      {/* Jobs List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '17px' }}>
          Active Jobs
        </h3>
        <span style={{
          padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
          background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
          border: '1px solid rgba(59,130,246,0.2)'
        }}>{jobs.length} total</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {jobs.map(job => (
          <div key={job._id} className="card" style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '16px 20px'
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#e2e8f0', marginBottom: '4px' }}>
                {job.title}
                <span style={{ color: '#475569', fontWeight: '400', marginLeft: '8px' }}>@ {job.company}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                {job.requiredSkills?.length} skills · {job.type} · {job.salary}
              </div>
            </div>
            <button className="btn btn-danger" onClick={() => handleDelete(job._id)}
              style={{ padding: '8px 16px', fontSize: '13px' }}>
              🗑️ Remove
            </button>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
            No jobs posted yet. Add your first job above!
          </div>
        )}
      </div>
    </div>
  );
}