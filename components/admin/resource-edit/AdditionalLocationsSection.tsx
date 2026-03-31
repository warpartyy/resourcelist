// components/admin/resource-edit/AdditionalLocationsSection.tsx
import { EditableLocation } from "@/lib/types/location";

type Props = {
  locations: EditableLocation[]
  setLocations: (locations: EditableLocation[]) => void
}

export default function AdditionalLocationsSection({
  locations,
  setLocations,
}: Props) {
const updateLocation = (
  index: number,
  field:
  | "address"
  | "city"
  | "state"
  | "zip"
  | "location_name"
  | "phone"
  | "email",
  value: string
) => {
    const updated = [...locations]
    updated[index][field] = value
    setLocations(updated)
  }

const addLocation = () => {
  setLocations([
    ...locations,
    {
      address: "",
      city: "",
      state: "OK",
      zip: "",
      is_primary: false,
      location_name: "",
      phone: "",
      email: "",
    },
  ])
}

  const removeLocation = (index: number) => {
    const updated = locations.filter((_, i) => i !== index)
    setLocations(updated)
  }

  return (
    <div className="mb-6">
      <div className="mb-2 font-semibold text-sm text-text-muted">
        Additional Locations (optional)
      </div>

      <p className="text-xs text-text-muted mb-3">
        Add other locations this organization serves. These may be closer to users.
      </p>

      {locations.map((loc, index) => (
        <div key={index} className="border border-border rounded-lg p-3 mb-3">
          <input
  value={loc.location_name || ""}
  onChange={(e) =>
    updateLocation(index, "location_name", e.target.value)
  }
  placeholder="Location name (e.g. El Reno Office)"
  className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
/>

<input
  value={loc.phone || ""}
  onChange={(e) =>
    updateLocation(index, "phone", e.target.value)
  }
  placeholder="Phone number (optional)"
  className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
/>

<input
  value={loc.email || ""}
  onChange={(e) =>
    updateLocation(index, "email", e.target.value)
  }
  placeholder="Email (optional)"
  className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
/>

          <input
            value={loc.address}
            onChange={(e) => updateLocation(index, "address", e.target.value)}
            placeholder="Street Address"
            className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary mb-2"
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              value={loc.city}
              onChange={(e) => updateLocation(index, "city", e.target.value)}
              placeholder="City"
              className="bg-bg border border-border rounded-lg p-3"
            />

            <input
              value={loc.state}
              onChange={(e) => updateLocation(index, "state", e.target.value)}
              placeholder="State"
              className="bg-bg border border-border rounded-lg p-3"
            />

            <input
              value={loc.zip}
              onChange={(e) => updateLocation(index, "zip", e.target.value)}
              placeholder="ZIP"
              className="bg-bg border border-border rounded-lg p-3"
            />
          </div>

          <button
            type="button"
            onClick={() => removeLocation(index)}
            className="text-xs text-red-500 mt-2"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLocation}
        className="text-sm text-blue-500"
      >
        + Add another location
      </button>
    </div>
  )
}