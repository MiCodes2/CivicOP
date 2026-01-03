import { useState, useEffect } from 'react'

const DuplicateDetectionPanel = ({ incident, onDuplicateFound }) => {
  const [duplicates, setDuplicates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (incident && incident.title && incident.description) {
      checkDuplicates()
    }
  }, [incident])

  const checkDuplicates = async () => {
    if (!incident) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v1/ai/duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: incident.title || incident.category || '',
          description: incident.description || '',
          limit: 20,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Duplicate check failed')
      }

      const data = await response.json()
      setDuplicates(data.matches || [])
      
      if (data.matches && data.matches.length > 0) {
        onDuplicateFound?.(data.matches)
      }
    } catch (err) {
      console.error('Duplicate detection error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!duplicates.length && !loading && !error) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
          <p className="text-sm text-amber-700">Checking for duplicates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">⚠️ {error}</p>
      </div>
    )
  }

  if (!duplicates.length) {
    return null
  }

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
          <span>🔗</span> Possible Duplicates
        </h3>
        <p className="text-xs text-amber-700 mt-1">
          {duplicates.length} similar issue{duplicates.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="space-y-2">
        {duplicates.map((dup, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-3 border border-amber-200 hover:border-amber-400 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  #{dup.incident_id}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {dup.category}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-amber-100 px-2 py-1 rounded">
                  <p className="text-sm font-bold text-amber-800">
                    {(dup.similarity * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-amber-700">similar</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded-full"
                style={{ width: `${dup.similarity * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-3 bg-amber-100 rounded border border-amber-200">
        <p className="text-xs text-amber-800">
          💡 <strong>Tip:</strong> Before submitting, verify these aren't the same issue. 
          Multiple reports of the same problem increase resolution priority.
        </p>
      </div>
    </div>
  )
}

export default DuplicateDetectionPanel
