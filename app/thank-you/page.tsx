export default function ThankYouPage() {
  return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <h1 className="text-2xl font-semibold mb-4">
        Thank you!
      </h1>

      <p className="text-gray-600 mb-6">
        Your update suggestion has been submitted and will be reviewed.
      </p>

      <a
        href="/"
        className="inline-block border px-4 py-2 rounded"
      >
        Back to Home
      </a>
    </div>
  )
}