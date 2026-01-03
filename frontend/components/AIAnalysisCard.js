import { useState, useEffect } from 'react'

const AIAnalysisCard = ({ incident, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (incident && incident.title && incident.description) {
      performAnalysis()
    }
  }, [incident])

  const performAnalysis = async () => {
    if (!incident) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v1/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: incident.title || incident.category || '',
          description: incident.description || '',
          severity: incident.severity || 2,
          category: incident.category || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Analysis failed')
      }

      const data = await response.json()
      setAnalysis(data)
      onAnalysisComplete?.(data)
    } catch (err) {
      console.error('AI analysis error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!analysis && !loading && !error) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-blue-700">Analyzing incident...</p>
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

  if (!analysis) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>🤖</span> AI Analysis
        </h3>
      </div>

      {/* Category Classification */}
      <div className="mb-3 pb-3 border-b border-blue-200">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-gray-600">Category</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {analysis.category}
            </p>
            <p className="text-xs text-gray-500">
              {(analysis.category_confidence * 100).toFixed(0)}% confidence
            </p>
          </div>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${analysis.category_confidence * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Priority */}
      <div className="mb-3 pb-3 border-b border-blue-200">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-gray-600">Priority</span>
          <div className="text-right">
            <p className={`text-sm font-semibold capitalize ${
              analysis.priority === 'high' ? 'text-red-600' :
              analysis.priority === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {analysis.priority}
            </p>
            <p className="text-xs text-gray-500">
              Score: {(analysis.priority_score * 100).toFixed(0)}
            </p>
          </div>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              analysis.priority === 'high' ? 'bg-red-500' :
              analysis.priority === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${analysis.priority_score * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="mb-3 pb-3 border-b border-blue-200">
        <p className="text-xs font-medium text-gray-600 mb-2">Sentiment</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded px-2 py-1 text-center">
            <p className="text-xs text-gray-500">Positive</p>
            <p className="text-sm font-semibold text-green-600">
              {(analysis.sentiment.positive * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-white rounded px-2 py-1 text-center">
            <p className="text-xs text-gray-500">Neutral</p>
            <p className="text-sm font-semibold text-gray-600">
              {(analysis.sentiment.neutral * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-white rounded px-2 py-1 text-center">
            <p className="text-xs text-gray-500">Negative</p>
            <p className="text-sm font-semibold text-red-600">
              {(analysis.sentiment.negative * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Overall AI Score */}
      <div className="bg-white rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600">Overall Score</span>
          <span className="text-lg font-bold text-indigo-600">
            {(analysis.overall_ai_score * 100).toFixed(0)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${analysis.overall_ai_score * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {analysis.overall_ai_score > 0.75 ? '✓ High confidence analysis' :
           analysis.overall_ai_score > 0.5 ? '◆ Moderate confidence analysis' :
           '△ Low confidence - review recommended'}
        </p>
      </div>
    </div>
  )
}

export default AIAnalysisCard
