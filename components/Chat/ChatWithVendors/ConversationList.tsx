import { TConversation } from "@/types/chat.type";

interface Props {
  conversations: TConversation[];
  selectedRoom: string | null;
  onSelect: (room: string) => void;
}

export default function ConversationList({
  conversations,
  selectedRoom,
  onSelect,
}: Props) {
  return (
    <div className="border-r overflow-y-auto">
      {conversations.map((c) => (
        <div
          key={c.room}
          onClick={() => onSelect(c.room)}
          className={`p-3 cursor-pointer border-b ${
            selectedRoom === c.room ? "bg-gray-100" : ""
          }`}
        >
          <div className="font-medium">{c.room}</div>

          <div className="text-sm text-gray-500">
            {c.status}
            {c.handledBy && ` • handled`}
          </div>

          {Object.values(c.unreadCount).some((v) => v > 0) && (
            <span className="text-xs text-red-500">Unread</span>
          )}
        </div>
      ))}
    </div>
  );
}
