import React, { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { api } from "@/lib/api"; // ✅ use your existing API instance
 
interface ItemReview {
  menuItemId?: string;
  name?: string;
  rating?: number;
  comment?: string;
}
 
interface Review {
  _id: string;
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  itemReviews?: ItemReview[];
  staffRating?: number;
  ambienceRating?: number;
  overallRating?: number;
  experience?: string;
  suggestions?: string;
  createdAt: string;
}
 
interface FilterResponse {
  count: number;
  filtersApplied?: Record<string, string>;
  reviews: Review[];
}
 
const ReviewsDashboard: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [count, setCount] = useState<number>(0);
  const [filtersApplied, setFiltersApplied] = useState<Record<string, string> | null>(null);
 
  const [ratingType, setRatingType] = useState("staffRating");
  const [rating, setRating] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const fetchReviews = async (isFilter = false) => {
    try {
      setLoading(true);
      setError(null);
 
      let url = "/reviews";
      const params: Record<string, string> = {};
 
      if (isFilter) {
        url = "/reviews/filter";
        if (ratingType) params.ratingType = ratingType;
        if (rating) params.rating = rating;
        if (day) params.day = day;
        if (month) params.month = month;
      }
 
      // ✅ Replaced axios with your configured API client
      const res = await api.get<FilterResponse | Review[]>(url, { params });
 
      let reviewsData: Review[] = [];
 
      if (Array.isArray(res.data)) {
        reviewsData = res.data;
      } else {
        reviewsData = res.data.reviews;
        setFiltersApplied(res.data.filtersApplied ?? null);
        setCount(res.data.count);
      }
 
      // ✅ Ensure every review has itemReviews as an array
      reviewsData = reviewsData.map((r) => ({
        ...r,
        itemReviews: Array.isArray(r.itemReviews) ? r.itemReviews : [],
      }));
 
      setReviews(reviewsData);
      if (Array.isArray(res.data)) setCount(reviewsData.length);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchReviews();
  }, []);
 
  const csvData = useMemo(() => {
    if (!reviews?.length) return "";
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Phone",
      "Item Reviews",
      "Staff Rating",
      "Ambience Rating",
      "Overall Rating",
      "Experience",
      "Suggestions",
      "Created At",
    ];
    const rows = reviews.map((r) => {
      const itemStr = (r.itemReviews || [])
        .map((it) => `${it.name || ""} (${it.rating || "-"}) - ${it.comment || ""}`)
        .join(" || ");
      return [
        r.orderId,
        r.customerName || "",
        r.customerPhone || "",
        itemStr,
        r.staffRating || "",
        r.ambienceRating || "",
        r.overallRating || "",
        r.experience || "",
        r.suggestions || "",
        format(new Date(r.createdAt), "yyyy-MM-dd HH:mm"),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    return [headers.join(","), ...rows].join("\n");
  }, [reviews]);
 
  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reviews.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
 
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-semibold">Customer Reviews Dashboard</h1>
 
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium">Rating Type</label>
            <select
              value={ratingType}
              onChange={(e) => setRatingType(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="staffRating">Staff Rating</option>
              <option value="ambienceRating">Ambience Rating</option>
              <option value="overallRating">Overall Rating</option>
            </select>
          </div>
 
          <div>
            <label className="block text-sm font-medium">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="">All</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={String(n)}>
                  {n} ★
                </option>
              ))}
            </select>
          </div>
 
          <div>
            <label className="block text-sm font-medium">Day</label>
            <input
              type="date"
              value={day}
              onChange={(e) => {
                setDay(e.target.value);
                setMonth("");
              }}
              className="border rounded px-3 py-1"
            />
          </div>
 
          <div>
            <label className="block text-sm font-medium">Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setDay("");
              }}
              className="border rounded px-3 py-1"
            />
          </div>
 
          <button
            onClick={() => fetchReviews(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Apply Filter
          </button>
 
          <button
            onClick={() => {
              setRating("");
              setDay("");
              setMonth("");
              setFiltersApplied(null);
              fetchReviews();
            }}
            className="border px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>
 
      {/* FILTER INFO */}
      {filtersApplied && (
        <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
          <strong>Filters Applied:</strong>{" "}
          {Object.entries(filtersApplied)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}{" "}
          ({count} results)
        </div>
      )}
 
      {/* TABLE */}
      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Item Reviews</th>
              <th className="p-3 border">Staff</th>
              <th className="p-3 border">Ambience</th>
              <th className="p-3 border">Overall</th>
              <th className="p-3 border">Experience</th>
              <th className="p-3 border">Suggestions</th>
              <th className="p-3 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  Loading reviews...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : !reviews?.length ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="p-3 border font-medium">{r.orderId}</td>
                  <td className="p-3 border">
                    <div>{r.customerName || "-"}</div>
                    <div className="text-sm text-gray-500">{r.customerPhone}</div>
                  </td>
                  <td className="p-3 border text-sm">
                    {(r.itemReviews || []).length > 0 ? (
                      (r.itemReviews || []).map((it, i) => (
                        <div key={i} className="mb-1">
                          <span className="font-medium">{it.name || "Item"}</span> –{" "}
                          {it.rating ?? "-"}★{" "}
                          <span className="text-gray-500">{it.comment || ""}</span>
                        </div>
                      ))
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 border text-center">{r.staffRating ?? "—"}</td>
                  <td className="p-3 border text-center">{r.ambienceRating ?? "—"}</td>
                  <td className="p-3 border text-center">{r.overallRating ?? "—"}</td>
                  <td className="p-3 border">{r.experience || "—"}</td>
                  <td className="p-3 border">{r.suggestions || "—"}</td>
                  <td className="p-3 border text-sm text-gray-500">
                    {r.createdAt ? format(new Date(r.createdAt), "yyyy-MM-dd HH:mm") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
 
      {/* FOOTER */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Total Reviews: {count}</p>
        <button
          onClick={downloadCSV}
          disabled={!reviews?.length}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
};
 
export default ReviewsDashboard;
 