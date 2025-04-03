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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🏓 Score Tracker (P vs E)</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="date"
          value={newMatch.date}
          onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="P score"
          value={newMatch.P}
          onChange={(e) => setNewMatch({ ...newMatch, P: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="E score"
          value={newMatch.E}
          onChange={(e) => setNewMatch({ ...newMatch, E: e.target.value })}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Match
        </button>
      </form>

      <div className="mb-4 font-semibold">
        Total – P: {totals.P}, E: {totals.E}
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date</th>
            <th className="border p-2">P</th>
            <th className="border p-2">E</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.id}>
              <td className="border p-2">{m.date}</td>
              <td className="border p-2">{m.P}</td>
              <td className="border p-2">{m.E}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() => setEditingMatch(m)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 underline"
                  onClick={() => handleDelete(m.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingMatch && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h2 className="font-semibold mb-2">
            Editing Match: {editingMatch.date}
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
            <input
              type="number"
              value={editingMatch.P}
              onChange={(e) =>
                setEditingMatch({ ...editingMatch, P: e.target.value })
              }
              className="border p-2 w-full"
            />
            <input
              type="number"
              value={editingMatch.E}
              onChange={(e) =>
                setEditingMatch({ ...editingMatch, E: e.target.value })
              }
              className="border p-2 w-full"
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded">
              Save Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
