export default function Privacy() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-4">We take privacy seriously. This page summarizes our public commitments—what we collect, how we use it, and how we protect it.</p>

      <div className="bg-white rounded-lg border p-4 shadow-sm space-y-3">
        <p className="text-sm text-gray-700">• We process uploaded images to detect and classify civic issues; raw PII is not retained after processing.</p>
        <p className="text-sm text-gray-700">• Location data is used only for mapping and routing; users may opt out of precise location sharing.</p>
        <p className="text-sm text-gray-700">• We store only essential metadata required to track and resolve reports; access is logged and restricted to authorized personnel.</p>
        <p className="text-sm text-gray-700">• For full details, contact our support or request the full privacy disclosure for compliance purposes.</p>
      </div>
    </div>
  )
}