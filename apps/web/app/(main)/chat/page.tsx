import ConversationsList from "./components/conversationsList";
import MessageSection from "./components/messageSection";
export default async function Page(): Promise<JSX.Element> {
  return (
    <div className="@lg/main:grid-cols-2 @xl/main:grid-cols-3 grid flex-1 gap-4 overflow-auto p-4">
      <ConversationsList />
      <MessageSection />
    </div>
  );
}
