import { saveAs } from 'file-saver';
import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { db, deleteById, getAll, chatId, type ChatHistoryItem, setMessages } from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { logger } from '~/utils/logger';
import { useAuth } from '~/components/AuthProvider';
import { supabase } from '~/lib/supabase';
import { useNavigate } from '@remix-run/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useStore } from '@nanostores/react';
import { themeStore } from '~/lib/stores/theme';

const menuVariants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-150px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent = { type: 'delete'; item: ChatHistoryItem } | null;

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useStore(themeStore);

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteItem = useCallback((event: React.UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    if (db) {
      deleteById(db, item.id)
        .then(() => {
          loadEntries();

          if (chatId.get() === item.id) {
            // hard page navigation to clear the stores
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          toast.error('Failed to delete conversation');
          logger.error(error);
        });
    }
  }, []);

  const renameItem = useCallback(
    (id: string, newDescription: string) => {
      if (db) {
        const item = list.find((item) => item.id === id);

        if (item) {
          setMessages(db, id, item.messages, item.urlId, newDescription)
            .then(() => {
              loadEntries();
              toast.success('Chat renamed successfully');
            })
            .catch((error) => {
              toast.error('Failed to rename chat');
              logger.error(error);
            });
        }
      }
    },
    [list],
  );

  const exportItem = useCallback((item: ChatHistoryItem) => {
    try {
      const chatData = {
        description: item.description,
        messages: item.messages,
        timestamp: item.timestamp,
      };
      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const filename = `${item.description || 'chat'}-${new Date(item.timestamp).toISOString().split('T')[0]}.json`;
      saveAs(blob, filename);
      toast.success('Chat exported successfully');
    } catch (error) {
      toast.error('Failed to export chat');
      logger.error(error);
    }
  }, []);

  const closeDialog = () => {
    setDialogContent(null);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open]);

  useEffect(() => {
    const enterThreshold = 40;
    const exitThreshold = 40;

    function onMouseMove(event: MouseEvent) {
      if (event.pageX < enterThreshold) {
        setOpen(true);
      }

      // Don't close if any modal or menu is open
      if (!showSettingsModal && !showUserMenu && !dialogContent) {
        if (menuRef.current && event.clientX > menuRef.current.getBoundingClientRect().right + exitThreshold) {
          setOpen(false);
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [showSettingsModal, showUserMenu, dialogContent]);

  return (
    <motion.div
      ref={menuRef}
      initial="closed"
      animate={open ? 'open' : 'closed'}
      variants={menuVariants}
      className="flex flex-col side-menu fixed top-0 w-[350px] h-full bg-bolt-elements-background-depth-2 border-r rounded-r-3xl border-bolt-elements-borderColor z-sidebar shadow-xl shadow-bolt-elements-sidebar-dropdownShadow text-sm"
    >
      <div className="flex items-center h-[var(--header-height)]">{/* Placeholder */}</div>
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <div className="p-4">
          <a
            href="/"
            className="flex gap-2 items-center bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover rounded-md p-2 transition-theme"
          >
            <span className="inline-block i-bolt:chat scale-110" />
            Start new chat
          </a>
        </div>
        <div className="text-bolt-elements-textPrimary font-medium pl-6 pr-5 my-2">Your Chats</div>
        <div className="flex-1 overflow-scroll pl-4 pr-5 pb-5">
          {list.length === 0 && <div className="pl-2 text-bolt-elements-textTertiary">No previous conversations</div>}
          <DialogRoot open={dialogContent !== null}>
            {binDates(list).map(({ category, items }) => (
              <div key={category} className="mt-4 first:mt-0 space-y-1">
                <div className="text-bolt-elements-textTertiary sticky top-0 z-1 bg-bolt-elements-background-depth-2 pl-2 pt-2 pb-1">
                  {category}
                </div>
                {items.map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onDelete={() => setDialogContent({ type: 'delete', item })}
                    onRename={renameItem}
                    onExport={exportItem}
                  />
                ))}
              </div>
            ))}
            <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
              {dialogContent?.type === 'delete' && (
                <>
                  <DialogTitle>Delete Chat?</DialogTitle>
                  <DialogDescription asChild>
                    <div>
                      <p>
                        You are about to delete <strong>{dialogContent.item.description}</strong>.
                      </p>
                      <p className="mt-1">Are you sure you want to delete this chat?</p>
                    </div>
                  </DialogDescription>
                  <div className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
                    <DialogButton type="secondary" onClick={closeDialog}>
                      Cancel
                    </DialogButton>
                    <DialogButton
                      type="danger"
                      onClick={(event) => {
                        deleteItem(event, dialogContent.item);
                        closeDialog();
                      }}
                    >
                      Delete
                    </DialogButton>
                  </div>
                </>
              )}
            </Dialog>
          </DialogRoot>
        </div>
        <div className="flex items-center justify-between border-t border-bolt-elements-borderColor p-4">
          <div className="flex items-center">
            {user && (
              <DropdownMenu.Root onOpenChange={setShowUserMenu}>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover transition-theme">
                    <div className="w-5 h-5 rounded-full bg-bolt-elements-background-depth-3 flex items-center justify-center">
                      <div className="i-ph:user text-bolt-elements-textSecondary text-sm" />
                    </div>
                    <div className="text-sm">
                      {user.email}
                    </div>
                    <div className="i-ph:caret-down ml-1 text-sm" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="start"
                    className="min-w-[200px] bg-bolt-elements-background-depth-2 rounded-lg p-1.5 shadow-lg border border-bolt-elements-borderColor animate-in fade-in-0 zoom-in-95 z-[1000]"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover rounded-md cursor-pointer outline-none"
                      onClick={() => {
                        setShowSettingsModal(true);
                        setShowUserMenu(false);
                        setOpen(false);
                      }}
                    >
                      <div className="i-ph:gear text-lg" />
                      Settings
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-bolt-elements-borderColor my-1" />
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-bolt-elements-sidebar-buttonText hover:bg-red-500 hover:text-white rounded-md cursor-pointer outline-none"
                      onClick={handleLogout}
                    >
                      <div className="i-ph:sign-out text-lg" />
                      Sign Out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover transition-theme"
              >
                <div className="i-ph:sign-in text-sm" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <DialogRoot open={showSettingsModal}>
        <Dialog onBackdrop={() => setShowSettingsModal(false)} onClose={() => setShowSettingsModal(false)}>
          <div className="w-full max-w-md p-6 bg-bolt-elements-background-depth-2 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <DialogTitle>Settings</DialogTitle>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-bolt-elements-textPrimary">Theme</h3>
                  <p className="text-sm text-bolt-elements-textSecondary">Choose your preferred theme</p>
                </div>
                <button
                  onClick={() => {
                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                    themeStore.set(newTheme);
                    localStorage.setItem('bolt_theme', newTheme);
                    document.querySelector('html')?.setAttribute('data-theme', newTheme);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover transition-theme"
                >
                  <div className={theme === 'dark' ? "i-ph:moon" : "i-ph:sun"} />
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </DialogRoot>
    </motion.div>
  );
}
