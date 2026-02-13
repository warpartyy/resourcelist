import Container from "../../components/ui/Container";

export default function SuggestResourcePage() {
  return (
    <Container>
      <h1 className="text-4xl font-bold mb-6">
        Suggest a Resource
      </h1>

      <p className="text-zinc-400 mb-8 max-w-2xl">
        Know of a resource that should be included? 
        Submit the information below. Our team will review 
        and verify before publishing.
      </p>

      <form className="space-y-6 max-w-2xl">

        <div>
          <label className="block mb-2 text-sm font-medium">
            Organization Name
          </label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
            placeholder="Enter organization name"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Category
          </label>
          <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <option>Food Assistance</option>
            <option>Housing Support</option>
            <option>Substance Use Treatment</option>
            <option>Mental Health Services</option>
            <option>Transportation Services</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Counties Served
          </label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
            placeholder="Example: Caddo, Comanche"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Phone Number
          </label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
            placeholder="(405) 555-1234"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Website
          </label>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
            placeholder="https://"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Description
          </label>
          <textarea
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
            placeholder="Brief description of services"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          Submit for Review
        </button>

      </form>
    </Container>
  );
}
