//@flow

import {createStore} from '..'
import {createEvent} from 'effector/event'
import {argumentHistory} from 'effector/fixtures'

describe('reset before computation', () => {
  test('reset before computation', () => {
    const fn = jest.fn()
    const A = createEvent('A')
    const B = A.map(d => `${d}->B`)

    const target = createStore('init')
      .reset(B)
      .on(A, (state, d) => `${state} + ${d}`)

    target.watch(e => {
      fn(e)
    })

    A('[1]')
    A('[2]')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
                      Array [
                        "init",
                        "init + [1]",
                        "init",
                        "init + [2]",
                        "init",
                      ]
              `)
  })

  it("doesnt depend on methods' ordering", () => {
    const fn = jest.fn()
    const A = createEvent('A')
    const B = A.map(d => `${d}->B`)

    const target = createStore('init')
      .on(A, (state, d) => `${state} + ${d}`)
      .reset(B)

    target.watch(e => {
      fn(e)
    })

    A('[1]')
    A('[2]')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
                      Array [
                        "init",
                        "init + [1]",
                        "init",
                        "init + [2]",
                        "init",
                      ]
              `)
  })
})

describe('computation before reset', () => {
  test('computation before reset', () => {
    const fn = jest.fn()
    const A = createEvent('A')
    const B = A.map(d => `${d}->B`)

    const target = createStore('init')
      .reset(A)
      .on(B, (state, d) => `${state} + ${d}`)

    target.watch(e => {
      fn(e)
    })

    A('[1]')
    A('[2]')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
                  Array [
                    "init",
                    "init + [1]->B",
                    "init",
                    "init + [2]->B",
                  ]
            `)
  })

  it("doesnt depend on methods' ordering", () => {
    const fn = jest.fn()
    const A = createEvent('A')
    const B = A.map(d => `${d}->B`)

    const target = createStore('init')
      .on(B, (state, d) => `${state} + ${d}`)
      .reset(A)

    target.watch(e => {
      fn(e)
    })

    A('[1]')
    A('[2]')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
                  Array [
                    "init",
                    "init + [1]->B",
                    "init",
                    "init + [2]->B",
                  ]
            `)
  })
})

describe('dependencies of resettable stores', () => {
  test('dependencies of resettable stores', () => {
    const fn = jest.fn()
    const run = createEvent('run')
    const reset = run.map(d => `${d}->reset`)
    const A = createStore('A')
    const B = A.map(d => `${d}->B`)

    A.on(run, (state, d) => `${state} + ${d}`).reset(reset)
    B.on(run, (state, d) => `${state} + ${d}`).reset(reset)

    B.watch(e => {
      fn(e)
    })
    run('run()')
    run('run()')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
      Array [
        "A->B",
        "A->B + run()",
        "A->B",
        "A + run()->B",
        "A->B",
        "A->B + run()",
        "A->B",
        "A + run()->B",
        "A->B",
      ]
    `)
  })
})
