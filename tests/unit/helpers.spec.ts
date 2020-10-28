// import { shallowMount } from '@vue/test-utils'
import * as helpers from '@/utils/helpers'

describe('helpers.ts', () => {
  it('isInFolder - returns true if folder is visible inside given directory path', () => {
    // const msg = 'new message'
    // const wrapper = shallowMount(TestSetup, {
    //   propsData: { msg }
    // })
    // expect(wrapper.text()).toMatch(msg)
    /*
      Sample file structure (folder names - lower case, files - upper):

      /movies                          doFile('/', 'movies', isFolder)
      /movies/action                   doFile('/movies', 'action', isFolder)
      /movies/action/ActionMovie1.avi  doFile('/movies/action', 'ActionMovie1.avi', isFile)
      /movies/action/SomeMovie.avi     doFile('/movies', 'SomeMovie.avi', isFile)
      /music                           doFile('/', 'music', isFolder)
      /music/silence                   doFile('/music', 'silence', isFolder)
      /music/silence/Silence1.mp3      doFile('/music/silence', 'Silence1.mp3', isFile)
      /music/silence/Silence2.mp3      doFile('/music/silence', 'Silence2.mp3', isFile)
      /music/other                     doFile('/music', 'other', isFolder)
      /music/SomeMusic.mp3             doFile('/music', 'SomeMusic.mp3', isFile)
      /RootFile1.txt                   doFile('/', 'RootFile1.txt', isFile)
      /RootFile2.txt                   doFile('/', 'RootFile2.txt', isFile)

    */

    const doFile = (path: string, name: string, isDirectory: boolean) => {
      return { path, name, isFolder: isDirectory }
    }

    const aFolder = true
    const isFile = !aFolder
    const files = [
      doFile('/movies', 'movies', aFolder),
      doFile('/movies/action', 'action', aFolder),
      doFile('/movies/action', 'ActionMovie1.avi', isFile),
      doFile('/movies', 'SomeMovie.avi', isFile),
      doFile('/music', 'music', aFolder),
      doFile('/music/silence', 'silence', aFolder),
      doFile('/music/silence', 'Silence1.mp3', isFile),
      doFile('/music/silence', 'Silence2.mp3', isFile),
      doFile('/music', 'other', aFolder),
      doFile('/music', 'SomeMusic.mp3', isFile),
      doFile('/', 'RootFile1.txt', isFile),
      doFile('/', 'RootFile2.txt', isFile)
    ]

    const testCases: any = {
      true: {
        '/': ['movies', 'music', 'RootFile1.txt', 'RootFile2.txt'],
        '/movies': ['action', 'SomeMovie.avi'],
        '/movies/action': ['ActionMovie.avi'],
        '/music': ['silence', 'SomeMusic.mp3'],
        '/music/silence': ['Silence1.mp3', 'Silence2.mp3']
      },
      false: {
        '/': ['action', 'silence', 'SomeMovie.avi', 'Silence1.mp3'],
        '/movies': ['silence', 'RootFile1.txt']
      }
    }

    for (const expected in testCases) {
      if (!testCases[expected]) {
        continue
      }
      const groupedCases = testCases[expected]
      for (const currentPath in groupedCases) {
        if (!groupedCases[currentPath]) {
          continue
        }
        // go through each path in test cases
        for (const name of groupedCases[currentPath]) {
          // get file for the current path
          const file = files.find((f: any) => f.name === name)
          if (!file) {
            continue
          }
          const { path, isFolder } = file
          const result = helpers.isInFolder(currentPath, path, name, isFolder)

          const expectedBool = expected === 'true'
          expect(result).toEqual(Boolean(expectedBool))
        }
      }
    }
  })

  it('getPathAfterMove  - returns updated path', () => {
    const move = helpers.getPathAfterMove

    const scenes = [
      {
        path: '/movies/action',
        pathBefore: '/movies',
        pathAfter: '/videos',
        expected: '/videos/action'
      },
      {
        path: '/folder1',
        pathBefore: '/',
        pathAfter: '/test',
        expected: '/test/folder1'
      },
      {
        path: '/movie/action',
        pathBefore: '/movie/action',
        pathAfter: '/',
        expected: '/'
      },
      {
        path: '/movie/action/good',
        pathBefore: '/movie/action',
        pathAfter: '/',
        expected: '/good'
      },
      {
        path: '/movie/action/good',
        pathBefore: '/movie/action',
        pathAfter: '/action',
        expected: '/action/good'
      },
      {
        path: '/moviexxx',
        pathBefore: '/movie',
        pathAfter: '/action',
        expected: null
      },
      {
        path: '/',
        pathBefore: '/',
        pathAfter: '/action',
        expected: '/action'
      }

      // TODO: case with prefix - /file1 to /file12
    ]

    for (const scene of scenes) {
      const result = move(scene.path, scene.pathBefore, scene.pathAfter)
      expect(result).toEqual(scene.expected)
    }
  })

  it('getParentPath - returns parent path', () => {
    const getParentPath = helpers.getParentPath

    const scenes = [
      {
        path: '/movies/action',
        expected: '/movies'
      },
      {
        path: '/folder1',
        expected: '/'
      },
      {
        path: '/movie/action/test',
        expected: '/movie/action'
      },
      {
        path: '/',
        expected: '/'
      },
      {
        path: '/movie/action/good',
        expected: '/movie/action'
      }
    ]

    for (const scene of scenes) {
      const result = getParentPath(scene.path)
      expect(result).toEqual(scene.expected)
    }
  })

  it('isChildPath - true if child of the path', () => {
    const isChildPath = helpers.isChildPath

    const scenes = [
      {
        path: '/movies/action',
        parent: '/movies',
        expected: true
      },
      {
        path: '/test',
        parent: '/tes',
        expected: false
      },
      {
        path: '/test',
        parent: '/',
        expected: true
      }
    ]

    for (const scene of scenes) {
      const result = isChildPath(scene.path, scene.parent)
      expect(result).toEqual(scene.expected)
    }
  })
})
