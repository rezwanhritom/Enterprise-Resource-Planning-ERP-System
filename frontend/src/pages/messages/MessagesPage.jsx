import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getEmployeeDirectory } from '../../services/employeeService.js';
import { getInbox, getMessages, sendMessage } from '../../services/messageService.js';

const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatShortTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function MessagesPage() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isInboxLoading, setIsInboxLoading] = useState(true);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const activeConversation = useMemo(
    () => inbox.find((conversation) => conversation.user?._id === selectedUserId),
    [inbox, selectedUserId]
  );

  useEffect(() => {
    const loadBase = async () => {
      try {
        setIsInboxLoading(true);
        setError('');
        const [inboxData, employeeData] = await Promise.all([
          getInbox(),
          getEmployeeDirectory(),
        ]);
        setInbox(inboxData);
        setContacts(employeeData.filter((employee) => employee._id !== user?._id));
        if (!selectedUserId && inboxData.length > 0) {
          setSelectedUserId(inboxData[0].user._id);
        }
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          'Unable to load messages right now.';
        setError(message);
      } finally {
        setIsInboxLoading(false);
      }
    };

    loadBase();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const loadConversation = async () => {
      try {
        setIsConversationLoading(true);
        setError('');
        const rows = await getMessages(selectedUserId);
        setMessages(rows);
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          'Unable to load this conversation.';
        setError(message);
      } finally {
        setIsConversationLoading(false);
      }
    };

    loadConversation();
  }, [selectedUserId]);

  const refreshInbox = async () => {
    const data = await getInbox();
    setInbox(data);
    if (!selectedUserId && data.length > 0) {
      setSelectedUserId(data[0].user._id);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = messageText.trim();
    if (!selectedUserId) {
      setError('Please select a conversation first.');
      return;
    }
    if (!trimmed) {
      setError('Message cannot be empty.');
      return;
    }

    try {
      setIsSending(true);
      setError('');
      const created = await sendMessage({
        receiverId: selectedUserId,
        message: trimmed,
      });
      setMessages((prev) => [...prev, created]);
      setMessageText('');
      await refreshInbox();
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to send message.';
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Messages</h2>
          <p className="page-subtitle">
            Internal communication workspace for direct employee conversations.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="messages-layout">
        <Card className="messages-inbox-card" title="Inbox">
          {contacts.length > 0 ? (
            <div className="form-field">
              <label htmlFor="recipient" className="form-label">
                Start conversation
              </label>
              <select
                id="recipient"
                className="input"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
              >
                <option value="">Select employee</option>
                {contacts.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {isInboxLoading ? (
            <p className="muted-copy">Loading inbox...</p>
          ) : inbox.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No conversations yet</p>
              <p className="empty-subtitle">
                Start a direct message to open your internal inbox thread.
              </p>
            </div>
          ) : (
            <div className="message-inbox-list">
              {inbox.map((conversation) => {
                const isActive = selectedUserId === conversation.user?._id;
                return (
                  <button
                    key={conversation.user?._id}
                    type="button"
                    className={`message-inbox-item ${isActive ? 'active' : ''}`.trim()}
                    onClick={() => setSelectedUserId(conversation.user?._id)}
                  >
                    <div className="message-inbox-item-header">
                      <p className="message-inbox-name">{conversation.user?.name}</p>
                      <span className="message-inbox-time">
                        {formatShortTime(conversation.latestTimestamp)}
                      </span>
                    </div>
                    <p className="message-inbox-preview">
                      {conversation.isSentByMe ? 'You: ' : ''}
                      {conversation.latestMessage}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="messages-conversation-card">
          {!selectedUserId ? (
            <div className="empty-state messages-empty-chat">
              <p className="empty-title">Select a conversation</p>
              <p className="empty-subtitle">
                Choose a user from inbox or start a new message thread.
              </p>
            </div>
          ) : (
            <>
              <header className="messages-chat-header">
                <p className="messages-chat-title">
                  {activeConversation?.user?.name || 'Conversation'}
                </p>
                <p className="messages-chat-subtitle">
                  {activeConversation?.user?.email || 'Internal user'}
                </p>
              </header>

              <div className="messages-thread">
                {isConversationLoading ? (
                  <p className="muted-copy">Loading conversation...</p>
                ) : messages.length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-title">No messages yet</p>
                    <p className="empty-subtitle">
                      Send a message to start this conversation.
                    </p>
                  </div>
                ) : (
                  messages.map((item) => {
                    const mine = String(item.senderId?._id) === String(user?._id);
                    return (
                      <article
                        key={item._id}
                        className={`message-row ${mine ? 'mine' : 'theirs'}`.trim()}
                      >
                        <div className="message-card">
                          <p className="message-card-author">
                            {mine ? 'You' : item.senderId?.name || 'Sender'}
                          </p>
                          <p className="message-card-body">{item.message}</p>
                          <p className="message-card-time">
                            {formatDateTime(item.timestamp || item.createdAt)}
                          </p>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <form className="messages-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  className="input"
                  placeholder="Write an internal message..."
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  maxLength={1500}
                />
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </>
          )}
        </Card>
      </section>
    </DashboardLayout>
  );
}
