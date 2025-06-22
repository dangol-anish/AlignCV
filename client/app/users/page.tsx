import { fetchUsers } from "@/lib/fetcher";
import { IUser } from "@/types/user";

export default async function UsersPage() {
  const data = await fetchUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      {data.sampleUser.map((user: IUser) => (
        <div key={user.id} className="mb-2 p-2 border rounded">
          <p>
            <strong>{user.email}</strong> (ID: {user.id})
          </p>
        </div>
      ))}
    </div>
  );
}
