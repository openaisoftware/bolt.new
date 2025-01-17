import { useLoaderData, useNavigate } from '@remix-run/react';
import type { Message } from 'ai';
import { atom } from 'nanostores';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getMessages, getNextId, getUrlId, openDatabase, setMessages } from './db';
import { workbenchStore } from '~/lib/stores/workbench';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('useChatHistory');

export interface ChatHistoryItem {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
}

const persistenceEnabled = !import.meta.env.VITE_DISABLE_PERSISTENCE;

export const db = persistenceEnabled ? await openDatabase() : undefined;

export const chatId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);

export function useChatHistory() {
  const navigate = useNavigate();
  const { id: mixedId } = useLoaderData<{ id?: string }>();

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();

  const storeMessageHistory = useCallback(async (messages: Message[]) => {
    if (!db || messages.length === 0) {
      return;
    }

    const { firstArtifact } = workbenchStore;

    if (!urlId && firstArtifact?.id) {
      const urlId = await getUrlId(db, firstArtifact.id);

      navigateChat(urlId);
      setUrlId(urlId);
    }

    if (!description.get() && firstArtifact?.title) {
      description.set(firstArtifact?.title);
    }

    if (initialMessages.length === 0 && !chatId.get()) {
      const nextId = await getNextId(db);

      chatId.set(nextId);

      if (!urlId) {
        navigateChat(nextId);
      }
    }

    await setMessages(db, chatId.get() as string, messages, urlId, description.get());
  }, [initialMessages.length, urlId]);

  const importChat = useCallback(async (chatDescription: string, messages: Message[]) => {
    logger.trace('Importing chat', { description: chatDescription, messages });
    description.set(chatDescription);
    await storeMessageHistory(messages);
  }, [storeMessageHistory]);

  useEffect(() => {
    if (!db) {
      setReady(true);

      if (persistenceEnabled) {
        toast.error(`Chat persistence is unavailable`);
      }

      return;
    }

    if (mixedId) {
      getMessages(db, mixedId)
        .then((storedMessages) => {
          if (storedMessages && storedMessages.messages.length > 0) {
            setInitialMessages(storedMessages.messages);
            setUrlId(storedMessages.urlId);
            description.set(storedMessages.description);
            chatId.set(storedMessages.id);
          } else {
            navigate(`/`, { replace: true });
          }

          setReady(true);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  }, [mixedId, navigate]);

  return {
    ready: !mixedId || ready,
    initialMessages,
    storeMessageHistory,
    importChat
  };
}

function navigateChat(nextId: string) {
  /**
   * FIXME: Using the intended navigate function causes a rerender for <Chat /> that breaks the app.
   *
   * `navigate(`/chat/${nextId}`, { replace: true });`
   */
  const url = new URL(window.location.href);
  url.pathname = `/chat/${nextId}`;

  window.history.replaceState({}, '', url);
}
