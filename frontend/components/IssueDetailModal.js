import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatWard } from '../lib/bengaluru_wards';

export default function IssueDetailModal({ issue, onClose, onUpdate, currentUser }) {
  const [assignmentData, setAssignmentData] = useState({
    assigned_to: issue?.assigned_to || '',
    notes: ''
  });
  const [wardUsers, setWardUsers] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch ward users (ward admins and executive engineers) for assignment
  useEffect(() => {
    const fetchWardUsers = async () => {
      if (!issue) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email, role, designation')
          .in('role', ['ward_admin', 'ward_executive_engineer', 'official'])
          .eq('is_active', true)
          .order('full_name');
        
        if (error) throw error;
        setWardUsers(data || []);
      } catch (err) {
        console.error('Error fetching ward users:', err);
      }
    };
    
    fetchWardUsers();
  }, [issue]);
  
  // Fetch assignment history
  useEffect(() => {
    const fetchAssignmentHistory = async () => {
      if (!issue) return;
      
      try {
        const { data, error } = await supabase
          .from('issue_assignments')
          .select(`
            *,
            assigned_to_user:assigned_to(full_name, email, role),
            assigned_from_user:assigned_from(full_name, email),
            assigned_by_user:assigned_by(full_name, email)
          `)
          .eq('issue_id', issue.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setAssignmentHistory(data || []);
      } catch (err) {
        console.error('Error fetching assignment history:', err);
      }
    };
    
    fetchAssignmentHistory();
  }, [issue]);
  
  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('civic_issues')
        .update({
          assigned_to: assignmentData.assigned_to || null,
          assigned_by: currentUser?.id,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', issue.id)
        .select();
      
      if (error) throw error;
      
      // Log the assignment
      await supabase.from('issue_assignments').insert({
        issue_id: issue.id,
        assigned_from: issue.assigned_to,
        assigned_to: assignmentData.assigned_to,
        assigned_by: currentUser?.id,
        notes: assignmentData.notes
      });
      
      if (onUpdate) onUpdate(data[0]);
      onClose();
    } catch (err) {
      console.error('Error assigning issue:', err);
      alert('Failed to assign issue: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    // Validate assignment for IN_PROGRESS and RESOLVED status
    if ((newStatus === 'IN_PROGRESS' || newStatus === 'RESOLVED') && !issue.assigned_to) {
      const statusLabel = newStatus === 'IN_PROGRESS' ? 'In Progress' : 'Resolved';
      alert(`⚠️ Please assign this issue to a team member before moving to ${statusLabel} status.`);
      return;
    }
    
    setLoading(true);
    
    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('civic_issues')
        .update(updateData)
        .eq('id', issue.id)
        .select();
      
      if (error) throw error;
      
      if (onUpdate) onUpdate(data[0]);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!issue) return null;
  
  const statusColors = {
    'OPEN': 'bg-orange-100 text-orange-700 border-orange-200',
    'IN_PROGRESS': 'bg-blue-100 text-blue-700 border-blue-200',
    'RESOLVED': 'bg-green-100 text-green-700 border-green-200',
    'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200'
  };
  
  const statusColor = statusColors[issue.status] || statusColors['OPEN'];
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Issue Details</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor} bg-white/90`}>
              {issue.status || 'OPEN'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Grid Layout: Image + Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Image */}
            {issue.image_url && (
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={issue.image_url} 
                  alt={issue.category}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
            )}
            
            {/* Right: Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{issue.category || 'Issue'}</h3>
                <p className="text-sm text-gray-600">ID: #{issue.id.slice(-8).toUpperCase()}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                <p className="text-gray-800 mt-1 leading-relaxed">{issue.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < (issue.severity || 3) 
                              ? (issue.severity >= 4 ? 'bg-red-500' : issue.severity === 3 ? 'bg-orange-500' : 'bg-yellow-500')
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{issue.severity || 3}/5</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ward</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {issue.ward_number ? formatWard(issue.ward_number.match(/\d+/)?.[0]) : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
                <p className="text-sm text-gray-800 mt-1">
                  {issue.address || `${issue.latitude?.toFixed(6)}, ${issue.longitude?.toFixed(6)}`}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported</label>
                  <p className="text-gray-700 mt-1">
                    {new Date(issue.created_at).toLocaleDateString('en-IN', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {issue.resolved_at && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved</label>
                    <p className="text-gray-700 mt-1">
                      {new Date(issue.resolved_at).toLocaleDateString('en-IN', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Change Actions */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'ward_admin' || currentUser.role === 'ward_executive_engineer') && (
            <div className="border-t pt-4">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Update Status</label>
              {!issue.assigned_to && (
                <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  ⚠️ <strong>Assignment Required:</strong> This issue must be assigned to someone before moving to "In Progress" or "Resolved" status.
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => {
                  const isBlockedWithoutAssignment = (status === 'IN_PROGRESS' || status === 'RESOLVED') && !issue.assigned_to;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={loading || issue.status === status || isBlockedWithoutAssignment}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        issue.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : isBlockedWithoutAssignment
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                      title={isBlockedWithoutAssignment ? 'Assign this issue first' : ''}
                    >
                      {status === 'RESOLVED' ? '✅ ' : status === 'IN_PROGRESS' ? '🔧 ' : ''}
                      {status.replace('_', ' ')}
                      {isBlockedWithoutAssignment && ' 🔒'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Assignment Section */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'ward_admin') && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Assign to Team Member</h4>
              <form onSubmit={handleAssign} className="space-y-3">
                <div>
                  <select
                    value={assignmentData.assigned_to}
                    onChange={(e) => setAssignmentData({...assignmentData, assigned_to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {wardUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email} ({user.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <textarea
                    value={assignmentData.notes}
                    onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                    placeholder="Add notes (optional)"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign Issue'}
                </button>
              </form>
            </div>
          )}
          
          {/* Assignment History */}
          {assignmentHistory.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Assignment History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {assignmentHistory.map((assignment, idx) => (
                  <div key={assignment.id} className="flex items-start gap-3 text-xs bg-gray-50 p-3 rounded border">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-700">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {assignment.assigned_from_user?.full_name ? (
                          <>Reassigned from <span className="text-blue-600">{assignment.assigned_from_user.full_name}</span> to </>
                        ) : 'Assigned to '}
                        <span className="text-blue-600">{assignment.assigned_to_user?.full_name || 'Unknown'}</span>
                      </p>
                      {assignment.assigned_by_user && (
                        <p className="text-gray-600 mt-0.5">
                          by {assignment.assigned_by_user.full_name}
                        </p>
                      )}
                      {assignment.notes && (
                        <p className="text-gray-700 mt-1 italic">"{assignment.notes}"</p>
                      )}
                      <p className="text-gray-500 mt-1">
                        {new Date(assignment.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
