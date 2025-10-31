import UserManagementTable from '@/components/staff/UserManagementTable';

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <UserManagementTable />
      </div>
    </div>
  );
}
