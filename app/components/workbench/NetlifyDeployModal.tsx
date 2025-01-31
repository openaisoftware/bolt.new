import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '~/components/ui/Modal';
import { Button } from '~/components/ui/Button';

interface NetlifyDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl?: string;
}

export function NetlifyDeployModal({ isOpen, onClose, repoUrl }: NetlifyDeployModalProps) {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!repoUrl) {
      toast.error('Please push your code to GitHub first');
      return;
    }

    setIsDeploying(true);
    try {
      // Format the Netlify deploy URL
      const netlifyDeployUrl = `https://app.netlify.com/start/deploy?repository=${repoUrl}`;
      // Open Netlify deploy page in a new tab
      window.open(netlifyDeployUrl, '_blank');
      onClose();
    } catch (error) {
      console.error('Error deploying to Netlify:', error);
      toast.error('Failed to initiate Netlify deployment');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-bolt-text-default mb-4">
        Deploy to Netlify
      </Dialog.Title>
      <div className="mt-2">
        <p className="text-sm text-bolt-text-subtle">
          {repoUrl
            ? 'Deploy your application to Netlify. This will open the Netlify deployment page in a new tab.'
            : 'Please push your code to GitHub first before deploying to Netlify.'}
        </p>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleDeploy}
          disabled={isDeploying || !repoUrl}
          className="flex items-center"
        >
          {isDeploying ? (
            <>
              <div className="i-ph:spinner animate-spin mr-2" />
              Deploying...
            </>
          ) : (
            <>
              <div className="i-ph:cloud-arrow-up mr-2" />
              Deploy to Netlify
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
} 