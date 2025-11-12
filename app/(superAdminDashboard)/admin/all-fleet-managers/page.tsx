import AgentTable from "@/components/AllAgents/AgentTable";
import AllAgentsTitle from "@/components/AllAgents/AllAgentsTitle";

export default async function AllAgentsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <AllAgentsTitle />

      {/* Agents Table */}
      <AgentTable />
    </div>
  );
}
