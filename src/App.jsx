import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFiAM-gjxaMJCeQ2jpTMgIioCnkKggj_M",
  authDomain: "table-tennis-tracker-81e5d.firebaseapp.com",
  projectId: "table-tennis-tracker-81e5d",
  storageBucket: "table-tennis-tracker-81e5d.firebasestorage.app",
  messagingSenderId: "894055850527",
  appId: "1:894055850527:web:65d94c2ecc852ea0d5ab2a",
  measurementId: "G-76M6ZTGM73"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const scoresRef = collection(db, "scores");

export default function App() {
  const [matches, setMatches] = useState([]);
  const [newMatch, setNewMatch] = useState({ date: "", P: "", E: "" });
  const [totals, setTotals] = useState({ P: 0, E: 0 });
  const [editingMatch, setEditingMatch] = useState(null);

  useEffect(() => {
    async function fetchScores() {
      const q = query(scoresRef, orderBy("date"));
      const querySnapshot = await getDocs(q);
      const data = [];
      let P_total = 0,
        E_total = 0;
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        P_total += parseFloat(d.P);
        E_total += parseFloat(d.E);
        data.push({ id: docSnap.id, ...d });
      });
      setMatches(data);
      setTotals({ P: P_total, E: E_total });
    }
    fetchScores();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newMatch.date || newMatch.P === "" || newMatch.E === "") return;
    await addDoc(scoresRef, {
      date: newMatch.date,
      P: parseFloat(newMatch.P),
      E: parseFloat(newMatch.E),
    });
    window.location.reload();
  }

  async function handleDelete(id) {
    if (confirm("Delete this match?")) {
      await deleteDoc(doc(db, "scores", id));
      window.location.reload();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <h1 className="text-4xl font-extrabold text-center text-blue-700">🏓 Ping Pong Score Tracker</h1>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={newMatch.date}
              onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Player P Score</label>
            <input
              type="number"
              placeholder="P score"
              value={newMatch.P}
              onChange={(e) => setNewMatch({ ...newMatch, P: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Player E Score</label>
            <input
              type="number"
              placeholder="E score"
              value={newMatch.E}
              onChange={(e) => setNewMatch({ ...newMatch, E: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow"
          >
            ➕ Add Match
          </button>
        </form>

        <div className="text-lg font-semibold text-center text-gray-800">
          📊 Total – <span className="text-blue-600">P: {totals.P}</span>, <span className="text-red-500">E: {totals.E}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-blue-100 text-gray-700">
                <th className="border p-3">📅 Date</th>
                <th className="border p-3">🅿️</th>
                <th className="border p-3">🇪</th>
                <th className="border p-3">⚙️</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="text-center hover:bg-blue-50">
                  <td className="border p-2 font-medium">{m.date}</td>
                  <td className="border p-2 text-blue-700 font-semibold">{m.P}</td>
                  <td className="border p-2 text-red-500 font-semibold">{m.E}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium underline"
                      onClick={() => setEditingMatch(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 font-medium underline"
                      onClick={() => handleDelete(m.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingMatch && (
          <div className="mt-6 p-4 border rounded bg-gray-100">
            <h2 className="font-semibold text-lg mb-2">
              ✏️ Editing Match from {editingMatch.date}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateDoc(doc(db, "scores", editingMatch.id), {
                  P: parseFloat(editingMatch.P),
                  E: parseFloat(editingMatch.E),
                });
                setEditingMatch(null);
                window.location.reload();
              }}
              className="space-y-2"
            >
              <div>
                <label className="block text-sm font-medium">P</label>
                <input
                  type="number"
                  value={editingMatch.P}
                  onChange={(e) =>
                    setEditingMatch({ ...editingMatch, P: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">E</label>
                <input
                  type="number"
                  value={editingMatch.E}
                  onChange={(e) =>
                    setEditingMatch({ ...editingMatch, E: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                ✅ Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

