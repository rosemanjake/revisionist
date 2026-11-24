import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { DEFAULT_LOADING_MESSAGE } from '@/utils/constants';
import type { ReportTab } from '@/utils/types';

const MOBILE_BREAKPOINT_PX = 800;

export const defaultLoadingMessage = DEFAULT_LOADING_MESSAGE;
export const InputContext = createContext<InputContextValue | null>(null);

export interface InputContextValue {
  currentValidLicense: string | null;
  setCurrentValidLicense: Dispatch<SetStateAction<string | null>>;
  shouldDisplayLicenseDialog: boolean;
  setShouldDisplayLicenseDialog: Dispatch<SetStateAction<boolean>>;
  wordCount: number;
  setWordCount: Dispatch<SetStateAction<number>>;
  inputStory: string;
  setInputStory: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  loadingMessage: string;
  setLoadingMessage: Dispatch<SetStateAction<string>>;
  shouldDisplaySidebar: boolean;
  setShouldDisplaySidebar: Dispatch<SetStateAction<boolean>>;
  activeTab: ReportTab;
  setActiveTab: Dispatch<SetStateAction<ReportTab>>;
  isMobile: boolean;
  setIsMobile: Dispatch<SetStateAction<boolean>>;
  alertMessage: string | null;
  setAlertMessage: Dispatch<SetStateAction<string | null>>;
  storyInputValue: string;
  setStoryInputValue: Dispatch<SetStateAction<string>>;
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  isSimpleLoading: boolean;
  setIsSimpleLoading: Dispatch<SetStateAction<boolean>>;
}

interface InputContextProviderProps {
  children: ReactNode;
}

export function useInputContext(): InputContextValue {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error('useInputContext must be used within an InputContextProvider');
  }
  return context;
}

export default function InputContextProvider({ children }: InputContextProviderProps): JSX.Element {
  const [currentValidLicense, setCurrentValidLicense] = useState<string | null>(null);
  const [shouldDisplayLicenseDialog, setShouldDisplayLicenseDialog] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [inputStory, setInputStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(DEFAULT_LOADING_MESSAGE);
  const [shouldDisplaySidebar, setShouldDisplaySidebar] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [storyInputValue, setStoryInputValue] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isSimpleLoading, setIsSimpleLoading] = useState<boolean>(false);

  useEffect(() => {
    function handleResize(): void {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const contextValue = useMemo<InputContextValue>(
    () => ({
      currentValidLicense,
      setCurrentValidLicense,
      shouldDisplayLicenseDialog,
      setShouldDisplayLicenseDialog,
      wordCount,
      setWordCount,
      inputStory,
      setInputStory,
      isLoading,
      setIsLoading,
      activeTab,
      setActiveTab,
      shouldDisplaySidebar,
      setShouldDisplaySidebar,
      isMobile,
      setIsMobile,
      alertMessage,
      setAlertMessage,
      storyInputValue,
      setStoryInputValue,
      loadingMessage,
      setLoadingMessage,
      file,
      setFile,
      isSimpleLoading,
      setIsSimpleLoading,
    }),
    [
      currentValidLicense,
      shouldDisplayLicenseDialog,
      wordCount,
      inputStory,
      isLoading,
      activeTab,
      shouldDisplaySidebar,
      isMobile,
      alertMessage,
      storyInputValue,
      loadingMessage,
      file,
      isSimpleLoading,
    ]
  );

  return <InputContext.Provider value={contextValue}>{children}</InputContext.Provider>;
}
