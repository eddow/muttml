import { reactive } from 'mutts/src'
import { bindApp, For, array } from '../../../src/lib/index.ts'

type ChildNode = {
    id: number
    label: string
}

const state = reactive({
    nodes: [
        { id: 1, label: 'alpha' },
        { id: 2, label: 'beta' },
        { id: 3, label: 'gamma' },
    ] satisfies ChildNode[],
    nextId: 4,
    shuffleSeed: 0,
    log: [] as string[],
})

const fixtureControls = {
    addToStart(label?: string) {
        const id = state.nextId++
        state.nodes.unshift({ id, label: label ?? `node-${id}` })
        logEvent('add-start', id)
    },
    addToEnd(label?: string) {
        const id = state.nextId++
        state.nodes.push({ id, label: label ?? `node-${id}` })
        logEvent('add-end', id)
    },
    removeFirst() {
        const removed = state.nodes.shift()
        if (removed) logEvent('remove-first', removed.id)
    },
    removeLast() {
        const removed = state.nodes.pop()
        if (removed) logEvent('remove-last', removed.id)
    },
    removeById(id: number) {
        const initialLength = state.nodes.length
        array.filter(state.nodes, (node) => node.id !== id)
        if (state.nodes.length !== initialLength) {
            logEvent('remove-id', id)
        }
    },
    reorder(reverse = false) {
        state.shuffleSeed++
        const copy = [...state.nodes]
        state.nodes.length = 0
        state.nodes.push(...(reverse ? copy.reverse() : copy.sort((a, b) => a.id - b.id)))
        logEvent(reverse ? 'reorder-reverse' : 'reorder-stable')
    },
    reset(nodes: ChildNode[]) {
        state.nextId = Math.max(0, ...nodes.map((node) => node.id)) + 1
        array.into(state.nodes, nodes)
        this.resetEvents()
        logEvent('reset', nodes.length)
    },
    resetEvents() {
        state.log.length = 0
    },
    get events() {
        return state.log
    },
}

declare global {
    interface Window {
        __pounceFixture?: typeof fixtureControls
    }
}

function logEvent(name: string, payload?: number) {
    const message = payload === undefined ? name : `${name}:${payload}`
    state.log.push(message)
}

window.__pounceFixture = fixtureControls

const ChildList = () => (
    <ul data-testid="child-list" aria-live="polite">
        <For each={state.nodes}>{(node: ChildNode) => <li data-node-id={node.id}>{node.label}</li>}</For>
    </ul>
)

const Controls = () => (
    <div class="controls">
        <button data-action="add-start" onClick={() => fixtureControls.addToStart()}>Add to start</button>
        <button data-action="add-end" onClick={() => fixtureControls.addToEnd()}>Add to end</button>
        <button data-action="remove-first" onClick={() => fixtureControls.removeFirst()}>Remove first</button>
        <button data-action="remove-last" onClick={() => fixtureControls.removeLast()}>Remove last</button>
        <button data-action="reverse" onClick={() => fixtureControls.reorder(true)}>Reverse</button>
        <button data-action="reset" onClick={() => fixtureControls.reset(defaultNodes)}>Reset</button>
    </div>
)

const defaultNodes: ChildNode[] = [
    { id: 1, label: 'alpha' },
    { id: 2, label: 'beta' },
    { id: 3, label: 'gamma' },
]

const FixtureApp = () => (
    <main>
        <h1>Renderer Fixture</h1>
        <p>Use the controls to mutate the children array and validate reconciliation behaviour.</p>
        <Controls />
        <section class="output">
            <ChildList />
        </section>
        <section class="events">
            <h2>Events</h2>
            <ul data-testid="event-log">
                <For each={state.log}>{(entry: string) => <li data-event={entry}>{entry}</li>}</For>
            </ul>
        </section>
    </main>
)

fixtureControls.reset(defaultNodes)

bindApp(<FixtureApp />, '#app')

