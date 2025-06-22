// Mock Next.js navigation module for Storybook

const mockRouter = {
  push: (url) => {
    console.log('Router.push:', url);
  },
  replace: (url) => {
    console.log('Router.replace:', url);
  },
  prefetch: () => Promise.resolve(),
  back: () => {
    console.log('Router.back');
  },
  forward: () => {
    console.log('Router.forward');
  },
  refresh: () => {
    console.log('Router.refresh');
  },
  pathname: '/storybook',
  query: {},
  asPath: '/storybook',
  route: '/storybook',
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
  beforePopState: () => {},
  isFallback: false,
  isLocaleDomain: false,
  isPreview: false,
  isReady: true,
};

const mockSearchParams = {
  get: (key) => null,
  getAll: (key) => [],
  has: (key) => false,
  keys: () => [][Symbol.iterator](),
  values: () => [][Symbol.iterator](),
  entries: () => [][Symbol.iterator](),
  forEach: () => {},
  toString: () => '',
  [Symbol.iterator]: () => [][Symbol.iterator](),
};

export const useRouter = () => mockRouter;

export const useSearchParams = () => mockSearchParams;

export const usePathname = () => '/storybook';

export const useParams = () => ({});

export const useSelectedLayoutSegment = () => null;

export const useSelectedLayoutSegments = () => [];

export const notFound = () => {
  console.log('notFound called');
};

export const redirect = (url) => {
  console.log('redirect called with:', url);
};

export const permanentRedirect = (url) => {
  console.log('permanentRedirect called with:', url);
};

// Default export for compatibility
export default {
  useRouter,
  useSearchParams,
  usePathname,
  useParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  notFound,
  redirect,
  permanentRedirect,
};