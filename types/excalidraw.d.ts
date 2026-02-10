declare module "@excalidraw/excalidraw" {
  import type { ComponentType, ReactNode, MemoExoticComponent } from "react";
  import type { JSX } from "react";

  // ---- Core types ----

  export type Theme = "light" | "dark";

  export type DataURL = string & { _brand: "DataURL" };
  export type FileId = string & { _brand: "FileId" };
  export type SocketId = string & { _brand: "SocketId" };
  export type NormalizedZoomValue = number & { _brand: "normalizedZoom" };
  export type GroupId = string;

  export type Zoom = Readonly<{ value: NormalizedZoomValue }>;

  export type PointerCoords = Readonly<{ x: number; y: number }>;

  export type FontFamilyValues = number;
  export type TextAlign = "left" | "center" | "right";
  export type StrokeRoundness = "round" | "sharp";
  export type Arrowhead =
    | "arrow"
    | "bar"
    | "dot"
    | "triangle"
    | "diamond"
    | null;
  export type ChartType = "bar" | "line";
  export type PointerType = "mouse" | "pen" | "touch";
  export type BindMode = "fixed" | "semi" | "none";

  export type ToolType =
    | "selection"
    | "lasso"
    | "rectangle"
    | "diamond"
    | "ellipse"
    | "arrow"
    | "line"
    | "freedraw"
    | "text"
    | "image"
    | "eraser"
    | "hand"
    | "frame"
    | "magicframe"
    | "embeddable"
    | "laser";

  export type ActiveTool =
    | { type: ToolType; customType: null }
    | { type: "custom"; customType: string };

  // ---- Element types ----

  export interface ExcalidrawElement {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    strokeColor: string;
    backgroundColor: string;
    fillStyle: string;
    strokeWidth: number;
    strokeStyle: string;
    roughness: number;
    opacity: number;
    groupIds: readonly GroupId[];
    frameId: string | null;
    roundness: { type: number; value?: number } | null;
    seed: number;
    version: number;
    versionNonce: number;
    isDeleted: boolean;
    boundElements: readonly { id: string; type: string }[] | null;
    updated: number;
    link: string | null;
    locked: boolean;
    [key: string]: any;
  }

  export type NonDeletedExcalidrawElement = ExcalidrawElement & {
    isDeleted: false;
  };
  export type NonDeleted<T extends ExcalidrawElement> = T & {
    isDeleted: false;
  };
  export type OrderedExcalidrawElement = ExcalidrawElement;
  export type ExcalidrawNonSelectionElement = ExcalidrawElement;
  export type ExcalidrawLinearElement = ExcalidrawElement;
  export type ExcalidrawBindableElement = ExcalidrawElement;
  export type ExcalidrawEmbeddableElement = ExcalidrawElement;
  export type ExcalidrawMagicFrameElement = ExcalidrawElement;
  export type ExcalidrawFrameLikeElement = ExcalidrawElement;
  export type ExcalidrawIframeLikeElement = ExcalidrawElement;

  // ---- Binary files ----

  export interface BinaryFileData {
    mimeType: string;
    id: FileId;
    dataURL: DataURL;
    created: number;
    lastRetrieved?: number;
    version?: number;
  }

  export type BinaryFiles = Record<string, BinaryFileData>;

  // ---- Collaborator ----

  export interface Collaborator {
    pointer?: {
      x: number;
      y: number;
      tool: "pointer" | "laser";
      renderCursor?: boolean;
      laserColor?: string;
    };
    button?: "up" | "down";
    selectedElementIds?: Record<string, true>;
    username?: string | null;
    userState?: string;
    color?: { background: string; stroke: string };
    avatarUrl?: string;
    id?: string;
    socketId?: SocketId;
    isCurrentUser?: boolean;
    isInCall?: boolean;
    isSpeaking?: boolean;
    isMuted?: boolean;
  }

  // ---- AppState ----

  export interface AppState {
    viewBackgroundColor: string;
    zoom: Zoom;
    scrollX: number;
    scrollY: number;
    width: number;
    height: number;
    theme: Theme;
    name: string | null;
    viewModeEnabled: boolean;
    zenModeEnabled: boolean;
    gridModeEnabled: boolean;
    gridSize: number;
    gridStep: number;
    exportBackground: boolean;
    exportWithDarkMode: boolean;
    exportScale: number;
    selectedElementIds: Readonly<Record<string, true>>;
    selectedGroupIds: Record<string, boolean>;
    editingGroupId: GroupId | null;
    collaborators: Map<SocketId, Collaborator>;
    activeTool: {
      lastActiveTool: ActiveTool | null;
      locked: boolean;
      fromSelection: boolean;
    } & ActiveTool;
    currentItemStrokeColor: string;
    currentItemBackgroundColor: string;
    currentItemFontFamily: FontFamilyValues;
    currentItemFontSize: number;
    currentItemTextAlign: TextAlign;
    currentItemStrokeWidth: number;
    currentItemRoughness: number;
    currentItemOpacity: number;
    isLoading: boolean;
    errorMessage: ReactNode;
    [key: string]: any;
  }

  export type UIAppState = Omit<
    AppState,
    "startBoundElement" | "cursorButton" | "scrollX" | "scrollY"
  >;

  // ---- Library ----

  export interface LibraryItem {
    id: string;
    status: "published" | "unpublished";
    elements: readonly NonDeletedExcalidrawElement[];
    created: number;
    name?: string;
    error?: string;
  }

  export type LibraryItems = readonly LibraryItem[];

  // ---- Import/Export types ----

  export interface ImportedDataState {
    type?: string;
    version?: number;
    source?: string;
    elements?: readonly ExcalidrawElement[] | null;
    appState?: Partial<AppState> | null;
    scrollToContent?: boolean;
    libraryItems?: LibraryItems | readonly NonDeletedExcalidrawElement[][];
    files?: BinaryFiles;
  }

  export type ExcalidrawInitialDataState = ImportedDataState & {
    libraryItems?: Promise<LibraryItems> | LibraryItems;
  };

  // ---- UI Options ----

  export interface ExportOpts {
    saveFileToDisk?: boolean;
    onExportToBackend?: (
      elements: readonly NonDeletedExcalidrawElement[],
      appState: UIAppState,
      files: BinaryFiles,
    ) => void;
    renderCustomUI?: (
      elements: readonly NonDeletedExcalidrawElement[],
      appState: UIAppState,
      files: BinaryFiles,
      canvas: HTMLCanvasElement,
    ) => JSX.Element;
  }

  export interface CanvasActions {
    changeViewBackgroundColor?: boolean;
    clearCanvas?: boolean;
    export?: false | ExportOpts;
    loadScene?: boolean;
    saveToActiveFile?: boolean;
    toggleTheme?: boolean | null;
    saveAsImage?: boolean;
  }

  export interface UIOptions {
    dockedSidebarBreakpoint?: number;
    canvasActions?: CanvasActions;
    tools?: { image: boolean };
  }

  // ---- Scene data ----

  export interface SceneData {
    elements?: ImportedDataState["elements"];
    appState?: ImportedDataState["appState"];
    collaborators?: Map<SocketId, Collaborator>;
  }

  // ---- Imperative API ----

  export interface ExcalidrawImperativeAPI {
    updateScene: (sceneData: SceneData) => void;
    updateLibrary: (opts: {
      libraryItems: LibraryItems | Promise<LibraryItems>;
      merge?: boolean;
      prompt?: boolean;
    }) => Promise<LibraryItems>;
    resetScene: (opts?: { resetLoadingState: boolean }) => void;
    getSceneElementsIncludingDeleted: () => readonly ExcalidrawElement[];
    getSceneElements: () => readonly NonDeletedExcalidrawElement[];
    getAppState: () => AppState;
    getFiles: () => BinaryFiles;
    getName: () => string;
    scrollToContent: (
      target?: ExcalidrawElement | readonly ExcalidrawElement[],
      opts?: {
        fitToContent?: boolean;
        fitToViewport?: boolean;
        viewportZoomFactor?: number;
        animate?: boolean;
        duration?: number;
      },
    ) => void;
    refresh: () => void;
    setToast: (
      toast: { message: string; closable?: boolean; duration?: number } | null,
    ) => void;
    addFiles: (data: BinaryFileData[]) => void;
    id: string;
    setActiveTool: (
      tool: { type: ToolType } | { type: "custom"; customType: string },
    ) => void;
    setCursor: (cursor: string) => void;
    resetCursor: () => void;
    toggleSidebar: (opts: {
      name: string;
      tab?: string;
      force?: boolean;
    }) => boolean;
    onChange: (
      callback: (
        elements: readonly ExcalidrawElement[],
        appState: AppState,
        files: BinaryFiles,
      ) => void,
    ) => () => void;
    onPointerDown: (
      callback: (
        activeTool: AppState["activeTool"],
        pointerDownState: any,
        event: React.PointerEvent<HTMLElement>,
      ) => void,
    ) => () => void;
    onPointerUp: (
      callback: (
        activeTool: AppState["activeTool"],
        pointerDownState: any,
        event: PointerEvent,
      ) => void,
    ) => () => void;
    onScrollChange: (
      callback: (scrollX: number, scrollY: number, zoom: Zoom) => void,
    ) => () => void;
    history: { clear: () => void };
  }

  // ---- Excalidraw component props ----

  export interface ExcalidrawProps {
    onChange?: (
      elements: readonly OrderedExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => void;
    initialData?:
      | (() =>
          | Promise<ExcalidrawInitialDataState | null>
          | ExcalidrawInitialDataState
          | null)
      | Promise<ExcalidrawInitialDataState | null>
      | ExcalidrawInitialDataState
      | null;
    excalidrawAPI?: (api: ExcalidrawImperativeAPI) => void;
    isCollaborating?: boolean;
    onPointerUpdate?: (payload: {
      pointer: { x: number; y: number; tool: "pointer" | "laser" };
      button: "down" | "up";
      pointersMap: Map<number, PointerCoords>;
    }) => void;
    onPaste?: (
      data: any,
      event: ClipboardEvent | null,
    ) => Promise<boolean> | boolean;
    onDuplicate?: (
      nextElements: readonly ExcalidrawElement[],
      prevElements: readonly ExcalidrawElement[],
    ) => ExcalidrawElement[] | void;
    renderTopLeftUI?: (
      isMobile: boolean,
      appState: UIAppState,
    ) => JSX.Element | null;
    renderTopRightUI?: (
      isMobile: boolean,
      appState: UIAppState,
    ) => JSX.Element | null;
    langCode?: string;
    viewModeEnabled?: boolean;
    zenModeEnabled?: boolean;
    gridModeEnabled?: boolean;
    objectsSnapModeEnabled?: boolean;
    libraryReturnUrl?: string;
    theme?: Theme;
    name?: string;
    renderCustomStats?: (
      elements: readonly NonDeletedExcalidrawElement[],
      appState: UIAppState,
    ) => JSX.Element;
    UIOptions?: Partial<UIOptions>;
    detectScroll?: boolean;
    handleKeyboardGlobally?: boolean;
    onLibraryChange?: (libraryItems: LibraryItems) => void | Promise<any>;
    autoFocus?: boolean;
    generateIdForFile?: (file: File) => string | Promise<string>;
    onLinkOpen?: (
      element: NonDeletedExcalidrawElement,
      event: CustomEvent<{
        nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
      }>,
    ) => void;
    onPointerDown?: (
      activeTool: AppState["activeTool"],
      pointerDownState: any,
    ) => void;
    onPointerUp?: (
      activeTool: AppState["activeTool"],
      pointerDownState: any,
    ) => void;
    onScrollChange?: (scrollX: number, scrollY: number, zoom: Zoom) => void;
    children?: ReactNode;
    validateEmbeddable?:
      | boolean
      | string[]
      | RegExp
      | RegExp[]
      | ((link: string) => boolean | undefined);
    aiEnabled?: boolean;
    showDeprecatedFonts?: boolean;
    renderScrollbars?: boolean;
  }

  // ---- Exported components ----

  export const Excalidraw: MemoExoticComponent<
    (props: ExcalidrawProps) => JSX.Element
  >;
  export const MainMenu: ComponentType<{ children?: ReactNode }> & {
    Item: ComponentType<{
      children?: ReactNode;
      onSelect?: () => void;
      icon?: ReactNode;
      shortcut?: string;
    }>;
    ItemLink: ComponentType<{
      children?: ReactNode;
      href: string;
      icon?: ReactNode;
    }>;
    ItemCustom: ComponentType<{ children?: ReactNode }>;
    DefaultItems: {
      LoadScene: ComponentType;
      SaveToActiveFile: ComponentType;
      Export: ComponentType;
      SaveAsImage: ComponentType;
      Help: ComponentType;
      ClearCanvas: ComponentType;
      ToggleTheme: ComponentType;
      ChangeCanvasBackground: ComponentType;
    };
    Group: ComponentType<{ title: string; children?: ReactNode }>;
  };
  export const WelcomeScreen: ComponentType<{ children?: ReactNode }> & {
    Center: ComponentType<{ children?: ReactNode }> & {
      Logo: ComponentType<{ children?: ReactNode }>;
      Heading: ComponentType<{ children?: ReactNode }>;
      Menu: ComponentType<{ children?: ReactNode }> & {
        Item: ComponentType<{
          children?: ReactNode;
          onSelect?: () => void;
          icon?: ReactNode;
          shortcut?: string;
        }>;
        ItemLink: ComponentType<{
          children?: ReactNode;
          href: string;
          icon?: ReactNode;
        }>;
        ItemHelp: ComponentType;
        ItemLoadScene: ComponentType;
        ItemLiveCollaborationTrigger: ComponentType<{ onSelect?: () => void }>;
      };
    };
    Hints: ComponentType<{ children?: ReactNode }> & {
      MenuHint: ComponentType<{ children?: ReactNode }>;
      ToolbarHint: ComponentType<{ children?: ReactNode }>;
      HelpHint: ComponentType<{ children?: ReactNode }>;
    };
  };
  export const Sidebar: ComponentType<{
    name: string;
    children?: ReactNode;
    docked?: boolean;
    onDock?: (docked: boolean) => void;
    onClose?: () => void;
    className?: string;
  }> & {
    Header: ComponentType<{ children?: ReactNode; className?: string }>;
    Tabs: ComponentType<{ children?: ReactNode }>;
    Tab: ComponentType<{
      tab: string;
      children?: ReactNode;
      className?: string;
    }>;
    TabTriggers: ComponentType<{ children?: ReactNode }>;
    TabTrigger: ComponentType<{
      tab: string;
      children?: ReactNode;
      className?: string;
    }>;
  };
  export const Footer: ComponentType<{ children?: ReactNode }>;
  export const LiveCollaborationTrigger: ComponentType<{
    isCollaborating: boolean;
    onSelect: () => void;
  }>;
  export const Button: ComponentType<{
    onSelect: () => void;
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }>;
  export const Ellipsify: ComponentType<{ children?: ReactNode }>;
  export const DefaultSidebar: ComponentType<{ children?: ReactNode }>;
  export const Stats: ComponentType;
  export const TTDDialog: ComponentType<{
    onTextSubmit: (opts: {
      text: string;
      source: string;
      type: string;
    }) => Promise<void>;
  }>;
  export const TTDDialogTrigger: ComponentType<{ icon?: ReactNode }>;
  export const CommandPalette: ComponentType;
  export const DiagramToCodePlugin: ComponentType;

  // ---- Exported functions ----

  export function getSceneVersion(
    elements: readonly ExcalidrawElement[],
  ): number;
  export function hashElementsVersion(
    elements: readonly ExcalidrawElement[],
  ): number;
  export function hashString(s: string): number;
  export function getNonDeletedElements(
    elements: readonly ExcalidrawElement[],
  ): readonly NonDeletedExcalidrawElement[];
  export function getTextFromElements(
    elements: readonly ExcalidrawElement[],
  ): string;
  export function isInvisiblySmallElement(element: ExcalidrawElement): boolean;
  export function isLinearElement(element: ExcalidrawElement): boolean;
  export function isElementLink(link: string): boolean;

  export function restoreAppState(
    appState: ImportedDataState["appState"],
    localAppState: Partial<AppState> | null,
  ): AppState;
  export function restoreElement(element: ExcalidrawElement): ExcalidrawElement;
  export function restoreElements(
    elements: ImportedDataState["elements"],
    localElements: readonly ExcalidrawElement[] | null | undefined,
  ): ExcalidrawElement[];
  export function restoreLibraryItems(
    libraryItems: any,
    defaultStatus?: "published" | "unpublished",
  ): LibraryItems;
  export function reconcileElements(
    localElements: readonly ExcalidrawElement[],
    remoteElements: readonly ExcalidrawElement[],
    localAppState: AppState,
  ): readonly ExcalidrawElement[];

  export function exportToCanvas(opts: {
    elements: readonly NonDeletedExcalidrawElement[];
    appState?: Partial<AppState>;
    files?: BinaryFiles;
    maxWidthOrHeight?: number;
    exportPadding?: number;
    getDimensions?: (
      width: number,
      height: number,
    ) => { width: number; height: number; scale?: number };
  }): Promise<HTMLCanvasElement>;
  export function exportToBlob(opts: {
    elements: readonly NonDeletedExcalidrawElement[];
    appState?: Partial<AppState>;
    files?: BinaryFiles;
    mimeType?: string;
    quality?: number;
    maxWidthOrHeight?: number;
    exportPadding?: number;
    getDimensions?: (
      width: number,
      height: number,
    ) => { width: number; height: number; scale?: number };
  }): Promise<Blob>;
  export function exportToSvg(opts: {
    elements: readonly NonDeletedExcalidrawElement[];
    appState?: Partial<AppState>;
    files?: BinaryFiles;
    exportPadding?: number;
    renderEmbeddables?: boolean;
  }): Promise<SVGSVGElement>;
  export function exportToClipboard(opts: {
    elements: readonly NonDeletedExcalidrawElement[];
    appState?: Partial<AppState>;
    files?: BinaryFiles;
    type: "png" | "svg" | "json";
  }): Promise<void>;

  export function serializeAsJSON(
    elements: readonly ExcalidrawElement[],
    appState: Partial<AppState>,
    files: BinaryFiles,
    type: "local" | "database",
  ): string;
  export function serializeLibraryAsJSON(libraryItems: LibraryItems): string;

  export function loadFromBlob(
    blob: Blob,
    localAppState: AppState | null,
    localElements: readonly ExcalidrawElement[] | null,
    fileHandle?: any,
  ): Promise<ImportedDataState & { scrollToContent: boolean }>;
  export function loadSceneOrLibraryFromBlob(
    blob: Blob,
    localAppState: AppState | null,
    localElements: readonly ExcalidrawElement[] | null,
  ): Promise<
    | { type: "scene"; data: ImportedDataState }
    | { type: "library"; data: LibraryItems }
  >;
  export function loadLibraryFromBlob(blob: Blob): Promise<LibraryItems>;

  export function mergeLibraryItems(
    existingItems: LibraryItems,
    newItems: LibraryItems,
  ): LibraryItems;
  export function getLibraryItemsHash(items: LibraryItems): string;
  export function parseLibraryTokensFromUrl(): {
    libraryUrl: string;
    idToken: string | null;
  } | null;
  export function useHandleLibrary(opts: {
    excalidrawAPI: ExcalidrawImperativeAPI | null;
    getInitialLibraryItems?: () => Promise<LibraryItems>;
  }): void;

  export function convertToExcalidrawElements(
    elements: readonly Record<string, any>[],
  ): ExcalidrawElement[];
  export function getCommonBounds(
    elements: readonly ExcalidrawElement[],
  ): readonly [number, number, number, number];
  export function getVisibleSceneBounds(opts: {
    scrollX: number;
    scrollY: number;
    width: number;
    height: number;
    zoom: Zoom;
  }): readonly [number, number, number, number];

  export function elementsOverlappingBBox(opts: {
    elements: readonly ExcalidrawElement[];
    bounds: readonly [number, number, number, number];
    type?: "overlap" | "contain" | "inside";
  }): ExcalidrawElement[];
  export function isElementInsideBBox(
    element: ExcalidrawElement,
    bounds: readonly [number, number, number, number],
  ): boolean;
  export function elementPartiallyOverlapsWithOrContainsBBox(
    element: ExcalidrawElement,
    bounds: readonly [number, number, number, number],
  ): boolean;

  export function getDataURL(file: Blob | File): Promise<DataURL>;
  export function setCustomTextMetricsProvider(
    provider: (text: string, font: string) => { width: number; height: number },
  ): void;

  export function mutateElement<T extends ExcalidrawElement>(
    element: T,
    updates: Partial<T>,
  ): T;
  export function newElementWith<T extends ExcalidrawElement>(
    element: T,
    updates: Partial<T>,
  ): T;
  export function bumpVersion(element: ExcalidrawElement): ExcalidrawElement;

  export function zoomToFitBounds(opts: {
    bounds: readonly [number, number, number, number];
    appState: AppState;
    fitToViewport?: boolean;
    viewportZoomFactor?: number;
  }): AppState;

  export function normalizeLink(link: string): string;
  export function sceneCoordsToViewportCoords(
    sceneCoords: { sceneX: number; sceneY: number },
    appState: AppState,
  ): { x: number; y: number };
  export function viewportCoordsToSceneCoords(
    viewportCoords: { clientX: number; clientY: number },
    appState: AppState,
  ): { x: number; y: number };

  // ---- Hooks ----

  export function useI18n(): { t: (key: string) => string; langCode: string };
  export function useEditorInterface(): any;
  export function useStylesPanelMode(): any;

  // ---- Constants ----

  export const FONT_FAMILY: Record<string, FontFamilyValues>;
  export const THEME: { LIGHT: "light"; DARK: "dark" };
  export const MIME_TYPES: Record<string, string>;
  export const ROUNDNESS: Record<string, number>;
  export const DEFAULT_LASER_COLOR: string;
  export const UserIdleState: Record<string, string>;
  export const CaptureUpdateAction: Record<string, any>;
  export const defaultLang: { code: string; label: string };
  export const languages: readonly { code: string; label: string }[];

  export function getFormFactor(width: number, height: number): any;
}
