export default function CrisisBanner() {
  return (
    <div className="bg-red-900 border border-red-700 text-white p-4 rounded-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="font-semibold">
            In immediate crisis?
          </p>
          <p className="text-sm text-red-200">
            Call or text 988 for the Suicide & Crisis Lifeline.
            If you are in immediate danger, call 911.
          </p>
        </div>

        <div className="text-lg font-bold">
          📞 988
        </div>
      </div>
    </div>
  );
}
