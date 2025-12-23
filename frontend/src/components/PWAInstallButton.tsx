import { useEffect, useState } from 'react';
import { Button, Tooltip, ActionIcon } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)') || false;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  if (!isInstallable) {
    return null;
  }

  if (isMobile) {
    return (
      <Tooltip label="Установить приложение">
        <ActionIcon
          onClick={handleInstall}
          variant="subtle"
          aria-label="Установить приложение"
        >
          <IconDownload size={20} />
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Tooltip label="Установить приложение">
      <Button
        onClick={handleInstall}
        variant="subtle"
        size="sm"
        leftSection={<IconDownload size={16} />}
        aria-label="Установить приложение"
      >
        Установить
      </Button>
    </Tooltip>
  );
}
