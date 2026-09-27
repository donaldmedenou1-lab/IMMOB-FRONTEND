import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: number;
  created_at: string;
  listings_count: number;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');

      const response = await api<{ users: User[] }>('admin/users.php');

      setUsers(Array.isArray(response.users) ? response.users : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les utilisateurs.'
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleUser(user: User) {
    try {
      setError('');

      await api('admin/user-toggle.php', {
        method: 'POST',
        body: JSON.stringify({
          id: user.id,
          active: !Boolean(user.is_active),
        }),
      });

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de modifier ce compte.'
      );
    }
  }

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#38BDF8] font-semibold">
            Administration
          </p>

          <h2 className="text-2xl font-bold text-[#172033] mt-1">
            Gestion des comptes
          </h2>

          <p className="text-sm text-[#6B7280] mt-1">
            Consultez et gérez les comptes utilisateurs depuis le serveur.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-[#172033] hover:border-[#38BDF8] transition-colors disabled:opacity-50"
        >
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Erreur
          </p>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

          <button
            onClick={loadUsers}
            className="mt-3 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#172033]">
              Utilisateurs
            </h3>

            <p className="text-xs text-[#6B7280] mt-1">
              {users.length} compte{users.length > 1 ? 's' : ''} trouvé
              {users.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <p className="text-sm text-[#6B7280]">
              Chargement des comptes…
            </p>
          </div>
        ) : users.length === 0 && !error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-[#172033]">
              Aucun utilisateur trouvé
            </p>

            <p className="text-xs text-[#6B7280] mt-1">
              Aucun compte n'est actuellement disponible.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#F5F7FA]">
                <tr className="text-xs text-[#6B7280]">
                  <th className="p-4 font-semibold">Utilisateur</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Téléphone</th>
                  <th className="p-4 font-semibold">Rôle</th>
                  <th className="p-4 font-semibold">Annonces</th>
                  <th className="p-4 font-semibold">État</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-sm text-[#172033]">
                        {user.name}
                      </div>

                      <div className="text-xs text-[#9CA3AF] mt-1">
                        ID #{user.id}
                      </div>
                    </td>

                    <td className="p-4 text-sm text-[#4B5563]">
                      {user.email}
                    </td>

                    <td className="p-4 text-sm text-[#4B5563]">
                      {user.phone || '—'}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-[#4B5563]">
                      {user.listings_count ?? 0}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.is_active ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleUser(user)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          user.is_active
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {user.is_active ? 'Suspendre' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}