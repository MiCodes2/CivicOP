import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tickets from Supabase
  useEffect(() => {
    fetchTickets();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('civic_issues_tickets')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'civic_issues' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setTickets(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    return tickets.reduce((acc, t) => { 
      acc[t.status] = (acc[t.status] || 0) + 1; 
      return acc; 
    }, {});
  }, [tickets]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-sm text-gray-600">All reported civic issues tracked as tickets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Issues</div>
          <div className="text-3xl font-bold text-blue-900">{tickets.length}</div>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">Open</div>
          <div className="text-3xl font-bold text-orange-900">{counts.OPEN || 0}</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">In Progress</div>
          <div className="text-3xl font-bold text-yellow-900">{counts.IN_PROGRESS || 0}</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">Resolved</div>
          <div className="text-3xl font-bold text-green-900">{counts.RESOLVED || 0}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 font-medium">Closed</div>
          <div className="text-3xl font-bold text-gray-900">{counts.CLOSED || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">All Issues</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-2xl mb-2">⏳</div>
            Loading issues...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <div className="text-2xl mb-2">⚠️</div>
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-2xl mb-2">📭</div>
            No issues yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-[calc(100vh-400px)] overflow-y-auto">
            {tickets.map(ticket => (
              <div key={ticket.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start gap-3">
                  {ticket.image_url && (
                    <img 
                      src={ticket.image_url} 
                      alt={ticket.category}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ticket.category || 'Issue'}</h3>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{ticket.description || 'No description'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {ticket.address && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">📍 {ticket.address.split(',')[0]}</span>
                      )}
                      {ticket.ward_number && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">🏛️ {ticket.ward_number}</span>
                      )}
                      <span className={`px-2 py-1 rounded font-medium ${
                        ticket.severity >= 4 ? 'bg-red-100 text-red-800' :
                        ticket.severity === 3 ? 'bg-orange-100 text-orange-800' :
                        ticket.severity === 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>⚠️ {ticket.severity}/5</span>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'OPEN' ? 'bg-orange-100 text-orange-800' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status || 'OPEN'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
