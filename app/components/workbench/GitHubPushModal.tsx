import { useState } from 'react';
import { toast } from 'react-toastify';
import { githubStore } from '~/lib/stores/github';

interface GitHubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (repoUrl: string) => void;
}

export function GitHubPushModal({ isOpen, onClose, onSuccess }: GitHubPushModalProps) {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [repoName, setRepoName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await githubStore.pushToGitHub(token, username, repoName);
      const repoUrl = `https://github.com/${username}/${repoName}`;
      onSuccess?.(repoUrl);
      toast.success('Successfully pushed to GitHub!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to push to GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bolt-elements-background-depth-2 rounded-lg p-6 w-[400px] max-w-[90vw]">
        <h2 className="text-xl font-semibold mb-4">Push to GitHub</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                GitHub Token
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor px-3 py-2"
                  placeholder="ghp_xxxxxxxxxxxx"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                GitHub Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor px-3 py-2"
                  placeholder="your-username"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Repository Name
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor px-3 py-2"
                  placeholder="my-project"
                  required
                />
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md bg-bolt-elements-background-depth-1 hover:bg-bolt-elements-background-depth-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-md bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-background-depth-4 disabled:opacity-50"
            >
              {isLoading ? 'Pushing...' : 'Push to GitHub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
