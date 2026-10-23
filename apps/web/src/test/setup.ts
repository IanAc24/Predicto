import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest globals are off, so Testing Library does not unmount between tests on its own.
afterEach(cleanup)

// jsdom does not implement scrolling; the router calls it on navigation.
window.scrollTo = () => {}
