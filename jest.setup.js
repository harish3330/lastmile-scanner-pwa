import '@testing-library/jest-dom'

// Mock DOMStringList
class DOMStringListMock {
  constructor() {
    this.length = 0
  }
  contains(str) {
    return false
  }
  item(index) {
    return null
  }
}

// Create a mock IDBRequest-like object
function createMockRequest(resultValue = null) {
  return {
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
    result: resultValue,
    error: null
  }
}

// Mock IndexedDB
const dbMock = {
  objectStoreNames: new DOMStringListMock(),
  createObjectStore: jest.fn(),
  transaction: jest.fn(() => ({
    objectStore: jest.fn(() => ({
      put: jest.fn(() => createMockRequest(undefined)),
      get: jest.fn(() => createMockRequest(null)),
      getAll: jest.fn(() => createMockRequest([])),
      delete: jest.fn(() => createMockRequest(undefined)),
      clear: jest.fn(() => createMockRequest(undefined))
    }))
  }))
}

const indexedDBMock = {
  databases: jest.fn(() => Promise.resolve([])),
  open: jest.fn((name, version) => {
    const request = createMockRequest(dbMock)
    // Simulate async behavior
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess({ target: request })
      }
    }, 0)
    return request
  })
}

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock,
  writable: true,
  configurable: true
})

Object.defineProperty(window, 'DOMStringList', {
  value: DOMStringListMock,
  writable: true,
  configurable: true
})

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: jest.fn(() => []),
        getVideoTracks: jest.fn(() => [
          {
            enabled: true,
            stop: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            readyState: 'live'
          }
        ]),
        getAudioTracks: jest.fn(() => []),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      })
    ),
    enumerateDevices: jest.fn(() => Promise.resolve([]))
  },
  writable: true,
  configurable: true
})

// Mock navigator.permissions
Object.defineProperty(navigator, 'permissions', {
  value: {
    query: jest.fn(() =>
      Promise.resolve({
        state: 'granted'
      })
    )
  },
  writable: true,
  configurable: true
})

// Mock HTMLVideoElement
HTMLVideoElement.prototype.play = jest.fn(function() {
  return Promise.resolve()
})
HTMLVideoElement.prototype.pause = jest.fn()

Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
  set: jest.fn(),
  get: jest.fn(() => null),
  configurable: true
})

Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
  get: jest.fn(() => 640),
  configurable: true
})

Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
  get: jest.fn(() => 480),
  configurable: true
})

// Mock HTMLCanvasElement
const mockCanvasContext = {
  drawImage: jest.fn(),
  getImageData: jest.fn(() => new ImageData(new Uint8ClampedArray(4 * 640 * 480), 640, 480)),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  fillStyle: '',
  font: ''
}

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext)

// Mock ImageData if not defined
if (typeof ImageData === 'undefined') {
  global.ImageData = class ImageData {
    constructor(data, width, height) {
      this.data = data
      this.width = width
      this.height = height
    }
  }
}

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16)
})
global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id)
})

// Suppress console warnings during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('jsdom') || args[0].includes('Not implemented'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})


