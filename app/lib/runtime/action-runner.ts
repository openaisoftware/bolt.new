import * as nodePath from 'node:path';
import { WebContainer } from '@webcontainer/api';
import { map, type MapStore } from 'nanostores';
import type { ActionCallbackData } from './message-parser';
import { workbenchStore } from '~/lib/stores/workbench';
import type { BoltAction } from '~/types/actions';
import { createScopedLogger } from '~/utils/logger';
import { unreachable } from '~/utils/unreachable';

const logger = createScopedLogger('ActionRunner');

export type ActionStatus = 'pending' | 'running' | 'complete' | 'aborted' | 'failed';

export type BaseActionState = BoltAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
};

export type FailedActionState = BoltAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'abort' | 'executed'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #currentExecutionPromise: Promise<void> = Promise.resolve();

  actions: ActionsMap = map({});

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;

    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      // action already added
      return;
    }

    const abortController = new AbortController();

    this.actions.setKey(actionId, {
      ...data.action,
      status: 'pending',
      executed: false,
      abort: () => {
        abortController.abort();
        this.#updateAction(actionId, { status: 'aborted' });
      },
      abortSignal: abortController.signal,
    });

    this.#currentExecutionPromise.then(() => {
      this.#updateAction(actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData) {
    const { actionId } = data;
    const action = this.actions.get()[actionId];

    if (!action) {
      unreachable(`Action ${actionId} not found`);
    }

    if (action.executed) {
      return;
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: true });

    this.#currentExecutionPromise = this.#currentExecutionPromise
      .then(() => {
        return this.#executeAction(actionId);
      })
      .catch((error) => {
        console.error('Action failed:', error);
      });
  }

  async #executeAction(actionId: string) {
    const action = this.actions.get()[actionId];

    this.#updateAction(actionId, { status: 'running' });

    try {
      switch (action.type) {
        case 'shell': {
          await this.#runShellAction(action);
          break;
        }
        case 'file': {
          await this.#runFileAction(action);
          break;
        }
      }

      this.#updateAction(actionId, { status: action.abortSignal.aborted ? 'aborted' : 'complete' });
    } catch (error) {
      this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });

      // re-throw the error to be caught in the promise chain
      throw error;
    }
  }

  async #runShellAction(action: ActionState) {
    if (action.type !== 'shell') {
      unreachable('Expected shell action');
    }

    const webcontainer = await this.#webcontainer;

    // write the command to the Bolt terminal
    workbenchStore.writeToBoltTerminal(`\x1b[1;34m$ ${action.content}\x1b[0m\n`);

    const process = await webcontainer.spawn('jsh', ['-c', action.content], {
      env: { npm_config_yes: true },
    });

    action.abortSignal.addEventListener('abort', () => {
      process.kill();
      workbenchStore.writeToBoltTerminal('\x1b[1;31mCommand aborted\x1b[0m\n');
    });

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
          workbenchStore.writeToBoltTerminal(data);
        },
      }),
    );

    const exitCode = await process.exit;

    logger.debug(`Process terminated with code ${exitCode}`);
    workbenchStore.writeToBoltTerminal(
      `\x1b[1;${exitCode === 0 ? '32' : '31'}mProcess exited with code ${exitCode}\x1b[0m\n\n`,
    );
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    const webcontainer = await this.#webcontainer;

    let folder = nodePath.dirname(action.filePath);

    // remove trailing slashes
    folder = folder.replace(/\/+$/g, '');

    // write file creation to Bolt terminal
    workbenchStore.writeToBoltTerminal(`\x1b[1;34mCreating file: ${action.filePath}\x1b[0m\n`);

    if (folder !== '.') {
      try {
        await webcontainer.fs.mkdir(folder, { recursive: true });
        logger.debug('Created folder', folder);
        workbenchStore.writeToBoltTerminal(`\x1b[1;32mCreated folder: ${folder}\x1b[0m\n`);
      } catch (error) {
        logger.error('Failed to create folder\n\n', error);
        workbenchStore.writeToBoltTerminal(`\x1b[1;31mFailed to create folder: ${folder}\x1b[0m\n${error}\n`);
      }
    }

    try {
      // Create empty file first to show it in the workbench immediately
      await webcontainer.fs.writeFile(action.filePath, '');
      logger.debug(`Empty file created ${action.filePath}`);
      workbenchStore.writeToBoltTerminal(`\x1b[1;32mFile created: ${action.filePath}\x1b[0m\n`);
      
      // Show the file in workbench
      workbenchStore.setShowWorkbench(true);
      workbenchStore.setSelectedFile(action.filePath);
      workbenchStore.setIsStreaming(true);

      // Stream the content
      const chunks = action.content.split('');
      let currentContent = '';
      
      for (const chunk of chunks) {
        if (action.abortSignal.aborted) {
          break;
        }
        
        currentContent += chunk;
        workbenchStore.setCurrentDocumentContent(currentContent);
        
        // Add a small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      // Ensure final content is set
      if (!action.abortSignal.aborted) {
        workbenchStore.setCurrentDocumentContent(action.content);
        await webcontainer.fs.writeFile(action.filePath, action.content);
      }

      workbenchStore.setIsStreaming(false);
      logger.debug(`File content streamed ${action.filePath}`);
      workbenchStore.writeToBoltTerminal(`\x1b[1;32mFile content written: ${action.filePath}\x1b[0m\n\n`);
    } catch (error) {
      workbenchStore.setIsStreaming(false);
      logger.error('Failed to write file\n\n', error);
      workbenchStore.writeToBoltTerminal(`\x1b[1;31mFailed to write file: ${action.filePath}\x1b[0m\n${error}\n\n`);
    }
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();

    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
